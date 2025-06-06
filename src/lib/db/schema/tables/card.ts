import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";
import { pgWallet } from "./wallet";
import { relations } from "drizzle-orm";
import { pgUser } from "@/lib/db/schema/tables/user";
import { pgInvoice } from "@/lib/db/schema/tables/invoice";

export const pgUserCard = pgTable("user_card", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => pgWallet.id)
    .notNull(),
  cardToken: text("card_token").notNull(),
  last4: text("last4").notNull(),
  brand: text("brand").notNull(),
  expiryMonth: text("expiry_month").notNull(),
  expiryYear: text("expiry_year").notNull(),
  holderName: text("holder_name").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const userCardRelations = relations(pgUserCard, ({ one }) => ({
  wallet: one(pgWallet, {
    fields: [pgUserCard.walletId],
    references: [pgWallet.id],
  }),
}));

export type UserCard = typeof pgUserCard.$inferSelect;
export type UserCardInsert = typeof pgUserCard.$inferInsert;
