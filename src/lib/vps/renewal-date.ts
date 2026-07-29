import { addMonths, subDays } from "date-fns";

/**
 * A Contabo renova (e cobra no nosso cartão) no dia do mês em que a VPS foi
 * comprada. Cobramos o cliente alguns dias antes desse aniversário para dar
 * tempo de cancelar a instância na Contabo caso o pagamento não entre.
 */
export const RENEWAL_LEAD_DAYS = 2;

/**
 * Data da primeira renovação de uma assinatura comprada agora: aniversário da
 * compra menos {@link RENEWAL_LEAD_DAYS}. A cobrança inicial continua sendo no
 * ato da compra — só o ciclo seguinte é antecipado.
 */
export function firstRenewalDate(purchasedAt: Date, intervalMonths: number): Date {
  return subDays(addMonths(purchasedAt, intervalMonths), RENEWAL_LEAD_DAYS);
}

/**
 * Data da renovação seguinte. Ancorada na renovação atual (que já carrega o
 * adiantamento), então o intervalo em relação à Contabo se mantém a cada ciclo.
 */
export function nextRenewalDate(currentChargeDate: Date, intervalMonths: number): Date {
  return addMonths(currentChargeDate, intervalMonths);
}
