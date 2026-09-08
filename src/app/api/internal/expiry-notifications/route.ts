import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgOrganizationDomains, pgVpsSubscription } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { checkNamecheapBalanceSafely } from "@/lib/server/domains/namecheap-balance-alert";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { getStorageVpsPlan } from "@/lib/storage-vps-catalog";
import { getVdsPlan } from "@/lib/vds-catalog";
import { getCloudVpsPlan } from "@/lib/vps-catalog";

const ADMIN_NOTIFY_EMAIL = "jbmidiadigital@gmail.com";

/** Dias-antes-do-vencimento em que disparamos aviso. Cron roda 1x/dia — cada
 * assinatura/domínio recebe um email por checkpoint cruzado, não um por dia. */
const EXPIRY_CHECKPOINTS_DAYS = [7, 3, 1];

function ensureAuthorized(req: Request): boolean {
  // Allow requests from localhost (internal cron)
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const host = req.headers.get("host") || "";
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    forwarded === "";
  if (isLocal) return true;

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  const cronSecret = process.env.CRON_SECRET;
  const internalToken =
    process.env.API_MACHINE_INTERNAL_TOKEN ||
    process.env.INTERNAL_SERVICE_TOKEN;
  if (cronSecret && token === cronSecret) return true;
  if (internalToken && token === internalToken) return true;
  return false;
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

const PLAN_TYPE_LABEL: Record<string, string> = {
  "storage-vps": "Storage VPS",
  vds: "Cloud VDS",
  vps: "Cloud VPS",
  "vps-windows": "VPS Windows",
};

function planDisplayName(planType: string, planId: string): string {
  if (planType === "vds") return getVdsPlan(planId)?.name || planId;
  if (planType === "storage-vps")
    return getStorageVpsPlan(planId)?.name || planId;
  if (planType === "vps-windows")
    return `${getCloudVpsPlan(planId)?.name || planId} Windows`;
  return getCloudVpsPlan(planId)?.name || planId;
}

async function notifySubscriptionExpiring(
  sub: typeof pgVpsSubscription.$inferSelect & {
    user: { name: string | null; email: string };
  },
  daysLeft: number,
  baseUrl: string
): Promise<void> {
  const user = sub.user;
  if (!user?.email) return;

  const planLabel = `${PLAN_TYPE_LABEL[sub.planType] || sub.planType} — ${planDisplayName(sub.planType, sub.planId)}`;
  const dateLabel = sub.nextChargeDate.toLocaleDateString("pt-BR");
  const dayWord = daysLeft === 1 ? "dia" : "dias";
  const renewNote =
    sub.paymentMethod === "credit_card"
      ? "Ela será renovada automaticamente no cartão cadastrado."
      : "Esse plano não renova sozinho — renove manualmente pelo painel pra não perder o servidor.";
  const severity = daysLeft <= 3 ? "danger" : "warning";
  const title = `Sua assinatura ${planLabel} vence em ${daysLeft} ${dayWord}`;
  const message = `Sua assinatura <strong>${planLabel}</strong> vence em <strong>${dateLabel}</strong> (${daysLeft} ${dayWord}). ${renewNote}`;

  await sendNotificationEmail(
    user.email,
    (user.name || "Cliente").split(" ")[0],
    "Atlas Hosting",
    title,
    message,
    severity,
    `${baseUrl}/minhas-assinaturas`,
    "Gerenciar Assinatura"
  );

  await sendNotificationEmail(
    ADMIN_NOTIFY_EMAIL,
    "Admin",
    "Atlas Hosting",
    title,
    `${message}<br><br>Cliente: ${user.name || "N/A"} (${user.email})`,
    severity,
    `${baseUrl}/admin/vps-plans`,
    "Ver no Admin"
  );
}

async function notifyDomainExpiring(
  domain: string,
  owner: { name: string | null; email: string },
  expireDate: Date,
  daysLeft: number,
  baseUrl: string
): Promise<void> {
  const dateLabel = expireDate.toLocaleDateString("pt-BR");
  const dayWord = daysLeft === 1 ? "dia" : "dias";
  const severity = daysLeft <= 3 ? "danger" : "warning";
  const title = `Seu domínio ${domain} vence em ${daysLeft} ${dayWord}`;
  const message = `O domínio <strong>${domain}</strong> vence em <strong>${dateLabel}</strong> (${daysLeft} ${dayWord}). Renove pelo painel pra não correr o risco de perder o domínio.`;

  await sendNotificationEmail(
    owner.email,
    (owner.name || "Cliente").split(" ")[0],
    "Atlas Hosting",
    title,
    message,
    severity,
    `${baseUrl}/domains`,
    "Gerenciar Domínios"
  );

  await sendNotificationEmail(
    ADMIN_NOTIFY_EMAIL,
    "Admin",
    "Atlas Hosting",
    title,
    `${message}<br><br>Cliente: ${owner.name || "N/A"} (${owner.email})`,
    severity,
    `${baseUrl}/domains`,
    "Ver Domínios"
  );
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!ensureAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = getServerPublicBaseUrl();
  let subscriptionsNotified = 0;
  let domainsNotified = 0;
  const namecheapBalance = await checkNamecheapBalanceSafely("cron diário");

  // 1) Assinaturas VPS/VDS/Storage/Windows ativas prestes a vencer/cobrar
  const activeSubs = await db.query.pgVpsSubscription.findMany({
    where: eq(pgVpsSubscription.status, "active"),
    with: { user: true },
  });

  for (const sub of activeSubs) {
    const daysLeft = daysUntil(sub.nextChargeDate);
    if (!EXPIRY_CHECKPOINTS_DAYS.includes(daysLeft)) continue;
    try {
      await notifySubscriptionExpiring(sub as any, daysLeft, baseUrl);
      subscriptionsNotified++;
    } catch (err) {
      console.error(
        `[EXPIRY-CRON] Falha ao notificar assinatura ${sub.id}:`,
        err
      );
    }
  }

  // 2) Domínios ativos registrados via Namecheap/Atlas. Domínios só "apontados"
  // (registrados em outro registrador, ex. Hostinger) não retornam ExpireDate
  // consultável aqui — a chamada falha e o domínio é ignorado silenciosamente,
  // já que não temos como saber o vencimento real de um registrador terceiro.
  const activeDomains = await db.query.pgOrganizationDomains.findMany({
    where: eq(pgOrganizationDomains.active, true),
    with: { organization: { with: { owner: true } } },
  });

  for (const domainRow of activeDomains) {
    const owner = (domainRow.organization as any)?.owner;
    if (!owner?.email) continue;

    try {
      const info = await namecheapApi.getInfo({ DomainName: domainRow.domain });
      if (!info?.ExpireDate) continue;

      const expireDate = new Date(info.ExpireDate);
      const daysLeft = daysUntil(expireDate);
      if (!EXPIRY_CHECKPOINTS_DAYS.includes(daysLeft)) continue;

      await notifyDomainExpiring(
        domainRow.domain,
        owner,
        expireDate,
        daysLeft,
        baseUrl
      );
      domainsNotified++;
    } catch (err) {
      console.error(
        `[EXPIRY-CRON] Domínio ${domainRow.domain} ignorado (não gerenciado por nós ou erro na consulta):`,
        err
      );
    }
  }

  return NextResponse.json({
    checkpoints: EXPIRY_CHECKPOINTS_DAYS,
    domainsNotified,
    namecheapBalance,
    subscriptionsNotified,
  });
}
