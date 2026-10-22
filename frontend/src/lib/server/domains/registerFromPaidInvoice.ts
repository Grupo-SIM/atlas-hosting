import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type DomainRegisterInvoiceOptions,
  type DomainRegistrationOutcome,
  type Invoice,
  pgInvoice,
  pgOrganizationDomains,
} from "@/lib/db/schema";
import type { CloudflareZone } from "@/lib/server/apis/cloudflare";
import namecheapApi from "@/lib/server/apis/namecheap";
import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";
import {
  notifyLowNamecheapBalanceAfterActionSafely,
  notifyNamecheapActionFailureSafely,
} from "./namecheap-balance-alert";
import {
  formatAtlasDnsError,
  provisionCloudflareZone,
} from "@/lib/server/domains/cloudflare-dns";
import { atlasRegistrantContact } from "@/lib/server/domains/atlas-registrant";
import { REGISTRAR_ADAPTERS } from "@/lib/server/registrars";

/** Domínios a registrar: pacote (`metadata.bundleDomains`) ou fatura avulsa (`reference`). */
export function domainNamesFromInvoice(
  invoice: Pick<Invoice, "reference" | "metadata">
): string[] {
  const meta = invoice.metadata as DomainRegisterInvoiceOptions;
  if (meta.bundleDomains && meta.bundleDomains.length >= 2) {
    return [
      ...new Set(meta.bundleDomains.map(d => d.trim().toLowerCase())),
    ].filter(Boolean);
  }
  const one = invoice.reference?.trim().toLowerCase();
  return one ? [one] : [];
}

export interface RegisterResult {
  /** Domínios que a organização passou a possuir (registrados agora ou já existentes). */
  registered: string[];
  /** Domínios que falharam nesta tentativa. */
  failed: string[];
  /** Domínios já registrados/vinculados previamente (sem nova cobrança). */
  skipped: string[];
  /** Mensagem de erro real do registrador, por domínio que falhou. */
  errors: Record<string, string>;
}

/**
 * Indica que uma tentativa anterior pode ter sido concluída no registrador sem
 * que a aplicação recebesse a resposta. Nesse caso, encontrar o domínio na
 * conta durante o reprocessamento significa concluir o provisionamento Atlas,
 * e não importar o domínio como uma migração antiga.
 */
export function hasAmbiguousPreviousRegistration(
  metadata: DomainRegisterInvoiceOptions,
  domain: string
): boolean {
  const previousError = metadata.domainRegistration?.errors[domain];
  if (!previousError) return false;

  const normalized = previousError.toLowerCase();
  return (
    normalized.includes("timeout") ||
    normalized.includes("econnreset") ||
    normalized.includes("socket hang up") ||
    normalized.includes("network error")
  );
}

export async function provisionPurchasedDomainDns(
  domain: string,
  dependencies?: {
    provisionZone?: (
      domainName: string,
      scanExistingRecords: boolean
    ) => Promise<CloudflareZone>;
    setNameservers?: (
      domainName: string,
      nameservers: string[]
    ) => Promise<void>;
  }
) {
  const zone = await (dependencies?.provisionZone || provisionCloudflareZone)(
    domain,
    false
  );
  const setNameservers =
    dependencies?.setNameservers ||
    REGISTRAR_ADAPTERS.get("namecheap")?.setNameservers;
  if (!setNameservers)
    throw new Error("Integração com o registrador indisponível.");
  await setNameservers(domain, zone.name_servers);
  return zone;
}

/** Já existe vínculo domínio→organização no nosso banco? (idempotência principal) */
async function isLinkedInDb(orgId: string, domain: string): Promise<boolean> {
  const existing = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.organizationId, orgId),
      eq(pgOrganizationDomains.domain, domain)
    ),
  });
  return !!existing;
}

async function linkDomain(
  orgId: string,
  domain: string,
  newlyRegistered: boolean
): Promise<void> {
  if (await isLinkedInDb(orgId, domain)) return;
  if (!newlyRegistered) {
    await db.insert(pgOrganizationDomains).values({
      active: true,
      connectionStatus: "migration_required",
      dnsMode: "legacy_plesk",
      domain,
      organizationId: orgId,
      registrarProvider: "namecheap",
      verifiedAt: new Date(),
    });
    return;
  }

  let connectionStatus = "provisioning";
  let cloudflareZoneId: string | null = null;
  let cloudflareZoneStatus: string | null = null;
  let expectedNameservers: string[] | null = null;
  let lastDnsError: string | null = null;
  try {
    const zone = await provisionPurchasedDomainDns(domain);
    cloudflareZoneId = zone.id;
    cloudflareZoneStatus = zone.status;
    expectedNameservers = zone.name_servers;
    connectionStatus =
      zone.status === "active" ? "connected" : "awaiting_activation";
  } catch (error) {
    connectionStatus = "error";
    lastDnsError = formatAtlasDnsError(
      error,
      "Falha ao configurar o DNS no Atlas."
    );
  }
  await db.insert(pgOrganizationDomains).values({
    active: true,
    cloudflareZoneId,
    cloudflareZoneStatus,
    connectionStatus,
    dnsImportedAt: new Date(),
    dnsImportStatus: "complete",
    dnsMode: "cloudflare",
    domain,
    expectedNameservers,
    lastDnsError,
    organizationId: orgId,
    registrarProvider: "namecheap",
    verifiedAt: new Date(),
  });
}

/** O domínio já está na NOSSA conta Namecheap? Evita comprar de novo se só faltou vincular. */
async function isOwnedAtNamecheap(domain: string): Promise<boolean> {
  try {
    const info = await namecheapApi.getInfo({ DomainName: domain });
    return !!info && info.IsOwner === true;
  } catch {
    // getInfo lança quando o domínio não está na conta — tratamos como "não é nosso".
    return false;
  }
}

async function persistOutcome(
  invoice: Pick<Invoice, "id" | "metadata">,
  result: RegisterResult
): Promise<void> {
  if (!invoice.id) return;
  const status: DomainRegistrationOutcome["status"] =
    result.failed.length === 0
      ? "success"
      : result.registered.length > 0
        ? "partial"
        : "failed";
  const outcome: DomainRegistrationOutcome = {
    at: new Date().toISOString(),
    errors: result.errors,
    failed: result.failed,
    registered: result.registered,
    skipped: result.skipped,
    status,
  };
  try {
    const mergedMeta = {
      ...((invoice.metadata as Record<string, unknown>) ?? {}),
      domainRegistration: outcome,
    };
    await db
      .update(pgInvoice)
      .set({ metadata: mergedMeta as DomainRegisterInvoiceOptions })
      .where(eq(pgInvoice.id, invoice.id));
  } catch (err) {
    console.error(
      `[REGISTER] Falha ao persistir resultado do registro na fatura ${invoice.id}:`,
      err
    );
  }
}

/**
 * Registra na Namecheap e vincula à organização. Mesmo padrão do checkout único,
 * mas idempotente (não recompra o que já é nosso) e não-silencioso (loga o erro real
 * do registrador e persiste o resultado no metadata da fatura).
 */
export async function registerDomainsFromPaidInvoice(
  invoice: Pick<Invoice, "id" | "reference" | "metadata" | "orgId">,
  _billingContact: NamecheapContactDetails
): Promise<RegisterResult> {
  const meta = invoice.metadata as DomainRegisterInvoiceOptions;
  const years = Math.max(1, Number.parseInt(String(meta?.years ?? "1"), 10));
  const whoisguard = meta?.whoisguard === "on";
  const names = domainNamesFromInvoice(invoice);

  const result: RegisterResult = {
    errors: {},
    failed: [],
    registered: [],
    skipped: [],
  };
  const atlasContact = atlasRegistrantContact();

  for (const DomainName of names) {
    try {
      // 1) Idempotência: já vinculado no banco → nada a fazer, sem cobrança.
      if (await isLinkedInDb(invoice.orgId, DomainName)) {
        console.log(
          `[REGISTER] ${DomainName} já vinculado à org ${invoice.orgId}; pulando.`
        );
        result.registered.push(DomainName);
        result.skipped.push(DomainName);
        continue;
      }

      // 2) Já é nosso na Namecheap mas faltou vincular → só vincula, sem recomprar.
      if (await isOwnedAtNamecheap(DomainName)) {
        const shouldProvisionDns = hasAmbiguousPreviousRegistration(
          meta,
          DomainName
        );
        console.warn(
          shouldProvisionDns
            ? `[REGISTER] ${DomainName} foi registrado apesar da falha anterior; concluindo o provisionamento sem nova cobrança.`
            : `[REGISTER] ${DomainName} já está na conta Namecheap; vinculando sem nova cobrança.`
        );
        await linkDomain(invoice.orgId, DomainName, shouldProvisionDns);
        result.registered.push(DomainName);
        result.skipped.push(DomainName);
        continue;
      }

      // 3) Registro efetivo.
      console.log(
        `[REGISTER] → createDomain ${DomainName} (${years}a, wg=${whoisguard})`
      );
      const domainResult = await namecheapApi.createDomain({
        AddFreeWhoisguard: whoisguard ? "yes" : "no",
        Admin: atlasContact,
        AuxBilling: atlasContact,
        DomainName,
        Registrant: atlasContact,
        Tech: atlasContact,
        WGEnabled: whoisguard ? "yes" : "no",
        Years: years,
      });

      if (domainResult.Registered) {
        console.log(
          `[REGISTER] ✓ ${DomainName} registrado (OrderID: ${domainResult.OrderID}).`
        );
        await linkDomain(invoice.orgId, DomainName, true);
        result.registered.push(DomainName);
        await notifyLowNamecheapBalanceAfterActionSafely(
          `registro do domínio ${DomainName}`
        );
      } else {
        console.error(
          `[REGISTER] ✗ ${DomainName} não registrado. Resposta:`,
          domainResult
        );
        result.failed.push(DomainName);
        result.errors[DomainName] =
          "O registro do domínio não foi confirmado (verifique saldo/disponibilidade).";
        await notifyNamecheapActionFailureSafely(
          `registro do domínio ${DomainName}`,
          result.errors[DomainName]
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // Uma falha de transporte não prova que a operação de compra falhou: a
      // Namecheap pode ter registrado o domínio e perdido apenas a resposta.
      // Reconcilia a posse antes de deixar a fatura pendente ou permitir retry.
      if (await isOwnedAtNamecheap(DomainName)) {
        console.warn(
          `[REGISTER] ${DomainName} consta na conta Namecheap após erro no createDomain; conciliando sem nova compra.`
        );
        try {
          await linkDomain(invoice.orgId, DomainName, true);
          result.registered.push(DomainName);
          continue;
        } catch (reconciliationError) {
          const reconciliationMessage =
            reconciliationError instanceof Error
              ? reconciliationError.message
              : String(reconciliationError);
          console.error(
            `[REGISTER] ✗ Erro ao conciliar ${DomainName}:`,
            reconciliationMessage
          );
          result.failed.push(DomainName);
          result.errors[DomainName] =
            `Domínio registrado, mas não foi possível vinculá-lo: ${reconciliationMessage}`;
          continue;
        }
      }

      console.error(`[REGISTER] ✗ Erro ao registrar ${DomainName}:`, message);
      result.failed.push(DomainName);
      result.errors[DomainName] = message;
      await notifyNamecheapActionFailureSafely(
        `registro do domínio ${DomainName}`,
        message
      );
    }
  }

  await persistOutcome(invoice, result);

  return result;
}
