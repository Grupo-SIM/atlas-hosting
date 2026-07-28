import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type DomainRegisterInvoiceOptions,
  type DomainRegistrationOutcome,
  type Invoice,
  pgInvoice,
  pgOrganizationDomains,
} from "@/lib/db/schema";
import namecheapApi from "@/lib/server/apis/namecheap";
import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";

const DEFAULT_NS = [
  "dns1.registrar-servers.com",
  "dns2.registrar-servers.com",
] as const;

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

async function linkDomain(orgId: string, domain: string): Promise<void> {
  if (await isLinkedInDb(orgId, domain)) return;
  await db.insert(pgOrganizationDomains).values({
    active: true,
    domain,
    organizationId: orgId,
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
  contact: NamecheapContactDetails
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
        console.warn(
          `[REGISTER] ${DomainName} já está na conta Namecheap; vinculando sem nova cobrança.`
        );
        await linkDomain(invoice.orgId, DomainName);
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
        Admin: contact,
        AuxBilling: contact,
        DomainName,
        Nameservers: [...DEFAULT_NS],
        Registrant: contact,
        Tech: contact,
        WGEnabled: whoisguard ? "yes" : "no",
        Years: years,
      });

      if (domainResult.Registered) {
        console.log(
          `[REGISTER] ✓ ${DomainName} registrado (OrderID: ${domainResult.OrderID}).`
        );
        await linkDomain(invoice.orgId, DomainName);
        result.registered.push(DomainName);
      } else {
        console.error(
          `[REGISTER] ✗ ${DomainName} não registrado. Resposta:`,
          domainResult
        );
        result.failed.push(DomainName);
        result.errors[DomainName] =
          "Namecheap retornou Registered=false (verifique saldo/disponibilidade).";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[REGISTER] ✗ Erro ao registrar ${DomainName}:`, message);
      result.failed.push(DomainName);
      result.errors[DomainName] = message;
    }
  }

  await persistOutcome(invoice, result);

  return result;
}
