import { relations } from "drizzle-orm";
import { bigint, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgNamecheapIntegration = pgTable("namecheap_integration", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  password: text("password").notNull(),
  username: text("username").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id),
});

export const namecheapIntegrationRelations = relations(
  pgNamecheapIntegration,
  ({ many }) => ({
    users: many(pgUser),
  })
);

export type NamecheapIntegration = typeof pgNamecheapIntegration.$inferSelect;
export type NamecheapIntegrationInsert =
  typeof pgNamecheapIntegration.$inferInsert;
