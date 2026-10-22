import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgVpsSubscription } from "@/lib/db/schema";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { daysUntilRenewal } from "@/lib/server/subscriptions/renewal-policy";
import { notifySubscriptionExpiring } from "@/lib/server/subscriptions/renewal-reminder";

export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || ![process.env.CRON_SECRET, process.env.API_MACHINE_INTERNAL_TOKEN, process.env.INTERNAL_SERVICE_TOKEN].filter(Boolean).includes(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (typeof body?.subscriptionId !== "string" || !body.subscriptionId.trim()) {
    return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
  }

  const sub = await db.query.pgVpsSubscription.findFirst({
    where: eq(pgVpsSubscription.id, body.subscriptionId.trim()),
    with: { user: true },
  });
  if (!sub) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  if (sub.status !== "active" || !sub.user?.email) {
    return NextResponse.json({ error: "Subscription must be active and have a recipient" }, { status: 409 });
  }
  const daysLeft = daysUntilRenewal(sub.nextChargeDate);
  if (daysLeft < 1) {
    return NextResponse.json({ error: "Renewal date must be in the future" }, { status: 409 });
  }

  try {
    const sent = await notifySubscriptionExpiring(sub, daysLeft, getServerPublicBaseUrl(), { allowResend: true });
    return NextResponse.json({ subscriptionId: sub.id, daysLeft, sent });
  } catch (error) {
    console.error(`[RENEWAL-EMAIL] Failed for subscription ${sub.id}:`, error);
    return NextResponse.json({ error: "Failed to send renewal email" }, { status: 500 });
  }
}
