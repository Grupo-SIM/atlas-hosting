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
  callbacks: {
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Se a URL for relativa e válida, usar baseUrl
      if (url.startsWith("/")) {
        // Se for /newuser, redirecionar para /api/newuser
        if (url === "/newuser" || url.startsWith("/newuser")) {
          return `${baseUrl}/api/newuser`;
        }
        return `${baseUrl}${url}`;
      }
      // Se a URL for do mesmo domínio, permitir
      if (url.startsWith(baseUrl)) {
        // Se for /newuser, redirecionar para /api/newuser
        if (url.includes("/newuser") && !url.includes("/api/newuser")) {
          return `${baseUrl}/api/newuser`;
        }
        return url;
      }
      // Por padrão, redirecionar para /api/newuser após OAuth
      return `${baseUrl}/api/newuser`;
    },
  },
});
