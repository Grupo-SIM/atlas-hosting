import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { pgOrganization } from "./organization";

export const pgPlan = pgTable("plans", {
  backup: boolean("backup").default(true),
  cdn: boolean("cdn").default(false),
  description: text("description").notNull(),
  email: boolean("email").default(true),
  featured: boolean("featured").default(false),
  id: uuid("id").primaryKey().defaultRandom(),
  maxSites: integer("max_sites").notNull(),
  maxStorage: doublePrecision("max_storage").notNull(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  ssl: boolean("ssl").default(true),
  supportPriority: boolean("support_priority").default(false),
});

export const plansTableRelations = relations(pgPlan, ({ many }) => ({
  users: many(pgOrganization),
}));

export type Plan = typeof pgPlan.$inferSelect;
export type PlanInsert = typeof pgPlan.$inferInsert;
