import { describe, expect, test } from "bun:test";
import {
  type PaymentDeclinedInvoice,
  type PaymentDeclinedRepository,
  processPaymentDeclined,
} from "./payment-declined";

interface State {
  invoiceStatus: "pending" | "processing" | "paid" | "failed";
  planId: string | null;
  vpsStatus: "active" | "failed" | null;
  failureCount: number;
}

function repositoryFor(
  invoice: PaymentDeclinedInvoice | undefined,
  state: State
): PaymentDeclinedRepository {
  return {
    async clearOrganizationPlan(_orgId, planId) {
      if (state.planId !== planId) return false;
      state.planId = null;
      return true;
    },
    async failInvoice() {
      if (state.invoiceStatus === "paid" || state.invoiceStatus === "failed")
        return false;
      state.invoiceStatus = "failed";
      return true;
    },
    async failVpsSubscriptions() {
      if (state.vpsStatus !== "active") return 0;
      state.vpsStatus = "failed";
      state.failureCount += 1;
      return 1;
    },
    async findInvoice(id) {
      return invoice?.id === id ? invoice : undefined;
    },
  };
}

describe("processPaymentDeclined", () => {
  test("immediately fails a pending VPS invoice and its active subscription", async () => {
    const invoice: PaymentDeclinedInvoice = {
      id: "invoice-vps",
      orgId: "org-1",
      reference: "vps-10",
      type: "vps",
    };
    const state: State = {
      failureCount: 0,
      invoiceStatus: "pending",
      planId: null,
      vpsStatus: "active",
    };

    await expect(
      processPaymentDeclined(invoice.id, repositoryFor(invoice, state))
    ).resolves.toEqual({
      invoiceId: invoice.id,
      status: "vps-subscription-failed",
    });
    expect(state).toMatchObject({
      failureCount: 1,
      invoiceStatus: "failed",
      vpsStatus: "failed",
    });
  });

  test("removes the matching organization plan after a declined subscription invoice", async () => {
    const invoice: PaymentDeclinedInvoice = {
      id: "invoice-plan",
      orgId: "org-1",
      reference: "plan-1",
      type: "subscription",
    };
    const state: State = {
      failureCount: 0,
      invoiceStatus: "processing",
      planId: "plan-1",
      vpsStatus: null,
    };

    await expect(
      processPaymentDeclined(invoice.id, repositoryFor(invoice, state))
    ).resolves.toEqual({
      invoiceId: invoice.id,
      status: "organisation-plan-failed",
    });
    expect(state).toMatchObject({ invoiceStatus: "failed", planId: null });
  });

  test("does not undo a paid invoice or remove a newer plan", async () => {
    const invoice: PaymentDeclinedInvoice = {
      id: "invoice-plan",
      orgId: "org-1",
      reference: "plan-old",
      type: "subscription",
    };
    const state: State = {
      failureCount: 0,
      invoiceStatus: "paid",
      planId: "plan-new",
      vpsStatus: null,
    };

    await expect(
      processPaymentDeclined(invoice.id, repositoryFor(invoice, state))
    ).resolves.toEqual({
      invoiceId: invoice.id,
      status: "organisation-plan-unchanged",
    });
    expect(state).toMatchObject({ invoiceStatus: "paid", planId: "plan-new" });
  });
});
