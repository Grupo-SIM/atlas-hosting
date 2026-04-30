"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  pgUser,
  userSettings,
  type UserSettings,
  type Session,
  type User,
} from "@/lib/db/schema";

import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { AppLogger } from "../server/logs";
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

export async function getUser(): Promise<User> {
  "use server";

  const session = await auth();

  if (session?.user?.id) {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, session.user.id),
      with: {
        organization: {
          with: {
            members: true,
            plan: true,
            wallet: {
              with: {
                cards: true,
              },
            },
            owner: true,
            domains: true,
          },
        },
        domainAccess: true,
        referrer: true,
        referredUsers: true,
        settings: true,
        sessions: true,
      },
    });

    if (!user) {
      throw await redirectToLogin();
    }

    const { organization } = user;

    if (!organization) {
      redirect("/newuser");
    }

    user.organization = organization;

    return user as User;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  const { user } = await validateSession(sessionToken);

  if (!user) {
    throw await redirectToLogin();
  }

  return user as User;
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
          organization: {
            with: {
              members: true,
              plan: true,
              wallet: { with: { cards: true } },
              owner: true,
              domains: true,
            },
          },
          domainAccess: true,
          referrer: true,
          referredUsers: true,
          settings: true,
          sessions: true,
        },
      });
      if (user && user.organization) {
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
