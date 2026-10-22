import type { DomainRenewInvoiceOptions, Invoice } from "@/lib/db/schema";
import namecheapApi from "@/lib/server/apis/namecheap";
import {
  notifyLowNamecheapBalanceAfterActionSafely,
  notifyNamecheapActionFailureSafely,
} from "./namecheap-balance-alert";

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
      await notifyLowNamecheapBalanceAfterActionSafely("renovação de domínio");
    else
      await notifyNamecheapActionFailureSafely(
        `renovação do domínio ${domainName}`,
        "A Namecheap retornou Renewed=false."
      );
    return { renewed: result.Renewed };
  } catch (err) {
    console.error("[RENEW] Falha ao renovar domínio:", domainName, err);
    await notifyNamecheapActionFailureSafely(
      `renovação do domínio ${domainName}`,
      err instanceof Error ? err.message : String(err)
    );
    return { renewed: false };
  }
}
