import { describe, expect, test } from "bun:test";
import { classifySubscriptions, matchesSubscriptionFilter, subscriptionBillingLabel, type BillingMethod } from "./subscription-status";

const now = new Date("2026-10-05");
const subscription = (paymentMethod: BillingMethod, status = "active", nextChargeDate = new Date("2027-01-01")) => ({ paymentMethod, status, nextChargeDate });

describe("subscription billing methods", () => {
  test("mixed user matches each method and labels each method once", () => {
    const user = classifySubscriptions([subscription("pix"), subscription("credit_card"), subscription("pix")], now);
    expect(matchesSubscriptionFilter(user, "credit_card")).toBe(true);
    expect(matchesSubscriptionFilter(user, "pix")).toBe(true);
    expect(matchesSubscriptionFilter(user, "boleto")).toBe(false);
    expect(matchesSubscriptionFilter(user, "none")).toBe(false);
    expect(subscriptionBillingLabel(user)).toBe("Cartão de crédito / PIX");
  });
  test("paused cards, boleto and voucher retain their payment methods", () => {
    const user = classifySubscriptions([subscription("credit_card", "paused"), subscription("boleto"), subscription("voucher")], now);
    expect(user.billingMethods).toEqual(["credit_card", "boleto", "voucher"]);
    expect(matchesSubscriptionFilter(user, "boleto")).toBe(true);
    expect(matchesSubscriptionFilter(user, "voucher")).toBe(true);
    expect(subscriptionBillingLabel(user)).toBe("Cartão de crédito / Boleto / Voucher");
  });
  test("expired, cancelled and failed subscriptions do not count", () => {
    const user = classifySubscriptions([subscription("pix", "active", now), subscription("credit_card", "cancelled"), subscription("boleto", "failed")], now);
    expect(matchesSubscriptionFilter(user, "none")).toBe(true);
    expect(matchesSubscriptionFilter(user, "pix")).toBe(false);
    expect(matchesSubscriptionFilter(user, "all")).toBe(true);
    expect(subscriptionBillingLabel(user)).toBe("Sem assinatura");
  });
  test("user without subscriptions has no billing method", () => {
    const user = classifySubscriptions([], now);
    expect(matchesSubscriptionFilter(user, "none")).toBe(true);
    expect(subscriptionBillingLabel(user)).toBe("Sem assinatura");
  });
});
