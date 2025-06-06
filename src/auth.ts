import { db } from "@/lib/db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Github from "next-auth/providers/github";
import {
  pgAccount,
  pgAuthJsSession,
  pgUser,
  pgVerificationTokens,
} from "./lib/db/schema/index";

export const runtime = "nodejs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: pgUser,
    accountsTable: pgAccount,
    sessionsTable: pgAuthJsSession,
    verificationTokensTable: pgVerificationTokens,
  }),
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Github,
  ],
  session: {
    strategy: "database",
  },
});
