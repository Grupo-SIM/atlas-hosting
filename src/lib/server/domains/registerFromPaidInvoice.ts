import { db } from "@/lib/db";
import {
  pgOrganizationDomains,
  type DomainRegisterInvoiceOptions,
  type Invoice,
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
    return [...new Set(meta.bundleDomains.map((d) => d.trim().toLowerCase()))].filter(
      Boolean
    );
  }
  const one = invoice.reference?.trim().toLowerCase();
  return one ? [one] : [];
}

/**
 * Registra na Namecheap e vincula à organização. Mesmo padrão do checkout único.
 */
export async function registerDomainsFromPaidInvoice(
  invoice: Pick<Invoice, "reference" | "metadata" | "orgId">,
  contact: NamecheapContactDetails
): Promise<{ registered: string[]; failed: string[] }> {
  const meta = invoice.metadata as DomainRegisterInvoiceOptions;
  const years = Math.max(1, parseInt(String(meta?.years ?? "1"), 10));
  const whoisguard = meta?.whoisguard === "on";
  const names = domainNamesFromInvoice(invoice);
  const registered: string[] = [];
  const failed: string[] = [];

  for (const DomainName of names) {
    try {
      const domainResult = await namecheapApi.createDomain({
        DomainName,
        Years: years,
        Registrant: contact,
        Admin: contact,
        Tech: contact,
        AuxBilling: contact,
        AddFreeWhoisguard: whoisguard ? "yes" : "no",
        WGEnabled: whoisguard ? "yes" : "no",
        Nameservers: [...DEFAULT_NS],
      });

      if (domainResult.Registered) {
        registered.push(DomainName);
        await db.insert(pgOrganizationDomains).values({
          organizationId: invoice.orgId,
          domain: DomainName,
          active: true,
        });
      } else {
        failed.push(DomainName);
      }
    } catch {
      failed.push(DomainName);
    }
  }

  return { registered, failed };
}
