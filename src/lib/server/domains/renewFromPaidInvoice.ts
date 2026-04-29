import {
  type DomainRenewInvoiceOptions,
  type Invoice,
} from "@/lib/db/schema";
import namecheapApi from "@/lib/server/apis/namecheap";

export async function renewDomainFromPaidInvoice(
  invoice: Pick<Invoice, "reference" | "metadata" | "orgId">
): Promise<{ renewed: boolean }> {
  const meta = invoice.metadata as DomainRenewInvoiceOptions;
  const domainName = meta.domain;
  try {
    const result = await namecheapApi.renewDomain({ DomainName: domainName, Years: 1 });
    return { renewed: result.Renewed };
  } catch (err) {
    console.error("[RENEW] Falha ao renovar domínio:", domainName, err);
    return { renewed: false };
  }
}
