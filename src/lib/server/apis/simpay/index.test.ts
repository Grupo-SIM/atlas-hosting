import { describe, expect, test } from "bun:test";
import { isApprovedPaymentStatus } from "./index";

describe("Simpay approved payment statuses", () => {
  test("normalizes approved statuses returned by Simpay and DOM", () => {
    for (const status of [
      "completed",
      "PAID",
      "Approved",
      "confirmed",
      "authorized",
      "captured",
      "succeeded",
      "success",
      "charge-approved",
    ]) {
      expect(isApprovedPaymentStatus(status)).toBe(true);
    }
  });

  test("does not approve pending or failed statuses", () => {
    expect(isApprovedPaymentStatus("pending")).toBe(false);
    expect(isApprovedPaymentStatus("failed")).toBe(false);
    expect(isApprovedPaymentStatus(undefined)).toBe(false);
  });
});
