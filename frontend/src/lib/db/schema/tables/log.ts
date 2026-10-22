import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgLog = pgTable("log", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  description: text("description").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  readAt: timestamp("read_at", { mode: "date" }),
  severity: text("severity", {
    enum: ["info", "warning", "danger", "success"],
  }).notNull(),
  title: text("title").notNull(),
  type: text("type", { enum: ["hosting", "account", "security"] }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .$default(() => new Date())
    .notNull(),
  userId: uuid("user_id").notNull(),
});

export const logsRelations = relations(pgLog, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgLog.userId],
    references: [pgUser.id],
  }),
}));

export type Log = typeof pgLog.$inferSelect;
export type LogInsert = typeof pgLog.$inferInsert;
