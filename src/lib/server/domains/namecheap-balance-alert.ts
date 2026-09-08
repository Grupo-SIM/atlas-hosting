import type {
  DomainRegisterInvoiceOptions,
  DomainRenewInvoiceOptions,
  Invoice,
} from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import type { UsersGetBalancesCleanedResponse } from "@/lib/server/apis/namecheap/types";

export const NAMECHEAP_LOW_BALANCE_USD = 40;
const ALERT_COOLDOWN_MS = 20 * 60 * 60 * 1000;
const PAYMENT_BLOCKED_MESSAGE =
  "Não foi possível processar sua solicitação no momento. Nenhuma cobrança foi realizada. Tente novamente em instantes.";

let lastAlertAt = 0;

export interface NamecheapBalanceAlertResult {
  availableBalance: number;
  currency: string;
  notified: boolean;
  reason?: "cooldown" | "recipient_not_configured" | "sufficient_balance";
}

export type NamecheapFundsValidation =
  | { ok: true }
  | {
      message: string;
      ok: false;
      reason:
        | "balance_unavailable"
        | "cost_unavailable"
        | "insufficient_balance";
    };

interface NamecheapBalanceReader {
  getBalances(): Promise<UsersGetBalancesCleanedResponse>;
}

interface InsufficientBalanceNotifier {
  notify(availableBalance: number, requiredBalance: number): Promise<void>;
}

export function shouldSendNamecheapBalanceAlert(
  availableBalance: number,
  previousAlertAt: number,
  now: number
): boolean {
  return (
    availableBalance < NAMECHEAP_LOW_BALANCE_USD &&
    now - previousAlertAt >= ALERT_COOLDOWN_MS
  );
}

async function notifyLowNamecheapBalance(
  balances: UsersGetBalancesCleanedResponse
): Promise<NamecheapBalanceAlertResult> {
  const result = {
    availableBalance: balances.AvailableBalance,
    currency: balances.Currency,
  };

  if (balances.AvailableBalance >= NAMECHEAP_LOW_BALANCE_USD) {
    return { ...result, notified: false, reason: "sufficient_balance" };
  }

  const recipient = process.env.DOMAIN_EMAIL?.trim();
  if (!recipient) {
    console.error(
      `[NAMECHEAP][BALANCE] Saldo baixo (${balances.Currency} ${balances.AvailableBalance.toFixed(2)}), mas DOMAIN_EMAIL não está configurado.`
    );
    return { ...result, notified: false, reason: "recipient_not_configured" };
  }

  const now = Date.now();
  if (
    !shouldSendNamecheapBalanceAlert(
      balances.AvailableBalance,
      lastAlertAt,
      now
    )
  )
    return { ...result, notified: false, reason: "cooldown" };

  await sendNotificationEmail(
    recipient,
    "Admin",
    "Atlas Hosting",
    "Saldo baixo na Namecheap",
    `O saldo disponível na conta Namecheap está em <strong>${balances.Currency} ${balances.AvailableBalance.toFixed(2)}</strong>, abaixo do limite de <strong>USD ${NAMECHEAP_LOW_BALANCE_USD.toFixed(2)}</strong>. Adicione fundos para evitar falhas no registro e na renovação de domínios.`,
    "danger"
  );
  lastAlertAt = now;

  return { ...result, notified: true };
}

export async function checkNamecheapBalanceAndNotify(): Promise<NamecheapBalanceAlertResult> {
  const balances = await namecheapApi.getBalances();
  return notifyLowNamecheapBalance(balances);
}

export async function checkNamecheapBalanceSafely(
  context: string
): Promise<NamecheapBalanceAlertResult | null> {
  try {
    return await checkNamecheapBalanceAndNotify();
  } catch (error) {
    console.error(
      `[NAMECHEAP][BALANCE] Falha ao consultar saldo após ${context}:`,
      error
    );
    return null;
  }
}

async function notifyInsufficientNamecheapBalance(
  availableBalance: number,
  requiredBalance: number
): Promise<void> {
  const recipient = process.env.DOMAIN_EMAIL?.trim();
  if (!recipient) {
    console.error(
      "[NAMECHEAP][BALANCE] Compra bloqueada por saldo insuficiente, mas DOMAIN_EMAIL não está configurado."
    );
    return;
  }

  await sendNotificationEmail(
    recipient,
    "Admin",
    "Atlas Hosting",
    "Compra de domínio bloqueada por saldo insuficiente",
    `Uma tentativa de compra foi bloqueada antes da cobrança do cliente. Saldo disponível: <strong>USD ${availableBalance.toFixed(2)}</strong>. Custo necessário na Namecheap: <strong>USD ${requiredBalance.toFixed(2)}</strong>. Adicione fundos à conta para liberar novas compras.`,
    "danger"
  );
}

export async function validateNamecheapFundsForPayment(
  invoice: Pick<Invoice, "metadata" | "type">,
  balanceReader: NamecheapBalanceReader = namecheapApi,
  insufficientBalanceNotifier: InsufficientBalanceNotifier = {
    notify: notifyInsufficientNamecheapBalance,
  }
): Promise<NamecheapFundsValidation> {
  if (invoice.type !== "domain") return { ok: true };

  const metadata = invoice.metadata as DomainRegisterInvoiceOptions &
    DomainRenewInvoiceOptions;
  if (metadata.testPaymentOnly) return { ok: true };

  const requiredUsd = metadata.namecheapCostUsd;
  if (!Number.isFinite(requiredUsd) || !requiredUsd || requiredUsd <= 0) {
    console.error(
      "[NAMECHEAP][BALANCE] Fatura sem custo Namecheap em USD; pagamento bloqueado."
    );
    return {
      message: PAYMENT_BLOCKED_MESSAGE,
      ok: false,
      reason: "cost_unavailable",
    };
  }

  let balances: UsersGetBalancesCleanedResponse;
  try {
    balances = await balanceReader.getBalances();
  } catch (error) {
    console.error(
      "[NAMECHEAP][BALANCE] Consulta falhou; pagamento bloqueado:",
      error
    );
    return {
      message: PAYMENT_BLOCKED_MESSAGE,
      ok: false,
      reason: "balance_unavailable",
    };
  }

  if (balances.Currency !== "USD") {
    console.error(
      `[NAMECHEAP][BALANCE] Moeda inesperada ${balances.Currency}; pagamento bloqueado.`
    );
    return {
      message: PAYMENT_BLOCKED_MESSAGE,
      ok: false,
      reason: "balance_unavailable",
    };
  }

  if (balances.AvailableBalance < requiredUsd) {
    try {
      await insufficientBalanceNotifier.notify(
        balances.AvailableBalance,
        requiredUsd
      );
    } catch (error) {
      console.error(
        "[NAMECHEAP][BALANCE] Falha ao enviar aviso de saldo insuficiente:",
        error
      );
    }
    console.error(
      `[NAMECHEAP][BALANCE] Saldo USD ${balances.AvailableBalance.toFixed(2)} insuficiente para custo USD ${requiredUsd.toFixed(2)}; pagamento bloqueado.`
    );
    return {
      message: PAYMENT_BLOCKED_MESSAGE,
      ok: false,
      reason: "insufficient_balance",
    };
  }

  if (balances.AvailableBalance < NAMECHEAP_LOW_BALANCE_USD) {
    try {
      await notifyLowNamecheapBalance(balances);
    } catch (error) {
      console.error(
        "[NAMECHEAP][BALANCE] Falha ao enviar aviso de saldo baixo:",
        error
      );
    }
  }

  return { ok: true };
}
