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
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AppLogger } from "../server/logs";
import { invalidateSession, validateSession } from "./utils";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export async function getUser() {
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
      redirect("/login");
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
  invalidateSession(sessionToken as string);

  if (!user) {
    redirect("/login");
  }

  return user as User;
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

// '{ id: string; name: string; ownerId: string | null; domId: string | null; pleskId: string | null; planId: string | null; namecheapId: number | null; createdAt: Date; updatedAt: Date; ... 6 more ...; domains: { ...; }[]; } | null'
// '{ id: string; name: string; ownerId: string | null; domId: string | null; pleskId: string | null; planId: string | null; namecheapId: number | null; createdAt: Date; updatedAt: Date; deletedAt: Date | null; walletId: string; } & { ...; }'.

export interface UserWithLogger extends User {
  logger: AppLogger;
}
