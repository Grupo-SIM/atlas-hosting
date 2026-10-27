import { beforeEach, expect, mock, test } from "bun:test";

let ip: string | null;
let job: any;
let subscriptions: any[];
let updates: any[];
let purchases = 0;
let nodeOwner = "owner";
const invoice = {
  id: "purchase",
  metadata: { config: {}, vpsId: "6" },
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
      pgVpsServers: {
        findFirst: async () => ({ id: "node", userId: nodeOwner }),
      },
      pgVpsSubscription: {
        findFirst: async () => subscriptions[0],
        findMany: async () => subscriptions,
      },
    },
    update: () => ({
      set: (value: any) => ({
        where: () => ({
          returning: async () => {
            if (job?.status !== "pending") return [];
            updates.push(value);
            job.status = "provisioning";
            return [{ id: "job" }];
          },
          then: (resolve: (value: unknown) => unknown) => {
            updates.push(value);
            return Promise.resolve([]).then(resolve);
          },
        }),
      }),
    }),
  },
}));
mock.module("./getVps", () => ({ getContaboInstanceIpv4: async () => ip }));
mock.module("./createSecret", () => ({
  createContaboPasswordSecret: async () => 1,
}));
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
    {
      id: "sub",
      initialInvoiceId: "purchase",
      lastInvoiceId: "renewal",
      status: "active",
    },
  ];
  updates = [];
  purchases = 0;
  nodeOwner = "owner";
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

test("never provisions without a persisted subscription", async () => {
  subscriptions = [];
  await expect(provisionPaidVps("purchase")).rejects.toThrow(
    "Assinatura deve estar persistida"
  );
  expect(purchases).toBe(0);
});
test("never links a supplier instance registered to another user", async () => {
  nodeOwner = "different-owner";
  await provisionPaidVps("purchase");
  expect(updates.some(value => value.vpsNodeId)).toBe(false);
  expect(purchases).toBe(0);
});

test("legacy subscription without supplier reservation cannot trigger a new purchase", async () => {
  job = null;
  await expect(provisionPaidVps("purchase")).rejects.toThrow(
    "Provisionamento sem reserva persistida"
  );
  expect(purchases).toBe(0);
});

test("resumes a committed pending reservation but never retries an uncertain supplier purchase", async () => {
  job = { id: "job", instanceId: null, status: "pending" };
  await reconcileVpsInstanceLinks();
  expect(purchases).toBe(1);
  expect(job.status).toBe("provisioning");
  await reconcileVpsInstanceLinks();
  expect(purchases).toBe(1);
});
