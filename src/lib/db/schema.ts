import type { InferSelectModel } from "drizzle-orm";
import {
  date,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  namesiloId: integer("namesilo_id"),
  createdAt: date("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: date("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: date("deleted_at", { mode: "date" }),
});

export const sessionTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: date("expires_at", { mode: "date" }).notNull(),
});

export const plansTable = pgTable("plans", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  metadata: json("metadata").$type<PlanMetadata>(),
  pleskPlanId: integer("plesk_plan_id").notNull(),
});

export const userPlansTable = pgTable(
  "user_plans",
  {
    userId: integer("user_id").notNull(),
    planId: integer("plan_id")
      .references(() => plansTable.id)
      .notNull(),
    createdAt: date("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: date("updated_at", { mode: "date" }).defaultNow().notNull(),
    deletedAt: date("deleted_at", { mode: "date" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.planId] })],
);

interface PlanMetadata {
	features: string[];
}

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
