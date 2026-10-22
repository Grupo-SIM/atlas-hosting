import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgInvoice, pgVpsSubscription } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { getStorageVpsPlan } from "@/lib/storage-vps-catalog";
import { getVdsPlan } from "@/lib/vds-catalog";
import { getCloudVpsPlan } from "@/lib/vps-catalog";
import { ensureRenewalInvoice } from "./renewal-invoice";
import { renewalEmailMessage } from "./renewal-policy";

const PLAN_TYPE_LABEL: Record<string, string> = {
  "storage-vps": "Storage VPS",
  vds: "Cloud VDS",
  vps: "Cloud VPS",
  "vps-windows": "VPS Windows",
};

function planDisplayName(planType: string, planId: string): string {
  if (planType === "vds") return getVdsPlan(planId)?.name || planId;
  if (planType === "storage-vps")
    return getStorageVpsPlan(planId)?.name || planId;
  if (planType === "vps-windows")
    return `${getCloudVpsPlan(planId)?.name || planId} Windows`;
  return getCloudVpsPlan(planId)?.name || planId;
}

export async function notifySubscriptionExpiring(
  sub: typeof pgVpsSubscription.$inferSelect & {
    user: { name: string | null; email: string };
  },
  daysLeft: number,
  baseUrl: string,
  options: { allowResend?: boolean } = {}
): Promise<boolean> {
  const user = sub.user;
  if (!user?.email) return false;

  const planLabel = `${PLAN_TYPE_LABEL[sub.planType] || sub.planType} — ${planDisplayName(sub.planType, sub.planId)}`;
  const dayWord = daysLeft === 1 ? "dia" : "dias";
  const invoice = await ensureRenewalInvoice(sub);
  const severity = "warning";
  const title = daysLeft === 0
    ? `Sua assinatura ${planLabel} renova hoje`
    : `Sua assinatura ${planLabel} renova em ${daysLeft} ${dayWord}`;
  const plan = sub.planType === "vds" ? getVdsPlan(sub.planId) : sub.planType === "storage-vps" ? getStorageVpsPlan(sub.planId) : getCloudVpsPlan(sub.planId);
  const details = plan ? `${"cores" in plan ? plan.cores : plan.vcpu} · ${plan.ram} · ${plan.storage}` : undefined;
  const message = renewalEmailMessage(planLabel, sub.amountBrl, sub.intervalMonths, sub.nextChargeDate, details);

  const marker = `${sub.nextChargeDate.toISOString()}:${daysLeft}`;
  return db.transaction(async tx => {
    await tx.execute(sql`select id from vps_subscriptions where id = ${sub.id} for update`);
    const current = await tx.query.pgVpsSubscription.findFirst({ where: eq(pgVpsSubscription.id, sub.id) });
    if (!current || current.status !== "active" || current.nextChargeDate.getTime() !== sub.nextChargeDate.getTime() || (!options.allowResend && (current.config as any)?.renewalReminderSent?.[marker])) return false;
    const currentInvoice = await tx.query.pgInvoice.findFirst({ where: eq(pgInvoice.id, invoice.id) });
    // Cobrança em andamento ou já paga não deve gerar pedido de pagamento.
    if (!currentInvoice || !["pending", "failed"].includes(currentInvoice.status) || (current.config as any)?.renewalCardUncertain) return false;
    await sendNotificationEmail(
      user.email, (user.name || "Cliente").split(" ")[0], "Atlas Hosting", title, message, severity,
      `${baseUrl}/checkout/${invoice.id}?initialStep=payment`, "Pagar renovação", undefined, true,
    );
    await tx.update(pgVpsSubscription).set({
      config: sql`jsonb_set(${pgVpsSubscription.config}::jsonb, '{renewalReminderSent}', coalesce(${pgVpsSubscription.config}::jsonb->'renewalReminderSent', '{}'::jsonb) || jsonb_build_object(${marker}::text, true))::json`,
    }).where(eq(pgVpsSubscription.id, sub.id));
    return true;
  });

}

