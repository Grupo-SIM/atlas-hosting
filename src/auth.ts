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
import { and, eq } from "drizzle-orm";
import type { AccountInsert } from "./lib/db/schema/index";

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
    async signIn({ user, account, profile }) {
      // Permitir vincular contas com o mesmo email automaticamente
      if (user.email && account) {
        // Verificar se já existe um usuário com este email
        const existingUser = await db.query.pgUser.findFirst({
          where: eq(pgUser.email, user.email.toLowerCase()),
        });

        if (existingUser) {
          // Verificar se já existe uma conta OAuth vinculada para este provider
          const existingAccount = await db.query.pgAccount.findFirst({
            where: (accounts, { and, eq }) =>
              and(
                eq(accounts.userId, existingUser.id),
                eq(accounts.provider, account.provider)
              ),
          });

          // Se não existe conta para este provider, permitir vincular
          if (!existingAccount) {
            // Vincular a conta OAuth ao usuário existente
            await db.insert(pgAccount).values({
              userId: existingUser.id,
              type: account.type as AccountInsert["type"],
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state as string | null | undefined,
            });

            // Atualizar o user.id para o usuário existente
            user.id = existingUser.id;
            return true;
          }
        }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Se a URL for relativa e válida, usar baseUrl
      if (url.startsWith("/")) {
        // Se for /newuser, redirecionar para /api/newuser
        if (url === "/newuser" || url.startsWith("/newuser")) {
          return `${baseUrl}/api/newuser`;
        }
        // Se for página de erro do NextAuth, redirecionar para /api/newuser
        if (url.includes("/api/auth/signin") && url.includes("error")) {
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
        // Se for página de erro do NextAuth, redirecionar para /api/newuser
        if (url.includes("/api/auth/signin") && url.includes("error")) {
          return `${baseUrl}/api/newuser`;
        }
        return url;
      }
      // Por padrão, redirecionar para /api/newuser após OAuth
      return `${baseUrl}/api/newuser`;
    },
  },
});
