import { describe, expect, test } from "bun:test";
import {
  processSignatureCancellation,
  type SignatureCancellationInvoice,
  type SignatureCancellationRepository,
} from "./signature-cancellation";

type RepositoryState = {
  planId: string | null;
  vpsStatus: "active" | "cancelled" | null;
};

function createRepository(
  invoice: SignatureCancellationInvoice | undefined,
  state: RepositoryState,
): SignatureCancellationRepository {
  return {
    async findInvoice(id) {
      return invoice?.id === id ? invoice : undefined;
    },
    async clearOrganizationPlan(_orgId, planId) {
      if (state.planId !== planId) return false;
      state.planId = null;
      return true;
    },
    async cancelVpsSubscriptions(_invoiceId, _cancelledAt) {
      if (state.vpsStatus !== "active") return 0;
      state.vpsStatus = "cancelled";
      return 1;
    },
  };
}

describe("processSignatureCancellation", () => {
  test("removes the organization plan tied to a cancelled subscription invoice", async () => {
    const invoice: SignatureCancellationInvoice = {
      id: "invoice-subscription",
      orgId: "org-1",
      reference: "plan-1",
      type: "subscription",
    };
    const state: RepositoryState = { planId: "plan-1", vpsStatus: null };

    await expect(
      processSignatureCancellation(invoice.id, createRepository(invoice, state)),
    ).resolves.toEqual({
      status: "organisation-plan-cancelled",
      invoiceId: invoice.id,
    });
    expect(state.planId).toBeNull();
  });

  test("preserves an organization plan replaced after the cancelled invoice", async () => {
    const invoice: SignatureCancellationInvoice = {
      id: "invoice-subscription",
      orgId: "org-1",
      reference: "plan-old",
      type: "subscription",
    };
    const state: RepositoryState = { planId: "plan-new", vpsStatus: null };

    await expect(
      processSignatureCancellation(invoice.id, createRepository(invoice, state)),
    ).resolves.toEqual({
      status: "organisation-plan-unchanged",
      invoiceId: invoice.id,
    });
    expect(state.planId).toBe("plan-new");
  });

  test("cancels the VPS subscription tied to the cancelled invoice", async () => {
    const invoice: SignatureCancellationInvoice = {
      id: "invoice-vps",
      orgId: "org-1",
      reference: "vps-10",
      type: "vps",
    };
    const state: RepositoryState = { planId: null, vpsStatus: "active" };

    await expect(
      processSignatureCancellation(invoice.id, createRepository(invoice, state)),
    ).resolves.toEqual({
      status: "vps-subscription-cancelled",
      invoiceId: invoice.id,
    });
    expect(state.vpsStatus).toBe("cancelled");
  });

  test("is benign when the webhook has no reference or invoice", async () => {
    const state: RepositoryState = { planId: null, vpsStatus: null };
    const repository = createRepository(undefined, state);

    await expect(processSignatureCancellation(undefined, repository)).resolves.toEqual({
      status: "missing-reference",
    });
    await expect(processSignatureCancellation("unknown", repository)).resolves.toEqual({
      status: "invoice-not-found",
      invoiceId: "unknown",
    });
  });
});
