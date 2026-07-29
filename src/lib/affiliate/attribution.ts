import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgAffiliateAttribution, pgUser } from "@/lib/db/schema";

const ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Records or refreshes attribution: when a user logs in or signs up after
 * clicking an affiliate link (referrer_code cookie present).
 * Self-attribution is silently ignored.
 */
export async function recordAttribution(
  affiliateCode: string,
  userId: string
): Promise<void> {
  const affiliate = await db.query.pgUser.findFirst({
    columns: { id: true },
    where: eq(pgUser.affiliateCode, affiliateCode),
  });

  if (!affiliate || affiliate.id === userId) return;

  const expiresAt = new Date(Date.now() + ATTRIBUTION_TTL_MS);

  await db
    .insert(pgAffiliateAttribution)
    .values({
      affiliateUserId: affiliate.id,
      attributedUserId: userId,
      expiresAt,
    })
    .onConflictDoUpdate({
      set: {
        affiliateUserId: affiliate.id,
        expiresAt,
        updatedAt: new Date(),
      },
      target: pgAffiliateAttribution.attributedUserId,
    });
}

/** Returns the active (non-expired) attribution for a buyer, or undefined. */
export async function getActiveAttribution(userId: string) {
  return db.query.pgAffiliateAttribution.findFirst({
    where: and(
      eq(pgAffiliateAttribution.attributedUserId, userId),
      gt(pgAffiliateAttribution.expiresAt, new Date())
    ),
  });
}
