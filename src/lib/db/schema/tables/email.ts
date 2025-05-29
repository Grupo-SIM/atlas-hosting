import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgZohoOAuthTokens = pgTable("zoho_oauth_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => pgUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresIn: integer("expires_in").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// This table can store non-sensitive configuration for Zoho
// Note: Sensitive information like client ID and client secret should be stored in environment variables
export const pgZohoGlobalConfig = pgTable("zoho_global_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const pgZohoDomainOrganizations = pgTable("zoho_domain_orgs", {
  id: uuid("id").primaryKey().defaultRandom(),
  domainName: text("domain_name").notNull().unique(),
  zohoOrgId: text("zoho_org_id").notNull(),
  userId: uuid("user_id").references(() => pgUser.id, { onDelete: "cascade" }),
  password: text("password").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const zohoOAuthTokenRelations = relations(
  pgZohoOAuthTokens,
  ({ one }) => ({
    user: one(pgUser, {
      fields: [pgZohoOAuthTokens.userId],
      references: [pgUser.id],
    }),
  })
);

export const zohoDomainOrgRelations = relations(
  pgZohoDomainOrganizations,
  ({ one }) => ({
    user: one(pgUser, {
      fields: [pgZohoDomainOrganizations.userId],
      references: [pgUser.id],
    }),
  })
);

export type ZohoOAuthToken = typeof pgZohoOAuthTokens.$inferSelect;
export type ZohoOAuthTokenInsert = typeof pgZohoOAuthTokens.$inferInsert;
export type ZohoGlobalConfig = typeof pgZohoGlobalConfig.$inferSelect;
export type ZohoGlobalConfigInsert = typeof pgZohoGlobalConfig.$inferInsert;
