import { pgTable, text, uuid } from "drizzle-orm/pg-core";
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
});

export const userCardRelations = relations(pgUserCard, ({ one }) => ({
  wallet: one(pgWallet, {
    fields: [pgUserCard.walletId],
    references: [pgWallet.id],
  }),
}));

export type UserCard = typeof pgUserCard.$inferSelect;
export type UserCardInsert = typeof pgUserCard.$inferInsert;
