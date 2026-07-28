export interface SignatureCancellationInvoice {
  id: string;
  orgId: string;
  reference: string;
  type: "subscription" | "domain" | "vps";
}

export interface SignatureCancellationRepository {
  findInvoice(id: string): Promise<SignatureCancellationInvoice | undefined>;
  clearOrganizationPlan(orgId: string, planId: string): Promise<boolean>;
  cancelVpsSubscriptions(invoiceId: string, cancelledAt: Date): Promise<number>;
}

export type SignatureCancellationResult =
  | { status: "missing-reference" }
  | { status: "invoice-not-found"; invoiceId: string }
  | { status: "organisation-plan-cancelled"; invoiceId: string }
  | { status: "organisation-plan-unchanged"; invoiceId: string }
  | { status: "vps-subscription-cancelled"; invoiceId: string }
  | { status: "vps-subscription-not-found"; invoiceId: string }
  | { status: "invoice-type-ignored"; invoiceId: string };

export async function processSignatureCancellation(
  externalReference: string | undefined,
  repository: SignatureCancellationRepository
): Promise<SignatureCancellationResult> {
  if (!externalReference) return { status: "missing-reference" };

  const invoice = await repository.findInvoice(externalReference);
  if (!invoice) {
    return { invoiceId: externalReference, status: "invoice-not-found" };
  }

  if (invoice.type === "subscription") {
    const planCleared = await repository.clearOrganizationPlan(
      invoice.orgId,
      invoice.reference
    );

    return {
      invoiceId: invoice.id,
      status: planCleared
        ? "organisation-plan-cancelled"
        : "organisation-plan-unchanged",
    };
  }

  if (invoice.type === "vps") {
    const cancelledSubscriptions = await repository.cancelVpsSubscriptions(
      invoice.id,
      new Date()
    );

    return {
      invoiceId: invoice.id,
      status:
        cancelledSubscriptions > 0
          ? "vps-subscription-cancelled"
          : "vps-subscription-not-found",
    };
  }

  return { invoiceId: invoice.id, status: "invoice-type-ignored" };
}
