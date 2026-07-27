"use server";

import { db } from "@/lib/db";
import { pgVpsSubscription, pgInvoice, pgSystemConfig } from "@/lib/db/schema";
import { eq, desc, and, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { addMilliseconds, addMonths } from "date-fns";

export type VpsPlanRow = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  planId: string;
  planType: "vps" | "vds" | "storage-vps" | "vps-windows";
  intervalMonths: number;
  amountBrl: number;
  paymentMethod: "credit_card" | "pix" | "boleto";
  status: "active" | "cancelled" | "failed" | "paused";
  nextChargeDate: Date;
  pausedAt: Date | null;
  createdAt: Date;
};

export async function getVpsPlanSubscriptionsAction(): Promise<VpsPlanRow[]> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

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
    paymentMethod: (s.paymentMethod ?? ((s.config as any)?.cardToken ? "credit_card" : "pix")) as VpsPlanRow["paymentMethod"],
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

  if (!sub || !sub.pausedAt || !sub.nextChargeDate) return;

  const remaining = sub.nextChargeDate.getTime() - sub.pausedAt.getTime();
  const newNextChargeDate =
    remaining > 0
      ? addMilliseconds(new Date(), remaining)
      : addMonths(new Date(), sub.intervalMonths);

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

export async function cancelVpsSubscriptionAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  await db
    .update(pgVpsSubscription)
    .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}

export async function getPixAllowAllDurationsAction(): Promise<boolean> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const config = await db.query.pgSystemConfig.findFirst();
  return config?.pixAllowAllDurations ?? false;
}

export async function setPixAllowAllDurationsAction(enabled: boolean): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  // system_config is a singleton table (always exactly one row, no primary key).
  await db.update(pgSystemConfig).set({ pixAllowAllDurations: enabled });

  revalidatePath("/admin/vps-plans");
}

export async function getBoletoEnabledAction(): Promise<boolean> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const config = await db.query.pgSystemConfig.findFirst();
  return config?.boletoEnabled ?? false;
}

export async function setBoletoEnabledAction(enabled: boolean): Promise<void> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  await db.update(pgSystemConfig).set({ boletoEnabled: enabled });

  revalidatePath("/admin/vps-plans");
}

export async function backfillVpsSubscriptionsAction(): Promise<{ created: number; skipped: number }> {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  // IDs de faturas que já têm subscription vinculada
  const existingSubs = await db.query.pgVpsSubscription.findMany({
    columns: { lastInvoiceId: true },
  });
  const linkedInvoiceIds = existingSubs
    .map((s) => s.lastInvoiceId)
    .filter((id): id is string => id !== null);

  // Faturas VPS pagas sem subscription correspondente
  const whereClause =
    linkedInvoiceIds.length > 0
      ? and(eq(pgInvoice.type, "vps"), eq(pgInvoice.status, "paid"), notInArray(pgInvoice.id, linkedInvoiceIds))
      : and(eq(pgInvoice.type, "vps"), eq(pgInvoice.status, "paid"));

  const invoices = await db.query.pgInvoice.findMany({
    where: whereClause,
    orderBy: [desc(pgInvoice.createdAt)],
  });

  let created = 0;
  let skipped = 0;

  for (const inv of invoices) {
    const meta = inv.metadata as any;
    const config = meta?.config || {};
    const intervalMonths = parseInt(config.duration || "1", 10);
    const planType =
      config.type === "vds" ? "vds"
      : config.type === "storage-vps" ? "storage-vps"
      : config.type === "vps-windows" ? "vps-windows"
      : "vps";

    const nextChargeDate = addMonths(new Date(inv.createdAt), intervalMonths);

    try {
      await db.insert(pgVpsSubscription).values({
        orgId: inv.orgId,
        userId: inv.userId,
        planId: meta?.vpsId || "10",
        planType: planType as any,
        config,
        intervalMonths,
        amountBrl: inv.amount,
        status: "active",
        nextChargeDate,
        lastInvoiceId: inv.id,
        failureCount: 0,
      });
      created++;
    } catch {
      skipped++;
    }
  }

  revalidatePath("/admin/vps-plans");
  return { created, skipped };
}
