import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

/** Avisos do sino do painel. `href` é para onde o clique leva. */
export const pgNotification = pgTable(
  "notifications",
  {
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    href: text("href"),
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(),
    readAt: timestamp("read_at", { mode: "date" }),
    title: text("title").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
  },
  table => [index("notifications_user_read_idx").on(table.userId, table.readAt)]
);

export type Notification = typeof pgNotification.$inferSelect;
