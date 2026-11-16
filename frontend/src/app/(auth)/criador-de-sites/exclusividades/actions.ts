"use server";

import { revalidatePath } from "next/cache";
import { FORBIDDEN_MESSAGE, getBuilderUser } from "@/lib/site-builder/access";
import {
  makeOffer,
  type ProposalResponse,
  respondToProposal,
  setMinAskingPrice,
} from "@/lib/template-exclusivity/proposals";
import { createPurchaseInvoice } from "@/lib/template-exclusivity/purchase";

type Result<T = object> = ({ ok: true } & T) | { error: string; ok: false };

const BASE = "/criador-de-sites/exclusividades";

function refresh(proposalId?: string) {
  revalidatePath(BASE);
  revalidatePath("/criador-de-sites/novo");
  if (proposalId) revalidatePath(`${BASE}/propostas/${proposalId}`);
}

/** Primeira compra da exclusividade: devolve o checkout da fatura anual. */
export async function buyExclusivity(
  templateId: string
): Promise<Result<{ checkoutUrl: string }>> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  if (!user.organization) {
    return { error: "Sua conta não tem organização.", ok: false };
  }
  const result = await createPurchaseInvoice(
    { id: user.id, organizationId: user.organization.id },
    String(templateId)
  );
  if (!result.ok) return result;
  refresh();
  return { checkoutUrl: `/checkout/${result.invoiceId}`, ok: true };
}

export async function sendProposal(
  templateId: string,
  amount: number
): Promise<Result<{ proposalId: string }>> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const result = await makeOffer(
    { id: user.id, organizationId: user.organization?.id },
    String(templateId),
    Number(amount)
  );
  if (result.ok) refresh(result.proposalId);
  return result;
}

export async function answerProposal(
  proposalId: string,
  response: ProposalResponse
): Promise<Result<{ checkoutUrl?: string }>> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const action = response?.action;
  if (!["accept", "decline", "cancel", "counter"].includes(action)) {
    return { error: "Ação inválida.", ok: false };
  }
  const safe: ProposalResponse =
    action === "counter"
      ? { action, amount: Number((response as { amount: number }).amount) }
      : ({ action } as ProposalResponse);
  const result = await respondToProposal(
    { id: user.id, organizationId: user.organization?.id },
    String(proposalId),
    safe
  );
  refresh(String(proposalId));
  return result;
}

export async function updateMinAskingPrice(
  exclusivityId: string,
  amount: number
): Promise<Result> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const result = await setMinAskingPrice(
    { id: user.id, organizationId: user.organization?.id },
    String(exclusivityId),
    Number(amount)
  );
  if (result.ok) refresh();
  return result;
}
