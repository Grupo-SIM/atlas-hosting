import { beforeEach, expect, mock, test } from "bun:test";

let principal = "owner";
let card: any;
let sub: any;
let processing: any;
let updated: any;
const user = {
  billingDocument: "52998224725",
  billingPhone: "11987654321",
  id: "owner",
  organization: { id: "org", ownerId: "owner", wallet: { id: "wallet" } },
};
const tx = {
  execute: async () => {},
  insert: () => ({ values: async () => {} }),
  query: {
    pgInvoice: { findFirst: async () => processing },
    pgUserCard: { findFirst: async () => card },
    pgVpsSubscription: { findFirst: async () => sub },
  },
  update: () => ({
    set: (data: any) => ({
      where: async () => {
        updated = data;
      },
    }),
  }),
};
mock.module("@/lib/auth", () => ({
  getRealUser: async () => ({ id: principal }),
  getUser: async () => user,
}));
mock.module("@/lib/db", () => ({
  db: { transaction: async (run: any) => run(tx) },
}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
const { associateSubscriptionCard } = await import("./payment-actions");
beforeEach(() => {
  principal = "owner";
  card = {
    brand: "Visa",
    cardToken: "token",
    expiryMonth: "12",
    expiryYear: "2099",
    last4: "4242",
  };
  sub = {
    config: { backup: true, renewalLastAttemptDay: 2 },
    id: "sub",
    paymentMethod: "credit_card",
    status: "active",
  };
  updated = null;
  processing = null;
});
test("explicit selection attaches token and allows renewal after a settled failed attempt", async () => {
  expect((await associateSubscriptionCard("sub", "card")).ok).toBe(true);
  expect(updated.config).toEqual({ backup: true, cardToken: "token" });
});
test("rejects missing/foreign card and subscription, and impersonation", async () => {
  card = null;
  expect((await associateSubscriptionCard("sub", "foreign")).ok).toBe(false);
  sub = null;
  expect((await associateSubscriptionCard("foreign", "card")).ok).toBe(false);
  principal = "admin";
  expect((await associateSubscriptionCard("sub", "card")).ok).toBe(false);
  expect(updated).toBeNull();
});
test("uncertain payments and cancellations cannot be reset by changing card", async () => {
  for (const key of [
    "renewalCardUncertain",
    "renewalCancellation",
    "renewalCancellationPending",
  ]) {
    sub.config = { [key]: true };
    expect((await associateSubscriptionCard("sub", "card")).ok).toBe(false);
  }
  sub.config = {};
  processing = { id: "invoice" };
  expect((await associateSubscriptionCard("sub", "card")).ok).toBe(false);
  expect(updated).toBeNull();
});
test("expired cards and paused subscriptions cannot enable automatic charges", async () => {
  card.expiryYear = "2000";
  expect((await associateSubscriptionCard("sub", "card")).ok).toBe(false);
  card.expiryYear = "2099";
  sub.status = "paused";
  expect((await associateSubscriptionCard("sub", "card")).ok).toBe(false);
  expect(updated).toBeNull();
});

test("missing payer details cannot silently enable a renewal that the gateway cannot process", async () => {
  const previous = user.billingDocument;
  user.billingDocument = "";
  try {
    expect((await associateSubscriptionCard("sub", "card")).ok).toBe(false);
    expect(updated).toBeNull();
  } finally {
    user.billingDocument = previous;
  }
});
