import { db } from "@/lib/db";
import {
  sessionTable,
  userTable,
  type Session,
  type User,
} from "@/lib/db/schema";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { hash, verify } from "./scrypt";
import { cookies } from "next/headers";
import { cache } from "react";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(sessionTable).values(session);
  return session;
}

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await db
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }
  return { session, user };
}

export async function validateSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return { session: null, user: null };
  }

  return await validateSessionToken(sessionToken);
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export async function createUser(
  name: string,
  email: string,
  passwordPlain: string,
): Promise<(Omit<User, "password"> & { password?: string }) | null> {
  try {
    const hashedPassword = await hash(passwordPlain); // Use new Scrypt hash
    const newUser: Omit<User, "id"> = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      namesiloId: null,
    };
    await db.insert(userTable).values(newUser);
    // Exclude password from the returned user object for security
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword as Omit<User, "password"> & {
			password?: string;
		};
  } catch (error) {
    // Handle potential errors, e.g., unique constraint violation for email
    console.error("Error creating user:", error);
    return null;
  }
}

export async function authenticateUser(
  email: string,
  passwordPlain: string,
): Promise<(Omit<User, "password"> & { password?: string }) | null> {
  const result = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email.toLowerCase()));

  if (result.length < 1) {
    return null; // User not found
  }

  const user = result[0];
  if (!user.password) {
    return null; // User has no password set (should not happen with createUser)
  }

  const validPassword = await verify(user.password, passwordPlain); // Use new Scrypt verify
  if (!validPassword) {
    return null; // Invalid password
  }

  // Exclude password from the returned user object for security
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as Omit<User, "password"> & { password?: string };
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };

export const getUser = cache(async function getUser() {
  const { user } = await validateSession();
  return user;
});