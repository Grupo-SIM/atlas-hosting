import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgZohoOAuthTokens = pgTable("zoho_oauth_tokens", {
  accessToken: text("access_token").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  expiresIn: integer("expires_in").notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  refreshToken: text("refresh_token").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  userId: uuid("user_id").references(() => pgUser.id, { onDelete: "cascade" }),
});

// This table can store non-sensitive configuration for Zoho
// Note: Sensitive information like client ID and client secret should be stored in environment variables
export const pgZohoGlobalConfig = pgTable("zoho_global_config", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  description: text("description"),
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  value: text("value").notNull(),
});

export const pgZohoDomainOrganizations = pgTable("zoho_domain_orgs", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  domainName: text("domain_name").notNull().unique(),
  id: uuid("id").primaryKey().defaultRandom(),
  password: text("password").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  userId: uuid("user_id").references(() => pgUser.id, { onDelete: "cascade" }),
  zohoOrgId: text("zoho_org_id").notNull(),
});

export const pgUserEmailAccountConfigs = pgTable(
  "user_email_account_configs",
  {
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    emailAddress: text("email_address").notNull(),
    emailPassword: text("email_password").notNull(), // For Plesk-managed accounts, this is the password set during creation
    encryptedImapPassword: text("encrypted_imap_password").notNull(), // If different from main emailPassword
    encryptedSmtpPassword: text("encrypted_smtp_password").notNull(), // If different from main emailPassword
    id: uuid("id").primaryKey().defaultRandom(),
    // For others, this is the main account password, used for both IMAP/SMTP if usernames are same
    // This will be encrypted by the encryption utility.
    imapHost: text("imap_host").notNull(),
    imapPort: integer("imap_port").notNull(),
    imapSecure: boolean("imap_secure").default(true).notNull(),
    imapUsername: text("imap_username").notNull(),

    isPleskManaged: boolean("is_plesk_managed").default(false),
    pleskMailId: integer("plesk_mail_id"), // Store the Plesk mail account ID for management
    pleskSiteId: integer("plesk_site_id"), // Store if provisioned via Plesk for the domain

    smtpHost: text("smtp_host").notNull(),
    smtpPort: integer("smtp_port").notNull(),
    smtpSecure: boolean("smtp_secure").default(true).notNull(), // true for SSL/TLS with port 465, false for STARTTLS with 587
    smtpUsername: text("smtp_username").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
  },
  table => [
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
