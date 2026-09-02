import type { DomainRegisterInvoiceOptions, Invoice } from "@/lib/db/schema";

/**
 * O checkout aberto já verifica o PIX em tempo real. Quando o cliente fecha a
 * página, o cron assume após esta curta janela e continua a entrega no servidor.
 */
export const PIX_RECONCILIATION_DELAY_MS = 30 * 1000;

type ReconciliationInvoice = Pick<
  Invoice,
  "createdAt" | "metadata" | "status" | "type" | "updatedAt"
>;

function validTimestamp(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Seleciona apenas compras PIX que já saíram da janela de polling do checkout.
 * Faturas antigas não têm `pixCreatedAt`, então usamos `updatedAt`/`createdAt`
 * como fallback para que pagamentos já presos também sejam recuperados.
 */
export function shouldReconcilePixDomainInvoice(
  invoice: ReconciliationInvoice,
  now = new Date(),
  delayMs = PIX_RECONCILIATION_DELAY_MS
): boolean {
  if (invoice.type !== "domain") return false;
  if (invoice.status !== "pending" && invoice.status !== "expired") {
    return false;
  }

  const metadata = invoice.metadata as DomainRegisterInvoiceOptions & {
    type?: string;
  };
  if (metadata.type === "renew" || metadata.isRenewal) return false;
  if (metadata.testPaymentOnly) return false;
  if (!metadata.simpayPaymentId || !metadata.pixCheckout) return false;

  const updatedAt = invoice.updatedAt.getTime();
  const startedAt =
    validTimestamp(metadata.pixCreatedAt) ??
    (Number.isFinite(updatedAt) ? updatedAt : invoice.createdAt.getTime());

  return now.getTime() - startedAt >= delayMs;
}
