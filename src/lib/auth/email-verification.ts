import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

/**
 * Check if user's email is verified and redirect to verification page if not
 */
export async function requireEmailVerification(userId: string): Promise<void> {
  const user = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, userId),
    columns: {
      id: true,
      email: true,
      emailVerified: true,
    },
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
    where: eq(pgUser.id, userId),
    columns: {
      emailVerified: true,
    },
  });

  return Boolean(user?.emailVerified);
}
