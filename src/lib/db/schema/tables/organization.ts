import { pgPlan } from "@/lib/db/schema/tables/plan";
import { pgWallet } from "@/lib/db/schema/tables/wallet";
import { relations } from "drizzle-orm";
import {
  bigint,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgNamecheapIntegration } from "./namecheap";
import { pgUser } from "./user";

export const pgOrganization = pgTable("organization", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id"),
  domId: text("dom_id"),
  pleskId: text("plesk_id"),
  planId: uuid("plan_id").references(() => pgPlan.id),
  namecheapId: bigint("namecheap_id", { mode: "number" }),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => pgWallet.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const organizationRelations = relations(
  pgOrganization,
  ({ one, many }) => ({
    owner: one(pgUser, {
      fields: [pgOrganization.ownerId],
      references: [pgUser.id],
      relationName: "owned_organizations",
    }),
    members: many(pgUser, { relationName: "organization_members" }),
    plan: one(pgPlan, {
      fields: [pgOrganization.planId],
      references: [pgPlan.id],
    }),
    namecheap: one(pgNamecheapIntegration, {
      fields: [pgOrganization.namecheapId],
      references: [pgNamecheapIntegration.id],
    }),
    wallet: one(pgWallet, {
      fields: [pgOrganization.walletId],
      references: [pgWallet.id],
    }),
  })
);

export const pgOrganizationDomains = pgTable("organization_domains", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => pgOrganization.id),
  domain: text("domain").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const pgUserPermission = pgTable(
  "domain_to_user",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id),
    domainId: uuid("domain_id")
      .notNull()
      .references(() => pgOrganizationDomains.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.domainId] })]
);
export const domainToUserRelations = relations(
  pgUserPermission,
  ({ one }) => ({
    domain: one(pgOrganizationDomains, {
      fields: [pgUserPermission.domainId],
      references: [pgOrganizationDomains.id],
    }),
    user: one(pgUser, {
      fields: [pgUserPermission.userId],
      references: [pgUser.id],
    }),
  })
);

export const organizationDomainsRelations = relations(
  pgOrganizationDomains,
  ({ many }) => ({
    domainAccess: many(pgUserPermission),
  })
);

export type Organization = typeof pgOrganization.$inferSelect;
export type OrganizationInsert = typeof pgOrganization.$inferInsert;
export type OrganizationDomain = typeof pgOrganizationDomains.$inferSelect;
export type OrganizationDomainInsert =
  typeof pgOrganizationDomains.$inferInsert;
export type UserDomainAccess = typeof pgUserPermission.$inferSelect;
export type UserDomainAccessInsert = typeof pgUserPermission.$inferInsert;
