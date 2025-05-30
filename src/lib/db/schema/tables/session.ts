import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";
import { relations } from "drizzle-orm";

export const pgSession = pgTable("session", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const sessionRelations = relations(pgSession, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgSession.userId],
    references: [pgUser.id],
  }),
}));

export type Session = typeof pgSession.$inferSelect;
export type SessionInsert = typeof pgSession.$inferInsert;
