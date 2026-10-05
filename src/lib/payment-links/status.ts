export type PaymentLinkEffectiveStatus = "pending" | "paid" | "cancelled";

/**
 * O `status` gravado na linha do link só é confiável pra "cancelled".
 *
 * O valor "used" era gravado no instante em que a fatura era criada — ou seja,
 * bastava abrir o link pra ele constar como pago. A verdade sobre pagamento mora
 * na fatura resultante, então derivamos daí. Links antigos marcados como "used"
 * indevidamente voltam sozinhos pra "pending" por causa disso.
 */
export function paymentLinkEffectiveStatus(
  linkStatus: string,
  resultingInvoiceStatus: string | null | undefined
): PaymentLinkEffectiveStatus {
  if (linkStatus === "cancelled") return "cancelled";
  if (resultingInvoiceStatus === "paid") return "paid";
  return "pending";
}

export function assertPaymentLinkEditable(invoice: { status: string; metadata?: unknown } | null | undefined) {
  const metadata = invoice?.metadata as Record<string, unknown> | undefined;
  if (invoice && (invoice.status === "paid" || invoice.status === "processing" || metadata?.simpayPaymentId || metadata?.pixTransactionId || metadata?.pixSettlementStartedAt || metadata?.domTransactionId || metadata?.paymentStartedAt)) {
    throw new Error("Pagamento iniciado. Concilie a cobrança antes de alterar ou cancelar o link.");
  }
}
