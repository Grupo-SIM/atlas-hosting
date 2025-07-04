import { pgZohoDomainOrganizations } from "@/lib/db/schema/tables/email";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { UserCard } from "./card";
import {
  pgOrganization,
  pgUserPermission,
  type Organization,
  type OrganizationDomain,
  type UserDomainAccess,
} from "./organization";
import type { Plan } from "./plan";
import { pgSession, type Session } from "./session";
import type { Wallet } from "./wallet";

export const pgUser = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  namesiloId: text("namesilo_id"),
  isAdmin: boolean("is_admin").default(false),
  selectedDomain: text("selected_domain"),
  referrerId: uuid("referrer_id"),
  organizationId: uuid("organization_id").references(() => pgOrganization.id),
  organizationRole: text("organization_role", {
    enum: ["member", "admin", "developer"],
  })
    .notNull()
    .default("admin"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => pgUser.id)
    .notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  pushNotifications: boolean("push_notifications").default(true),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .$default(() => new Date())
    .notNull(),
});

export const userRelations = relations(pgUser, ({ one, many }) => ({
  zohoOrgs: many(pgZohoDomainOrganizations),
  referrer: one(pgUser, {
    fields: [pgUser.referrerId],
    references: [pgUser.id],
    relationName: "referred_users",
  }),
  referredUsers: many(pgUser, {
    relationName: "referred_users",
  }),
  organization: one(pgOrganization, {
    fields: [pgUser.organizationId],
    references: [pgOrganization.id],
    relationName: "organization_members",
  }),
  domainAccess: many(pgUserPermission),
  sessions: many(pgSession),
  settings: one(userSettings, {
    fields: [pgUser.id],
    references: [userSettings.userId],
  }),
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
}

export type UserInsert = typeof pgUser.$inferInsert;
