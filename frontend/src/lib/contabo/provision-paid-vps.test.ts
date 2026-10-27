import { beforeEach, expect, mock, test } from "bun:test";

let ip: string | null;
let job: any;
let subscriptions: any[];
let updates: any[];
let purchases = 0;
const invoice = {
  id: "purchase",
  metadata: { config: {} },
  status: "paid",
  type: "vps",
  userId: "owner",
};
mock.module("@/lib/db", () => ({
  db: {
    insert: () => ({
      values: () => ({
        onConflictDoNothing: () => ({ returning: async () => [] }),
      }),
    }),
    query: {
      pgInvoice: { findFirst: async () => invoice },
      pgVpsProvisioningJob: { findFirst: async () => job },
      pgVpsServers: { findFirst: async () => ({ id: "node" }) },
      pgVpsSubscription: { findMany: async () => subscriptions },
    },
    update: () => ({
      set: (value: any) => ({
        where: async () => {
          updates.push(value);
        },
      }),
    }),
  },
}));
mock.module("./getVps", () => ({ getContaboInstanceIpv4: async () => ip }));
mock.module("./createVps", () => ({
  createVps: async () => {
    purchases++;
    throw new Error("Unexpected purchase");
  },
}));
mock.module("@/lib/email/service", () => ({
  sendNotificationEmail: async () => {},
}));
const { provisionPaidVps, reconcileVpsInstanceLinks } = await import(
  "./provision-paid-vps"
);
beforeEach(() => {
  ip = "192.0.2.1";
  job = { instanceId: "supplier-instance", status: "created" };
  subscriptions = [
    { id: "sub", initialInvoiceId: "purchase", lastInvoiceId: "renewal" },
  ];
  updates = [];
  purchases = 0;
});
test("retries linking when IPv4 becomes available without buying another instance", async () => {
  ip = null;
  await provisionPaidVps("purchase");
  expect(updates).toHaveLength(0);
  ip = "192.0.2.1";
  await reconcileVpsInstanceLinks();
  expect(updates).toContainEqual(
    expect.objectContaining({ vpsNodeId: "node" })
  );
  expect(purchases).toBe(0);
});
test("recovers a known instance even after a linking failure marked its job failed", async () => {
  job.status = "failed";
  await reconcileVpsInstanceLinks();
  expect(updates).toContainEqual(
    expect.objectContaining({ vpsNodeId: "node" })
  );
  expect(purchases).toBe(0);
});
test("never purchases an instance to repair a legacy subscription with no known supplier ID", async () => {
  job = null;
  await reconcileVpsInstanceLinks();
  expect(updates).toHaveLength(0);
  expect(purchases).toBe(0);
});
