import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type Invoice,
  pgInvoice,
  pgLog,
  pgVpsProvisioningJob,
  pgVpsServers,
  pgVpsSubscription,
} from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { createContaboPasswordSecret } from "./createSecret";
import { createVps } from "./createVps";
import { getContaboInstanceIpv4 } from "./getVps";
import { resolveContaboImageId } from "./image-id";
import {
  buildContaboInstanceRequest,
  type AtlasVpsConfiguration,
} from "./provisioning";

type VpsPlanType = "vps" | "vds" | "storage-vps" | "vps-windows";

function hasManualExtras(config: AtlasVpsConfiguration): string[] {
  const extras: string[] = [];
  if (config.objectStorage && config.objectStorage !== "none")
    extras.push(`Object Storage (${config.objectStorage})`);
  if (config.monitoring === "full") extras.push("Full Monitoring");
  if (
    config.storageUpgrades &&
    Object.values(config.storageUpgrades).some(quantity => quantity > 0)
  )
    extras.push("expansões VDS");
  return extras;
}

async function notifyAdmin(
  title: string,
  message: string,
  severity: "warning" | "danger"
): Promise<void> {
  const recipient = process.env.EMAIL;
  if (!recipient) {
    console.error(`[CONTABO] EMAIL ausente; alerta não enviado: ${title}`);
    return;
  }
  await sendNotificationEmail(
    recipient,
    "Admin",
    "Atlas Hosting",
    title,
    message,
    severity
  );
}

function planTypeFromConfig(config: Record<string, unknown>): VpsPlanType {
  if (config.type === "vds") return "vds";
  if (config.type === "storage-vps") return "storage-vps";
  if (config.type === "vps-windows") return "vps-windows";
  return "vps";
}

async function describeError(error: unknown): Promise<string> {
  const base = error instanceof Error ? error.message : String(error);
  const response = (error as { response?: Response })?.response;
  if (!response) return base;
  try {
    const body = await response.clone().text();
    return body ? `${base} — ${body}` : base;
  } catch {
    return base;
  }
}

async function failProvisioning(
  invoice: Invoice,
  error: unknown
): Promise<void> {
  const message = await describeError(error);
  await db
    .update(pgVpsProvisioningJob)
    .set({ error: message, status: "failed", updatedAt: new Date() })
    .where(eq(pgVpsProvisioningJob.invoiceId, invoice.id));
  await db.insert(pgLog).values({
    description: `Fatura ${invoice.id}: ${message}`,
    severity: "danger",
    title: "Falha ao provisionar VPS na Contabo",
    type: "hosting",
    userId: invoice.userId,
  });
  await notifyAdmin(
    "Falha ao provisionar VPS na Contabo",
    `A fatura <strong>${invoice.id}</strong> falhou no provisionamento Contabo: ${message}`,
    "danger"
  );
}

async function linkInstanceWhenIpv4IsAvailable(
  invoice: Invoice,
  instanceId: string,
  config: AtlasVpsConfiguration,
  planType: VpsPlanType
): Promise<void> {
  const ip = await getContaboInstanceIpv4(instanceId);
  if (!ip) {
    console.info(
      `[CONTABO] Instância ${instanceId} criada para fatura ${invoice.id}; aguardando IPv4.`
    );
    return;
  }

  const existingServer = await db.query.pgVpsServers.findFirst({
    where: eq(pgVpsServers.externalId, instanceId),
  });
  const server =
    existingServer ??
    (
      await db
        .insert(pgVpsServers)
        .values({
          externalId: instanceId,
          ip,
          metadata: { contaboImageId: resolveContaboImageId(config) },
          name: `Atlas ${planType} ${invoice.id.slice(0, 8)}`,
          os: config.image ?? "ubuntu",
          status: "pending",
          token: `atlas_${randomBytes(24).toString("hex")}`,
          userId: invoice.userId,
        })
        .returning()
    )[0];
  if (!server) throw new Error("Não foi possível salvar o servidor Atlas.");

  await db
    .update(pgVpsSubscription)
    .set({ updatedAt: new Date(), vpsNodeId: server.id })
    .where(
      and(
        eq(pgVpsSubscription.lastInvoiceId, invoice.id),
        eq(pgVpsSubscription.userId, invoice.userId)
      )
    );
}

/**
 * Provisiona uma única vez para cada fatura paga. A reserva com índice único é
 * feita antes de qualquer chamada externa, portanto callbacks repetidos não
 * podem criar uma segunda instância Contabo.
 */
export async function provisionPaidVps(invoiceId: string): Promise<void> {
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });
  if (!invoice || invoice.type !== "vps" || invoice.status !== "paid") return;

  const metadata = invoice.metadata as {
    config?: AtlasVpsConfiguration;
    isRenewal?: boolean;
    vpsId?: string;
  };
  if (metadata.isRenewal) return;

  const [reservedJob] = await db
    .insert(pgVpsProvisioningJob)
    .values({ invoiceId: invoice.id, status: "provisioning" })
    .onConflictDoNothing()
    .returning();
  const config = metadata.config ?? {};
  const planType = planTypeFromConfig(config as Record<string, unknown>);
  if (!reservedJob) {
    const existingJob = await db.query.pgVpsProvisioningJob.findFirst({
      where: eq(pgVpsProvisioningJob.invoiceId, invoice.id),
    });
    if (existingJob?.instanceId && existingJob.status === "created") {
      try {
        await linkInstanceWhenIpv4IsAvailable(
          invoice,
          existingJob.instanceId,
          config,
          planType
        );
      } catch (error) {
        await failProvisioning(invoice, error);
      }
    }
    return;
  }

  const manualExtras = hasManualExtras(config);
  if (manualExtras.length) {
    await notifyAdmin(
      "Compra VPS exige ação manual",
      `Fatura <strong>${invoice.id}</strong> inclui ${manualExtras.join(", ")}. A VPS base será provisionada; compre/entregue os extras manualmente.`,
      "warning"
    );
  }

  try {
    const password = config.password;
    if (typeof password !== "string" || password.length === 0) {
      throw new Error("Fatura VPS sem senha para criar o segredo Contabo.");
    }

    const secretId = await createContaboPasswordSecret(
      `atlas-${invoice.id}`.slice(0, 255),
      password
    );
    const response = await createVps(
      buildContaboInstanceRequest({
        config,
        displayName: `Atlas ${planType} ${invoice.id.slice(0, 8)}`,
        imageId: resolveContaboImageId(config),
        planId: metadata.vpsId ?? "",
        planType,
        rootPasswordSecretId: secretId,
      })
    );
    const instanceId = response.data[0]?.instanceId;
    if (!instanceId) throw new Error("Contabo não retornou o instanceId criado.");

    await db
      .update(pgVpsProvisioningJob)
      .set({
        error: null,
        instanceId: String(instanceId),
        status: "created",
        updatedAt: new Date(),
      })
      .where(eq(pgVpsProvisioningJob.id, reservedJob.id));
    await linkInstanceWhenIpv4IsAvailable(
      invoice,
      String(instanceId),
      config,
      planType
    );
  } catch (error) {
    console.error(`[CONTABO] Provisionamento falhou para fatura ${invoice.id}:`, error);
    await failProvisioning(invoice, error);
  }
}
