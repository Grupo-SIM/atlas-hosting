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
