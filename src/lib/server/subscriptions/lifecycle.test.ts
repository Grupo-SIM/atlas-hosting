import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { pgInvoice, pgVpsSubscription } from "@/lib/db/schema";
import type { Invoice } from "@/lib/db/schema";

const originalEmergencyEmails = process.env.EMERGENCY_ALERT_EMAILS;
afterAll(() => { if (originalEmergencyEmails === undefined) delete process.env.EMERGENCY_ALERT_EMAILS; else process.env.EMERGENCY_ALERT_EMAILS = originalEmergencyEmails; });

let sub: any;
let invoice: any;
let invoiceReads = 0;
let cancellations: Array<{ id: string; date: Date }> = [];
let alerts: string[] = [];
let smtpFails = false;
let cancellationFails = false;

function update(table: unknown) {
  return { set(values: any) { return { where() {
    if (table === pgVpsSubscription) {
      if (values.config?.queryChunks) sub.config.renewalCancellation.alertSentAt = "sent";
      else Object.assign(sub, values);
    }
    if (table === pgInvoice) Object.assign(invoice, values);
    return { then(resolve: (value: unknown) => unknown) { return Promise.resolve([]).then(resolve); }, returning() { return Promise.resolve([{ id: invoice.id }]); } };
  } }; } };
}
const tx = {
  execute: async () => {},
  query: {
    pgVpsSubscription: { findFirst: async () => sub },
    pgInvoice: { findFirst: async () => invoice },
  },
  update,
  insert: () => ({ values: async () => {} }),
};
mock.module("@/lib/db", () => ({ db: {
  transaction: async (run: (tx: any) => unknown) => run(tx),
  query: { pgVpsSubscription: { findMany: async () => [sub] } }, update,
} }));
mock.module("@/lib/contabo/cancelVps", () => ({ cancelVpsOnDate: async (id: string, date: Date) => {
  if (cancellationFails) throw new Error("provider unavailable");
  cancellations.push({ id, date });
} }));
mock.module("@/lib/contabo/getVps", () => ({ getContaboInstanceName: async () => "Nome real na Contabo" }));
mock.module("@/lib/email/service", () => ({ sendNotificationEmail: async (...args: any[]) => {
  if (smtpFails) throw new Error("SMTP unavailable");
  alerts.push(args[4]);
} }));
const { processRenewal, applyRenewalPayment, notifyPendingCancellationWithdrawals } = await import("./lifecycle");

beforeEach(() => {
  sub = { id: "sub", userId: "user", status: "active", nextChargeDate: new Date("2026-11-20T18:00:00-03:00"), intervalMonths: 1,
    paymentMethod: "credit_card", failureCount: 0, config: { cardToken: "token" }, vpsNode: { externalId: "12345", name: "Nome local" } };
  invoice = { id: "invoice", userId: "user", status: "pending", metadata: { isRenewal: true, subscriptionId: "sub", renewalCycle: sub.nextChargeDate.toISOString(), config: {} } };
  cancellations = []; alerts = []; smtpFails = false; cancellationFails = false; invoiceReads = 0;
  process.env.EMERGENCY_ALERT_EMAILS = "admin@example.test";
});
const firstDay = new Date("2026-11-20T09:00:00-03:00");
const secondDay = new Date("2026-11-21T09:00:00-03:00");
const declined = async () => { throw Object.assign(new Error("card declined"), { gatewayStatus: "DECLINED" }); };

describe("VPS plan renewal lifecycle", () => {
  test("first failure waits until next date; restarts do not charge twice", async () => {
    let attempts = 0;
    const charge = async () => { attempts++; throw Object.assign(new Error("declined"), { gatewayStatus: "DECLINED" }); };
    expect(await processRenewal("sub", invoice as Invoice, charge, firstDay)).toBe("retry-tomorrow");
    invoiceReads = 0;
    expect(await processRenewal("sub", invoice as Invoice, charge, firstDay)).toBe("skipped");
    expect(attempts).toBe(1);
    expect(cancellations).toHaveLength(0);
    invoiceReads = 0;
    expect(await processRenewal("sub", invoice as Invoice, charge, secondDay)).toBe("cancellation-scheduled");
    expect(attempts).toBe(2);
    expect(cancellations[0]).toEqual({ id: "12345", date: new Date("2026-11-22T21:00:00Z") });
  });
  test("second-day success advances original cycle and never cancels", async () => {
    await processRenewal("sub", invoice as Invoice, declined, firstDay);
    invoiceReads = 0;
    expect(await processRenewal("sub", invoice as Invoice, async () => {}, secondDay)).toBe("charged");
    expect(sub.nextChargeDate.toISOString()).toBe("2026-12-20T21:00:00.000Z");
    expect(invoice.status).toBe("paid");
    expect(cancellations).toHaveLength(0);
  });
  test("unpaid Pix uses same cancellation deadline without card charge", async () => {
    sub.paymentMethod = "pix";
    let charges = 0;
    expect(await processRenewal("sub", invoice as Invoice, async () => { charges++; }, secondDay)).toBe("cancellation-scheduled");
    expect(charges).toBe(0);
    expect(cancellations).toHaveLength(1);
  });
  for (const method of ["pix", "credit_card"] as const) {
    test(`${method} confirmed after cancellation sends emergency name and provider ID`, async () => {
      await processRenewal("sub", invoice as Invoice, declined, secondDay);
      await applyRenewalPayment(invoice as Invoice, method);
      expect(sub.status).toBe("active");
      expect(sub.config.renewalCancellation.withdrawalRequired).toBe(true);
      expect(alerts[0]).toContain("Nome real na Contabo");
      expect(alerts[0]).toContain("12345");
      await applyRenewalPayment(invoice as Invoice, method);
      expect(alerts).toHaveLength(1);
      expect(sub.nextChargeDate.toISOString()).toBe("2026-12-20T21:00:00.000Z");
    });
  }
  test("SMTP failure preserves payment and retries emergency alert", async () => {
    await processRenewal("sub", invoice as Invoice, declined, secondDay);
    smtpFails = true;
    await applyRenewalPayment(invoice as Invoice, "pix");
    expect(sub.status).toBe("active");
    expect(sub.config.renewalCancellation.alertSentAt).toBeUndefined();
    smtpFails = false;
    await notifyPendingCancellationWithdrawals();
    expect(alerts).toHaveLength(1);
  });
  test("provider failure does not claim cancellation succeeded", async () => {
    cancellationFails = true;
    let attempts = 0;
    const charge = async () => { attempts++; throw Object.assign(new Error("declined"), { gatewayStatus: "DECLINED" }); };
    expect(await processRenewal("sub", invoice as Invoice, charge, secondDay)).toBe("cancellation-error");
    expect(sub.config.renewalCancellationPending).toBe(true);
    invoiceReads = 0;
    cancellationFails = false;
    expect(await processRenewal("sub", invoice as Invoice, charge, secondDay)).toBe("cancellation-scheduled");
    expect(attempts).toBe(1);
    expect(cancellations).toHaveLength(1);
    expect(sub.status).toBe("paused");
  });
  test("paid cycle is advanced without another charge", async () => {
    invoice.status = "paid";
    let attempts = 0;
    expect(await processRenewal("sub", invoice as Invoice, async () => { attempts++; }, secondDay)).toBe("paid");
    expect(attempts).toBe(0);
    expect(cancellations).toHaveLength(0);
  });
  test("payment reservation is durable before calling gateway", async () => {
    await processRenewal("sub", invoice as Invoice, async () => {
      expect(invoice.status).toBe("processing");
      expect(sub.config.renewalCardUncertain).toBe(true);
      expect(sub.config.renewalClaimedAttemptDay).toBe(1);
    }, firstDay);
    expect(sub.status).toBe("active");
  });
  test("timeout preserves payment claim and never repeats an uncertain charge", async () => {
    let attempts = 0;
    const charge = async () => { attempts++; throw new Error("timeout"); };
    await processRenewal("sub", invoice as Invoice, charge, firstDay);
    expect(invoice.status).toBe("processing");
    expect(sub.config.renewalCardUncertain).toBe(true);
    invoiceReads = 0;
    expect(await processRenewal("sub", invoice as Invoice, charge, secondDay)).toBe("cancellation-scheduled");
    expect(attempts).toBe(1);
  });
  test("pending card retains gateway payment ID for reconciliation", async () => {
    await processRenewal("sub", invoice as Invoice, async () => {
      throw Object.assign(new Error("pending"), { gatewayStatus: "PENDING", paymentId: "gateway-123" });
    }, firstDay);
    expect(invoice.status).toBe("processing");
    expect(invoice.metadata.renewalCardPaymentId).toBe("gateway-123");
  });
  test("in-flight checkout cannot be charged or cancelled concurrently", async () => {
    invoice.status = "processing";
    let attempts = 0;
    expect(await processRenewal("sub", invoice as Invoice, async () => { attempts++; }, secondDay)).toBe("payment-processing");
    expect(attempts).toBe(0);
    expect(cancellations).toHaveLength(0);
  });
});
