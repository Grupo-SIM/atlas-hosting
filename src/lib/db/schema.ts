import { relations, type InferSelectModel } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  doublePrecision,
  pgTable,
  primaryKey,
  text,
  uuid
} from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  namesiloId: bigint("namesilo_id", {
    mode: "number"
  }),
  isAdmin: boolean("is_admin"),
  domId: text("dom_id"),
  planId: uuid("plan_id").references(() => plansTable.id),
  createdAt: date("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: date("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: date("deleted_at", { mode: "date" }),
});

export const userRelations = relations(userTable, ({ one }) => ({
  plan: one(plansTable, {
    fields: [userTable.planId],
    references: [plansTable.id]
	}),
}));

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
  featured: boolean("featured").default(false),
});

export const plansTableRelations = relations(plansTable, ({ many }) => ({
  users: many(userTable),
  planFeatures: many(planFeature)
}));

export const planFeature = pgTable("plan_feature", {
  planId: uuid("plan_id").notNull().references(() => plansTable.id),
  featureId: uuid("feature_id").notNull().references(() => featureTable.id),
}, (t) => [
  primaryKey({ columns: [t.planId, t.featureId] }),
]);

export const planFeatureRelations = relations(
  planFeature,
  ({ one }) => ({
    feature: one(featureTable, {
      fields: [planFeature.featureId],
      references: [featureTable.id],
    }),
    plan: one(plansTable, {
      fields: [planFeature.planId],
      references: [plansTable.id],
    }),
  }),
);

export const featureTable = pgTable("feature", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  reference: text("reference")
});

export const featureRelations = relations(featureTable, ({ many }) => ({
  featuresPlans: many(planFeature)
}));

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

export const invoiceRelations = relations(invoiceTable, ({ one }) => ({
  user: one(userTable, {
		fields: [invoiceTable.userId],
		references: [userTable.id],
	}),
}));

export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>;
export type Invoice = InferSelectModel<typeof invoiceTable>;
export type Plan = InferSelectModel<typeof plansTable>;
