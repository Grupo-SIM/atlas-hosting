import { addMonths } from "date-fns";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type BuilderPublishJobPayload,
  type Invoice,
  pgBuilderHostingSubscription,
  pgBuilderPublishJob,
  pgInvoice,
  pgLog,
  type SitePublishInvoiceOptions,
} from "@/lib/db/schema";
import {
  applySiteHostingRenewal,
  type SiteHostingRenewalMetadata,
} from "@/lib/server/site-hosting/renewal";
import { runPublish } from "./runPublish";
import { sanitize } from "./target";

const LOG_PREFIX = "[PUBLICAR]";

/** `true` quando a fatura é de publicação de site do Criador de Sites. */
export function isSitePublishInvoice(
  invoice: Pick<Invoice, "metadata">
): boolean {
  const meta = invoice.metadata as Partial<SitePublishInvoiceOptions>;
  return Boolean(meta?.siteHosting?.siteId);
}

/**
 * Entrega a publicação depois do pagamento confirmado: ativa a assinatura da
 * hospedagem (quando o pedido tinha a taxa da VM do Atlas) e publica o site.
 *
 * Idempotente por fatura: a reserva em `builder_publish_jobs` só sai de
 * `pending` uma vez, então webhook, polling do PIX e `after()` concorrentes
 * publicam o site uma única vez. Chamar para uma fatura que não é de publicação
 * não faz nada.
 *
 * O registro do domínio comprado **não** acontece aqui: faturas com domínio
 * passam primeiro pelo `fulfillDomainInvoice`, que registra na Namecheap e cria
 * a zona no Cloudflare antes de marcar a fatura como paga.
 */
export async function fulfillSitePublishInvoice(
  invoiceId: string
): Promise<{ ok: boolean; reason?: string }> {
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, invoiceId),
  });
  if (!invoice) return { ok: false, reason: "fatura não encontrada" };

  // Renovação mensal da hospedagem: avança o ciclo e, se estava suspenso, volta ao ar.
  const meta = invoice.metadata as unknown as SiteHostingRenewalMetadata;
  if (meta?.siteHostingSubscriptionId) {
    if (invoice.status !== "paid") {
      return { ok: false, reason: `fatura em ${invoice.status}` };
    }
    return applySiteHostingRenewal(invoice);
  }

  if (!isSitePublishInvoice(invoice))
    return { ok: true, reason: "não é de site" };
  if (invoice.status !== "paid" && invoice.status !== "processing") {
    return { ok: false, reason: `fatura em ${invoice.status}` };
  }

  // Reserva: só um processo segue daqui para frente.
  const [job] = await db
    .update(pgBuilderPublishJob)
    .set({ error: null, status: "running", updatedAt: new Date() })
    .where(
      and(
        eq(pgBuilderPublishJob.invoiceId, invoice.id),
        eq(pgBuilderPublishJob.status, "pending")
      )
    )
    .returning();
  if (!job) return { ok: true, reason: "já entregue ou em andamento" };

  const payload = job.payload as BuilderPublishJobPayload;

  try {
    // 1) Hospedagem paga na VM do Atlas: assinatura mensal deste site.
    if (payload.target === "atlas_vm" && payload.hostingAmountBrl) {
      const now = new Date();
      await db
        .insert(pgBuilderHostingSubscription)
        .values({
          amountBrl: payload.hostingAmountBrl,
          cancelledAt: null,
          config: {},
          graceUntil: null,
          initialInvoiceId: invoice.id,
          lastInvoiceId: invoice.id,
          nextChargeDate: addMonths(now, 1),
          orgId: invoice.orgId,
          siteId: job.siteId,
          status: "active",
          suspendedAt: null,
          updatedAt: now,
          userId: invoice.userId,
        })
        .onConflictDoUpdate({
          set: {
            amountBrl: payload.hostingAmountBrl,
            cancelledAt: null,
            failureCount: 0,
            graceUntil: null,
            lastInvoiceId: invoice.id,
            nextChargeDate: addMonths(now, 1),
            status: "active",
            suspendedAt: null,
            updatedAt: now,
          },
          target: pgBuilderHostingSubscription.siteId,
        });
    }

    // 2) Publica. A assinatura acabou de ser criada, então a trava de
    //    hospedagem paga não precisa ser consultada de novo.
    const result = await runPublish(
      { id: invoice.userId, organizationId: invoice.orgId },
      {
        domain: payload.domain,
        kind: payload.kind,
        label: payload.label,
        // A senha SSH do cliente nunca é gravada: numa VPS contratada no Atlas
        // o deploy usa a chave do Atlas (`SITE_BUILDER_SSH_KEY_PATH`).
        siteId: job.siteId,
        target: payload.target,
        vpsNodeId: payload.vpsNodeId,
      },
      { skipHostingCheck: true }
    );

    if (!result.ok) throw new Error(result.error);

    await db
      .update(pgBuilderPublishJob)
      .set({ error: null, status: "done", updatedAt: new Date() })
      .where(eq(pgBuilderPublishJob.id, job.id));

    console.log(
      `${LOG_PREFIX} ✓ Site ${job.siteId} publicado em ${result.domain} (fatura ${invoice.id})`
    );
    return { ok: true };
  } catch (error) {
    const message = sanitize(error);
    console.error(
      `${LOG_PREFIX} ✗ Falha ao publicar o site ${job.siteId} da fatura ${invoice.id}: ${message}`
    );
    await db
      .update(pgBuilderPublishJob)
      .set({ error: message, status: "failed", updatedAt: new Date() })
      .where(eq(pgBuilderPublishJob.id, job.id));
    await db
      .insert(pgLog)
      .values({
        description: `Fatura ${invoice.id}, site ${job.siteId}: ${message}`,
        severity: "danger",
        title: "Falha ao publicar o site após o pagamento",
        type: "hosting",
        userId: invoice.userId,
      })
      .catch(() => {});
    return { ok: false, reason: message };
  }
}

/**
 * Nova tentativa de uma entrega que falhou (o cliente já pagou). Devolve o job
 * para `pending` e entrega de novo.
 */
export async function retrySitePublishInvoice(invoiceId: string) {
  await db
    .update(pgBuilderPublishJob)
    .set({ status: "pending", updatedAt: new Date() })
    .where(
      and(
        eq(pgBuilderPublishJob.invoiceId, invoiceId),
        eq(pgBuilderPublishJob.status, "failed")
      )
    );
  return fulfillSitePublishInvoice(invoiceId);
}
