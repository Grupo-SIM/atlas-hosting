import { relations } from "drizzle-orm";
import { bigint, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUserCard } from "./card";

export const pgWallet = pgTable("wallet", {
  balance: bigint("balance", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  id: uuid("id").primaryKey().defaultRandom(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const walletRelations = relations(pgWallet, ({ many }) => ({
  cards: many(pgUserCard),
}));

export type Wallet = typeof pgWallet.$inferSelect;
export type WalletInsert = typeof pgWallet.$inferInsert;
