import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgPlan } from "@/lib/db/schema/tables/plan";
import { pgWallet } from "@/lib/db/schema/tables/wallet";
import { pgUser } from "./user";

export const pgOrganization = pgTable("organization", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  dokployId: text("dokploy_id"),
  domId: text("dom_id"),
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  namecheapId: bigint("namecheap_id", { mode: "number" }),
  ownerId: uuid("owner_id"),
  planId: uuid("plan_id").references(() => pgPlan.id),
  pleskId: text("plesk_id"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => pgWallet.id),
});

export const organizationRelations = relations(
  pgOrganization,
  ({ one, many }) => ({
    domains: many(pgOrganizationDomains, {
      relationName: "organization_domains",
    }),
    members: many(pgUser, { relationName: "organization_members" }),
    owner: one(pgUser, {
      fields: [pgOrganization.ownerId],
      references: [pgUser.id],
      relationName: "owned_organizations",
    }),
    plan: one(pgPlan, {
      fields: [pgOrganization.planId],
      references: [pgPlan.id],
    }),
    wallet: one(pgWallet, {
      fields: [pgOrganization.walletId],
      references: [pgWallet.id],
    }),
  })
);

export const pgOrganizationDomains = pgTable("organization_domains", {
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  domain: text("domain").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => pgOrganization.id),
});

export const pgUserPermission = pgTable(
  "domain_to_user",
  {
    domainId: uuid("domain_id")
      .notNull()
      .references(() => pgOrganizationDomains.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id),
  },
  t => [primaryKey({ columns: [t.userId, t.domainId] })]
);
export const domainToUserRelations = relations(pgUserPermission, ({ one }) => ({
  domain: one(pgOrganizationDomains, {
    fields: [pgUserPermission.domainId],
    references: [pgOrganizationDomains.id],
  }),
  user: one(pgUser, {
    fields: [pgUserPermission.userId],
    references: [pgUser.id],
  }),
}));

export const organizationDomainsRelations = relations(
  pgOrganizationDomains,
  ({ many, one }) => ({
    domainAccess: many(pgUserPermission),
    organization: one(pgOrganization, {
      fields: [pgOrganizationDomains.organizationId],
      references: [pgOrganization.id],
      relationName: "organization_domains",
    }),
  })
);

export type Organization = typeof pgOrganization.$inferSelect;
export type OrganizationInsert = typeof pgOrganization.$inferInsert;
export type OrganizationDomain = typeof pgOrganizationDomains.$inferSelect;
export type OrganizationDomainInsert =
  typeof pgOrganizationDomains.$inferInsert;
export type UserDomainAccess = typeof pgUserPermission.$inferSelect;
export type UserDomainAccessInsert = typeof pgUserPermission.$inferInsert;
