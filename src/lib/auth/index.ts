"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { pgUser, type Session, type User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AppLogger } from "../server/logs";
import { invalidateSession, validateSession } from "./utils";

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

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

    console.log(JSON.stringify(user.organization, null, 2));

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

export interface UserWithLogger extends User {
  logger: AppLogger;
}
