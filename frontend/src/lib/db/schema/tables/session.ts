import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgSession = pgTable("session", {
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id),
});

export const sessionRelations = relations(pgSession, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgSession.userId],
    references: [pgUser.id],
  }),
}));

export type Session = typeof pgSession.$inferSelect;
export type SessionInsert = typeof pgSession.$inferInsert;
