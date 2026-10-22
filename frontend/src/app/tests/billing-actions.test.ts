import { afterEach, beforeEach, expect, mock, spyOn, test } from "bun:test";
import { pgInvoice, pgVpsSubscription, pgVpsPaymentLink } from "@/lib/db/schema";

const actualSimpay = await import("@/lib/server/apis/simpay");

const owner = { id: "owner", name: "Cliente Atlas", email: "owner@example.com", organization: { id: "org", domId: "customer" } };
let currentUser: typeof owner | null = owner;
let invoice: any;
let link: any;
let subscriptions: any[] = [];
let pendingAfter: (() => Promise<void>)[] = [];
let provisioned: string[] = [];
let inserts = 0;
let locks = 0;
let gatewayCalls = 0;
let consumed = 0;
let cardFailure: unknown = null;
const originalFetch = globalThis.fetch;
const originalSimpayUrl = process.env.SIMPAY_API_URL;
const forbiddenGateway = async () => { gatewayCalls++; throw new Error("Gateway must not receive zero-value payments"); };

mock.module("@/lib/auth/index", () => ({ getOptionalUser: async () => currentUser, getRealUser: async () => owner, getUser: async () => owner }));
mock.module("@/lib/auth/utils", () => ({ authenticateUser: mock(), createGuestUser: mock(), createSession: mock(), createUser: mock(), generateSessionToken: mock(), resignupUnverifiedUser: mock() }));
mock.module("@/auth", () => ({ auth: mock(), signIn: mock(), signOut: mock() }));
mock.module("next/cache", () => ({ revalidatePath: mock(), revalidateTag: mock() }));
mock.module("next/server", () => ({ after: (fn: () => Promise<void>) => pendingAfter.push(fn) }));
mock.module("@/lib/affiliate/attribution", () => ({ recordAttribution: mock() }));
mock.module("@/lib/affiliate/commission", () => ({ triggerCommissionIfApplicable: async () => {} }));
mock.module("@/lib/contabo", () => ({ provisionPaidVps: async (id: string) => { provisioned.push(id); } }));
mock.module("@/lib/email/service", () => ({ sendNotificationEmail: async () => {} }));
mock.module("@/lib/notifications/vps-purchase", () => ({ triggerPurchaseNotifications: async () => {} }));
mock.module("@/lib/server/apis/currency", () => ({ default: { convertMultiple: async () => [5.86] } }));
mock.module("@/lib/server/apis/dom", () => ({ default: { createTransaction: forbiddenGateway } }));
mock.module("@/lib/server/apis/ip2location", () => ({ default: {} }));
mock.module("@/lib/server/apis/namecheap", () => ({ default: {}, namecheapApi: {}, getDomainPricing: mock() }));
mock.module("@/lib/server/apis/plesk", () => ({ default: {} }));
mock.module("@/lib/server/apis/simpay", () => ({ ...actualSimpay, default: { createPixPayment: forbiddenGateway, createCardPayment: async () => { gatewayCalls++; if (cardFailure) throw cardFailure; return { status: "COMPLETED", paymentId: "card-payment", transactionId: "card-transaction" }; } } }));

const query = {
  pgInvoice: { findFirst: async () => invoice },
  pgVpsPaymentLink: { findFirst: async () => link ? { ...link, resultingInvoice: invoice } : null },
  pgUser: { findFirst: async () => owner },
};
const db: any = {
  query,
  execute: async () => { locks++; },
  transaction: async (fn: (tx: any) => unknown) => fn(db),
  insert: (table: unknown) => ({ values: (data: any) => {
    if (table === pgInvoice) {
      return { returning: async () => { inserts++; invoice = { id: "invoice", ...data }; return [invoice]; } };
    }
    if (table === pgVpsSubscription) {
      return { onConflictDoNothing: async () => { if (!subscriptions.some(s => s.initialInvoiceId === data.initialInvoiceId)) subscriptions.push(data); } };
    }
    throw new Error("Unexpected insert");
  } }),
  update: (table: unknown) => ({ set: (data: any) => ({ where: () => {
    const apply = () => {
      if (table === pgVpsPaymentLink) { Object.assign(link, data); return [link]; }
      if (table !== pgInvoice) throw new Error("Unexpected update");
      if (data.status === "processing" && (invoice.status !== "pending" || invoice.dueDate <= new Date() || invoice.metadata.simpayPaymentId || invoice.metadata.pixTransactionId || invoice.metadata.domTransactionId)) return [];
      if (data.status === "paid" && invoice.voucherId && !invoice.voucherConsumed) { consumed++; invoice.voucherConsumed = true; }
      if (data.status === "pending" && data.metadata && typeof data.metadata === "object" && "queryChunks" in data.metadata) {
        const { paymentStartedAt: _started, ...metadata } = invoice.metadata;
        Object.assign(invoice, data, { metadata });
      } else Object.assign(invoice, data);
      return [invoice];
    };
    return { returning: () => { const promise = Promise.resolve(apply()); return Object.assign(promise, { execute: () => promise }); }, then: (resolve: (value: unknown) => unknown) => Promise.resolve(apply()).then(resolve) };
  } }) }),
};
mock.module("@/lib/db", () => ({ db }));
const { completeVoucherCheckout, createVpsInvoice, completeCheckout, completeCheckoutWithSavedCard } = await import("@/app/actions");

beforeEach(() => {
  currentUser = owner;
  invoice = null;
  link = { id: "link", status: "pending", linkedUserId: "owner", linkedOrgId: "org", planId: "6", productType: "vps", amountBrl: 123.45, intervalMonths: 7, allowPix: true, allowBoleto: true };
  subscriptions = []; pendingAfter = []; provisioned = []; inserts = 0; locks = 0; gatewayCalls = 0; consumed = 0; cardFailure = null;
});

const zeroInvoice = () => ({ id: "invoice", type: "vps", reference: "link", userId: "owner", orgId: "org", amount: 0, originalAmount: 123.45, voucherId: "voucher", voucherConsumed: false, status: "pending", dueDate: new Date(Date.now() + 60_000), metadata: { vpsId: "6", config: { duration: "7", type: "vps" } } });

test("link checkout overrides forged price, period and quantity; reopening reuses invoice", async () => {
  const data = { planId: "6", config: { paymentLinkId: "link", customLinkAmountBrl: 0.01, duration: "99", qty: "100" } };
  expect((await createVpsInvoice(data)).status).toBe("success");
  expect(invoice.amount).toBe(123.45);
  expect(invoice.metadata.config).toMatchObject({ duration: "7", qty: "1", image: "ubuntu", location: "eu" });
  expect(invoice.metadata.config.password.length).toBeGreaterThanOrEqual(12);
  const password = invoice.metadata.config.password;
  expect((await createVpsInvoice(data)).status).toBe("success");
  expect(inserts).toBe(1);
  expect(invoice.metadata.config.password).toBe(password);
  expect(locks).toBe(2);
  invoice.status = "paid";
  expect((await createVpsInvoice(data)).status).toBe("error");
});

test("cancelled, foreign and forged custom links cannot create invoices", async () => {
  link.status = "cancelled";
  expect((await createVpsInvoice({ planId: "6", config: { paymentLinkId: "link" } })).status).toBe("error");
  link.status = "pending"; link.linkedUserId = "another";
  expect((await createVpsInvoice({ planId: "6", config: { paymentLinkId: "link" } })).status).toBe("error");
  expect((await createVpsInvoice({ planId: "6", config: { customLinkAmountBrl: 1 } })).status).toBe("error");
  expect(inserts).toBe(0);
});

test("full voucher confirmation consumes once, provisions once and keeps renewal contract price", async () => {
  invoice = zeroInvoice();
  expect((await completeVoucherCheckout("invoice")).status).toBe("success");
  expect(invoice.status).toBe("paid");
  expect((await completeVoucherCheckout("invoice")).status).toBe("success");
  expect(consumed).toBe(1);
  expect(pendingAfter).toHaveLength(1);
  for (const fn of pendingAfter) await fn();
  expect(subscriptions).toHaveLength(1);
  expect(subscriptions[0]).toMatchObject({ amountBrl: 123.45, intervalMonths: 7, paymentMethod: "voucher", initialInvoiceId: "invoice" });
  expect(provisioned).toEqual(["invoice"]);
  expect(gatewayCalls).toBe(0);
});

test("full voucher cannot confirm foreign, expired or started invoice", async () => {
  for (const patch of [{ userId: "another" }, { orgId: "another" }, { dueDate: new Date(0) }, { metadata: { simpayPaymentId: "started" } }, { status: "processing" }]) {
    invoice = { ...zeroInvoice(), ...patch };
    expect((await completeVoucherCheckout("invoice")).status).toBe("error");
  }
  expect(consumed).toBe(0);
  expect(pendingAfter).toHaveLength(0);
});

test("regular checkout rejects zero total before calling provider", async () => {
  invoice = zeroInvoice();
  expect((await completeCheckout(null, { invoiceId: "invoice" } as any)).status).toBe("error");
  expect(gatewayCalls).toBe(0);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalSimpayUrl === undefined) delete process.env.SIMPAY_API_URL;
  else process.env.SIMPAY_API_URL = originalSimpayUrl;
});

const cardPayload = () => ({ invoiceId: "invoice", card: { cardToken: "card-token", last4: "4242", brand: "visa" }, document: "52998224725", firstName: "Cliente", lastName: "Atlas", phoneNumber: "11987654321", installments: 1 } as any);
function prepareCardInvoice() {
  invoice = { ...zeroInvoice(), amount: 90, originalAmount: 123.45 };
  process.env.SIMPAY_API_URL = "https://simulated.invalid";
  spyOn(globalThis, "fetch").mockImplementation(async () => Response.json({ masterCcRate: 0 }) as any);
}

test("card timeout retains payment claim and reservation until reconciliation", async () => {
  prepareCardInvoice();
  cardFailure = new Error("simulated gateway timeout");
  const result = await completeCheckoutWithSavedCard(null, cardPayload());
  expect(result.status).toBe("error");
  expect(result.message).toContain("conciliação");
  expect(invoice.status).toBe("processing");
  expect(invoice.voucherId).toBe("voucher");
  expect(invoice.metadata.paymentStartedAt).toBeDefined();
  expect(consumed).toBe(0);
  expect((await completeCheckoutWithSavedCard(null, cardPayload())).status).toBe("error");
  expect(gatewayCalls).toBe(1);
});

test("confirmed card decline releases claim; pending gateway response does not", async () => {
  for (const gatewayStatus of ["NOT_AUTHORIZED", "PENDING"]) {
    prepareCardInvoice();
    cardFailure = new actualSimpay.SimpayPaymentDeclinedError(gatewayStatus);
    expect((await completeCheckoutWithSavedCard(null, cardPayload())).status).toBe("error");
    expect(invoice.status).toBe(gatewayStatus === "PENDING" ? "processing" : "pending");
  }
});

test("concurrent card confirmation charges once and preserves contract without repeating voucher", async () => {
  prepareCardInvoice();
  const results = await Promise.all([completeCheckoutWithSavedCard(null, cardPayload()), completeCheckoutWithSavedCard(null, cardPayload())]);
  expect(results.filter(result => result.status === "success")).toHaveLength(1);
  expect(gatewayCalls).toBe(1);
  expect(consumed).toBe(1);
  for (const fn of pendingAfter) await fn();
  expect(subscriptions).toHaveLength(1);
  expect(subscriptions[0]).toMatchObject({ amountBrl: 123.45, paymentMethod: "credit_card", intervalMonths: 7 });
});

test("Windows links provision Windows even when no configurator was used", async () => {
  link.productType = "vps-windows";
  expect((await createVpsInvoice({ planId: "6", config: { paymentLinkId: "link" } })).status).toBe("success");
  expect(invoice.metadata.config.image).toBe("windows");
  expect(invoice.metadata.config.password.length).toBeGreaterThanOrEqual(12);
});
