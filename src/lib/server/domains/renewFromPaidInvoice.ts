import type { DomainRenewInvoiceOptions, Invoice } from "@/lib/db/schema";
import namecheapApi from "@/lib/server/apis/namecheap";
import { checkNamecheapBalanceSafely } from "./namecheap-balance-alert";

export async function renewDomainFromPaidInvoice(
  invoice: Pick<Invoice, "reference" | "metadata" | "orgId">
): Promise<{ renewed: boolean }> {
  const meta = invoice.metadata as DomainRenewInvoiceOptions;
  const domainName = meta.domain;
  try {
    const result = await namecheapApi.renewDomain({
      DomainName: domainName,
      Years: 1,
    });
    if (result.Renewed)
      await checkNamecheapBalanceSafely("renovação de domínio");
    return { renewed: result.Renewed };
  } catch (err) {
    console.error("[RENEW] Falha ao renovar domínio:", domainName, err);
    return { renewed: false };
  }
}
