import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgInvoice } from "./invoice";
import { pgOrganization } from "./organization";
import { pgUser } from "./user";

export const pgVpsPaymentLink = pgTable("vps_payment_links", {
  allowBoleto: boolean("allow_boleto").notNull().default(false),
  allowPix: boolean("allow_pix").notNull().default(false),
  amountBrl: doublePrecision("amount_brl").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  createdByAdminId: uuid("created_by_admin_id")
    .notNull()
    .references(() => pgUser.id),
  id: uuid("id").primaryKey().defaultRandom(),
  intervalMonths: integer("interval_months").notNull(),
  /** Se preenchido, só essa conta pode pagar o link. Se nulo, é genérico (qualquer um/guest). */
  linkedOrgId: uuid("linked_org_id").references(() => pgOrganization.id),
  linkedUserId: uuid("linked_user_id").references(() => pgUser.id),
  planId: text("plan_id").notNull(),
  planName: text("plan_name").notNull(),
  productType: text("product_type", {
    enum: ["vps", "vds", "storage-vps", "vps-windows"],
  }).notNull(),
  resultingInvoiceId: uuid("resulting_invoice_id").references(
    () => pgInvoice.id
  ),
  status: text("status", { enum: ["pending", "used", "cancelled"] })
    .notNull()
    .default("pending"),
  usedAt: timestamp("used_at", { mode: "date" }),
});

export const vpsPaymentLinkRelations = relations(
  pgVpsPaymentLink,
  ({ one }) => ({
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
  })
);

export type VpsPaymentLink = typeof pgVpsPaymentLink.$inferSelect;
export type VpsPaymentLinkInsert = typeof pgVpsPaymentLink.$inferInsert;
