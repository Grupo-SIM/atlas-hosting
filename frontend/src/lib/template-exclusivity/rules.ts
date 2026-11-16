/**
 * Regras puras da exclusividade de templates e da revenda por propostas.
 * Nada aqui toca o banco: é o que os testes cobrem.
 */

/** Dias que os outros usuários têm para trocar de template antes do site sair do ar. */
export const EVICTION_DAYS = 7;
/** Carência depois do vencimento da anuidade. */
export const GRACE_DAYS = 7;
/** Proposta sem resposta expira depois disso. */
export const PROPOSAL_TTL_DAYS = 7;
/** Prazo do comprador para pagar depois do aceite. */
export const PAYMENT_WINDOW_HOURS = 48;
/** Reserva do template durante o checkout da primeira compra. */
export const RESERVATION_HOURS = 24;
/** Lembretes de renovação, em dias antes do vencimento. */
export const REMINDER_DAYS = [15, 7, 1] as const;
/** A fatura de renovação é emitida com esta antecedência. */
export const RENEWAL_INVOICE_LEAD_DAYS = 15;
/** Duração de um ciclo de exclusividade. */
export const CYCLE_MONTHS = 12;

export const DEFAULT_RESALE_FEE_PERCENT = 10;
export const DEFAULT_RESALE_MIN_PRICE_BRL = 100;

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
}

export interface ResaleConfig {
  feePercent: number;
  minPriceBrl: number;
}

/** Normaliza a config do admin (valores inválidos caem no padrão). */
export function normalizeResaleConfig(
  raw: Partial<{ feePercent: number | null; minPriceBrl: number | null }> = {}
): ResaleConfig {
  const fee = Number(raw.feePercent);
  const min = Number(raw.minPriceBrl);
  return {
    feePercent:
      Number.isFinite(fee) && fee >= 0 && fee <= 100
        ? fee
        : DEFAULT_RESALE_FEE_PERCENT,
    minPriceBrl:
      Number.isFinite(min) && min > 0 ? round2(min) : DEFAULT_RESALE_MIN_PRICE_BRL,
  };
}

/** Menor proposta aceita: o mínimo do dono, nunca abaixo do piso global. */
export function minimumOffer(
  ownerMin: number | null | undefined,
  floor: number
): number {
  return round2(Math.max(ownerMin ?? floor, floor));
}

/** Taxa do Atlas sobre o valor fechado. */
export function atlasFee(agreed: number, feePercent: number): number {
  return round2((agreed * feePercent) / 100);
}

/** Quanto o comprador paga: valor fechado + taxa do Atlas (cobrada por cima). */
export function buyerTotal(agreed: number, feePercent: number): number {
  return round2(agreed + atlasFee(agreed, feePercent));
}

function isMoney(value: number): boolean {
  return Number.isFinite(value) && value > 0 && value < 10_000_000;
}

/** Valida o valor mínimo de venda escolhido pelo dono. */
export function validateAskingPrice(
  amount: number,
  floor: number
): string | null {
  if (!isMoney(amount)) return "Informe um valor válido.";
  if (round2(amount) < floor) {
    return `O valor mínimo de venda não pode ser menor que ${formatBrl(floor)}.`;
  }
  return null;
}

/** Valida um lance (proposta inicial ou contraproposta). */
export function validateOfferAmount(
  amount: number,
  minimum: number
): string | null {
  if (!isMoney(amount)) return "Informe um valor válido.";
  if (round2(amount) < minimum) {
    return `O valor mínimo para este template é ${formatBrl(minimum)}.`;
  }
  return null;
}

export type ProposalAction = "accept" | "decline" | "counter" | "cancel";
export type ProposalRoleName = "buyer" | "seller";

export interface ProposalSnapshot {
  status: string;
  turn: ProposalRoleName;
  expiresAt: Date;
}

/**
 * Diz se `role` pode executar `action` agora. Devolve a mensagem de erro, ou
 * `null` quando pode.
 *
 * - aceitar / recusar / contrapropor: só quem está com a vez, proposta aberta;
 * - cancelar: só o comprador, enquanto aberta ou aguardando o pagamento dele.
 */
export function proposalActionError(
  proposal: ProposalSnapshot,
  role: ProposalRoleName,
  action: ProposalAction,
  now = new Date()
): string | null {
  if (action === "cancel") {
    if (role !== "buyer") return "Só quem fez a proposta pode cancelá-la.";
    if (proposal.status !== "open" && proposal.status !== "awaiting_payment") {
      return "Esta negociação já foi encerrada.";
    }
    return null;
  }
  if (proposal.status !== "open") return "Esta negociação já foi encerrada.";
  if (proposal.expiresAt.getTime() <= now.getTime()) {
    return "Esta proposta expirou.";
  }
  if (proposal.turn !== role) {
    return "Aguarde a resposta da outra parte.";
  }
  return null;
}

export function otherRole(role: ProposalRoleName): ProposalRoleName {
  return role === "buyer" ? "seller" : "buyer";
}

export function proposalExpiry(now = new Date()): Date {
  return new Date(now.getTime() + PROPOSAL_TTL_DAYS * DAY_MS);
}

export function paymentDeadline(now = new Date()): Date {
  return new Date(now.getTime() + PAYMENT_WINDOW_HOURS * HOUR_MS);
}

export function reservationDeadline(now = new Date()): Date {
  return new Date(now.getTime() + RESERVATION_HOURS * HOUR_MS);
}

export function evictionDeadline(now = new Date()): Date {
  return new Date(now.getTime() + EVICTION_DAYS * DAY_MS);
}

export function graceDeadline(now = new Date()): Date {
  return new Date(now.getTime() + GRACE_DAYS * DAY_MS);
}

/** Fim de um ciclo começando em `from`. */
export function cycleEnd(from: Date): Date {
  const end = new Date(from);
  end.setMonth(end.getMonth() + CYCLE_MONTHS);
  return end;
}

/** Dias inteiros (arredondados para cima) até `target`. */
export function daysUntil(target: Date, now = new Date()): number {
  return Math.ceil((target.getTime() - now.getTime()) / DAY_MS);
}

/** Hora de emitir a fatura de renovação do ciclo que vence em `expiresAt`. */
export function renewalInvoiceDue(expiresAt: Date, now = new Date()): boolean {
  return daysUntil(expiresAt, now) <= RENEWAL_INVOICE_LEAD_DAYS;
}

/**
 * Qual lembrete enviar agora (o mais próximo do vencimento que ainda não foi),
 * ou `null`. As chaves já enviadas são `<ciclo>:<dias>`.
 */
export function dueReminder(
  expiresAt: Date,
  sent: readonly string[] | undefined,
  now = new Date()
): { days: number; key: string } | null {
  const left = daysUntil(expiresAt, now);
  if (left < 0) return null;
  const cycle = expiresAt.toISOString();
  const candidates = REMINDER_DAYS.filter(days => left <= days).sort(
    (a, b) => a - b
  );
  const days = candidates[0];
  if (days === undefined) return null;
  const key = `${cycle}:${days}`;
  return sent?.includes(key) ? null : { days, key };
}

export interface WalletLedger {
  /** Comissões de afiliado não canceladas (disponíveis + já sacadas). */
  commissions: number;
  /** Créditos de `wallet_entries` (vendas de exclusividade). */
  entries: number;
  /** Saques pendentes ou aprovados. */
  withdrawals: number;
  /** Só os saques pendentes, para exibição. */
  pendingWithdrawals: number;
}

/** Saldo disponível = tudo que entrou − tudo que saiu (ou está saindo). */
export function walletAvailable(ledger: WalletLedger): number {
  return Math.max(
    0,
    round2(ledger.commissions + ledger.entries - ledger.withdrawals)
  );
}

export type TemplateExclusivityState =
  /** Template sem exclusividade: todo mundo usa. */
  | { kind: "public" }
  /** Exclusividade à venda pelo preço anual do admin. */
  | { kind: "available"; annualPriceBrl: number }
  /** Outra pessoa está no checkout da primeira compra. */
  | { kind: "reserved" }
  | { kind: "owned_by_me"; exclusivityId: string; expiresAt: Date | null }
  | { kind: "owned_by_other"; exclusivityId: string; minOfferBrl: number };

/** Estado de um template para quem está vendo a galeria. */
export function templateStateFor(input: {
  setting?: { enabled: boolean; annualPriceBrl: number } | null;
  exclusivity?: {
    id: string;
    ownerUserId: string;
    status: string;
    expiresAt: Date | null;
    minAskingPriceBrl: number | null;
  } | null;
  viewerId: string;
  floor: number;
}): TemplateExclusivityState {
  const { exclusivity, setting, viewerId, floor } = input;
  if (exclusivity) {
    if (exclusivity.status === "reserved") {
      return exclusivity.ownerUserId === viewerId
        ? { kind: "available", annualPriceBrl: setting?.annualPriceBrl ?? 0 }
        : { kind: "reserved" };
    }
    if (exclusivity.status === "active" || exclusivity.status === "past_due") {
      return exclusivity.ownerUserId === viewerId
        ? {
            exclusivityId: exclusivity.id,
            expiresAt: exclusivity.expiresAt,
            kind: "owned_by_me",
          }
        : {
            exclusivityId: exclusivity.id,
            kind: "owned_by_other",
            minOfferBrl: minimumOffer(exclusivity.minAskingPriceBrl, floor),
          };
    }
  }
  if (setting?.enabled && setting.annualPriceBrl > 0) {
    return { annualPriceBrl: setting.annualPriceBrl, kind: "available" };
  }
  return { kind: "public" };
}

/** Quem não é o dono não pode criar site com o template nesses estados. */
export function blocksOthers(state: TemplateExclusivityState): boolean {
  return state.kind === "owned_by_other" || state.kind === "reserved";
}
