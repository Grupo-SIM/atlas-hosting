import type { InferSelectModel } from "drizzle-orm";
import {
  date,
  doublePrecision,
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
  domId: text("dom_id"),
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
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  metadata: json("metadata").$type<PlanMetadata>(),
  pleskPlanId: integer("plesk_plan_id").notNull(),
});

export const userPlansTable = pgTable(
  "user_plans",
  {
    userId: uuid("user_id").notNull(),
    planId: uuid("plan_id")
      .references(() => plansTable.id)
      .notNull(),
    nextPaymentDate: date("next_payment_date", { mode: "date" }).notNull(),
    createdAt: date("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: date("updated_at", { mode: "date" }).defaultNow().notNull(),
    deletedAt: date("deleted_at", { mode: "date" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.planId] })],
);

export const invoiceTable = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  amount: doublePrecision("amount").notNull(),
  reference: text("reference").notNull(),
  type: text("type", { enum: ["subscription", "domain"] }).notNull(),
  status: text("status", { enum: ["pending", "paid", "failed"] }).notNull(),
  dueDate: date("due_date", { mode: "date" }).notNull(),
  createdAt: date("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: date("updated_at", { mode: "date" }).defaultNow().notNull(),
});

interface PlanMetadata {
	features: string[];
}

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
