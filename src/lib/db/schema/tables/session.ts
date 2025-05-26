import { date, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgSession = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id),
  expiresAt: date("expires_at", { mode: "date" }).notNull(),
});

export type Session = typeof pgSession.$inferSelect;
export type SessionInsert = typeof pgSession.$inferInsert;
