import { and, eq } from "drizzle-orm";
import { adminNamecheapDetails } from "@/components/domains/DomainResult";
import { db } from "@/lib/db";
import {
  type DomainRegisterInvoiceOptions,
  type Invoice,
  pgInvoice,
  pgOrganizationDomains,
  pgUser,
  type RawUser,
} from "@/lib/db/schema";
import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";
import {
  domainNamesFromInvoice,
  type RegisterResult,
  registerDomainsFromPaidInvoice,
} from "./registerFromPaidInvoice";

export type ReprocessResult = {
  invoiceId: string;
  ok: boolean;
  reason?: string;
  domains?: string[];
} & Partial<RegisterResult>;

/**
 * Monta o contato do registrante. Preferimos o snapshot de cobrança do PIX
 * (`metadata.pixCheckout`), que tem endereço/telefone reais. Sem ele, usamos
 * nome/e-mail do usuário e completamos endereço/telefone com o contato admin.
 */
function contactFromInvoice(
  invoice: Pick<Invoice, "metadata">,
  user: Pick<RawUser, "name" | "email"> | null | undefined
): NamecheapContactDetails {
  const meta = invoice.metadata as DomainRegisterInvoiceOptions;
  const billing = meta?.pixCheckout;

  if (billing) {
    return {
      Address1: `${billing.address.street}, ${billing.address.number}`,
      City: billing.address.city,
      Country: "BR",
      EmailAddress: user?.email || adminNamecheapDetails.EmailAddress,
      FirstName: billing.firstName.trim(),
      LastName: billing.lastName.trim(),
      Phone: `+55.${billing.phoneNumber.replace(/\D/g, "")}`,
      PostalCode: billing.address.zipCode.replace(/\D/g, ""),
      StateProvince: billing.address.state,
    };
  }

  const parts = (user?.name ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    ...(adminNamecheapDetails as NamecheapContactDetails),
    EmailAddress: user?.email || adminNamecheapDetails.EmailAddress,
    FirstName: parts[0] || adminNamecheapDetails.FirstName,
    LastName:
      parts.slice(1).join(" ") || parts[0] || adminNamecheapDetails.LastName,
  };
}

/** Reprocessa uma fatura de domínio já paga: registra na Namecheap e vincula à org. */
export async function reprocessDomainInvoice(
  invoiceId: string
): Promise<ReprocessResult> {
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });

  if (!invoice) return { invoiceId, ok: false, reason: "invoice_not_found" };
  if (invoice.type !== "domain") {
    return {
      invoiceId,
      ok: false,
      reason: `not_a_domain_invoice_(${invoice.type})`,
    };
  }

  const meta = invoice.metadata as Record<string, unknown>;
  if (meta?.type === "renew") {
    return { invoiceId, ok: false, reason: "renew_not_supported_here" };
  }
  if (meta?.testPaymentOnly) {
    return { invoiceId, ok: false, reason: "test_payment_only" };
  }

  const domains = domainNamesFromInvoice(invoice);
  if (domains.length === 0) {
    return { invoiceId, ok: false, reason: "no_domains_in_invoice" };
  }

  const user = await db.query.pgUser.findFirst({
    where: eq(pgUser.organizationId, invoice.orgId),
  });

  const contact = contactFromInvoice(invoice, user);
  const result = await registerDomainsFromPaidInvoice(invoice, contact);

  // Garante fatura paga quando pelo menos um domínio foi efetivado.
  if (result.registered.length > 0 && invoice.status !== "paid") {
    await db
      .update(pgInvoice)
      .set({ status: "paid" })
      .where(eq(pgInvoice.id, invoice.id));
  }

  return {
    domains,
    invoiceId,
    ok: result.failed.length === 0,
    ...result,
  };
}

/**
 * Rede de segurança: varre faturas de domínio PAGAS que não têm todos os
 * domínios vinculados à organização e reprocessa. Idempotente — não recompra
 * o que já é nosso.
 */
export async function reprocessUnfulfilledDomainInvoices(): Promise<{
  scanned: number;
  reprocessed: ReprocessResult[];
}> {
  const invoices = await db.query.pgInvoice.findMany({
    where: and(eq(pgInvoice.type, "domain"), eq(pgInvoice.status, "paid")),
  });

  const reprocessed: ReprocessResult[] = [];

  for (const invoice of invoices) {
    const meta = invoice.metadata as Record<string, unknown>;
    if (meta?.type === "renew" || meta?.testPaymentOnly) continue;

    const names = domainNamesFromInvoice(invoice);
    if (names.length === 0) continue;

    const links = await db.query.pgOrganizationDomains.findMany({
      where: eq(pgOrganizationDomains.organizationId, invoice.orgId),
    });
    const linked = new Set(links.map(l => l.domain.trim().toLowerCase()));
    const missing = names.filter(n => !linked.has(n));
    if (missing.length === 0) continue;

    reprocessed.push(await reprocessDomainInvoice(invoice.id));
  }

  return { reprocessed, scanned: invoices.length };
}
