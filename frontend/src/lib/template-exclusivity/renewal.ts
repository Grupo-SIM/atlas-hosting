import { format } from "date-fns";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type Invoice,
  pgInvoice,
  pgOrganization,
  pgTemplateExclusivity,
  pgTemplateExclusivitySetting,
  type TemplateExclusivity,
} from "@/lib/db/schema";
import { notifyUser } from "@/lib/notifications/inbox";
import simpayApi, { isApprovedPaymentStatus } from "@/lib/server/apis/simpay";
import { releaseBlockedSites } from "./evictions";
import { cancelOpenProposals } from "./proposals";
import { fulfillExclusivityInvoice } from "./purchase";
import {
  daysUntil,
  dueReminder,
  formatBrl,
  GRACE_DAYS,
  graceDeadline,
  renewalInvoiceDue,
} from "./rules";
import { templateName } from "./names";
import {
  exclusivityMetadata,
  expirePendingInvoices,
  LOG_PREFIX,
  renewalInvoiceFilter,
} from "./shared";

const RENEWAL_HREF = "/criador-de-sites/exclusividades";

/**
 * Fatura da anuidade do ciclo que vence em `expires_at`, criada no máximo uma
 * vez (lock consultivo + busca por metadados, como nas renovações de VPS).
 * O valor é o preço anual atual definido pelo admin.
 */
export async function ensureRenewalInvoice(
  exclusivity: TemplateExclusivity
): Promise<Invoice | undefined> {
  const dueDate = exclusivity.expiresAt;
  if (!dueDate) return undefined;
  const cycle = dueDate.toISOString();
  return db.transaction(async tx => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`template-exclusivity-invoice:${exclusivity.id}`}))`
    );
    const [existing] = await tx
      .select()
      .from(pgInvoice)
      .where(
        and(
          eq(pgInvoice.userId, exclusivity.ownerUserId),
          renewalInvoiceFilter(exclusivity.id, cycle)
        )
      )
      .limit(1);
    if (existing) return existing;

    const [setting] = await tx
      .select()
      .from(pgTemplateExclusivitySetting)
      .where(eq(pgTemplateExclusivitySetting.templateId, exclusivity.templateId))
      .limit(1);
    const amount =
      setting && setting.annualPriceBrl > 0
        ? setting.annualPriceBrl
        : exclusivity.paidAmountBrl;

    const [invoice] = await tx
      .insert(pgInvoice)
      .values({
        amount,
        currency: "BRL",
        description: `Renovação da exclusividade do template ${templateName(exclusivity.templateId)} — 12 meses`,
        dueDate,
        metadata: {
          ...(exclusivityMetadata({
            exclusivityId: exclusivity.id,
            kind: "renewal",
            renewalCycle: cycle,
            templateId: exclusivity.templateId,
          }) as object),
          isRenewal: true,
        } as Invoice["metadata"],
        orgId: exclusivity.orgId,
        reference: `EXCL-REN-${exclusivity.id}-${cycle}`,
        status: "pending",
        type: "subscription",
        userId: exclusivity.ownerUserId,
      })
      .returning();
    return invoice;
  });
}

/** Cobra a anuidade no cartão salvo. Devolve `true` quando aprovada. */
async function chargeSavedCard(
  exclusivity: TemplateExclusivity,
  invoice: Invoice
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const cardToken = exclusivity.config?.cardToken;
  if (!cardToken) return { ok: false, reason: "sem cartão salvo" };
  try {
    const organization = await db.query.pgOrganization.findFirst({
      where: eq(pgOrganization.id, exclusivity.orgId),
      with: { wallet: { with: { cards: true } } },
      // biome-ignore lint/suspicious/noExplicitAny: relações aninhadas do drizzle
    } as any);
    // biome-ignore lint/suspicious/noExplicitAny: relações aninhadas do drizzle
    const card = (organization as any)?.wallet?.cards?.find(
      // biome-ignore lint/suspicious/noExplicitAny: relações aninhadas do drizzle
      (item: any) => item.cardToken === cardToken
    );
    const user = await db.query.pgUser.findFirst({
      where: (table, { eq: equals }) => equals(table.id, exclusivity.ownerUserId),
    });
    const document = user?.billingDocument?.replace(/\D/g, "") || "";

    // Reserva a fatura antes de cobrar: outra réplica não cobra de novo.
    const [claimed] = await db
      .update(pgInvoice)
      .set({ status: "processing", updatedAt: new Date() })
      .where(and(eq(pgInvoice.id, invoice.id), eq(pgInvoice.status, "pending")))
      .returning({ id: pgInvoice.id });
    if (!claimed) return { ok: false, reason: "fatura já em cobrança" };

    const payment = await simpayApi.createCardPayment({
      bin: card?.last4 || cardToken.substring(0, 6),
      brand: card?.brand || "unknown",
      description: "HOSTING Exclusividade de template",
      document,
      document_type: document.length === 14 ? "CNPJ" : "CPF",
      email: user?.email || "",
      holder_name: card?.holderName || user?.name || "",
      installments: 1,
      mobile_phone: user?.billingPhone?.replace(/\D/g, "") || "",
      name: user?.name || "",
      price: invoice.amount,
      token: cardToken,
    });

    if (isApprovedPaymentStatus(payment.status)) {
      await db
        .update(pgInvoice)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(pgInvoice.id, invoice.id));
      await fulfillExclusivityInvoice(invoice.id);
      return { ok: true };
    }
    await db
      .update(pgInvoice)
      .set({ status: "pending", updatedAt: new Date() })
      .where(eq(pgInvoice.id, invoice.id));
    return { ok: false, reason: `pagamento não aprovado (${payment.status})` };
  } catch (error) {
    // Resultado incerto: a fatura fica em `processing` para conciliação manual.
    console.error(`${LOG_PREFIX} Falha ao cobrar a renovação ${invoice.id}:`, error);
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Uma rodada do ciclo de vida de uma exclusividade ativa ou em carência. */
async function processExclusivity(
  exclusivity: TemplateExclusivity,
  now: Date
): Promise<void> {
  const expiresAt = exclusivity.expiresAt;
  if (!expiresAt) return;
  const name = templateName(exclusivity.templateId);
  const cycle = expiresAt.toISOString();

  // 1) Fatura de renovação, 15 dias antes.
  let invoice: Invoice | undefined;
  if (renewalInvoiceDue(expiresAt, now) || exclusivity.status === "past_due") {
    invoice = await ensureRenewalInvoice(exclusivity);
  }
  if (invoice?.status === "paid") {
    await fulfillExclusivityInvoice(invoice.id);
    return;
  }

  // 2) Lembretes em 15, 7 e 1 dia.
  const reminder = dueReminder(expiresAt, exclusivity.config?.remindersSent, now);
  if (reminder && invoice) {
    await db
      .update(pgTemplateExclusivity)
      .set({
        config: {
          ...exclusivity.config,
          remindersSent: [...(exclusivity.config?.remindersSent ?? []), reminder.key],
        },
        updatedAt: now,
      })
      .where(eq(pgTemplateExclusivity.id, exclusivity.id));
    const auto = exclusivity.config?.cardToken
      ? " Vamos cobrar no cartão salvo no dia do vencimento."
      : "";
    await notifyUser(exclusivity.ownerUserId, {
      body: `A exclusividade do template "${name}" vence em ${format(expiresAt, "dd/MM/yyyy")} (${reminder.days === 1 ? "amanhã" : `em ${reminder.days} dias`}). Renovação: ${formatBrl(invoice.amount)}.${auto}`,
      email: { actionText: "Pagar renovação", severity: "warning" },
      href: `/checkout/${invoice.id}`,
      kind: "template_exclusivity_reminder",
      title: "Sua exclusividade vai vencer",
    }).catch(() => {});
  }

  if (expiresAt.getTime() > now.getTime()) return;

  // 3) Venceu: tenta o cartão uma vez por ciclo e abre a carência.
  if (exclusivity.status === "active" && invoice) {
    let failure = "sem cartão salvo para a cobrança automática";
    if (exclusivity.config?.cardToken && invoice.status === "pending") {
      const charged = await chargeSavedCard(exclusivity, invoice);
      if (charged.ok) return;
      failure = charged.reason;
    }
    const graceUntil = graceDeadline(now);
    await db
      .update(pgTemplateExclusivity)
      .set({
        config: { ...exclusivity.config, lastFailure: failure },
        graceUntil,
        status: "past_due",
        updatedAt: now,
      })
      .where(
        and(
          eq(pgTemplateExclusivity.id, exclusivity.id),
          eq(pgTemplateExclusivity.status, "active")
        )
      );
    await notifyUser(exclusivity.ownerUserId, {
      body: `A anuidade do template "${name}" venceu e não foi paga. Você tem ${GRACE_DAYS} dias (até ${format(graceUntil, "dd/MM/yyyy")}) para pagar; depois disso o template volta a ser público.`,
      email: { actionText: "Pagar renovação", severity: "danger" },
      href: `/checkout/${invoice.id}`,
      kind: "template_exclusivity_past_due",
      title: "Exclusividade em atraso",
    }).catch(() => {});
    console.warn(
      `${LOG_PREFIX} Exclusividade ${exclusivity.id} em atraso até ${graceUntil.toISOString()}: ${failure} (ciclo ${cycle})`
    );
    return;
  }

  // 4) Carência acabou: perde a exclusividade.
  if (
    exclusivity.status === "past_due" &&
    exclusivity.graceUntil &&
    exclusivity.graceUntil.getTime() <= now.getTime()
  ) {
    if (invoice?.status === "processing") return; // pagamento em andamento
    await expireExclusivity(exclusivity, invoice);
  }
}

/** Fim da exclusividade: template volta a ser público. O site do ex-dono continua no ar. */
export async function expireExclusivity(
  exclusivity: TemplateExclusivity,
  renewalInvoice?: Invoice
): Promise<void> {
  const updated = await db
    .update(pgTemplateExclusivity)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        eq(pgTemplateExclusivity.id, exclusivity.id),
        inArray(pgTemplateExclusivity.status, ["active", "past_due"])
      )
    )
    .returning({ id: pgTemplateExclusivity.id });
  if (updated.length === 0) return;

  await expirePendingInvoices(db, [renewalInvoice?.id]);
  await cancelOpenProposals(
    exclusivity.id,
    "o dono perdeu a exclusividade do template."
  );
  await releaseBlockedSites(exclusivity.templateId);
  await notifyUser(exclusivity.ownerUserId, {
    body: `A exclusividade do template "${templateName(exclusivity.templateId)}" terminou por falta de pagamento. Seu site continua no ar, mas outras pessoas voltam a poder usar o template.`,
    email: { severity: "danger" },
    href: RENEWAL_HREF,
    kind: "template_exclusivity_expired",
    title: "Exclusividade encerrada",
  }).catch(() => {});
}

/** Rodada de renovações de todas as exclusividades em dia ou em carência. */
export async function processRenewals(now = new Date()): Promise<void> {
  const rows = await db
    .select()
    .from(pgTemplateExclusivity)
    .where(inArray(pgTemplateExclusivity.status, ["active", "past_due"]));
  for (const row of rows) {
    if (!row.expiresAt) continue;
    // Só mexe no que está perto de vencer (ou já venceu).
    if (row.status === "active" && daysUntil(row.expiresAt, now) > 15) continue;
    try {
      await processExclusivity(row, now);
    } catch (error) {
      console.error(`${LOG_PREFIX} Falha na renovação de ${row.id}:`, error);
    }
  }
}
