import { relations } from "drizzle-orm";
import { pgTable, uuid, bigint, date, timestamp } from "drizzle-orm/pg-core";
import { pgUserCard } from "./card";

export const pgWallet = pgTable("wallet", {
  id: uuid("id").primaryKey().defaultRandom(),
  balance: bigint("balance", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const walletRelations = relations(pgWallet, ({ many }) => ({
  cards: many(pgUserCard),
}));

export type Wallet = typeof pgWallet.$inferSelect;
export type WalletInsert = typeof pgWallet.$inferInsert;
