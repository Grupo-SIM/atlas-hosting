import { doublePrecision, pgTable } from "drizzle-orm/pg-core";

export const pgSystemConfig = pgTable("system_config", {
  domainFee: doublePrecision("domain_fee").notNull().default(5.0),
  referrerCommission: doublePrecision("referrer_commission")
    .notNull()
    .default(0.1),
});

export type SystemConfig = typeof pgSystemConfig.$inferSelect;
export type SystemConfigInsert = typeof pgSystemConfig.$inferInsert;
