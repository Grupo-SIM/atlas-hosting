import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { pgUser } from "./user";

export const pgAccount = pgTable(
  "account",
  {
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    id_token: text("id_token"),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    scope: text("scope"),
    session_state: text("session_state"),
    token_type: text("token_type"),
    type: text("type").$type<AdapterAccountType>().notNull(),
    userId: uuid("userId")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
  },
  account => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const pgAuthJsSession = pgTable("authjs_session", {
  expires: timestamp("expires", { mode: "date" }).notNull(),
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => pgUser.id, { onDelete: "cascade" }),
});

export const pgVerificationTokens = pgTable(
  "verificationToken",
  {
    expires: timestamp("expires", { mode: "date" }).notNull(),
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
  },
  verificationToken => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const pgAuthenticators = pgTable(
  "authenticator",
  {
    counter: integer("counter").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialID: text("credentialID").notNull().unique(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    transports: text("transports"),
    userId: uuid("userId")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
  },
  authenticator => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export type Account = typeof pgAccount.$inferSelect;
export type AccountInsert = typeof pgAccount.$inferInsert;

export type AuthJsSession = typeof pgAuthJsSession.$inferSelect;
export type AuthJsSessionInsert = typeof pgAuthJsSession.$inferInsert;

export type VerificationToken = typeof pgVerificationTokens.$inferSelect;
export type VerificationTokenInsert = typeof pgVerificationTokens.$inferInsert;

export type Authenticator = typeof pgAuthenticators.$inferSelect;
export type AuthenticatorInsert = typeof pgAuthenticators.$inferInsert;
