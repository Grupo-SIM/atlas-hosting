import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgSystemConfig } from "@/lib/db/schema";

type PaymentSettings = Partial<
  Pick<typeof pgSystemConfig.$inferInsert, "pixAllowAllDurations" | "boletoEnabled">
>;

export async function savePaymentSettings(settings: PaymentSettings) {
  await db.transaction(async tx => {
    // No primary key: serialize initialization and updates of this singleton.
    await tx.execute(sql`LOCK TABLE system_config IN SHARE ROW EXCLUSIVE MODE`);
    const updated = await tx.update(pgSystemConfig).set(settings).returning();
    if (updated.length === 0) {
      await tx.insert(pgSystemConfig).values(settings);
    }
  });
}
