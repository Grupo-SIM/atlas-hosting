import { afterAll, beforeEach, describe, expect, test } from "bun:test";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgSystemConfig } from "@/lib/db/schema";
import { savePaymentSettings } from "../payment-settings";

// Only run against an explicitly supplied, disposable local database.
const testUrl = process.env.PAYMENT_SETTINGS_TEST_DATABASE_URL;
if (testUrl) {
  const url = new URL(testUrl);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || process.env.DATABASE_URL !== testUrl) {
    throw new Error("Payment settings tests require the same explicit local DATABASE_URL.");
  }
}

describe.skipIf(!testUrl)("payment settings persistence", () => {
  beforeEach(async () => {
    await db.execute(sql`DROP TABLE IF EXISTS system_config`);
    await db.execute(sql`CREATE TABLE system_config (
      boleto_enabled boolean NOT NULL DEFAULT false,
      pix_allow_all_durations boolean NOT NULL DEFAULT false,
      domain_fee double precision NOT NULL DEFAULT 5,
      min_withdrawal_amount double precision NOT NULL DEFAULT 100,
      referrer_commission double precision NOT NULL DEFAULT 0.1,
      withdrawal_fee double precision NOT NULL DEFAULT 2
    )`);
  });

  afterAll(async () => {
    await db.execute(sql`DROP TABLE IF EXISTS system_config`);
  });

  test("creates missing configuration and preserves unrelated settings on updates", async () => {
    await savePaymentSettings({ pixAllowAllDurations: true });
    expect(await db.query.pgSystemConfig.findFirst()).toMatchObject({ pixAllowAllDurations: true, boletoEnabled: false });
    await db.update(pgSystemConfig).set({ domainFee: 17 });
    await savePaymentSettings({ boletoEnabled: true });
    expect(await db.query.pgSystemConfig.findFirst()).toMatchObject({ pixAllowAllDurations: true, boletoEnabled: true, domainFee: 17 });
    await savePaymentSettings({ pixAllowAllDurations: false });
    await savePaymentSettings({ boletoEnabled: false });
    expect(await db.query.pgSystemConfig.findFirst()).toMatchObject({ pixAllowAllDurations: false, boletoEnabled: false, domainFee: 17 });
  });

  test("concurrent first saves preserve both flags in one configuration", async () => {
    await Promise.all([
      savePaymentSettings({ pixAllowAllDurations: true }),
      savePaymentSettings({ boletoEnabled: true }),
    ]);
    const rows = await db.select().from(pgSystemConfig);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ pixAllowAllDurations: true, boletoEnabled: true });
  });
});
