import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgNamecheapIntegration } from "./namecheap";
import { pgPlan } from "./plan";
import { pgWallet } from "./wallet";
import { pgZohoDomainOrganizations } from "@/lib/db/schema/tables/email";

export const pgUser = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password").notNull(),
  namesiloId: text("namesilo_id"),
  isAdmin: boolean("is_admin"),
  domId: text("dom_id"),
  pleskId: text("plesk_id"),
  planId: uuid("plan_id").references(() => pgPlan.id),
  namecheapId: bigint("namecheap_id", { mode: "number" }),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => pgWallet.id),
  selectedDomain: text("selected_domain"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const userRelations = relations(pgUser, ({ one, many }) => ({
  plan: one(pgPlan, {
    fields: [pgUser.planId],
    references: [pgPlan.id],
  }),
  namecheap: one(pgNamecheapIntegration, {
    fields: [pgUser.namecheapId],
    references: [pgNamecheapIntegration.id],
  }),
  wallet: one(pgWallet, {
    fields: [pgUser.walletId],
    references: [pgWallet.id],
  }),
  zohoOrgs: many(pgZohoDomainOrganizations),
}));

export type User = typeof pgUser.$inferSelect;
export type UserInsert = typeof pgUser.$inferInsert;
