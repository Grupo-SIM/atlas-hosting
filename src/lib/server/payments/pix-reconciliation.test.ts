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

  test("ignores paid, non-domain, renewal and incomplete invoices", () => {
    expect(
      shouldReconcilePixDomainInvoice(invoice({ status: "paid" }), now)
    ).toBe(false);
    expect(shouldReconcilePixDomainInvoice(invoice({ type: "vps" }), now)).toBe(
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
