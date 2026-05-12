import { pgTable, text, uuid, timestamp, integer, doublePrecision, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgOrganization } from "./organization";
import { pgUser } from "./user";
import { pgInvoice } from "./invoice";

export const pgVpsSubscription = pgTable("vps_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => pgOrganization.id),
  userId: uuid("user_id").notNull().references(() => pgUser.id),
  planId: text("plan_id").notNull(),
  planType: text("plan_type", { enum: ["vps", "vds", "storage-vps", "vps-windows"] }).notNull().default("vps"),
  config: json("config").notNull(),
  intervalMonths: integer("interval_months").notNull(),
  amountBrl: doublePrecision("amount_brl").notNull(),
  status: text("status", { enum: ["active", "cancelled", "failed", "paused"] }).notNull().default("active"),
  nextChargeDate: timestamp("next_charge_date", { mode: "date" }).notNull(),
  lastInvoiceId: uuid("last_invoice_id").references(() => pgInvoice.id),
  failureCount: integer("failure_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  pausedAt: timestamp("paused_at", { mode: "date" }),
});

export const vpsSubscriptionRelations = relations(pgVpsSubscription, ({ one }) => ({
  organization: one(pgOrganization, {
    fields: [pgVpsSubscription.orgId],
    references: [pgOrganization.id],
  }),
  user: one(pgUser, {
    fields: [pgVpsSubscription.userId],
    references: [pgUser.id],
  }),
  lastInvoice: one(pgInvoice, {
    fields: [pgVpsSubscription.lastInvoiceId],
    references: [pgInvoice.id],
  }),
}));

export type VpsSubscription = typeof pgVpsSubscription.$inferSelect;
export type VpsSubscriptionInsert = typeof pgVpsSubscription.$inferInsert;
