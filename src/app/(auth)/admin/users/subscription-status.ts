export type SubscriptionFilter = "all" | "automatic" | "manual" | "none";

export function classifySubscriptions(subscriptions: {
  status: string;
  nextChargeDate: Date;
  paymentMethod: string;
  config: unknown;
}[], now = new Date()) {
  const current = subscriptions.filter(s =>
    ["active", "paused"].includes(s.status) && s.nextChargeDate > now);
  const automatic = (s: typeof current[number]) =>
    s.status === "active" && s.paymentMethod === "credit_card" &&
    typeof (s.config as { cardToken?: unknown } | null)?.cardToken === "string" &&
    Boolean((s.config as { cardToken?: string }).cardToken?.trim());
  return {
    hasActiveSubscription: current.length > 0,
    hasAutomaticSubscription: current.some(automatic),
    hasManualSubscription: current.some(s => !automatic(s)),
  };
}

export function matchesSubscriptionFilter(user: ReturnType<typeof classifySubscriptions>, filter: SubscriptionFilter) {
  if (filter === "automatic") return user.hasAutomaticSubscription;
  if (filter === "manual") return user.hasManualSubscription;
  if (filter === "none") return !user.hasActiveSubscription;
  return true;
}

export function subscriptionBillingLabel(user: ReturnType<typeof classifySubscriptions>) {
  return [user.hasAutomaticSubscription && "Automática", user.hasManualSubscription && "Manual"].filter(Boolean).join(" / ") || "-";
}
