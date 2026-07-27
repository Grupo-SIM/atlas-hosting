export type PaymentDeclinedInvoice = {
  id: string;
  orgId: string;
  reference: string;
  type: "subscription" | "domain" | "vps";
};

export type PaymentDeclinedRepository = {
  findInvoice(id: string): Promise<PaymentDeclinedInvoice | undefined>;
  failInvoice(invoiceId: string): Promise<boolean>;
  clearOrganizationPlan(orgId: string, planId: string): Promise<boolean>;
  failVpsSubscriptions(invoiceId: string): Promise<number>;
};

export type PaymentDeclinedResult =
  | { status: "missing-reference" }
  | { status: "invoice-not-found"; invoiceId: string }
  | { status: "vps-subscription-failed"; invoiceId: string }
  | { status: "vps-subscription-not-found"; invoiceId: string }
  | { status: "organisation-plan-failed"; invoiceId: string }
  | { status: "organisation-plan-unchanged"; invoiceId: string }
  | { status: "invoice-failed"; invoiceId: string }
  | { status: "invoice-unchanged"; invoiceId: string };

export async function processPaymentDeclined(
  externalReference: string | undefined,
  repository: PaymentDeclinedRepository,
): Promise<PaymentDeclinedResult> {
  if (!externalReference) return { status: "missing-reference" };

  const invoice = await repository.findInvoice(externalReference);
  if (!invoice) {
    return { status: "invoice-not-found", invoiceId: externalReference };
  }

  const invoiceFailed = await repository.failInvoice(invoice.id);

  if (invoice.type === "vps") {
    const failedSubscriptions = await repository.failVpsSubscriptions(invoice.id);
    return {
      status:
        failedSubscriptions > 0
          ? "vps-subscription-failed"
          : "vps-subscription-not-found",
      invoiceId: invoice.id,
    };
  }

  if (invoice.type === "subscription") {
    const planCleared = await repository.clearOrganizationPlan(
      invoice.orgId,
      invoice.reference,
    );
    return {
      status: planCleared
        ? "organisation-plan-failed"
        : "organisation-plan-unchanged",
      invoiceId: invoice.id,
    };
  }

  return {
    status: invoiceFailed ? "invoice-failed" : "invoice-unchanged",
    invoiceId: invoice.id,
  };
}
