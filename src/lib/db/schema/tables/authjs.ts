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
    userId: uuid("userId")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const pgAuthJsSession = pgTable("authjs_session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => pgUser.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const pgVerificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
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
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
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
