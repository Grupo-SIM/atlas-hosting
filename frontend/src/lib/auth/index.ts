"use server";

import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  pgUser,
  type Session,
  type User,
  type UserSettings,
  userSettings,
} from "@/lib/db/schema";
import type { AppLogger } from "../server/logs";
import { IMPERSONATE_COOKIE } from "./impersonation";
import { validateSession } from "./utils";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

async function redirectToLogin(): Promise<Error> {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || headersList.get("referer");

  try {
    if (pathname && pathname !== "/login") {
      redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      redirect("/login");
    }

    return new Error();
  } catch (error) {
    return error as Error;
  }
}

const USER_WITH = {
  domainAccess: true,
  organization: {
    with: {
      domains: true,
      members: true,
      owner: true,
      plan: true,
      wallet: {
        with: {
          cards: true,
        },
      },
    },
  },
  referredUsers: true,
  referrer: true,
  sessions: true,
  settings: true,
} as const;

/** Carrega um usuário completo (com relações) por id. Usado por impersonação. */
export async function loadFullUserById(userId: string): Promise<User | null> {
  const user = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, userId),
    with: USER_WITH,
  });
  return (user as User) ?? null;
}

/** Resolve o principal autenticado (admin/cliente real), sem aplicar impersonação. */
async function resolvePrincipal(): Promise<User | null> {
  const session = await auth();

  if (session?.user?.id) {
    return await loadFullUserById(session.user.id);
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  const { user } = await validateSession(sessionToken);

  return (user as User) ?? null;
}

/**
 * Usuário real da sessão, IGNORANDO impersonação. Use em guards de admin
 * (ex.: iniciar/parar impersonação) para saber quem é o admin de verdade.
 */
export async function getRealUser(): Promise<User> {
  "use server";
  const principal = await resolvePrincipal();
  if (!principal) throw await redirectToLogin();
  return principal;
}

export async function getUser(): Promise<User> {
  "use server";

  const principal = await resolvePrincipal();

  if (!principal) {
    throw await redirectToLogin();
  }

  // Impersonação: admin acessando a conta de um cliente ("Acessar como cliente").
  // Só ativa se o principal REAL for admin — o cookie sozinho não concede nada.
  const cookieStore = await cookies();
  const targetId = cookieStore.get(IMPERSONATE_COOKIE)?.value;
  if (targetId && principal.isAdmin && targetId !== principal.id) {
    const target = await loadFullUserById(targetId);
    if (target?.organization) {
      target.impersonatedBy = principal.id;
      return target;
    }
  }

  if (!principal.organization) {
    redirect("/newuser");
  }

  if ((principal as any).suspendedAt) redirect("/suspended");

  return principal;
}

export async function checkIsAuthenticated(): Promise<boolean> {
  "use server";
  try {
    const session = await auth();
    if (session?.user?.id) return true;

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    const { user } = await validateSession(sessionToken);
    return !!user;
  } catch {
    return false;
  }
}

export async function getOptionalUser(): Promise<User | null> {
  "use server";
  try {
    const session = await auth();
    if (session?.user?.id) {
      const user = await db.query.pgUser.findFirst({
        where: eq(pgUser.id, session.user.id),
        with: {
          domainAccess: true,
          organization: {
            with: {
              domains: true,
              members: true,
              owner: true,
              plan: true,
              wallet: { with: { cards: true } },
            },
          },
          referredUsers: true,
          referrer: true,
          sessions: true,
          settings: true,
        },
      });
      if (user?.organization) {
        return user as User;
      }
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    const { user } = await validateSession(sessionToken);
    return user as User | null;
  } catch {
    return null;
  }
}

export async function getUserSettings(
  userId: string
): Promise<UserSettings | undefined> {
  return await db.query.userSettings
    .findFirst({
      where: eq(userSettings.userId, userId),
    })
    .execute();
}

export interface UserWithLogger extends User {
  logger: AppLogger;
}
