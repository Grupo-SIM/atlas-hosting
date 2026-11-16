import { format } from "date-fns";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pgInvoice,
  pgTemplateExclusivity,
  pgTemplateProposal,
  pgTemplateProposalEvent,
  type TemplateProposal,
} from "@/lib/db/schema";
import { notifyUser } from "@/lib/notifications/inbox";
import {
  buyerTotal,
  formatBrl,
  minimumOffer,
  otherRole,
  type ProposalRoleName,
  paymentDeadline,
  proposalActionError,
  proposalExpiry,
  round2,
  validateAskingPrice,
  validateOfferAmount,
} from "./rules";
import { getResaleConfig } from "./status";
import { transferExclusivity } from "./transfer";
import { templateName } from "./names";
import {
  exclusivityMetadata,
  expirePendingInvoices,
  isUniqueViolation,
  LOG_PREFIX,
} from "./shared";

type Result<T = object> = ({ ok: true } & T) | { error: string; ok: false };

/** Erro de regra lançado dentro da transação e devolvido como mensagem. */
class RuleError extends Error {}

export interface Actor {
  id: string;
  organizationId: string | null | undefined;
}

export function proposalHref(proposalId: string): string {
  return `/criador-de-sites/exclusividades/propostas/${proposalId}`;
}

function roleOf(proposal: TemplateProposal, userId: string): ProposalRoleName | null {
  if (proposal.buyerUserId === userId) return "buyer";
  if (proposal.sellerUserId === userId) return "seller";
  return null;
}

async function run<T>(
  fn: () => Promise<T>,
  fallback: string
): Promise<Result<{ value: T }>> {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    if (error instanceof RuleError) return { error: error.message, ok: false };
    if (isUniqueViolation(error)) {
      return {
        error: "Você já tem uma negociação aberta para este template.",
        ok: false,
      };
    }
    console.error(`${LOG_PREFIX} ${fallback}:`, error);
    return { error: `${fallback}. Tente de novo.`, ok: false };
  }
}

/** O dono define o valor mínimo de venda (nunca abaixo do piso do admin). */
export async function setMinAskingPrice(
  actor: Actor,
  exclusivityId: string,
  amount: number
): Promise<Result> {
  const { minPriceBrl } = await getResaleConfig();
  const invalid = validateAskingPrice(amount, minPriceBrl);
  if (invalid) return { error: invalid, ok: false };

  const updated = await db
    .update(pgTemplateExclusivity)
    .set({ minAskingPriceBrl: round2(amount), updatedAt: new Date() })
    .where(
      and(
        eq(pgTemplateExclusivity.id, exclusivityId),
        eq(pgTemplateExclusivity.ownerUserId, actor.id),
        inArray(pgTemplateExclusivity.status, ["active", "past_due"])
      )
    )
    .returning({ id: pgTemplateExclusivity.id });
  if (updated.length === 0) {
    return { error: "Exclusividade não encontrada.", ok: false };
  }
  return { ok: true };
}

/** Primeira proposta de um comprador para o dono atual do template. */
export async function makeOffer(
  actor: Actor,
  templateId: string,
  amount: number
): Promise<Result<{ proposalId: string }>> {
  if (!actor.organizationId) {
    return { error: "Sua conta não tem organização.", ok: false };
  }
  const { minPriceBrl } = await getResaleConfig();

  const result = await run(async () => {
    return db.transaction(async tx => {
      const [exclusivity] = await tx
        .select()
        .from(pgTemplateExclusivity)
        .where(
          and(
            eq(pgTemplateExclusivity.templateId, templateId),
            inArray(pgTemplateExclusivity.status, ["active", "past_due"])
          )
        )
        .for("update");
      if (!exclusivity) {
        throw new RuleError("Este template não tem dono no momento.");
      }
      if (exclusivity.ownerUserId === actor.id) {
        throw new RuleError("Você já é o dono deste template.");
      }
      const minimum = minimumOffer(exclusivity.minAskingPriceBrl, minPriceBrl);
      const invalid = validateOfferAmount(amount, minimum);
      if (invalid) throw new RuleError(invalid);

      const [proposal] = await tx
        .insert(pgTemplateProposal)
        .values({
          amountBrl: round2(amount),
          buyerUserId: actor.id,
          exclusivityId: exclusivity.id,
          expiresAt: proposalExpiry(),
          sellerUserId: exclusivity.ownerUserId,
          status: "open",
          templateId,
          turn: "seller",
        })
        .returning();
      if (!proposal) throw new Error("Falha ao criar a proposta.");
      await tx.insert(pgTemplateProposalEvent).values({
        action: "offer",
        actor: "buyer",
        amountBrl: proposal.amountBrl,
        proposalId: proposal.id,
      });
      return proposal;
    });
  }, "Não foi possível enviar a proposta");
  if (!result.ok) return result;

  const proposal = result.value;
  await notifyUser(proposal.sellerUserId, {
    body: `Alguém quer comprar a exclusividade do template "${templateName(templateId)}" por ${formatBrl(proposal.amountBrl)}. Você pode aceitar, recusar ou mandar uma contraproposta até ${format(proposal.expiresAt, "dd/MM/yyyy")}.`,
    email: { actionText: "Ver proposta", severity: "info" },
    href: proposalHref(proposal.id),
    kind: "template_proposal_received",
    title: "Nova proposta pelo seu template",
  }).catch(() => {});
  return { ok: true, proposalId: proposal.id };
}

export type ProposalResponse =
  | { action: "accept" }
  | { action: "decline" }
  | { action: "cancel" }
  | { action: "counter"; amount: number };

/**
 * Resposta de uma das partes. Toda a validação (vez, status, prazo, mínimo)
 * acontece com a proposta travada, então dois cliques ao mesmo tempo não
 * aceitam duas vezes.
 */
export async function respondToProposal(
  actor: Actor,
  proposalId: string,
  response: ProposalResponse
): Promise<Result<{ checkoutUrl?: string }>> {
  const { feePercent, minPriceBrl } = await getResaleConfig();
  const now = new Date();

  const result = await run(async () => {
    return db.transaction(async tx => {
      const [proposal] = await tx
        .select()
        .from(pgTemplateProposal)
        .where(eq(pgTemplateProposal.id, proposalId))
        .for("update");
      if (!proposal) throw new RuleError("Negociação não encontrada.");
      const role = roleOf(proposal, actor.id);
      if (!role) throw new RuleError("Negociação não encontrada.");

      const denied = proposalActionError(proposal, role, response.action, now);
      if (denied) throw new RuleError(denied);

      if (response.action === "cancel") {
        if (proposal.status === "awaiting_payment" && proposal.invoiceId) {
          const invoice = await tx.query.pgInvoice.findFirst({
            where: eq(pgInvoice.id, proposal.invoiceId),
          });
          if (invoice && (invoice.status === "processing" || invoice.status === "paid")) {
            throw new RuleError(
              "O pagamento já está em andamento e não dá para cancelar agora."
            );
          }
          await expirePendingInvoices(tx, [proposal.invoiceId]);
        }
        await closeProposal(tx, proposal, "cancelled", "cancel", role, now);
        return { proposal, role };
      }

      if (response.action === "decline") {
        await closeProposal(tx, proposal, "declined", "decline", role, now);
        return { proposal, role };
      }

      const [exclusivity] = await tx
        .select()
        .from(pgTemplateExclusivity)
        .where(eq(pgTemplateExclusivity.id, proposal.exclusivityId))
        .for("update");
      const live =
        exclusivity &&
        exclusivity.ownerUserId === proposal.sellerUserId &&
        (exclusivity.status === "active" || exclusivity.status === "past_due");
      if (!live) {
        throw new RuleError("Este template não pertence mais ao vendedor.");
      }

      if (response.action === "counter") {
        const minimum = minimumOffer(exclusivity.minAskingPriceBrl, minPriceBrl);
        const invalid = validateOfferAmount(response.amount, minimum);
        if (invalid) throw new RuleError(invalid);
        const amount = round2(response.amount);
        const [updated] = await tx
          .update(pgTemplateProposal)
          .set({
            amountBrl: amount,
            expiresAt: proposalExpiry(now),
            turn: otherRole(role),
            updatedAt: now,
          })
          .where(eq(pgTemplateProposal.id, proposal.id))
          .returning();
        await tx.insert(pgTemplateProposalEvent).values({
          action: "counter",
          actor: role,
          amountBrl: amount,
          proposalId: proposal.id,
        });
        return { proposal: updated ?? proposal, role };
      }

      // Aceite: só uma venda pode estar aguardando pagamento por vez.
      const [pending] = await tx
        .select({ id: pgTemplateProposal.id })
        .from(pgTemplateProposal)
        .where(
          and(
            eq(pgTemplateProposal.exclusivityId, proposal.exclusivityId),
            eq(pgTemplateProposal.status, "awaiting_payment"),
            ne(pgTemplateProposal.id, proposal.id)
          )
        )
        .limit(1);
      if (pending) {
        throw new RuleError(
          "Já existe outra proposta aceita aguardando pagamento para este template. Tente de novo depois do prazo dela."
        );
      }

      const buyer = await tx.query.pgUser.findFirst({
        columns: { organizationId: true },
        where: (table, { eq: equals }) => equals(table.id, proposal.buyerUserId),
      });
      if (!buyer?.organizationId) {
        throw new RuleError("A conta do comprador não tem organização.");
      }

      const deadline = paymentDeadline(now);
      const total = buyerTotal(proposal.amountBrl, feePercent);
      const [invoice] = await tx
        .insert(pgInvoice)
        .values({
          amount: total,
          currency: "BRL",
          description: `Compra da exclusividade do template ${templateName(proposal.templateId)} (${formatBrl(proposal.amountBrl)} + taxa Atlas ${feePercent}%)`,
          dueDate: deadline,
          metadata: exclusivityMetadata({
            exclusivityId: proposal.exclusivityId,
            kind: "resale",
            proposalId: proposal.id,
            templateId: proposal.templateId,
          }),
          orgId: buyer.organizationId,
          originalAmount: total,
          reference: `EXCL-RES-${proposal.id}`,
          status: "pending",
          type: "subscription",
          userId: proposal.buyerUserId,
        })
        .returning({ id: pgInvoice.id });
      if (!invoice) throw new Error("Falha ao criar a fatura.");

      const [updated] = await tx
        .update(pgTemplateProposal)
        .set({
          acceptedAt: now,
          feePercent,
          invoiceId: invoice.id,
          paymentDeadline: deadline,
          status: "awaiting_payment",
          updatedAt: now,
        })
        .where(eq(pgTemplateProposal.id, proposal.id))
        .returning();
      await tx.insert(pgTemplateProposalEvent).values({
        action: "accept",
        actor: role,
        amountBrl: proposal.amountBrl,
        proposalId: proposal.id,
      });
      return { invoiceId: invoice.id, proposal: updated ?? proposal, role, total };
    });
  }, "Não foi possível registrar a resposta");
  if (!result.ok) return result;

  const { proposal, role } = result.value;
  const name = templateName(proposal.templateId);
  const href = proposalHref(proposal.id);
  const counterpart =
    role === "buyer" ? proposal.sellerUserId : proposal.buyerUserId;

  switch (response.action) {
    case "counter":
      await notifyUser(counterpart, {
        body: `${role === "buyer" ? "O comprador" : "O dono"} do template "${name}" mandou uma contraproposta de ${formatBrl(proposal.amountBrl)}. Responda até ${format(proposal.expiresAt, "dd/MM/yyyy")}.`,
        email: { actionText: "Ver contraproposta", severity: "info" },
        href,
        kind: "template_proposal_counter",
        title: "Nova contraproposta",
      }).catch(() => {});
      return { ok: true };
    case "decline":
      await notifyUser(counterpart, {
        body: `A proposta de ${formatBrl(proposal.amountBrl)} pelo template "${name}" foi recusada.`,
        email: { severity: "info" },
        href,
        kind: "template_proposal_declined",
        title: "Proposta recusada",
      }).catch(() => {});
      return { ok: true };
    case "cancel":
      await notifyUser(proposal.sellerUserId, {
        body: `O comprador desistiu da negociação pelo template "${name}".`,
        href,
        kind: "template_proposal_cancelled",
        title: "Negociação cancelada",
      }).catch(() => {});
      return { ok: true };
    default: {
      const { invoiceId, total } = result.value as {
        invoiceId: string;
        total: number;
      };
      const checkoutUrl = `/checkout/${invoiceId}`;
      await notifyUser(proposal.buyerUserId, {
        body: `Negócio fechado: ${formatBrl(proposal.amountBrl)} pelo template "${name}". Pague ${formatBrl(total)} (com a taxa do Atlas) até ${proposal.paymentDeadline ? format(proposal.paymentDeadline, "dd/MM/yyyy 'às' HH:mm") : "o prazo"} para receber a exclusividade.`,
        email: { actionText: "Pagar agora", severity: "success" },
        href: checkoutUrl,
        kind: "template_proposal_accepted",
        title: "Proposta aceita",
      }).catch(() => {});
      await notifyUser(proposal.sellerUserId, {
        body: `Negócio fechado: ${formatBrl(proposal.amountBrl)} pelo template "${name}". Assim que o comprador pagar, o valor cai na sua carteira do Atlas.`,
        email: { actionText: "Ver negociação", severity: "success" },
        href,
        kind: "template_proposal_accepted",
        title: "Proposta aceita",
      }).catch(() => {});
      return { checkoutUrl: role === "buyer" ? checkoutUrl : undefined, ok: true };
    }
  }
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function closeProposal(
  tx: Tx,
  proposal: TemplateProposal,
  status: "cancelled" | "declined" | "expired",
  action: "cancel" | "decline" | "expire",
  actor: ProposalRoleName | "system",
  now: Date
) {
  await tx
    .update(pgTemplateProposal)
    .set({ status, updatedAt: now })
    .where(eq(pgTemplateProposal.id, proposal.id));
  await tx.insert(pgTemplateProposalEvent).values({
    action,
    actor,
    amountBrl: proposal.amountBrl,
    proposalId: proposal.id,
  });
}

/** Encerra as negociações abertas de uma exclusividade (ex.: expirou). */
export async function cancelOpenProposals(
  exclusivityId: string,
  note: string
): Promise<void> {
  const now = new Date();
  const closed = await db.transaction(async tx => {
    const rows = await tx
      .update(pgTemplateProposal)
      .set({ status: "cancelled", updatedAt: now })
      .where(
        and(
          eq(pgTemplateProposal.exclusivityId, exclusivityId),
          inArray(pgTemplateProposal.status, ["open", "awaiting_payment"])
        )
      )
      .returning();
    if (rows.length > 0) {
      await tx.insert(pgTemplateProposalEvent).values(
        rows.map(row => ({
          action: "cancel" as const,
          actor: "system" as const,
          note,
          proposalId: row.id,
        }))
      );
      await expirePendingInvoices(
        tx,
        rows.map(row => row.invoiceId)
      );
    }
    return rows;
  });
  for (const proposal of closed) {
    await notifyUser(proposal.buyerUserId, {
      body: `Sua negociação pelo template "${templateName(proposal.templateId)}" foi encerrada: ${note}`,
      href: proposalHref(proposal.id),
      kind: "template_proposal_cancelled",
      title: "Negociação encerrada",
    }).catch(() => {});
  }
}

/**
 * Prazos das negociações:
 * - aberta sem resposta por 7 dias → expira (avisa os dois);
 * - aceita sem pagamento em 48h → cancelada, com a fatura expirada.
 */
export async function expireStaleProposals(now = new Date()): Promise<void> {
  const stale = await db
    .select()
    .from(pgTemplateProposal)
    .where(eq(pgTemplateProposal.status, "open"))
    .limit(200);
  for (const proposal of stale) {
    if (proposal.expiresAt.getTime() > now.getTime()) continue;
    const closed = await db.transaction(async tx => {
      const [locked] = await tx
        .select()
        .from(pgTemplateProposal)
        .where(eq(pgTemplateProposal.id, proposal.id))
        .for("update");
      if (locked?.status !== "open" || locked.expiresAt.getTime() > now.getTime()) {
        return false;
      }
      await closeProposal(tx, locked, "expired", "expire", "system", now);
      return true;
    });
    if (!closed) continue;
    const name = templateName(proposal.templateId);
    for (const userId of [proposal.buyerUserId, proposal.sellerUserId]) {
      await notifyUser(userId, {
        body: `A negociação pelo template "${name}" expirou sem resposta em 7 dias.`,
        href: proposalHref(proposal.id),
        kind: "template_proposal_expired",
        title: "Proposta expirada",
      }).catch(() => {});
    }
  }

  const unpaid = await db
    .select()
    .from(pgTemplateProposal)
    .where(eq(pgTemplateProposal.status, "awaiting_payment"))
    .limit(200);
  for (const proposal of unpaid) {
    if (!proposal.paymentDeadline || proposal.paymentDeadline.getTime() > now.getTime()) {
      continue;
    }
    const invoice = proposal.invoiceId
      ? await db.query.pgInvoice.findFirst({
          where: eq(pgInvoice.id, proposal.invoiceId),
        })
      : undefined;
    if (invoice?.status === "processing") continue; // pagamento em andamento
    if (invoice?.status === "paid") {
      await transferExclusivity(invoice);
      continue;
    }
    const closed = await db.transaction(async tx => {
      const [locked] = await tx
        .select()
        .from(pgTemplateProposal)
        .where(eq(pgTemplateProposal.id, proposal.id))
        .for("update");
      if (locked?.status !== "awaiting_payment") return false;
      await expirePendingInvoices(tx, [locked.invoiceId]);
      await tx
        .update(pgTemplateProposal)
        .set({ status: "cancelled", updatedAt: now })
        .where(eq(pgTemplateProposal.id, locked.id));
      await tx.insert(pgTemplateProposalEvent).values({
        action: "cancel",
        actor: "system",
        amountBrl: locked.amountBrl,
        note: "O pagamento não foi feito em 48 horas.",
        proposalId: locked.id,
      });
      return true;
    });
    if (!closed) continue;
    const name = templateName(proposal.templateId);
    await notifyUser(proposal.buyerUserId, {
      body: `O prazo de 48 horas para pagar o template "${name}" terminou e a compra foi cancelada.`,
      email: { severity: "warning" },
      href: proposalHref(proposal.id),
      kind: "template_proposal_unpaid",
      title: "Compra cancelada por falta de pagamento",
    }).catch(() => {});
    await notifyUser(proposal.sellerUserId, {
      body: `O comprador não pagou em 48 horas e a venda do template "${name}" foi cancelada. Você continua com a exclusividade.`,
      href: proposalHref(proposal.id),
      kind: "template_proposal_unpaid",
      title: "Venda cancelada",
    }).catch(() => {});
  }
}
