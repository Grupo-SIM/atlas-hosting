import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgZohoDomainOrganizations } from "@/lib/db/schema/tables/email";
import type { UserCard } from "./card";
import {
  type Organization,
  type OrganizationDomain,
  pgOrganization,
  pgUserPermission,
  type UserDomainAccess,
} from "./organization";
import type { Plan } from "./plan";
import { pgSession, type Session } from "./session";
import type { Wallet } from "./wallet";

export const pgUser = pgTable("users", {
  affiliateCode: text("affiliate_code").unique(),
  billingCity: text("billing_city"),

  // Billing Information
  billingDocument: text("billing_document"),
  billingNeighborhood: text("billing_neighborhood"),
  billingNumber: text("billing_number"),
  billingPhone: text("billing_phone"),
  billingState: text("billing_state"),
  billingStreet: text("billing_street"),
  billingZipCode: text("billing_zip_code"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
  dokployId: text("dokploy_id"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  githubToken: text("github_token"),
  id: uuid("id").primaryKey().defaultRandom(),
  image: text("image"),
  isAdmin: boolean("is_admin").default(false),
  name: text("name").notNull(),
  namesiloId: text("namesilo_id"),
  organizationId: uuid("organization_id").references(() => pgOrganization.id),
  organizationRole: text("organization_role", {
    enum: ["member", "admin", "developer"],
  })
    .notNull()
    .default("admin"),
  password: text("password"),
  referrerId: uuid("referrer_id"),
  selectedDomain: text("selected_domain"),
  suspendedAt: timestamp("suspended_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  id: uuid("id").primaryKey().defaultRandom(),
  pushNotifications: boolean("push_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .$default(() => new Date())
    .notNull(),
  userId: uuid("user_id")
    .references(() => pgUser.id)
    .notNull(),
});

export const userRelations = relations(pgUser, ({ one, many }) => ({
  domainAccess: many(pgUserPermission),
  organization: one(pgOrganization, {
    fields: [pgUser.organizationId],
    references: [pgOrganization.id],
    relationName: "organization_members",
  }),
  referredUsers: many(pgUser, {
    relationName: "referred_users",
  }),
  referrer: one(pgUser, {
    fields: [pgUser.referrerId],
    references: [pgUser.id],
    relationName: "referred_users",
  }),
  sessions: many(pgSession),
  settings: one(userSettings, {
    fields: [pgUser.id],
    references: [userSettings.userId],
  }),
  zohoOrgs: many(pgZohoDomainOrganizations),
}));

export type RawUser = typeof pgUser.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;

export interface User extends Omit<RawUser, "organization"> {
  organization: Required<
    Exclude<Organization, null> & {
      domains: OrganizationDomain[];
      plan: Plan | null;
      owner: RawUser | null;
      wallet: (Wallet & { cards: UserCard[] }) | null;
      members: RawUser[];
    }
  >;
  domainAccess: UserDomainAccess[];
  referrer: RawUser | null;
  referredUsers: RawUser[];
  sessions: Session[];
  settings: UserSettings;
  /**
   * Preenchido apenas quando um admin está acessando esta conta via
   * impersonação ("Acessar como cliente"). Contém o id do admin real.
   * Ausente em sessões normais.
   */
  impersonatedBy?: string;
}

export type UserInsert = typeof pgUser.$inferInsert;
