import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";

/**
 * Check if user's email is verified and redirect to verification page if not
 */
export async function requireEmailVerification(userId: string): Promise<void> {
  const user = await db.query.pgUser.findFirst({
    columns: {
      email: true,
      emailVerified: true,
      id: true,
    },
    where: eq(pgUser.id, userId),
  });

  if (!user) {
    redirect("/login");
  }

  // If email is not verified, redirect to verification page
  if (!user.emailVerified) {
    redirect("/verify-email");
  }
}

/**
 * Check if user's email is verified without redirecting
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const user = await db.query.pgUser.findFirst({
    columns: {
      emailVerified: true,
    },
    where: eq(pgUser.id, userId),
  });

  return Boolean(user?.emailVerified);
}
