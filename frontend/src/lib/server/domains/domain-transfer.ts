export const OPEN_DOMAIN_TRANSFER_STATUSES = [
  "pending_both",
  "awaiting_source",
  "awaiting_target",
] as const;

export const DOMAIN_TRANSFER_STATUSES = [
  ...OPEN_DOMAIN_TRANSFER_STATUSES,
  "completed",
  "rejected",
  "cancelled",
  "expired",
] as const;

export type DomainTransferStatus = (typeof DOMAIN_TRANSFER_STATUSES)[number];

export interface DomainTransferState {
  sourceAcceptedAt: Date | null;
  targetAcceptedAt: Date | null;
}

export interface DomainInvoiceReference {
  metadata: unknown;
  reference: string;
}

export function getDomainTransferStatus({
  sourceAcceptedAt,
  targetAcceptedAt,
}: DomainTransferState): Extract<
  DomainTransferStatus,
  "pending_both" | "awaiting_source" | "awaiting_target"
> {
  if (sourceAcceptedAt && !targetAcceptedAt) return "awaiting_target";
  if (!sourceAcceptedAt && targetAcceptedAt) return "awaiting_source";
  return "pending_both";
}

export function isOpenDomainTransferStatus(
  status: DomainTransferStatus
): boolean {
  return OPEN_DOMAIN_TRANSFER_STATUSES.includes(
    status as (typeof OPEN_DOMAIN_TRANSFER_STATUSES)[number]
  );
}

export function invoiceReferencesDomain(
  invoice: DomainInvoiceReference,
  domain: string
): boolean {
  const normalizedDomain = domain.trim().toLowerCase();
  if (invoice.reference.trim().toLowerCase() === normalizedDomain) return true;

  if (!invoice.metadata || typeof invoice.metadata !== "object") return false;
  const metadata = invoice.metadata as {
    bundleDomains?: unknown;
    domain?: unknown;
  };
  if (
    typeof metadata.domain === "string" &&
    metadata.domain.trim().toLowerCase() === normalizedDomain
  ) {
    return true;
  }
  return (
    Array.isArray(metadata.bundleDomains) &&
    metadata.bundleDomains.some(
      candidate =>
        typeof candidate === "string" &&
        candidate.trim().toLowerCase() === normalizedDomain
    )
  );
}

export function domainTransferStatusMessage(
  status: DomainTransferStatus,
  viewerId: string,
  sourceUserId: string,
  targetUserId: string
): string {
  if (status === "completed") return "Transferência concluída.";
  if (status === "rejected") return "Transferência recusada pelo destinatário.";
  if (status === "cancelled") return "Transferência cancelada pelo solicitante.";
  if (status === "expired") return "Transferência expirada.";

  const viewerMustAccept =
    (status === "pending_both" &&
      (viewerId === sourceUserId || viewerId === targetUserId)) ||
    (status === "awaiting_source" && viewerId === sourceUserId) ||
    (status === "awaiting_target" && viewerId === targetUserId);

  return viewerMustAccept
    ? "Aguardando sua confirmação."
    : "Aguardando confirmação da outra parte.";
}
