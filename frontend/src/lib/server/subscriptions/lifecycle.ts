import { addDays } from "date-fns";
import { and, eq, sql } from "drizzle-orm";
import { getContaboInstanceName } from "@/lib/contabo/getVps";
import { cancelVpsOnDate } from "@/lib/contabo/cancelVps";
import { db } from "@/lib/db";
import { pgInvoice, pgLog, pgVpsSubscription, type Invoice } from "@/lib/db/schema";
import { deliverEmergencyAlert, getEmergencyRecipients } from "@/lib/server/emergency-alerts";
import { sendNotificationEmail } from "@/lib/email/service";
import { isFinalCardDecline } from "@/lib/server/payments/card-failure";
import { nextRenewalDate } from "@/lib/vps/renewal-date";
import { escapeEmailHtml, renewalAttemptDay } from "./renewal-policy";

type PaymentMethod = typeof pgVpsSubscription.$inferSelect.paymentMethod;
type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];


async function lockSubscription(tx: Transaction, id: string) {
  await tx.execute(sql`select id from vps_subscriptions where id = ${id} for update`);
  return tx.query.pgVpsSubscription.findFirst({ where: eq(pgVpsSubscription.id, id), with: { vpsNode: true } });
}

/** A retirada de cancelamento de instância não consta na API pública da Contabo.
 * Nunca reportar cancelamento retirado sem confirmação do fornecedor. */
async function recordCancellationWithdrawal(tx: Transaction, sub: NonNullable<Awaited<ReturnType<typeof lockSubscription>>>, config: Record<string, any>) {
  if (!sub.vpsNode?.externalId || !config.renewalCancellation) return;
  config.renewalCancellation = { ...config.renewalCancellation, withdrawalRequired: true };
  await tx.insert(pgLog).values({ userId: sub.userId, type: "hosting", severity: "danger",
    title: "Pagamento recebido: retirar cancelamento na Contabo",
    description: `Assinatura ${sub.id}, instância ${sub.vpsNode?.externalId || "sem vínculo"}. Pagamento confirmado. Retirada do cancelamento exige ação no painel Contabo: API pública não oferece essa operação.`,
  });
}

async function applyPayment(tx: Transaction, invoice: Invoice, method: PaymentMethod, cardToken?: string) {
  const meta = invoice.metadata as any;
  const sub = await lockSubscription(tx, meta.subscriptionId);
  if (!sub || sub.userId !== invoice.userId || sub.lastInvoiceId === invoice.id) return;
  if (meta.renewalCycle && meta.renewalCycle !== sub.nextChargeDate.toISOString()) return;
  await tx.update(pgInvoice).set({ status: "paid", updatedAt: new Date() }).where(eq(pgInvoice.id, invoice.id));
  const config = { ...(meta.config || {}), ...(sub.config as any) };
  // Config da fatura foi capturada antes do cancelamento: preservar estado atual.
  if ((sub.config as any)?.renewalCancellation) config.renewalCancellation = (sub.config as any).renewalCancellation;
  delete config.renewalLastAttemptDay;
  delete config.renewalCancellationPending;
  delete config.renewalCardUncertain;
  delete config.renewalClaimedAttemptDay;
  delete config.renewalClaimedAt;
  if (cardToken) config.cardToken = cardToken;
  await recordCancellationWithdrawal(tx, sub, config);
  await tx.update(pgVpsSubscription).set({
    config, paymentMethod: method, status: "active", pausedAt: null, failureCount: 0,
    nextChargeDate: nextRenewalDate(sub.nextChargeDate, sub.intervalMonths), lastInvoiceId: invoice.id, updatedAt: new Date(),
  }).where(eq(pgVpsSubscription.id, sub.id));
}

export async function applyRenewalPayment(invoice: Invoice, method: PaymentMethod, cardToken?: string) {
  await db.transaction(tx => applyPayment(tx, invoice, method, cardToken));
  await notifyPendingCancellationWithdrawals((invoice.metadata as any).subscriptionId);

}

/** Lock compartilhado com confirmação de pagamento evita cancelar um ciclo já pago. */
export async function processRenewal(
  subscriptionId: string,
  invoice: Invoice,
  charge: (sub: typeof pgVpsSubscription.$inferSelect, invoice: Invoice) => Promise<void>,
  now = new Date(),
) {
  // Reserva COMMITADA antes do gateway: uma queda não libera nova cobrança.
  const prepared = await db.transaction(async tx => {
    const sub = await lockSubscription(tx, subscriptionId);
    if (!sub || sub.status !== "active" || (invoice.metadata as any).renewalCycle !== sub.nextChargeDate.toISOString()) return;
    const attemptDay = renewalAttemptDay(sub.nextChargeDate, now);
    const config = { ...(sub.config as any) };
    if (!attemptDay || sub.paymentMethod !== "credit_card" || !config.cardToken || config.renewalCardUncertain || config.renewalLastAttemptDay === attemptDay) return;
    const currentInvoice = await tx.query.pgInvoice.findFirst({ where: eq(pgInvoice.id, invoice.id) });
    if (!currentInvoice || currentInvoice.status !== "pending") return;
    const claimed = await tx.update(pgInvoice).set({ status: "processing", updatedAt: now }).where(and(eq(pgInvoice.id, invoice.id), eq(pgInvoice.status, "pending"), eq(pgInvoice.amount, currentInvoice.amount))).returning({ id: pgInvoice.id });
    if (!claimed.length) return;
    config.renewalCardUncertain = true;
    config.renewalClaimedAttemptDay = attemptDay;
    config.renewalClaimedAt = now.toISOString();
    await tx.update(pgVpsSubscription).set({ config, updatedAt: now }).where(eq(pgVpsSubscription.id, sub.id));
    return { sub, invoice: currentInvoice };
  });
  let outcome: { approved: boolean; error?: unknown } | undefined;
  if (prepared) {
    try { await charge(prepared.sub, prepared.invoice); outcome = { approved: true }; }
    catch (error) { outcome = { approved: false, error }; }
  }

  return db.transaction(async tx => {
    const sub = await lockSubscription(tx, subscriptionId);
    if (!sub || (sub.status !== "active" && !(sub.status === "paused" && outcome?.approved))) return "skipped";
    const cycle = (invoice.metadata as any).renewalCycle;
    if (cycle !== sub.nextChargeDate.toISOString()) return "skipped";
    const currentInvoice = await tx.query.pgInvoice.findFirst({ where: eq(pgInvoice.id, invoice.id) });
    if (!currentInvoice) throw new Error("Fatura de renovação não encontrada.");
    if (currentInvoice.status === "paid") { await applyPayment(tx, currentInvoice, sub.paymentMethod); return "paid"; }
    if (currentInvoice.status === "processing" && !(sub.config as any)?.renewalCardUncertain) return "payment-processing";
    const attemptDay = renewalAttemptDay(sub.nextChargeDate, now);
    if (!attemptDay) return "skipped";
    const config = { ...(sub.config as any) };
    const alreadyAttempted = config.renewalLastAttemptDay === attemptDay;
    if (alreadyAttempted && !config.renewalCancellationPending && !outcome) return "skipped";
    const automatic = sub.paymentMethod === "credit_card" && !!config.cardToken;
    const failure = outcome?.error;
    if (outcome?.approved) {
      await tx.update(pgInvoice).set({ status: "paid", updatedAt: now }).where(eq(pgInvoice.id, invoice.id));
      await applyPayment(tx, invoice, "credit_card", config.cardToken);
      return "charged";
    }
    if (outcome && isFinalCardDecline(failure)) {
      await tx.update(pgInvoice).set({ status: "pending", updatedAt: now }).where(eq(pgInvoice.id, invoice.id));
      delete config.renewalCardUncertain;
      delete config.renewalClaimedAttemptDay;
      delete config.renewalClaimedAt;
    }
    if (failure && typeof failure === "object" && "paymentId" in failure && typeof failure.paymentId === "string") {
      await tx.update(pgInvoice).set({ metadata: { ...currentInvoice.metadata, renewalCardPaymentId: failure.paymentId } as Invoice["metadata"] }).where(eq(pgInvoice.id, invoice.id));
    }
    if (!outcome && config.renewalCardUncertain && config.renewalClaimedAttemptDay === attemptDay && now.getTime() - Date.parse(config.renewalClaimedAt) < 15 * 60 * 1000) return "payment-processing";
    config.renewalLastAttemptDay = attemptDay;
    let status: typeof sub.status = "active";
    if (attemptDay === 2) {
      // Sem ID do fornecedor, a assinatura mantém apenas o fluxo financeiro.
      if (!sub.vpsNode?.externalId) {
        delete config.renewalCancellationPending;
        await tx.update(pgVpsSubscription).set({
          config, failureCount: automatic && !alreadyAttempted ? sub.failureCount + 1 : sub.failureCount, updatedAt: now,
        }).where(eq(pgVpsSubscription.id, sub.id));
        return "cancellation-skipped";
      }
      try {
        const cancelDate = addDays(sub.nextChargeDate, 2);
        await cancelVpsOnDate(sub.vpsNode.externalId, cancelDate);
        config.renewalCancellation = { instanceId: sub.vpsNode.externalId, cycle: sub.nextChargeDate.toISOString(), cancelDate: cancelDate.toISOString(), withdrawalRequired: false };
        delete config.renewalCancellationPending;
        status = "paused";
      } catch (error) {
        // Falha do fornecedor não pode liberar outra tentativa de cartão.
        config.renewalCancellationPending = true;
        await tx.update(pgVpsSubscription).set({ config, failureCount: automatic && !alreadyAttempted ? sub.failureCount + 1 : sub.failureCount, updatedAt: now }).where(eq(pgVpsSubscription.id, sub.id));
        await tx.insert(pgLog).values({ userId: sub.userId, type: "hosting", severity: "danger", title: "Falha ao agendar cancelamento VPS na Contabo",
          description: `Assinatura ${sub.id}: ${error instanceof Error ? error.message : String(error)}. Cancelamento pendente; nova tentativa apenas no fornecedor, sem cobrar cartão novamente.`,
        });
        return "cancellation-error";
      }
    }
    await tx.update(pgVpsSubscription).set({ config, status, pausedAt: status === "paused" ? now : null,
      failureCount: automatic && !alreadyAttempted ? (sub.failureCount || 0) + 1 : sub.failureCount, updatedAt: now,
    }).where(eq(pgVpsSubscription.id, sub.id));
    await tx.insert(pgLog).values({ userId: sub.userId, type: "hosting", severity: "danger",
      title: attemptDay === 2 ? "Cancelamento VPS agendado na Contabo" : "Primeira tentativa de renovação sem pagamento",
      description: `Assinatura ${sub.id}. ${failure instanceof Error ? failure.message : "Pagamento não confirmado"}. ${attemptDay === 2 ? "Cancelamento confirmado pelo fornecedor." : "Nova tentativa no dia seguinte."}`,
    });
    return status === "paused" ? "cancellation-scheduled" : "retry-tomorrow";
  });
}

/** Retenta falha SMTP sem perder reconhecimento financeiro da renovação. */
export async function notifyPendingCancellationWithdrawals(subscriptionId?: string) {
  const subs = await db.query.pgVpsSubscription.findMany({ where: subscriptionId ? eq(pgVpsSubscription.id, subscriptionId) : sql`${pgVpsSubscription.config}::jsonb->'renewalCancellation'->>'withdrawalRequired' = 'true' and ${pgVpsSubscription.config}::jsonb->'renewalCancellation'->>'alertSentAt' is null`, with: { vpsNode: true } });
  for (const sub of subs) {
    const cancellation = (sub.config as any)?.renewalCancellation;
    if (!sub.vpsNode?.externalId || !cancellation?.withdrawalRequired || cancellation.alertSentAt) continue;
    const recipients = getEmergencyRecipients();
    const safe = escapeEmailHtml;
    const instanceId = sub.vpsNode?.externalId || cancellation.instanceId;
    let providerName: string | null = null;
    try { if (instanceId) providerName = await getContaboInstanceName(instanceId); }
    catch (error) { console.error(`[VPS-RENEWAL] Nome Contabo indisponível para ${instanceId}:`, error); }
    const name = safe(providerName || sub.vpsNode?.name || "Nome indisponível");
    const id = safe(instanceId || "ID indisponível");
    const sentTo = new Set<string>(cancellation.alertSentTo || []);
    await deliverEmergencyAlert(async recipient => {
      if (sentTo.has(recipient)) return;
      await sendNotificationEmail(
        recipient, "Admin", "Atlas Hosting", "URGENTE: desagendar cancelamento da VPS na Contabo",
        `Pagamento da renovação confirmado. <strong>Desagende manualmente o cancelamento na Contabo.</strong><br><br>Nome da VPS: <strong>${name}</strong><br>ID da VPS na Contabo: <strong>${id}</strong><br>Cancelamento agendado: <strong>${safe(cancellation.cancelDate)}</strong><br>Assinatura Atlas: ${sub.id}<br><br>A API pública não permite retirar esse cancelamento automaticamente.`,
        "danger", undefined, undefined, undefined, true,
      );
      sentTo.add(recipient);
    }, recipients);
    const complete = recipients.length > 0 && recipients.every(recipient => sentTo.has(recipient));
    if (sentTo.size) {
      const progress = JSON.stringify({ alertSentTo: [...sentTo], ...(complete ? { alertSentAt: new Date().toISOString() } : {}) });
      await db.update(pgVpsSubscription).set({
        config: sql`jsonb_set(${pgVpsSubscription.config}::jsonb, '{renewalCancellation}', (${pgVpsSubscription.config}::jsonb->'renewalCancellation') || ${progress}::jsonb)::json`,
      }).where(eq(pgVpsSubscription.id, sub.id));
    }
    if (!complete) console.error(`[VPS-RENEWAL] Alerta emergencial pendente para ${sub.id}; verifique EMERGENCY_ALERT_EMAILS/SMTP.`);
  }
}
