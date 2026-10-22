import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgInvoice, pgVpsSubscription, type VpsSubscription } from "@/lib/db/schema";

/** Reutiliza checkout durante o ciclo; lock impede faturas duplicadas. */
export async function ensureRenewalInvoice(sub: VpsSubscription) {
  return db.transaction(async tx => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`vps-renewal-invoice:${sub.id}`}))`);
    const current = await tx.query.pgVpsSubscription.findFirst({ where: eq(pgVpsSubscription.id, sub.id) });
    if (!current || current.nextChargeDate.getTime() !== sub.nextChargeDate.getTime() || !["active", "paused", "failed"].includes(current.status)) throw new Error("Assinatura mudou; atualize a página.");
    const cycle = sub.nextChargeDate.toISOString();
    const [existing] = await tx.select().from(pgInvoice).where(and(
      eq(pgInvoice.userId, sub.userId),
      sql`${pgInvoice.status} in ('pending', 'processing', 'paid')`,
      sql`${pgInvoice.metadata}->>'subscriptionId' = ${sub.id}`,
      sql`${pgInvoice.metadata}->>'renewalCycle' = ${cycle}`,
    ));
    if (existing) return existing;
    const [invoice] = await tx.insert(pgInvoice).values({
      amount: sub.amountBrl, currency: "BRL", description: `Renovação ${sub.planType} ${sub.planId} — ${sub.intervalMonths} meses`,
      dueDate: new Date(sub.nextChargeDate.getTime() + 86_400_000),
      metadata: { config: { ...(sub.config as Record<string, unknown>), duration: String(sub.intervalMonths) }, isRenewal: true, subscriptionId: sub.id, renewalCycle: cycle, vpsId: sub.planId },
      orgId: sub.orgId, userId: sub.userId, reference: `VPS-REN-${sub.id}-${cycle}`, status: "pending", type: "vps",
    }).returning();
    return invoice;
  });
}
