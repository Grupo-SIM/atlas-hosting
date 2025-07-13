import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { 
  pgPasswordResetToken, 
  pgEmailVerificationToken,
  type PasswordResetToken,
  type EmailVerificationToken 
} from "@/lib/db/schema";
import { eq, and, gt, lt } from "drizzle-orm";

/**
 * Generate a secure random token
 */
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString("hex");
}

/**
 * Generate a human-readable code (6 digits)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Password Reset Token Functions
 */
export async function createPasswordResetToken(userId: string): Promise<PasswordResetToken> {
  // Clean up any existing tokens for this user
  await db
    .delete(pgPasswordResetToken)
    .where(eq(pgPasswordResetToken.userId, userId));

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  const [resetToken] = await db
    .insert(pgPasswordResetToken)
    .values({
      userId,
      token,
      expiresAt,
      used: false,
    })
    .returning();

  return resetToken;
}

export async function validatePasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  const [resetToken] = await db
    .select()
    .from(pgPasswordResetToken)
    .where(
      and(
        eq(pgPasswordResetToken.token, token),
        eq(pgPasswordResetToken.used, false),
        gt(pgPasswordResetToken.expiresAt, new Date())
      )
    )
    .limit(1);

  return resetToken || null;
}

export async function markPasswordResetTokenAsUsed(token: string): Promise<void> {
  await db
    .update(pgPasswordResetToken)
    .set({ used: true })
    .where(eq(pgPasswordResetToken.token, token));
}

/**
 * Email Verification Token Functions
 */
export async function createEmailVerificationToken(userId: string, email: string): Promise<EmailVerificationToken> {
  // Clean up any existing tokens for this user and email
  await db
    .delete(pgEmailVerificationToken)
    .where(
      and(
        eq(pgEmailVerificationToken.userId, userId),
        eq(pgEmailVerificationToken.email, email)
      )
    );

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const [verificationToken] = await db
    .insert(pgEmailVerificationToken)
    .values({
      userId,
      email,
      token,
      expiresAt,
      used: false,
    })
    .returning();

  return verificationToken;
}

export async function validateEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
  const [verificationToken] = await db
    .select()
    .from(pgEmailVerificationToken)
    .where(
      and(
        eq(pgEmailVerificationToken.token, token),
        eq(pgEmailVerificationToken.used, false),
        gt(pgEmailVerificationToken.expiresAt, new Date())
      )
    )
    .limit(1);

  return verificationToken || null;
}

export async function markEmailVerificationTokenAsUsed(token: string): Promise<void> {
  await db
    .update(pgEmailVerificationToken)
    .set({ used: true })
    .where(eq(pgEmailVerificationToken.token, token));
}

/**
 * Change Email Token Functions
 * These use the same table as email verification but with different logic
 */
export async function createChangeEmailToken(userId: string, newEmail: string): Promise<EmailVerificationToken> {
  // Clean up any existing change email tokens for this user
  await db
    .delete(pgEmailVerificationToken)
    .where(
      and(
        eq(pgEmailVerificationToken.userId, userId),
        eq(pgEmailVerificationToken.email, newEmail)
      )
    );

  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

  const [changeEmailToken] = await db
    .insert(pgEmailVerificationToken)
    .values({
      userId,
      email: newEmail, // This is the NEW email that needs to be verified
      token,
      expiresAt,
      used: false,
    })
    .returning();

  return changeEmailToken;
}

export async function validateChangeEmailToken(token: string, newEmail: string): Promise<EmailVerificationToken | null> {
  const [changeEmailToken] = await db
    .select()
    .from(pgEmailVerificationToken)
    .where(
      and(
        eq(pgEmailVerificationToken.token, token),
        eq(pgEmailVerificationToken.email, newEmail),
        eq(pgEmailVerificationToken.used, false),
        gt(pgEmailVerificationToken.expiresAt, new Date())
      )
    )
    .limit(1);

  return changeEmailToken || null;
}

/**
 * Clean up expired tokens (should be run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const now = new Date();
  
  // Clean up expired password reset tokens
  await db
    .delete(pgPasswordResetToken)
    .where(lt(pgPasswordResetToken.expiresAt, now));

  // Clean up expired email verification tokens (including change email tokens)
  await db
    .delete(pgEmailVerificationToken)
    .where(lt(pgEmailVerificationToken.expiresAt, now));
    
  console.log('Expired tokens cleaned up successfully');
}
