import { expect, test } from "bun:test";
import { assertPaymentLinkEditable, paymentLinkEffectiveStatus } from "./status";
test("created and opened links remain pending until payment", () => {
  expect(paymentLinkEffectiveStatus("pending", null)).toBe("pending");
  expect(paymentLinkEffectiveStatus("used", "pending")).toBe("pending");
  expect(paymentLinkEffectiveStatus("used", "paid")).toBe("paid");
  expect(paymentLinkEffectiveStatus("cancelled", "expired")).toBe("cancelled");
});
test("cancellation requires reconciliation once payment starts", () => {
  expect(() => assertPaymentLinkEditable({ status: "pending", metadata: { pixTransactionId: "created" } })).toThrow("Concilie");
  expect(() => assertPaymentLinkEditable({ status: "pending", metadata: { simpayPaymentId: "created" } })).toThrow("Concilie");
  expect(() => assertPaymentLinkEditable({ status: "pending", metadata: { domTransactionId: "boleto-created" } })).toThrow("Concilie");
  expect(() => assertPaymentLinkEditable({ status: "expired", metadata: { paymentStartedAt: "uncertain-card" } })).toThrow("Concilie");
  expect(() => assertPaymentLinkEditable({ status: "processing" })).toThrow();
  expect(() => assertPaymentLinkEditable({ status: "paid" })).toThrow();
  expect(() => assertPaymentLinkEditable({ status: "pending" })).not.toThrow();
});
