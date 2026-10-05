import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgPlan } from "@/lib/db/schema/tables/plan";
import { pgWallet } from "@/lib/db/schema/tables/wallet";
import { pgUser } from "./user";

export const pgOrganization = pgTable("organization", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  /** CNPJ da empresa, só dígitos. Opcional — nem toda org é pessoa jurídica. */
  document: text("document"),
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

export const pgOrganizationDomains = pgTable(
  "organization_domains",
  {
    active: boolean("active").default(true).notNull(),
    cloudflareZoneId: text("cloudflare_zone_id"),
    cloudflareZoneStatus: text("cloudflare_zone_status"),
    connectionStatus: text("connection_status").default("connected").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    dnsImportedAt: timestamp("dns_imported_at", { mode: "date" }),
    dnsImportStatus: text("dns_import_status").default("not_started").notNull(),
    dnsMode: text("dns_mode").default("external").notNull(),
    dnsScanStartedAt: timestamp("dns_scan_started_at", { mode: "date" }),
    domain: text("domain").notNull(),
    expectedNameservers: text("expected_nameservers").array(),
    id: uuid("id").primaryKey().defaultRandom(),
    lastDnsCheckAt: timestamp("last_dns_check_at", { mode: "date" }),
    lastDnsError: text("last_dns_error"),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => pgOrganization.id),
    registrarProvider: text("registrar_provider"),
    verifiedAt: timestamp("verified_at", { mode: "date" }),
  },
  table => [
    uniqueIndex("organization_domains_domain_unique").on(table.domain),
    uniqueIndex("organization_domains_cloudflare_zone_unique").on(
      table.cloudflareZoneId
    ),
  ]
);

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

export const pgDomainTransfer = pgTable(
  "domain_transfers",
  {
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    domainId: uuid("domain_id")
      .references(() => pgOrganizationDomains.id, { onDelete: "set null" }),
    domainName: text("domain_name"),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    rejectedAt: timestamp("rejected_at", { mode: "date" }),
    sourceAcceptedAt: timestamp("source_accepted_at", { mode: "date" }),
    sourceOrganizationId: uuid("source_organization_id")
      .notNull()
      .references(() => pgOrganization.id),
    sourceUserId: uuid("source_user_id")
      .notNull()
      .references(() => pgUser.id),
    status: text("status", {
      enum: [
        "pending_both",
        "awaiting_source",
        "awaiting_target",
        "completed",
        "rejected",
        "cancelled",
        "expired",
      ],
    }).notNull(),
    targetAcceptedAt: timestamp("target_accepted_at", { mode: "date" }),
    targetOrganizationId: uuid("target_organization_id")
      .notNull()
      .references(() => pgOrganization.id),
    targetUserId: uuid("target_user_id")
      .notNull()
      .references(() => pgUser.id),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .$default(() => new Date())
      .notNull(),
  },
  table => [
    uniqueIndex("domain_transfers_active_domain_unique")
      .on(table.domainId)
      .where(
        sql`${table.status} in ('pending_both', 'awaiting_source', 'awaiting_target')`
      ),
  ]
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
export type DomainTransfer = typeof pgDomainTransfer.$inferSelect;
export type DomainTransferInsert = typeof pgDomainTransfer.$inferInsert;
