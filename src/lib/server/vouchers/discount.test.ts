import { describe, expect, test } from "bun:test";
import { calculateVoucherDiscount } from "./discount";

describe("voucher amounts in cents", () => {
  test("rounds percentage once and preserves exact remaining cents", () => {
    expect(calculateVoucherDiscount(19.99, "percentage", 15)).toEqual({ discountCents: 300, finalAmount: 16.99 });
  });
  test("caps fixed and percentage discounts at full invoice value", () => {
    expect(calculateVoucherDiscount(25.01, "fixed", 100)).toEqual({ discountCents: 2501, finalAmount: 0 });
    expect(calculateVoucherDiscount(25.01, "percentage", 100)).toEqual({ discountCents: 2501, finalAmount: 0 });
  });
  test("rejects malformed values and excessive percentages", () => {
    for (const value of [-1, NaN, Infinity, 101]) expect(() => calculateVoucherDiscount(100, "percentage", value)).toThrow();
    expect(() => calculateVoucherDiscount(-5, "fixed", 10)).toThrow();
    expect(() => calculateVoucherDiscount(1e300, "fixed", 10)).toThrow();
    expect(() => calculateVoucherDiscount(10, "unknown" as any, 10)).toThrow();
  });
});
