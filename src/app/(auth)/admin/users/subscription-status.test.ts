import { describe, expect, test } from "bun:test";
import { classifySubscriptions, matchesSubscriptionFilter } from "./subscription-status";
const now = new Date("2026-10-05");
const subscription = (paymentMethod: string, config = {}, status = "active", nextChargeDate = new Date("2027-01-01")) => ({ paymentMethod, config, status, nextChargeDate });
describe("subscription classification", () => {
  test("mixed user matches automatic and manual independently", () => {
    const user = classifySubscriptions([subscription("credit_card", { cardToken: "saved" }), subscription("pix")], now);
    expect(matchesSubscriptionFilter(user, "automatic")).toBe(true);
    expect(matchesSubscriptionFilter(user, "manual")).toBe(true);
    expect(matchesSubscriptionFilter(user, "none")).toBe(false);
  });
  test("card without active recurrence counts as manual", () => {
    expect(classifySubscriptions([subscription("credit_card")], now).hasAutomaticSubscription).toBe(false);
    expect(classifySubscriptions([subscription("credit_card", { cardToken: "saved" }, "paused")], now).hasManualSubscription).toBe(true);
  });
  test("expired and cancelled subscriptions do not count", () => {
    const user = classifySubscriptions([subscription("pix", {}, "active", now), subscription("credit_card", { cardToken: "saved" }, "cancelled")], now);
    expect(matchesSubscriptionFilter(user, "none")).toBe(true);
  });
});
