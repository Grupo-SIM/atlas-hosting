import { getTemplate } from "@repo/site-builder";
import { format } from "date-fns";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type Invoice,
  LIVE_EXCLUSIVITY_STATUSES,
  pgInvoice,
  pgTemplateExclusivity,
  pgTemplateExclusivitySetting,
  type TemplateExclusivityInvoiceOptions,
} from "@/lib/db/schema";
import { notifyUser } from "@/lib/notifications/inbox";
import { scheduleEvictions } from "./evictions";
import { reportPaidWithoutDelivery } from "./report";
import { cycleEnd, formatBrl, reservationDeadline } from "./rules";
import { templateName } from "./names";
import {
  exclusivityData,
  exclusivityMetadata,
  expirePendingInvoices,
  isUniqueViolation,
  LOG_PREFIX,
} from "./shared";
import { transferExclusivity } from "./transfer";

type Result<T = object> = ({ ok: true } & T) | { error: string; ok: false };

/**
 * Primeira compra da exclusividade: reserva o template por 24h e cria a fatura
 * com o preço anual do admin. A reserva conta no índice único, então duas
 * pessoas não compram o mesmo template ao mesmo tempo.
 */
export async function createPurchaseInvoice(
  user: { id: string; organizationId: string },
  templateId: string,
  now = new Date()
): Promise<Result<{ invoiceId: string }>> {
  if (!getTemplate(templateId)) {
    return { error: "Template não encontrado.", ok: false };
  }
  const [setting] = await db
    .select()
    .from(pgTemplateExclusivitySetting)
    .where(eq(pgTemplateExclusivitySetting.templateId, templateId))
    .limit(1);
  if (!(setting?.enabled && setting.annualPriceBrl > 0)) {
    return {
      error: "Este template não está disponível para exclusividade.",
      ok: false,
    };
  }

  try {
    const invoiceId = await db.transaction(async tx => {
      const [live] = await tx
        .select()
        .from(pgTemplateExclusivity)
        .where(
          and(
            eq(pgTemplateExclusivity.templateId, templateId),
            inArray(pgTemplateExclusivity.status, [...LIVE_EXCLUSIVITY_STATUSES])
          )
        )
        .for("update");

      if (live) {
        const reservationOver =
          live.status === "reserved" &&
          (live.reservedUntil?.getTime() ?? 0) <= now.getTime();
        if (live.status === "reserved" && live.ownerUserId === user.id && !reservationOver) {
          // Mesmo usuário voltando ao checkout: reaproveita a fatura.
          if (live.initialInvoiceId) return live.initialInvoiceId;
        }
        if (!reservationOver) {
          throw new PurchaseError(
            live.ownerUserId === user.id
              ? "Você já tem a exclusividade deste template."
              : "Este template já tem dono ou está sendo comprado por outra pessoa."
          );
        }
        // Reserva vencida que o job ainda não limpou: libera agora.
        await tx
          .update(pgTemplateExclusivity)
          .set({ status: "released", updatedAt: now })
          .where(eq(pgTemplateExclusivity.id, live.id));
        await expirePendingInvoices(tx, [live.initialInvoiceId]);
      }

      const reservedUntil = reservationDeadline(now);
      const [exclusivity] = await tx
        .insert(pgTemplateExclusivity)
        .values({
          orgId: user.organizationId,
          ownerUserId: user.id,
          paidAmountBrl: setting.annualPriceBrl,
          reservedUntil,
          status: "reserved",
          templateId,
        })
        .returning();
      if (!exclusivity) throw new Error("Falha ao reservar o template.");

      const [invoice] = await tx
        .insert(pgInvoice)
        .values({
          amount: setting.annualPriceBrl,
          currency: "BRL",
          description: `Exclusividade do template ${templateName(templateId)} — 12 meses`,
          dueDate: reservedUntil,
          metadata: exclusivityMetadata({
            exclusivityId: exclusivity.id,
            kind: "purchase",
            templateId,
          }),
          orgId: user.organizationId,
          reference: `EXCL-${exclusivity.id}`,
          status: "pending",
          type: "subscription",
          userId: user.id,
        })
        .returning({ id: pgInvoice.id });
      if (!invoice) throw new Error("Falha ao criar a fatura.");

      await tx
        .update(pgTemplateExclusivity)
        .set({ initialInvoiceId: invoice.id, lastInvoiceId: invoice.id })
        .where(eq(pgTemplateExclusivity.id, exclusivity.id));
      return invoice.id;
    });
    return { invoiceId, ok: true };
  } catch (error) {
    if (error instanceof PurchaseError) return { error: error.message, ok: false };
    if (isUniqueViolation(error)) {
      return {
        error: "Outra pessoa acabou de reservar este template.",
        ok: false,
      };
    }
    console.error(`${LOG_PREFIX} Falha ao iniciar a compra:`, error);
    return { error: "Não foi possível iniciar a compra. Tente de novo.", ok: false };
  }
}

class PurchaseError extends Error {}

/**
 * Guarda o cartão usado no pagamento dentro da fatura, para a exclusividade
 * (criada ou renovada na entrega) cobrar a próxima anuidade nele.
 */
export async function rememberExclusivityCard(
  invoice: Pick<Invoice, "id" | "metadata">,
  cardToken: string | undefined
): Promise<void> {
  if (!(cardToken && exclusivityData(invoice))) return;
  // Relê a fatura: o checkout acabou de gravar outros campos nos metadados.
  const fresh = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoice.id),
  });
  const data = fresh && exclusivityData(fresh);
  if (!(fresh && data)) return;
  const meta = fresh.metadata as unknown as TemplateExclusivityInvoiceOptions;
  await db
    .update(pgInvoice)
    .set({
      metadata: {
        ...meta,
        templateExclusivity: { ...data, cardToken },
      } as unknown as Invoice["metadata"],
    })
    .where(eq(pgInvoice.id, invoice.id));
}

/**
 * Entrega de uma fatura de exclusividade paga. Idempotente: webhook, polling e
 * `after()` podem chamar quantas vezes for.
 */
export async function fulfillExclusivityInvoice(
  invoiceId: string
): Promise<{ ok: boolean; reason?: string }> {
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });
  if (!invoice) return { ok: false, reason: "fatura não encontrada" };
  const data = exclusivityData(invoice);
  if (!data) return { ok: true, reason: "não é de exclusividade" };
  if (invoice.status !== "paid") {
    return { ok: false, reason: `fatura em ${invoice.status}` };
  }

  try {
    if (data.kind === "resale") return await transferExclusivity(invoice);
    if (data.kind === "renewal") return await applyRenewal(invoice);
    return await activatePurchase(invoice);
  } catch (error) {
    console.error(`${LOG_PREFIX} Falha na entrega da fatura ${invoice.id}:`, error);
    return { ok: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

async function activatePurchase(invoice: Invoice) {
  const data = exclusivityData(invoice);
  if (!data) return { ok: true };
  const now = new Date();

  const outcome = await db.transaction(async tx => {
    const [row] = await tx
      .select()
      .from(pgTemplateExclusivity)
      .where(eq(pgTemplateExclusivity.id, data.exclusivityId))
      .for("update");
    if (!row) return "missing" as const;
    if (row.status === "active" || row.status === "past_due") {
      return "already" as const;
    }
    if (row.status !== "reserved" && row.status !== "released") {
      return "conflict" as const;
    }
    if (row.status === "released") {
      // Pagou depois da reserva vencer: só ativa se ninguém pegou o template.
      const [other] = await tx
        .select({ id: pgTemplateExclusivity.id })
        .from(pgTemplateExclusivity)
        .where(
          and(
            eq(pgTemplateExclusivity.templateId, row.templateId),
            inArray(pgTemplateExclusivity.status, [...LIVE_EXCLUSIVITY_STATUSES])
          )
        )
        .limit(1);
      if (other) return "conflict" as const;
    }
    await tx
      .update(pgTemplateExclusivity)
      .set({
        config: { ...row.config, cardToken: data.cardToken ?? row.config?.cardToken },
        expiresAt: cycleEnd(now),
        graceUntil: null,
        lastInvoiceId: invoice.id,
        reservedUntil: null,
        startedAt: now,
        status: "active",
        updatedAt: now,
      })
      .where(eq(pgTemplateExclusivity.id, row.id));
    return "activated" as const;
  });

  if (outcome === "already") return { ok: true, reason: "já ativa" };
  if (outcome === "missing" || outcome === "conflict") {
    await reportPaidWithoutDelivery(
      invoice,
      "O pagamento chegou, mas o template já tem outro dono. É preciso estornar."
    );
    return { ok: false, reason: "pago sem entrega" };
  }

  const expiresAt = cycleEnd(now);
  await notifyUser(invoice.userId, {
    body: `Pronto! O template "${templateName(data.templateId)}" agora é só seu até ${format(expiresAt, "dd/MM/yyyy")}. Ninguém mais pode criar sites com ele.`,
    email: { actionText: "Ver minhas exclusividades", severity: "success" },
    href: "/criador-de-sites/exclusividades",
    kind: "template_exclusivity_active",
    title: "Exclusividade ativada",
  }).catch(() => {});
  await scheduleEvictions(data.templateId, invoice.userId, now);
  return { ok: true };
}

async function applyRenewal(invoice: Invoice) {
  const data = exclusivityData(invoice);
  if (!(data?.renewalCycle)) return { ok: false, reason: "renovação sem ciclo" };
  const cycle = data.renewalCycle;

  const outcome = await db.transaction(async tx => {
    const [row] = await tx
      .select()
      .from(pgTemplateExclusivity)
      .where(eq(pgTemplateExclusivity.id, data.exclusivityId))
      .for("update");
    if (!row) return { kind: "missing" as const };
    if (row.config?.lastRenewalCycle === cycle) return { kind: "already" as const };
    if (row.status !== "active" && row.status !== "past_due") {
      return { kind: "conflict" as const };
    }
    const base = row.expiresAt ?? new Date(cycle);
    const expiresAt = cycleEnd(base);
    await tx
      .update(pgTemplateExclusivity)
      .set({
        config: {
          ...row.config,
          cardToken: data.cardToken ?? row.config?.cardToken,
          lastFailure: undefined,
          lastRenewalCycle: cycle,
        },
        expiresAt,
        graceUntil: null,
        lastInvoiceId: invoice.id,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(pgTemplateExclusivity.id, row.id));
    return { expiresAt, kind: "renewed" as const, templateId: row.templateId };
  });

  if (outcome.kind === "already") return { ok: true, reason: "ciclo já aplicado" };
  if (outcome.kind !== "renewed") {
    await reportPaidWithoutDelivery(
      invoice,
      "A renovação foi paga depois de a exclusividade expirar. É preciso estornar ou reativar manualmente."
    );
    return { ok: false, reason: "renovação paga sem exclusividade" };
  }

  await notifyUser(invoice.userId, {
    body: `A exclusividade do template "${templateName(outcome.templateId)}" foi renovada até ${format(outcome.expiresAt, "dd/MM/yyyy")} (${formatBrl(invoice.amount)}).`,
    email: { severity: "success" },
    href: "/criador-de-sites/exclusividades",
    kind: "template_exclusivity_renewed",
    title: "Exclusividade renovada",
  }).catch(() => {});
  return { ok: true };
}
