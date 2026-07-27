import { pgTable, text, uuid, timestamp, integer, doublePrecision, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgOrganization } from "./organization";
import { pgUser } from "./user";
import { pgInvoice } from "./invoice";

export const pgVpsPaymentLink = pgTable("vps_payment_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdByAdminId: uuid("created_by_admin_id").notNull().references(() => pgUser.id),
  productType: text("product_type", { enum: ["vps", "vds", "storage-vps"] }).notNull(),
  planId: text("plan_id").notNull(),
  planName: text("plan_name").notNull(),
  intervalMonths: integer("interval_months").notNull(),
  amountBrl: doublePrecision("amount_brl").notNull(),
  allowPix: boolean("allow_pix").notNull().default(false),
  /** Se preenchido, só essa conta pode pagar o link. Se nulo, é genérico (qualquer um/guest). */
  linkedOrgId: uuid("linked_org_id").references(() => pgOrganization.id),
  linkedUserId: uuid("linked_user_id").references(() => pgUser.id),
  status: text("status", { enum: ["pending", "used", "cancelled"] }).notNull().default("pending"),
  resultingInvoiceId: uuid("resulting_invoice_id").references(() => pgInvoice.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  usedAt: timestamp("used_at", { mode: "date" }),
});

export const vpsPaymentLinkRelations = relations(pgVpsPaymentLink, ({ one }) => ({
  createdByAdmin: one(pgUser, {
    fields: [pgVpsPaymentLink.createdByAdminId],
    references: [pgUser.id],
  }),
  linkedUser: one(pgUser, {
    fields: [pgVpsPaymentLink.linkedUserId],
    references: [pgUser.id],
  }),
  resultingInvoice: one(pgInvoice, {
    fields: [pgVpsPaymentLink.resultingInvoiceId],
    references: [pgInvoice.id],
  }),
}));

export type VpsPaymentLink = typeof pgVpsPaymentLink.$inferSelect;
export type VpsPaymentLinkInsert = typeof pgVpsPaymentLink.$inferInsert;
