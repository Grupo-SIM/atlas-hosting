import { relations } from "drizzle-orm";
import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";
import { pgOrganization } from "./organization";

export const pgInvoice = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => pgOrganization.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id),
  amount: doublePrecision("amount").notNull(),
  reference: text("reference").notNull(),
  type: text("type", { enum: ["subscription", "domain"] }).notNull(),
  status: text("status", {
    enum: ["pending", "paid", "failed", "processing"],
  }).notNull(),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  currency: text("currency").default("BRL").notNull(), // Added currency, defaulting to BRL
  description: text("description"), // Added description, optional
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const invoiceRelations = relations(pgInvoice, ({ one }) => ({
  organization: one(pgOrganization, {
    fields: [pgInvoice.orgId],
    references: [pgOrganization.id],
  }),
  user: one(pgUser, {
    fields: [pgInvoice.userId],
    references: [pgUser.id],
  }),
}));

export type Invoice = typeof pgInvoice.$inferSelect;
export type InvoiceInsert = typeof pgInvoice.$inferInsert;
export type InvoiceSelect = typeof pgInvoice.$inferSelect;
