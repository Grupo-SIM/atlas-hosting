import { invoiceReferencesDomain } from "./domain-transfer";

export interface DomainDeletionState {
  domain: string;
  purchased: boolean;
  expiresAt: string | null;
  autoRenew: boolean;
  transfers: { status: string }[];
  invoices: { status: string; reference: string; metadata: unknown }[];
}

export function canDeleteOrganizationDomain(user: { id: string; impersonatedBy?: unknown; organization: { ownerId: string | null } }) {
  return !user.impersonatedBy && user.organization.ownerId === user.id;
}

export function assertDomainDeletionAllowed(state: DomainDeletionState, now = new Date()) {
  if (state.transfers.some(transfer => ["pending_both", "awaiting_source", "awaiting_target"].includes(transfer.status))) {
    throw new Error("Conclua ou cancele a transferência em andamento antes de apagar o domínio.");
  }
  if (state.invoices.some(invoice => ["pending", "processing"].includes(invoice.status) && invoiceReferencesDomain(invoice, state.domain))) {
    throw new Error("Há uma compra ou renovação pendente para este domínio. Resolva a cobrança antes da exclusão.");
  }
  if (!state.purchased) return;
  const expiresAt = state.expiresAt ? new Date(state.expiresAt) : null;
  if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
    throw new Error("Não foi possível confirmar a vigência do domínio no registrador. Tente novamente mais tarde.");
  }
  if (expiresAt > now) throw new Error("O domínio ainda possui vigência paga e não pode ser apagado.");
  if (state.autoRenew) throw new Error("Desative a renovação automática antes de apagar o domínio.");
}

/** Detach only after successful DNS removal. A retry may safely delete an already absent zone. */
export async function deleteDnsBeforeDetach(zoneId: string | null, deleteZone: (id: string) => Promise<void>, detach: () => Promise<void>) {
  if (zoneId) await deleteZone(zoneId);
  await detach();
}
