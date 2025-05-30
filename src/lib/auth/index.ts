import type { CheckoutFormInputs } from "@/components/checkout/CheckoutForm";
import { db } from "@/lib/db";
import {
  pgNamecheapIntegration,
  pgSession,
  pgUser,
  pgWallet,
  type Session,
  type SessionInsert,
  type User,
} from "@/lib/db/schema";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { randomBytes } from "@noble/hashes/utils";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { ReadonlyRequestCookies } from "node_modules/next/dist/server/web/spec-extension/adapters/request-cookies";
import type { AppLogger } from "../server/logs";
import { hash, hashWithEncodeKey, verify } from "./scrypt";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: SessionInsert = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  await db.insert(pgSession).values(session);
  return session;
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db
    .select({ user: pgUser, session: pgSession })
    .from(pgSession)
    .innerJoin(pgUser, eq(pgSession.userId, pgUser.id))
    .where(eq(pgSession.id, sessionId));

  if (result.length < 1) {
    return { session: null, user: null };
  }

  const { user, session } = result[0];

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(pgSession).where(eq(pgSession.id, session.id));
    return { session: null, user: null };
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await db
      .update(pgSession)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(pgSession.id, session.id));
  }

  return { session, user };
}

export async function validateSession(
  cookieStore: ReadonlyRequestCookies
): Promise<SessionValidationResult> {
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return { session: null, user: null };
  }

  return await validateSessionToken(sessionToken);
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(pgSession).where(eq(pgSession.id, sessionId));
}

export async function invalidateAllSessions(userId: string): Promise<void> {
  await db.delete(pgSession).where(eq(pgSession.userId, userId));
}

export async function createUser(
  name: string,
  email: string,
  passwordPlain: string,
  referrerId?: string
) {
  try {
    const walletResult = await db
      .insert(pgWallet)
      .values({
        balance: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const { id: walletId } = walletResult[0];

    const hashedPassword = await hash(passwordPlain);
    const newUser = await db
      .insert(pgUser)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        walletId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        namesiloId: null,
        referrerId,
      })
      .returning({
        id: pgUser.id,
        name: pgUser.name,
        email: pgUser.email,
        createdAt: pgUser.createdAt,
        updatedAt: pgUser.updatedAt,
        deletedAt: pgUser.deletedAt,
      });
    return newUser[0];
  } catch (error) {
    // Handle potential errors, e.g., unique constraint violation for email
    console.error("Error creating user:", error);
    return null;
  }
}

export async function authenticateUser(
  email: string,
  passwordPlain: string
): Promise<Omit<User, "password"> | null> {
  const result = await db
    .select()
    .from(pgUser)
    .where(eq(pgUser.email, email.toLowerCase()));

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

  return userWithoutPassword;
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };

export async function getUser<
  T extends boolean = false,
  U = T extends true ? User | null : User,
>(cookieStore: ReadonlyRequestCookies): Promise<U> {
  "use cache";
  cacheTag("current-user");

  const { user } = await validateSession(cookieStore);
  return user as U;
}

export async function createNamecheapForUser(
  user: User,
  checkoutInputs: CheckoutFormInputs
): Promise<number> {
  const randomPassword = randomBytes(10).toHex();
  const hashedPassword = await hashWithEncodeKey(randomPassword);

  const nameCheapUser = await namecheapApi.createUser({
    AcceptTerms: true,
    Address1: checkoutInputs.address.street,
    City: checkoutInputs.address.city,
    Country: "BR",
    EmailAddress: user.email,
    FirstName: user.name.split(" ")[0],
    LastName: user.name.split(" ")[1],
    NewUserName: user.id.replace(/\-/g, ""),
    NewUserPassword: randomPassword,
    Phone: checkoutInputs.phoneNumber,
    StateProvince: checkoutInputs.address.state,
    Zip: checkoutInputs.address.zipCode,
  });

  const namecheapId = nameCheapUser.UserId;

  if (!namecheapId) {
    throw new Error("Failed to create Namecheap user");
  }

  await db.insert(pgNamecheapIntegration).values({
    id: namecheapId,
    password: hashedPassword,
    username: user.id.replace(/\-/g, ""),
    userId: user.id,
  });

  await db
    .update(pgUser)
    .set({
      namecheapId,
    })
    .where(eq(pgUser.id, user.id));

  return namecheapId;
}

export interface UserWithLogger extends User {
  logger: AppLogger;
}
