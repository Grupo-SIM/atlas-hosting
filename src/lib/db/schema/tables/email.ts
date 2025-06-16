import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  uniqueIndex,
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

export const pgUserEmailAccountConfigs = pgTable(
  "user_email_account_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
    emailAddress: text("email_address").notNull(),
    emailPassword: text("email_password").notNull(), // For Plesk-managed accounts, this is the password set during creation
    // For others, this is the main account password, used for both IMAP/SMTP if usernames are same
    // This will be encrypted by the encryption utility.
    imapHost: text("imap_host").notNull(),
    imapPort: integer("imap_port").notNull(),
    imapUsername: text("imap_username").notNull(),
    encryptedImapPassword: text("encrypted_imap_password").notNull(), // If different from main emailPassword
    imapSecure: boolean("imap_secure").default(true).notNull(),

    smtpHost: text("smtp_host").notNull(),
    smtpPort: integer("smtp_port").notNull(),
    smtpUsername: text("smtp_username").notNull(),
    encryptedSmtpPassword: text("encrypted_smtp_password").notNull(), // If different from main emailPassword
    smtpSecure: boolean("smtp_secure").default(true).notNull(), // true for SSL/TLS with port 465, false for STARTTLS with 587

    isPleskManaged: boolean("is_plesk_managed").default(false),
    pleskSiteId: integer("plesk_site_id"), // Store if provisioned via Plesk for the domain
    pleskMailId: integer("plesk_mail_id"), // Store the Plesk mail account ID for management

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_email_config_unique_idx").on(
      table.userId,
      table.emailAddress
    ),
  ]
);

export type UserEmailAccountConfig =
  typeof pgUserEmailAccountConfigs.$inferSelect;
export type NewUserEmailAccountConfig =
  typeof pgUserEmailAccountConfigs.$inferInsert;

// Don't forget to add this table to your main schema index file (e.g., src/lib/db/schema/index.ts)
// export * from './userEmailConfigs';
// And then run drizzle-kit generate:pg and drizzle-kit push:pg

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
