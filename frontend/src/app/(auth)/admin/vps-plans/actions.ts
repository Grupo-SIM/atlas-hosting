"use server";

import { addMilliseconds, addMonths } from "date-fns";
import { and, desc, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice, pgVpsSubscription } from "@/lib/db/schema";
import { hasAreaAccess } from "@/lib/permissions/access";
import { savePaymentSettings } from "@/lib/server/payment-settings";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { daysUntilRenewal } from "@/lib/server/subscriptions/renewal-policy";
import { notifySubscriptionExpiring } from "@/lib/server/subscriptions/renewal-reminder";
import { firstRenewalDate } from "@/lib/vps/renewal-date";

export interface VpsPlanRow {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  planId: string;
  planType: "vps" | "vds" | "storage-vps" | "vps-windows";
  intervalMonths: number;
  amountBrl: number;
  paymentMethod: "credit_card" | "pix" | "boleto" | "voucher";
  status: "active" | "cancelled" | "failed" | "paused";
  nextChargeDate: Date;
  pausedAt: Date | null;
  createdAt: Date;
}

export async function getVpsPlanSubscriptionsAction(): Promise<VpsPlanRow[]> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "view")))
    redirect("/home");

  const subs = await db.query.pgVpsSubscription.findMany({
    orderBy: [desc(pgVpsSubscription.createdAt)],
    with: {
      user: {
        columns: { email: true, id: true, name: true },
      },
    },
  });

  return subs.map(s => ({
    amountBrl: s.amountBrl,
    createdAt: s.createdAt,
    id: s.id,
    intervalMonths: s.intervalMonths,
    nextChargeDate: s.nextChargeDate,
    pausedAt: s.pausedAt ?? null,
    paymentMethod: (s.paymentMethod ??
      ((s.config as any)?.cardToken
        ? "credit_card"
        : "pix")) as VpsPlanRow["paymentMethod"],
    planId: s.planId,
    planType: s.planType as VpsPlanRow["planType"],
    status: s.status as VpsPlanRow["status"],
    userEmail: (s.user as any)?.email ?? "",
    userId: s.userId,
    userName: (s.user as any)?.name ?? null,
  }));
}

export async function suspendVpsSubscriptionAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "edit")))
    redirect("/home");

  await db
    .update(pgVpsSubscription)
    .set({ pausedAt: new Date(), status: "paused", updatedAt: new Date() })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}

export async function reactivateVpsSubscriptionAction(
  id: string
): Promise<void> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "edit")))
    redirect("/home");

  const sub = await db.query.pgVpsSubscription.findFirst({
    where: eq(pgVpsSubscription.id, id),
  });

  if (!sub?.pausedAt || !sub.nextChargeDate) return;

  const remaining = sub.nextChargeDate.getTime() - sub.pausedAt.getTime();
  const newNextChargeDate =
    remaining > 0
      ? addMilliseconds(new Date(), remaining)
      : addMonths(new Date(), sub.intervalMonths);

  await db
    .update(pgVpsSubscription)
    .set({
      failureCount: 0,
      nextChargeDate: newNextChargeDate,
      pausedAt: null,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}

export async function cancelVpsSubscriptionAction(id: string): Promise<void> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "edit")))
    redirect("/home");

  await db
    .update(pgVpsSubscription)
    .set({
      cancelledAt: new Date(),
      status: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(pgVpsSubscription.id, id));

  revalidatePath("/admin/vps-plans");
}

export async function getPixAllowAllDurationsAction(): Promise<boolean> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "view")))
    redirect("/home");

  const config = await db.query.pgSystemConfig.findFirst();
  return config?.pixAllowAllDurations ?? false;
}

export async function setPixAllowAllDurationsAction(
  enabled: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "edit")))
    return { error: "Acesso restrito a administradores.", ok: false };

  try {
    await savePaymentSettings({ pixAllowAllDurations: enabled });
    revalidatePath("/admin/vps-plans");
    return { ok: true };
  } catch (error) {
    console.error("[payment-settings] PIX save failed", error);
    return { error: "Erro ao salvar configuração de PIX.", ok: false };
  }
}

export async function getBoletoEnabledAction(): Promise<boolean> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "view")))
    redirect("/home");

  const config = await db.query.pgSystemConfig.findFirst();
  return config?.boletoEnabled ?? false;
}

export async function setBoletoEnabledAction(
  enabled: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "edit")))
    return { error: "Acesso restrito a administradores.", ok: false };

  try {
    await savePaymentSettings({ boletoEnabled: enabled });
    revalidatePath("/admin/vps-plans");
    return { ok: true };
  } catch (error) {
    console.error("[payment-settings] Boleto save failed", error);
    return { error: "Erro ao salvar configuração de boleto.", ok: false };
  }
}

export async function backfillVpsSubscriptionsAction(): Promise<{
  created: number;
  skipped: number;
}> {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "edit")))
    redirect("/home");

  // IDs de faturas que já têm subscription vinculada
  const existingSubs = await db.query.pgVpsSubscription.findMany({
    columns: { initialInvoiceId: true, lastInvoiceId: true },
  });
  const linkedInvoiceIds = existingSubs
    .flatMap(s => [s.lastInvoiceId, s.initialInvoiceId])
    .filter((id): id is string => id !== null);

  // Faturas VPS pagas sem subscription correspondente
  const whereClause =
    linkedInvoiceIds.length > 0
      ? and(
          eq(pgInvoice.type, "vps"),
          eq(pgInvoice.status, "paid"),
          notInArray(pgInvoice.id, linkedInvoiceIds)
        )
      : and(eq(pgInvoice.type, "vps"), eq(pgInvoice.status, "paid"));

  const invoices = await db.query.pgInvoice.findMany({
    orderBy: [desc(pgInvoice.createdAt)],
    where: whereClause,
  });

  let created = 0;
  let skipped = 0;

  for (const inv of invoices) {
    const meta = inv.metadata as any;
    if (meta?.isRenewal) {
      skipped++;
      continue;
    }
    const config = meta?.config || {};
    const intervalMonths = Number.parseInt(config.duration || "1", 10);
    const planType =
      config.type === "vds"
        ? "vds"
        : config.type === "storage-vps"
          ? "storage-vps"
          : config.type === "vps-windows"
            ? "vps-windows"
            : "vps";

    const nextChargeDate = firstRenewalDate(
      new Date(inv.createdAt),
      intervalMonths
    );

    try {
      await db
        .insert(pgVpsSubscription)
        .values({
          amountBrl: inv.originalAmount ?? inv.amount,
          config,
          failureCount: 0,
          initialInvoiceId: inv.id,
          intervalMonths,
          lastInvoiceId: inv.id,
          nextChargeDate,
          orgId: inv.orgId,
          planId: meta?.vpsId || "10",
          planType: planType as any,
          status: "active",
          userId: inv.userId,
        })
        .onConflictDoNothing({ target: pgVpsSubscription.initialInvoiceId })
        .returning({ id: pgVpsSubscription.id })
        .then(rows => {
          if (rows.length) created++;
          else skipped++;
        });
    } catch {
      skipped++;
    }
  }

  revalidatePath("/admin/vps-plans");
  return { created, skipped };
}

export async function sendRenewalReminderAction(id: string) {
  const admin = await getUser();
  if (!(await hasAreaAccess(admin, "admin_vps_plans", "edit")))
    return { message: "Acesso não autorizado.", status: "error" } as const;

  try {
    const sub = await db.query.pgVpsSubscription.findFirst({
      where: eq(pgVpsSubscription.id, id),
      with: { user: true },
    });
    if (!sub || sub.status !== "active" || !sub.user?.email) {
      return {
        message: "Assinatura indisponível para envio de lembrete.",
        status: "error",
      } as const;
    }
    const daysLeft = daysUntilRenewal(sub.nextChargeDate);
    if (daysLeft < 1) {
      return {
        message: "A data de renovação precisa ser futura.",
        status: "error",
      } as const;
    }
    const sent = await notifySubscriptionExpiring(
      sub,
      daysLeft,
      getServerPublicBaseUrl(),
      { allowResend: true }
    );
    return {
      message: sent
        ? "Lembrete enviado ao cliente."
        : "Envio ignorado: assinatura alterada ou pagamento já realizado/em processamento.",
      status: sent ? "success" : "info",
    } as const;
  } catch (error) {
    console.error(`[RENEWAL-EMAIL] Falha na assinatura ${id}:`, error);
    return {
      message: "Não foi possível enviar o lembrete. Tente novamente.",
      status: "error",
    } as const;
  }
}
