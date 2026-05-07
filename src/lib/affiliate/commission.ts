import { db } from "@/lib/db";
import { pgAffiliateCommission, pgSystemConfig } from "@/lib/db/schema";
import type { Invoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getActiveAttribution } from "./attribution";

/**
 * Called after every invoice is marked paid.
 * Skips renewals, self-purchases, and invoices with no active attribution.
 */
export async function triggerCommissionIfApplicable(
  invoice: Invoice
): Promise<void> {
  const meta = invoice.metadata as Record<string, unknown> | null;

  // Skip renewals: explicit flag or domain renew metadata type
  if (meta?.isRenewal === true || meta?.type === "renew") return;

  const attribution = await getActiveAttribution(invoice.userId);
  if (!attribution) return;

  // Self-purchase guard
  if (attribution.affiliateUserId === invoice.userId) return;

  // Prevent duplicate commission for same invoice
  const existing = await db.query.pgAffiliateCommission.findFirst({
    where: (t, { eq }) => eq(t.invoiceId, invoice.id),
  });
  if (existing) return;

  const config = await db.query.pgSystemConfig.findFirst();
  const rawRate =
    Number(process.env.AFFILIATE_COMMISSION_RATE) ||
    config?.referrerCommission ||
    10;
  const rate = rawRate > 1 ? rawRate / 100 : rawRate;

  await db.insert(pgAffiliateCommission).values({
    affiliateUserId: attribution.affiliateUserId,
    buyerUserId: invoice.userId,
    invoiceId: invoice.id,
    grossAmount: invoice.amount,
    commissionAmount: invoice.amount * rate,
    commissionRate: rate,
    status: "available",
  });
}
