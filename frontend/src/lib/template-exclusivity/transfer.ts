import { format } from "date-fns";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type Invoice,
  pgTemplateExclusivity,
  pgTemplateProposal,
  pgTemplateProposalEvent,
  pgWalletEntry,
} from "@/lib/db/schema";
import { notifyUser } from "@/lib/notifications/inbox";
import { scheduleEvictions } from "./evictions";
import { reportPaidWithoutDelivery } from "./report";
import { cycleEnd, formatBrl } from "./rules";
import { templateName } from "./names";
import {
  exclusivityData,
  expirePendingInvoices,
  LOG_PREFIX,
} from "./shared";

/** Referência idempotente do crédito do vendedor numa revenda. */
export function saleReference(proposalId: string): string {
  return `template_sale:${proposalId}`;
}

/**
 * Revenda paga: passa a exclusividade para o comprador (ciclo novo de 12 meses),
 * credita o valor fechado na carteira do vendedor e encerra as outras propostas.
 *
 * Tudo numa transação com a proposta e a exclusividade travadas, então repetir
 * a chamada não credita duas vezes nem cria dois donos.
 */
export async function transferExclusivity(
  invoice: Invoice
): Promise<{ ok: boolean; reason?: string }> {
  const data = exclusivityData(invoice);
  if (!data?.proposalId) return { ok: false, reason: "revenda sem proposta" };
  const proposalId = data.proposalId;
  const now = new Date();

  const outcome = await db.transaction(async tx => {
    const [proposal] = await tx
      .select()
      .from(pgTemplateProposal)
      .where(eq(pgTemplateProposal.id, proposalId))
      .for("update");
    if (!proposal) return { kind: "missing" as const };
    if (proposal.status === "paid") return { kind: "already" as const };

    const [old] = await tx
      .select()
      .from(pgTemplateExclusivity)
      .where(eq(pgTemplateExclusivity.id, proposal.exclusivityId))
      .for("update");
    // O pagamento só vale enquanto o vendedor ainda é o dono. Se a negociação
    // foi cancelada por prazo mas o dono é o mesmo, a venda ainda fecha.
    const sellerStillOwns =
      old &&
      old.ownerUserId === proposal.sellerUserId &&
      (old.status === "active" || old.status === "past_due");
    if (!sellerStillOwns) return { kind: "conflict" as const };

    await tx
      .update(pgTemplateExclusivity)
      .set({ status: "transferred", updatedAt: now })
      .where(eq(pgTemplateExclusivity.id, old.id));

    const expiresAt = cycleEnd(now);
    await tx.insert(pgTemplateExclusivity).values({
      acquiredVia: "resale",
      config: data.cardToken ? { cardToken: data.cardToken } : {},
      expiresAt,
      initialInvoiceId: invoice.id,
      lastInvoiceId: invoice.id,
      orgId: invoice.orgId,
      ownerUserId: proposal.buyerUserId,
      paidAmountBrl: proposal.amountBrl,
      startedAt: now,
      status: "active",
      templateId: old.templateId,
    });

    await tx
      .insert(pgWalletEntry)
      .values({
        amountBrl: proposal.amountBrl,
        description: `Venda da exclusividade do template ${templateName(old.templateId)}`,
        kind: "template_sale",
        referenceId: saleReference(proposal.id),
        userId: proposal.sellerUserId,
      })
      .onConflictDoNothing();

    await tx
      .update(pgTemplateProposal)
      .set({ status: "paid", updatedAt: now })
      .where(eq(pgTemplateProposal.id, proposal.id));
    await tx.insert(pgTemplateProposalEvent).values({
      action: "paid",
      actor: "system",
      amountBrl: proposal.amountBrl,
      proposalId: proposal.id,
    });

    const others = await tx
      .update(pgTemplateProposal)
      .set({ status: "cancelled", updatedAt: now })
      .where(
        and(
          eq(pgTemplateProposal.exclusivityId, old.id),
          ne(pgTemplateProposal.id, proposal.id),
          inArray(pgTemplateProposal.status, ["open", "awaiting_payment"])
        )
      )
      .returning();
    if (others.length > 0) {
      await tx.insert(pgTemplateProposalEvent).values(
        others.map(item => ({
          action: "cancel" as const,
          actor: "system" as const,
          note: "O template foi vendido para outra pessoa.",
          proposalId: item.id,
        }))
      );
      await expirePendingInvoices(
        tx,
        others.map(item => item.invoiceId)
      );
    }

    return {
      expiresAt,
      kind: "transferred" as const,
      others,
      proposal,
      templateId: old.templateId,
    };
  });

  if (outcome.kind === "already") return { ok: true, reason: "já transferida" };
  if (outcome.kind !== "transferred") {
    await reportPaidWithoutDelivery(
      invoice,
      "A revenda foi paga, mas o vendedor não tem mais a exclusividade. É preciso estornar."
    );
    return { ok: false, reason: "revenda paga sem exclusividade" };
  }

  const { expiresAt, others, proposal, templateId } = outcome;
  const name = templateName(templateId);
  console.log(
    `${LOG_PREFIX} ✓ Template ${templateId} transferido (proposta ${proposal.id}, ${formatBrl(proposal.amountBrl)})`
  );

  await notifyUser(proposal.sellerUserId, {
    body: `Você vendeu a exclusividade do template "${name}" por ${formatBrl(proposal.amountBrl)}. O valor já está na sua carteira do Atlas. Seus sites com esse template saem do ar em 7 dias.`,
    email: { actionText: "Ver minha carteira", severity: "success" },
    href: "/carteira",
    kind: "template_sale_done",
    title: "Venda concluída",
  }).catch(() => {});
  await notifyUser(proposal.buyerUserId, {
    body: `A exclusividade do template "${name}" agora é sua até ${format(expiresAt, "dd/MM/yyyy")}. Crie seu site a partir dele.`,
    email: { actionText: "Criar meu site", severity: "success" },
    href: `/criador-de-sites/preview/${templateId}`,
    kind: "template_purchase_done",
    title: "Compra concluída",
  }).catch(() => {});
  for (const other of others) {
    await notifyUser(other.buyerUserId, {
      body: `O template "${name}" foi vendido para outra pessoa e sua negociação foi encerrada. Você pode fazer uma nova proposta ao novo dono.`,
      email: { severity: "info" },
      href: `/criador-de-sites/exclusividades/propostas/${other.id}`,
      kind: "template_proposal_cancelled",
      title: "Negociação encerrada",
    }).catch(() => {});
  }

  await scheduleEvictions(templateId, proposal.buyerUserId);
  return { ok: true };
}
