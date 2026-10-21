import { describe, expect, test } from "bun:test";
import type { Invoice } from "@/lib/db/schema";
import {
  PIX_RECONCILIATION_DELAY_MS,
  shouldReconcilePixDomainInvoice,
} from "./pix-reconciliation";

const now = new Date("2026-08-13T15:00:00.000Z");

function invoice(
  overrides: Partial<
    Pick<Invoice, "metadata" | "status" | "type" | "updatedAt">
  > = {}
) {
  return {
    createdAt: new Date(now.getTime() - PIX_RECONCILIATION_DELAY_MS * 2),
    metadata: {
      pixCheckout: {},
      simpayPaymentId: "pix_123",
      whoisguard: "on",
      years: "1",
    },
    status: "pending",
    type: "domain",
    updatedAt: new Date(now.getTime() - PIX_RECONCILIATION_DELAY_MS),
    ...overrides,
  } as Pick<
    Invoice,
    "createdAt" | "metadata" | "status" | "type" | "updatedAt"
  >;
}

describe("PIX domain reconciliation candidate", () => {
  test("starts the server fallback after thirty seconds", () => {
    expect(PIX_RECONCILIATION_DELAY_MS).toBe(30_000);
  });

  test("includes old pending and expired PIX domain invoices", () => {
    expect(shouldReconcilePixDomainInvoice(invoice(), now)).toBe(true);
    expect(
      shouldReconcilePixDomainInvoice(invoice({ status: "expired" }), now)
    ).toBe(true);
  });

  test("keeps reconciling a PIX paid one hour and fifty-four minutes later", () => {
    const pending = invoice({
      metadata: {
        ...invoice().metadata,
        pixCreatedAt: "2026-08-13T17:25:00-03:00",
      },
    });
    expect(shouldReconcilePixDomainInvoice(pending, new Date("2026-08-13T19:19:00-03:00"))).toBe(true);
    // A confirmação pode chegar depois do vencimento local da fatura.
    expect(shouldReconcilePixDomainInvoice({ ...pending, status: "expired" }, new Date("2026-08-14T19:19:00-03:00"))).toBe(true);
  });

  test("reconciles VPS renewal without an open checkout", () => {
    expect(shouldReconcilePixDomainInvoice(invoice({ type: "vps", metadata: { ...invoice().metadata, vpsId: "4", config: { duration: "1" }, isRenewal: true, subscriptionId: "sub" } }), now)).toBe(true);
  });

  test("waits thirty seconds before the server reconciliation starts", () => {
    const metadata = {
      ...(invoice().metadata as Record<string, unknown>),
      pixCreatedAt: new Date(
        now.getTime() - PIX_RECONCILIATION_DELAY_MS + 1000
      ).toISOString(),
    };
    expect(shouldReconcilePixDomainInvoice(invoice({ metadata }), now)).toBe(
      false
    );
  });

  test("ignores paid, subscription, domain renewal and incomplete invoices", () => {
    expect(
      shouldReconcilePixDomainInvoice(invoice({ status: "paid" }), now)
    ).toBe(false);
    expect(shouldReconcilePixDomainInvoice(invoice({ type: "vps" }), now)).toBe(false);
    expect(shouldReconcilePixDomainInvoice(invoice({ type: "subscription" }), now)).toBe(
      false
    );
    expect(
      shouldReconcilePixDomainInvoice(
        invoice({ metadata: { ...invoice().metadata, isRenewal: true } }),
        now
      )
    ).toBe(false);
    expect(
      shouldReconcilePixDomainInvoice(
        invoice({ metadata: { whoisguard: "on", years: "1" } }),
        now
      )
    ).toBe(false);
  });
});
