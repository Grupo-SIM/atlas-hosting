import { relations } from "drizzle-orm";
import { date, pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgLog = pgTable("log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  type: text("type", { enum: ["hosting", "account", "security"] }).notNull(),
  severity: text("severity", {
    enum: ["info", "warning", "danger", "success"],
  }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .$default(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const logsRelations = relations(pgLog, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgLog.userId],
    references: [pgUser.id],
  }),
}));

export type Log = typeof pgLog.$inferSelect;
export type LogInsert = typeof pgLog.$inferInsert;
