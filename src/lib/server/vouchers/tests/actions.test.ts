import { beforeEach, describe, expect, mock, test } from "bun:test";

const user = { id: "owner", organization: { id: "org" } };
let reads: unknown[][] = [];
let updates: Record<string, unknown>[] = [];
let locks = 0;
let returning: unknown[] = [{ id: "invoice" }];
const chain = () => ({ where: () => ({ for: async () => { locks++; return reads.shift() ?? []; }, then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(reads.shift() ?? []).then(resolve) }) });
const tx = {
  select: () => ({ from: chain }),
  update: () => ({ set: (value: Record<string, unknown>) => {
    updates.push(value);
    return { where: () => ({ returning: async () => returning, then: (resolve: (value: unknown[]) => unknown) => Promise.resolve([]).then(resolve) }) };
  } }),
};
mock.module("@/lib/auth", () => ({ getRealUser: async () => user }));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("@/lib/db", () => ({ db: { ...tx, transaction: async (fn: (t: typeof tx) => unknown) => fn(tx) } }));
const { applyVoucher, removeVoucher } = await import("@/app/(auth)/vouchers/actions");
const invoice = { id: "invoice", userId: "owner", orgId: "org", status: "pending", dueDate: new Date(Date.now() + 60000), amount: 19.99, metadata: {}, voucherId: null };
const voucher = { id: "voucher", active: true, userId: null, expiresAt: null, currentUses: 0, maxUses: 1, discountType: "percentage", discountValue: 15 };

beforeEach(() => { reads = []; updates = []; locks = 0; returning = [{ id: "invoice" }]; });
describe("server voucher reservation", () => {
  test("persists original amount and association without consuming usage", async () => {
    reads = [[invoice], [voucher], [{ count: 0 }]];
    expect(await applyVoucher("invoice", " test ")).toMatchObject({ status: "success", finalAmount: 16.99, discount: 3 });
    expect(locks).toBe(2);
    expect(updates).toHaveLength(1);
    expect(updates[0]).toMatchObject({ amount: 16.99, originalAmount: 19.99, voucherDiscount: 300, voucherId: "voucher" });
    expect(updates[0]).not.toHaveProperty("currentUses");
  });
  test("blocks foreign invoices, cumulative discounts and started payments", async () => {
    for (const patch of [{ userId: "other" }, { orgId: "other" }, { voucherId: "existing" }, { status: "paid" }, { status: "processing" }, { metadata: { simpayPaymentId: "started" } }, { metadata: { paymentStartedAt: "uncertain-card" } }, { dueDate: new Date(0) }]) {
      reads = [[{ ...invoice, ...patch }]];
      expect((await applyVoucher("invoice", "test")).status).toBe("error");
    }
    expect(updates).toHaveLength(0);
  });
  test("blocks invalid, expired, exhausted and foreign vouchers", async () => {
    for (const variant of [null, { ...voucher, active: false }, { ...voucher, expiresAt: new Date(0) }, { ...voucher, currentUses: 1 }, { ...voucher, userId: "other" }]) {
      reads = [[invoice], variant ? [variant] : [], [{ count: 0 }]];
      expect((await applyVoucher("invoice", "test")).status).toBe("error");
    }
    expect(updates).toHaveLength(0);
  });
  test("active reservation occupies final available use", async () => {
    reads = [[invoice], [voucher], [{ count: 1 }]];
    expect((await applyVoucher("invoice", "test")).status).toBe("error");
    expect(updates).toHaveLength(0);
  });
  test("removal clears reservation and restores server original amount", async () => {
    expect((await removeVoucher("invoice")).status).toBe("success");
    expect(updates[0]).toMatchObject({ originalAmount: null, voucherId: null, voucherDiscount: 0 });
    expect(updates[0].amount).toBeDefined();
  });
  test("conditional removal rejects unavailable or unauthorized invoice", async () => {
    returning = [];
    expect((await removeVoucher("invoice")).status).toBe("error");
  });
});
