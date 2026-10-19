export const DAY_MS = 86_400_000;
export const RENEWAL_REMINDER_DAYS = [15, 8] as const;

export function daysUntilRenewal(date: Date, now = new Date()) {
  const civil = (value: Date) => Date.parse(`${value.toLocaleDateString("en-CA", { timeZone: "America/Recife" })}T00:00:00Z`);
  return Math.round((civil(date) - civil(now)) / DAY_MS);
}

export function escapeEmailHtml(value: string) {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, char => entities[char]);
}

export function renewalEmailMessage(plan: string, amount: number, months: number, date: Date, details?: string) {
  const safePlan = escapeEmailHtml(plan);
  return `Sua assinatura <strong>${safePlan}</strong> está pendente de renovação.${details ? `<br>${escapeEmailHtml(details)}` : ""}<br><br>Valor: <strong>${amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong><br>Período: <strong>${months} ${months === 1 ? "mês" : "meses"}</strong><br>Renovação: <strong>${date.toLocaleDateString("pt-BR")}</strong><br><br>Pague pelo link abaixo até o dia seguinte à data de renovação. Caso contrário, prosseguiremos com o cancelamento da VPS e consequente apagamento dos dados. Se houver cartão cadastrado, a cobrança automática será tentada na data de renovação e, se falhar, no dia seguinte.`;
}

/** Uma tentativa por data civil de Recife; nunca três tentativas no mesmo dia. */
export function renewalAttemptDay(date: Date, now = new Date()) {
  const civil = (value: Date) => value.toLocaleDateString("en-CA", { timeZone: "America/Recife" });
  const initial = civil(date);
  const today = civil(now);
  if (today < initial) return 0;
  return today === initial ? 1 : 2;
}
