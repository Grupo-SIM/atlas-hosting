import { db } from "@/lib/db";
import {
  pgOrganization,
  pgSession,
  pgUser,
  pgWallet,
  userSettings,
  type Session,
  type SessionInsert,
  type User,
} from "@/lib/db/schema";
import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppLogger } from "../server/logs";
import { hash, verify } from "./scrypt";
import type { RawUser } from "@/lib/db/schema/tables/user";
import { auth } from "@/auth";
import { getUser } from ".";
import { emailService } from "../consts/singletons";
import { createEmailVerificationToken } from "./tokens";
import { sendWelcomeEmail, sendEmailVerificationEmail } from "../email/service";

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

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const result = await db.query.pgSession.findFirst({
    where: eq(pgSession.id, sessionId),
    with: {
      user: {
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
          sessions: true,
          settings: true,
        },
      },
    },
  });

  if (!result) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

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

export async function validateSession(sessionToken?: string) {
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
  organizationName: string,
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

    const newOrg = await db
      .insert(pgOrganization)
      .values({
        name: organizationName,
        walletId,
      })
      .returning();

    const newUser = await db
      .insert(pgUser)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        referrerId,
        organizationRole: "admin",
        organizationId: newOrg[0].id,
      })
      .returning({
        id: pgUser.id,
        name: pgUser.name,
        email: pgUser.email,
        createdAt: pgUser.createdAt,
        updatedAt: pgUser.updatedAt,
        deletedAt: pgUser.deletedAt,
      });

    // Create user settings after user creation
    await db.insert(userSettings).values({
      userId: newUser[0].id,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db
      .update(pgOrganization)
      .set({
        ownerId: newUser[0].id,
      })
      .where(eq(pgOrganization.id, newOrg[0].id));

    // Create email verification token
    const verificationToken = await createEmailVerificationToken(
      newUser[0].id,
      newUser[0].email
    );

    // Send welcome email and verification email
    try {
      await sendWelcomeEmail(
        newUser[0].email,
        newUser[0].name,
        organizationName
      );
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      // Don't fail user creation if email fails
    }

    try {
      await sendEmailVerificationEmail(
        newUser[0].email,
        newUser[0].name,
        verificationToken.token,
        verificationToken.code
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail user creation if email fails, but log it
    }

    return newUser[0];
  } catch (error) {
    // Handle potential errors, e.g., unique constraint violation for email
    console.error("Error creating user:", error);
    return null;
  }
}

export async function createUserForOrganization(
  name: string,
  email: string,
  passwordPlain: string,
  organizationId: string,
  role: "admin" | "member" | "developer" = "member"
) {
  const user = await getUser();

  try {
    const hashedPassword = await hash(passwordPlain);

    const newUser = await db
      .insert(pgUser)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        organizationRole: role,
        organizationId,
      })
      .returning({
        id: pgUser.id,
        name: pgUser.name,
        email: pgUser.email,
        createdAt: pgUser.createdAt,
        updatedAt: pgUser.updatedAt,
        deletedAt: pgUser.deletedAt,
      });

    // Create user settings after user creation
    await db.insert(userSettings).values({
      userId: newUser[0].id,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const logger = new AppLogger(user);
    logger.log({
      title: "Usuário criado",
      description: `Usuário ${newUser[0].name} (${newUser[0].email}) foi criado na organização ${user.organization?.name ?? "Sem Nome"}.`,
      type: "account",
      severity: "info",
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
): Promise<Omit<RawUser, "password"> | null> {
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
