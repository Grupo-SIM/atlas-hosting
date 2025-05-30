import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";
import { pgOrganization } from "./organization";

export const pgPlan = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  featured: boolean("featured").default(false),
  maxSites: integer("max_sites").notNull(),
  maxStorage: doublePrecision("max_storage").notNull(),
  ssl: boolean("ssl").default(true),
  backup: boolean("backup").default(true),
  email: boolean("email").default(true),
  cdn: boolean("cdn").default(false),
  supportPriority: boolean("support_priority").default(false),
});

export const plansTableRelations = relations(pgPlan, ({ many }) => ({
  users: many(pgOrganization),
}));

export type Plan = typeof pgPlan.$inferSelect;
export type PlanInsert = typeof pgPlan.$inferInsert;
