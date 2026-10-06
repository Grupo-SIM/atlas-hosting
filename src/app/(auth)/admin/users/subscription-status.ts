export const BILLING_METHOD_LABELS = {
  credit_card: "Cartão de crédito",
  pix: "PIX",
  boleto: "Boleto",
  voucher: "Voucher",
} as const;

export type BillingMethod = keyof typeof BILLING_METHOD_LABELS;
export type SubscriptionFilter = "all" | BillingMethod | "none";

export function classifySubscriptions(subscriptions: {
  status: string;
  nextChargeDate: Date;
  paymentMethod: BillingMethod;
}[], now = new Date()) {
  const current = subscriptions.filter(s =>
    ["active", "paused"].includes(s.status) && s.nextChargeDate > now);
  return {
    hasActiveSubscription: current.length > 0,
    billingMethods: (Object.keys(BILLING_METHOD_LABELS) as BillingMethod[])
      .filter(method => current.some(s => s.paymentMethod === method)),
  };
}

export function matchesSubscriptionFilter(user: ReturnType<typeof classifySubscriptions>, filter: SubscriptionFilter) {
  if (filter === "all") return true;
  if (filter === "none") return !user.hasActiveSubscription;
  return user.billingMethods.includes(filter);
}

export function subscriptionBillingLabel(user: ReturnType<typeof classifySubscriptions>) {
  return user.billingMethods.map(method => BILLING_METHOD_LABELS[method]).join(" / ") || "Sem assinatura";
}
