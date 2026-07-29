import { relations } from "drizzle-orm";
import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgInvoice } from "./invoice";
import { pgUser } from "./user";

/**
 * One active attribution per user (unique on attributed_user_id).
 * Upserted on every login/signup when referrer_code cookie is present.
 * Expires 30 days after last click.
 */
export const pgAffiliateAttribution = pgTable("affiliate_attributions", {
  affiliateUserId: uuid("affiliate_user_id")
    .notNull()
    .references(() => pgUser.id),
  attributedUserId: uuid("attributed_user_id")
    .notNull()
    .unique()
    .references(() => pgUser.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/** One row per commission earned. Permanent audit trail. */
export const pgAffiliateCommission = pgTable("affiliate_commissions", {
  affiliateUserId: uuid("affiliate_user_id")
    .notNull()
    .references(() => pgUser.id),
  buyerUserId: uuid("buyer_user_id")
    .notNull()
    .references(() => pgUser.id),
  commissionAmount: doublePrecision("commission_amount").notNull(),
  commissionRate: doublePrecision("commission_rate").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  grossAmount: doublePrecision("gross_amount").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => pgInvoice.id),
  status: text("status", { enum: ["available", "withdrawn"] })
    .notNull()
    .default("available"),
});

export const pgAffiliateAttributionRelations = relations(
  pgAffiliateAttribution,
  ({ one }) => ({
    affiliateUser: one(pgUser, {
      fields: [pgAffiliateAttribution.affiliateUserId],
      references: [pgUser.id],
      relationName: "affiliate_attributions_affiliate",
    }),
    attributedUser: one(pgUser, {
      fields: [pgAffiliateAttribution.attributedUserId],
      references: [pgUser.id],
      relationName: "affiliate_attributions_attributed",
    }),
  })
);

export const pgAffiliateCommissionRelations = relations(
  pgAffiliateCommission,
  ({ one }) => ({
    affiliateUser: one(pgUser, {
      fields: [pgAffiliateCommission.affiliateUserId],
      references: [pgUser.id],
      relationName: "affiliate_commissions_affiliate",
    }),
    buyerUser: one(pgUser, {
      fields: [pgAffiliateCommission.buyerUserId],
      references: [pgUser.id],
      relationName: "affiliate_commissions_buyer",
    }),
    invoice: one(pgInvoice, {
      fields: [pgAffiliateCommission.invoiceId],
      references: [pgInvoice.id],
    }),
  })
);

export type AffiliateAttribution = typeof pgAffiliateAttribution.$inferSelect;
export type AffiliateAttributionInsert =
  typeof pgAffiliateAttribution.$inferInsert;
export type AffiliateCommission = typeof pgAffiliateCommission.$inferSelect;
export type AffiliateCommissionInsert =
  typeof pgAffiliateCommission.$inferInsert;
