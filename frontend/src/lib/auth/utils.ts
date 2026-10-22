import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pgOrganization,
  pgSession,
  pgUser,
  pgWallet,
  type Session,
  type SessionInsert,
  userSettings,
} from "@/lib/db/schema";
import type { RawUser } from "@/lib/db/schema/tables/user";
import { sendEmailVerificationEmail } from "../email/service";
import { AppLogger } from "../server/logs";
import { getUser } from ".";
import { hash, verify } from "./scrypt";
import { createEmailVerificationToken } from "./tokens";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export function generateAffiliateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createSession(
  token: string,
  userId: string
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: SessionInsert = {
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    id: sessionId,
    userId,
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
        affiliateCode: generateAffiliateCode(),
        createdAt: new Date(),
        email: email.toLowerCase(),
        name,
        organizationId: newOrg[0].id,
        organizationRole: "admin",
        password: hashedPassword,
        referrerId,
        updatedAt: new Date(),
      })
      .returning({
        createdAt: pgUser.createdAt,
        deletedAt: pgUser.deletedAt,
        email: pgUser.email,
        id: pgUser.id,
        name: pgUser.name,
        updatedAt: pgUser.updatedAt,
      });

    // Create user settings after user creation
    await db.insert(userSettings).values({
      createdAt: new Date(),
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      updatedAt: new Date(),
      userId: newUser[0].id,
    });

    await db
      .update(pgOrganization)
      .set({
        ownerId: newUser[0].id,
      })
      .where(eq(pgOrganization.id, newOrg[0].id));

    // Create email verification token and send emails — none of this must block user creation
    try {
      const verificationToken = await createEmailVerificationToken(
        newUser[0].id,
        newUser[0].email
      );

      // Envia apenas o email de verificação em background
      sendEmailVerificationEmail(
        newUser[0].email,
        verificationToken.token,
        verificationToken.code ?? ""
      ).catch(err =>
        console.error("Background verification email error:", err)
      );
    } catch (error) {
      console.error("Failed to send verification/welcome email:", error);
      // Don't fail user creation if token creation or email sending fails
    }

    return newUser[0];
  } catch (error) {
    // Handle potential errors, e.g., unique constraint violation for email
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Reaproveita um usuário existente que nunca verificou o email, permitindo
 * tentar cadastrar de novo (nova senha/nome) sem criar wallet/organization
 * duplicados e sem apagar o registro original.
 */
export async function resignupUnverifiedUser(
  existingUserId: string,
  name: string,
  email: string,
  passwordPlain: string,
  organizationName: string
) {
  try {
    const hashedPassword = await hash(passwordPlain);

    const updatedUser = await db
      .update(pgUser)
      .set({
        name,
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(pgUser.id, existingUserId))
      .returning({
        createdAt: pgUser.createdAt,
        deletedAt: pgUser.deletedAt,
        email: pgUser.email,
        id: pgUser.id,
        name: pgUser.name,
        organizationId: pgUser.organizationId,
        updatedAt: pgUser.updatedAt,
      });

    const user = updatedUser[0];

    if (user.organizationId) {
      await db
        .update(pgOrganization)
        .set({ name: organizationName, updatedAt: new Date() })
        .where(eq(pgOrganization.id, user.organizationId));
    }

    try {
      const verificationToken = await createEmailVerificationToken(
        user.id,
        user.email
      );

      sendEmailVerificationEmail(
        user.email,
        verificationToken.token,
        verificationToken.code ?? ""
      ).catch(err =>
        console.error("Background verification email error:", err)
      );
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    return user;
  } catch (error) {
    console.error("Error re-signing up unverified user:", error);
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
        createdAt: new Date(),
        email: email.toLowerCase(),
        name,
        organizationId,
        organizationRole: role,
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .returning({
        createdAt: pgUser.createdAt,
        deletedAt: pgUser.deletedAt,
        email: pgUser.email,
        id: pgUser.id,
        name: pgUser.name,
        updatedAt: pgUser.updatedAt,
      });

    // Create user settings after user creation
    await db.insert(userSettings).values({
      createdAt: new Date(),
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      updatedAt: new Date(),
      userId: newUser[0].id,
    });

    const logger = new AppLogger(user);
    logger.log({
      description: `Usuário ${newUser[0].name} (${newUser[0].email}) foi criado na organização ${user.organization?.name ?? "Sem Nome"}.`,
      severity: "info",
      title: "Usuário criado",
      type: "account",
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

export async function createGuestUser(
  name: string,
  email: string,
  organizationName: string
) {
  const passwordPlain = Math.random().toString(36).slice(-8); // Random 8 chars password
  const user = await createUser(name, email, passwordPlain, organizationName);
  return { passwordPlain, user };
}
