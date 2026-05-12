"use server";

import { db } from "@/lib/db";
import { pgVpsSubscription } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { addMilliseconds } from "date-fns";

export type VpsPlanRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  planId: string;
  planType: "vps" | "vds" | "storage-vps" | "vps-windows";
  intervalMonths: number;
  amountBrl: number;
  status: "active" | "cancelled" | "failed" | "paused";
  nextChargeDate: Date;
  pausedAt: Date | null;
  createdAt: Date;
};

export async function getVpsPlanSubscriptionsAction(): Promise<VpsPlanRow[]> {
  const subs = await db.query.pgVpsSubscription.findMany({
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
    },
    orderBy: [desc(pgVpsSubscription.createdAt)],
  });

  return subs.map((s) => ({
    id: s.id,
    userId: s.userId,
    userName: (s.user as any)?.name ?? null,
    userEmail: (s.user as any)?.email ?? "",
    planId: s.planId,
    planType: s.planType as VpsPlanRow["planType"],
    intervalMonths: s.intervalMonths,
    amountBrl: s.amountBrl,
    status: s.status as VpsPlanRow["status"],
    nextChargeDate: s.nextChargeDate,
    pausedAt: s.pausedAt ?? null,
    createdAt: s.createdAt,
  }));
}

export async function suspendVpsSubscriptionAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  await db
    .update(pgVpsSubscription)
    .set({ status: "paused", pausedAt: new Date(), updatedAt: new Date() })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}

export async function reactivateVpsSubscriptionAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const sub = await db.query.pgVpsSubscription.findFirst({
    where: eq(pgVpsSubscription.id, id),
  });

  if (!sub || !sub.pausedAt) return;

  const remaining = sub.nextChargeDate.getTime() - sub.pausedAt.getTime();
  const newNextChargeDate = addMilliseconds(new Date(), remaining);

  await db
    .update(pgVpsSubscription)
    .set({
      status: "active",
      pausedAt: null,
      nextChargeDate: newNextChargeDate,
      failureCount: 0,
      updatedAt: new Date(),
    })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}
