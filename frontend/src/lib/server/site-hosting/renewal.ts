import { addDays, addMonths } from "date-fns";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type BuilderHostingSubscription,
  type Invoice,
  pgBuilderHostingSubscription,
  pgBuilderPublication,
  pgBuilderSite,
  pgInvoice,
  pgLog,
  pgOrganization,
} from "@/lib/db/schema";
import simpayApi, { isApprovedPaymentStatus } from "@/lib/server/apis/simpay";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import { suspendSite } from "@/lib/site-builder/deploySite";
import { runPublish, savePublication } from "@/lib/site-builder/runPublish";
import { resolveTarget, sanitize } from "@/lib/site-builder/target";

const LOG_PREFIX = "[SITE-HOSTING]";

/** Marca a fatura de renovação da hospedagem de um site. */
export interface SiteHostingRenewalMetadata {
  isRenewal: true;
  renewalCycle: string;
  /** Lido por `fulfillSitePublishInvoice` para saber que é renovação de hospedagem. */
  siteHostingSubscriptionId: string;
  simpayPaymentId?: string;
}

/**
 * Fatura do ciclo atual, criada no máximo uma vez por `(assinatura, ciclo)`.
 * Mesmo padrão do `ensureRenewalInvoice` das VPS: lock consultivo na transação
 * e busca por `metadata`, então duas réplicas não emitem faturas duplicadas.
 */
export async function ensureSiteHostingInvoice(
  sub: BuilderHostingSubscription
): Promise<Invoice> {
  return db.transaction(async tx => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`site-hosting-invoice:${sub.id}`}))`
    );
    const cycle = sub.nextChargeDate.toISOString();
    const [existing] = await tx
      .select()
      .from(pgInvoice)
      .where(
        and(
          eq(pgInvoice.userId, sub.userId),
          sql`${pgInvoice.status} in ('pending', 'processing', 'paid')`,
          sql`${pgInvoice.metadata}->>'siteHostingSubscriptionId' = ${sub.id}`,
          sql`${pgInvoice.metadata}->>'renewalCycle' = ${cycle}`
        )
      );
    if (existing) return existing;

    const [site] = await tx
      .select({ name: pgBuilderSite.name })
      .from(pgBuilderSite)
      .where(eq(pgBuilderSite.id, sub.siteId))
      .limit(1);

    const [invoice] = await tx
      .insert(pgInvoice)
      .values({
        amount: sub.amountBrl,
        currency: "BRL",
        description: `Hospedagem do site ${site?.name ?? ""} — 1 mês`.trim(),
        dueDate: addDays(sub.nextChargeDate, 1),
        metadata: {
          isRenewal: true,
          renewalCycle: cycle,
          siteHostingSubscriptionId: sub.id,
        } as unknown as Invoice["metadata"],
        orgId: sub.orgId,
        reference: `SITE-REN-${sub.id}-${cycle}`,
        status: "pending",
        type: "subscription",
        userId: sub.userId,
      })
      .returning();
    return invoice;
  });
}

/**
 * Cobra (ou confere) o ciclo de uma assinatura de hospedagem.
 *
 * - pago: avança o próximo vencimento e, se o site estava suspenso, republica;
 * - recusado: conta a falha, marca `past_due` e abre a carência;
 * - carência vencida: suspende o site (arquivos e DNS ficam intactos).
 */
export async function chargeSiteHostingCycle(
  sub: BuilderHostingSubscription,
  now = new Date()
): Promise<"charged" | "past_due" | "suspended" | "skipped"> {
  if (sub.status === "cancelled") return "skipped";

  const invoice = await ensureSiteHostingInvoice(sub);
  if (!invoice) return "skipped";

  if (invoice.status === "paid") {
    await applySiteHostingRenewal(invoice);
    return "charged";
  }

  const cardToken = sub.config?.cardToken;
  if (cardToken) {
    try {
      const organization = await db.query.pgOrganization.findFirst({
        where: eq(pgOrganization.id, sub.orgId),
        with: { wallet: { with: { cards: true } } },
        // biome-ignore lint/suspicious/noExplicitAny: relações aninhadas do drizzle
      } as any);
      // biome-ignore lint/suspicious/noExplicitAny: relações aninhadas do drizzle
      const card = (organization as any)?.wallet?.cards?.find(
        // biome-ignore lint/suspicious/noExplicitAny: relações aninhadas do drizzle
        (item: any) => item.cardToken === cardToken
      );
      const user = await db.query.pgUser.findFirst({
        where: (table, { eq: equals }) => equals(table.id, sub.userId),
      });
      const document = user?.billingDocument?.replace(/\D/g, "") || "";

      const payment = await simpayApi.createCardPayment({
        bin: card?.last4 || cardToken.substring(0, 6),
        brand: card?.brand || "unknown",
        description: "HOSTING Renovação hospedagem de site",
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
        await applySiteHostingRenewal({ ...invoice, status: "paid" });
        return "charged";
      }
      return markPastDue(
        sub,
        now,
        `pagamento não aprovado (${payment.status})`
      );
    } catch (error) {
      return markPastDue(sub, now, sanitize(error));
    }
  }

  return markPastDue(sub, now, "sem cartão salvo para a cobrança automática");
}

/** Abre (ou mantém) a carência; passado o prazo, suspende o site. */
async function markPastDue(
  sub: BuilderHostingSubscription,
  now: Date,
  reason: string
): Promise<"past_due" | "suspended"> {
  const { hostingGraceDays } = getAtlasHostingConfig();
  const graceUntil = sub.graceUntil ?? addDays(now, hostingGraceDays);

  if (graceUntil.getTime() <= now.getTime()) {
    await suspendSiteHosting(sub, reason);
    return "suspended";
  }

  await db
    .update(pgBuilderHostingSubscription)
    .set({
      config: { ...sub.config, lastFailure: reason },
      failureCount: sub.failureCount + 1,
      graceUntil,
      status: "past_due",
      updatedAt: now,
    })
    .where(eq(pgBuilderHostingSubscription.id, sub.id));
  console.warn(
    `${LOG_PREFIX} Assinatura ${sub.id} em atraso até ${graceUntil.toISOString()}: ${reason}`
  );
  return "past_due";
}

/**
 * Suspende o site: o Caddy passa a servir a página de suspensão no mesmo
 * endereço. Os arquivos publicados e o DNS continuam, então pagar e republicar
 * devolve o site ao ar.
 */
export async function suspendSiteHosting(
  sub: BuilderHostingSubscription,
  reason: string
): Promise<{ ok: boolean; reason?: string }> {
  const publication = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.siteId, sub.siteId),
  });

  try {
    if (publication && publication.status === "published") {
      const target = await resolveTarget(
        sub.userId,
        {
          target: publication.target,
          vpsNodeId: publication.vpsNodeId ?? undefined,
        },
        // Suspender é sair do ar: vale mesmo sem assinatura de VPS vigente.
        { allowIneligible: true }
      );
      if ("error" in target) throw new Error(target.error);

      await suspendSite({
        domain: publication.domain,
        includeWww: publication.kind === "domain",
        target: target.deploy,
      });

      await savePublication(sub.siteId, {
        domain: publication.domain,
        ip: publication.serverIp,
        kind: publication.kind,
        lastError: null,
        status: "suspended",
        target: publication.target,
        vpsNodeId: publication.vpsNodeId,
      });
    }

    await db
      .update(pgBuilderHostingSubscription)
      .set({
        config: { ...sub.config, lastFailure: reason },
        status: "suspended",
        suspendedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pgBuilderHostingSubscription.id, sub.id));

    await db.insert(pgLog).values({
      description: `Site ${sub.siteId} suspenso: ${reason}`,
      severity: "warning",
      title: "Hospedagem de site suspensa por falta de pagamento",
      type: "hosting",
      userId: sub.userId,
    });
    return { ok: true };
  } catch (error) {
    const message = sanitize(error);
    console.error(
      `${LOG_PREFIX} Falha ao suspender o site ${sub.siteId}: ${message}`
    );
    return { ok: false, reason: message };
  }
}

/**
 * Renovação paga: avança o ciclo, reativa a assinatura e, se o site estava
 * suspenso, republica para tirar a página de suspensão.
 */
export async function applySiteHostingRenewal(
  invoice: Invoice
): Promise<{ ok: boolean; reason?: string }> {
  const meta = invoice.metadata as unknown as SiteHostingRenewalMetadata;
  const subscriptionId = meta?.siteHostingSubscriptionId;
  if (!subscriptionId) return { ok: true, reason: "não é renovação de site" };

  const sub = await db.query.pgBuilderHostingSubscription.findFirst({
    where: eq(pgBuilderHostingSubscription.id, subscriptionId),
  });
  if (!sub) return { ok: false, reason: "assinatura não encontrada" };

  const cycle = meta.renewalCycle;
  // Ciclo já aplicado: nada a fazer (a chamada pode repetir).
  if (sub.config?.lastRenewalCycle === cycle && sub.status === "active") {
    return { ok: true, reason: "ciclo já aplicado" };
  }

  const wasSuspended = sub.status === "suspended";
  const base =
    sub.nextChargeDate.getTime() > Date.now() ? sub.nextChargeDate : new Date();

  await db
    .update(pgBuilderHostingSubscription)
    .set({
      config: {
        ...sub.config,
        lastFailure: undefined,
        lastRenewalCycle: cycle,
      },
      failureCount: 0,
      graceUntil: null,
      lastInvoiceId: invoice.id,
      nextChargeDate: addMonths(base, 1),
      status: "active",
      suspendedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(pgBuilderHostingSubscription.id, sub.id));

  if (!wasSuspended) return { ok: true };

  // Estava suspenso: republica para o endereço voltar a servir o site.
  const publication = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.siteId, sub.siteId),
  });
  if (!publication)
    return { ok: true, reason: "sem publicação para restaurar" };

  const { baseDomain } = getAtlasHostingConfig();
  const label =
    publication.kind === "subdomain" && baseDomain
      ? publication.domain.replace(`.${baseDomain}`, "")
      : undefined;

  const result = await runPublish(
    { id: sub.userId, organizationId: sub.orgId },
    {
      domain: publication.domain,
      kind: publication.kind,
      label,
      siteId: sub.siteId,
      target: publication.target,
      vpsNodeId: publication.vpsNodeId ?? undefined,
    },
    { skipHostingCheck: true }
  );
  if (!result.ok) {
    console.error(
      `${LOG_PREFIX} Pagou mas não voltou ao ar (site ${sub.siteId}): ${result.error}`
    );
    return { ok: false, reason: result.error };
  }
  return { ok: true };
}
