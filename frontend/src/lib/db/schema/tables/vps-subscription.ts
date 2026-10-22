import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgInvoice } from "./invoice";
import { pgOrganization } from "./organization";
import { pgUser } from "./user";
import { pgVpsServers } from "./vps";

export const pgVpsSubscription = pgTable("vps_subscriptions", {
  amountBrl: doublePrecision("amount_brl").notNull(),
  cancelledAt: timestamp("cancelled_at", { mode: "date" }),
  config: json("config").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  failureCount: integer("failure_count").notNull().default(0),
  id: uuid("id").primaryKey().defaultRandom(),
  initialInvoiceId: uuid("initial_invoice_id").unique().references(() => pgInvoice.id),
  intervalMonths: integer("interval_months").notNull(),
  lastInvoiceId: uuid("last_invoice_id").references(() => pgInvoice.id),
  nextChargeDate: timestamp("next_charge_date", { mode: "date" }).notNull(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => pgOrganization.id),
  pausedAt: timestamp("paused_at", { mode: "date" }),
  paymentMethod: text("payment_method", {
    enum: ["credit_card", "pix", "boleto", "voucher"],
  })
    .notNull()
    .default("credit_card"),
  planId: text("plan_id").notNull(),
  planType: text("plan_type", {
    enum: ["vps", "vds", "storage-vps", "vps-windows"],
  })
    .notNull()
    .default("vps"),
  status: text("status", { enum: ["active", "cancelled", "failed", "paused"] })
    .notNull()
    .default("active"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id),
  vpsNodeId: uuid("vps_node_id").references(() => pgVpsServers.id, {
    onDelete: "set null",
  }),
});

export const vpsSubscriptionRelations = relations(
  pgVpsSubscription,
  ({ one }) => ({
    lastInvoice: one(pgInvoice, {
      fields: [pgVpsSubscription.lastInvoiceId],
      references: [pgInvoice.id],
    }),
    organization: one(pgOrganization, {
      fields: [pgVpsSubscription.orgId],
      references: [pgOrganization.id],
    }),
    user: one(pgUser, {
      fields: [pgVpsSubscription.userId],
      references: [pgUser.id],
    }),
    vpsNode: one(pgVpsServers, {
      fields: [pgVpsSubscription.vpsNodeId],
      references: [pgVpsServers.id],
    }),
  }),
);

export type VpsSubscription = typeof pgVpsSubscription.$inferSelect;
export type VpsSubscriptionInsert = typeof pgVpsSubscription.$inferInsert;
