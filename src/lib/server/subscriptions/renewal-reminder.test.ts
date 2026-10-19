import { beforeEach, expect, mock, test } from "bun:test";

let sub: any;
let invoice: any;
let sent: any[][];
let updates: number;
mock.module("@/lib/db", () => ({ db: { transaction: async (run: any) => run({
  execute: async () => {},
  query: {
    pgVpsSubscription: { findFirst: async () => sub },
    pgInvoice: { findFirst: async () => invoice },
  },
  update: () => ({ set: () => ({ where: async () => { updates++; } }) }),
}) } }));
mock.module("./renewal-invoice", () => ({ ensureRenewalInvoice: async () => invoice }));
mock.module("@/lib/email/service", () => ({ sendNotificationEmail: async (...args: any[]) => { sent.push(args); } }));
const { notifySubscriptionExpiring } = await import("./renewal-reminder");

beforeEach(() => {
  sub = { id: "sub", status: "active", planType: "vps", planId: "4", amountBrl: 126.49, intervalMonths: 1,
    nextChargeDate: new Date("2026-11-20T18:00:00-03:00"), config: {}, user: { name: "Cliente", email: "client@example.test" } };
  invoice = { id: "invoice", status: "pending" };
  sent = []; updates = 0;
});

for (const days of [1, 0]) {
  for (const status of ["pending", "failed"]) {
    test(`reminder ${days} days before renewal sends for ${status} payment`, async () => {
      invoice.status = status;
      expect(await notifySubscriptionExpiring(sub, days, "https://atlas.example.test")).toBe(true);
      expect(sent).toHaveLength(1);
      expect(sent[0][3]).toContain(days === 0 ? "renova hoje" : "renova em 1 dia");
      expect(sent[0][6]).toBe("https://atlas.example.test/checkout/invoice?initialStep=payment");
      expect(updates).toBe(1);
    });
  }
  for (const status of ["paid", "processing"]) {
    test(`reminder ${days} days before renewal skips ${status} payment`, async () => {
      invoice.status = status;
      expect(await notifySubscriptionExpiring(sub, days, "https://atlas.example.test")).toBe(false);
      expect(sent).toHaveLength(0);
      expect(updates).toBe(0);
    });
  }
}
test("uncertain card charge waits for reconciliation", async () => {
  sub.config.renewalCardUncertain = true;
  expect(await notifySubscriptionExpiring(sub, 0, "https://atlas.example.test")).toBe(false);
  expect(sent).toHaveLength(0);
});
test("persisted checkpoint prevents resend after scheduler restart", async () => {
  sub.config.renewalReminderSent = { [`${sub.nextChargeDate.toISOString()}:0`]: true };
  expect(await notifySubscriptionExpiring(sub, 0, "https://atlas.example.test")).toBe(false);
  expect(sent).toHaveLength(0);
});
test("payment advancing cycle during reminder preparation prevents stale reminder", async () => {
  const snapshot = { ...sub };
  sub.nextChargeDate = new Date("2026-12-20T18:00:00-03:00");
  expect(await notifySubscriptionExpiring(snapshot, 0, "https://atlas.example.test")).toBe(false);
  expect(sent).toHaveLength(0);
});
