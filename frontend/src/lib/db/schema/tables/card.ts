import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgWallet } from "./wallet";

export const pgUserCard = pgTable("user_card", {
  brand: text("brand").notNull(),
  cardToken: text("card_token").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiryMonth: text("expiry_month").notNull(),
  expiryYear: text("expiry_year").notNull(),
  holderName: text("holder_name").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  isDefault: boolean("is_default").notNull().default(false),
  last4: text("last4").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  walletId: uuid("wallet_id")
    .references(() => pgWallet.id)
    .notNull(),
});

export const userCardRelations = relations(pgUserCard, ({ one }) => ({
  wallet: one(pgWallet, {
    fields: [pgUserCard.walletId],
    references: [pgWallet.id],
  }),
}));

export type UserCard = typeof pgUserCard.$inferSelect;
export type UserCardInsert = typeof pgUserCard.$inferInsert;
