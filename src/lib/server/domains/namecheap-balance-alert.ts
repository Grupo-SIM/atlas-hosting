import type {
  DomainRegisterInvoiceOptions,
  DomainRenewInvoiceOptions,
  Invoice,
} from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import type { UsersGetBalancesCleanedResponse } from "@/lib/server/apis/namecheap/types";

export const NAMECHEAP_LOW_BALANCE_USD = 40;
const PAYMENT_BLOCKED_MESSAGE =
  "Não foi possível processar sua solicitação no momento. Nenhuma cobrança foi realizada. Tente novamente em instantes.";

export interface NamecheapBalanceAlertResult {
  availableBalance: number;
  currency: string;
  notified: boolean;
  reason?: "recipient_not_configured" | "sufficient_balance";
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

export function shouldSendNamecheapBalanceAlert(availableBalance: number): boolean {
  return availableBalance < NAMECHEAP_LOW_BALANCE_USD;
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

  await sendNotificationEmail(
    recipient,
    "Admin",
    "Atlas Hosting",
    "Saldo baixo na Namecheap",
    `O saldo disponível na conta Namecheap está em <strong>${balances.Currency} ${balances.AvailableBalance.toFixed(2)}</strong>, abaixo do limite de <strong>USD ${NAMECHEAP_LOW_BALANCE_USD.toFixed(2)}</strong>. Adicione fundos para evitar falhas no registro e na renovação de domínios.`,
    "danger"
  );

  return { ...result, notified: true };
}

export async function notifyLowNamecheapBalanceAfterAction(): Promise<NamecheapBalanceAlertResult> {
  const balances = await namecheapApi.getBalances();
  return notifyLowNamecheapBalance(balances);
}

export async function notifyLowNamecheapBalanceAfterActionSafely(
  context: string
): Promise<NamecheapBalanceAlertResult | null> {
  try {
    return await notifyLowNamecheapBalanceAfterAction();
  } catch (error) {
    console.error(
      `[NAMECHEAP][BALANCE] Falha ao consultar saldo após ${context}:`,
      error
    );
    return null;
  }
}

export async function notifyNamecheapActionFailure(
  action: string,
  error: string
): Promise<void> {
  const recipient = process.env.DOMAIN_EMAIL?.trim();
  if (!recipient) {
    console.error(
      `[NAMECHEAP][ACTION] ${action} falhou, mas DOMAIN_EMAIL não está configurado.`
    );
    return;
  }

  await sendNotificationEmail(
    recipient,
    "Admin",
    "Atlas Hosting",
    `Falha na Namecheap: ${action}`,
    `A ação <strong>${action}</strong> falhou na Namecheap.<br><br>Detalhe: <strong>${error}</strong>.`,
    "danger"
  );
}

export async function notifyNamecheapActionFailureSafely(
  action: string,
  error: string
): Promise<void> {
  try {
    await notifyNamecheapActionFailure(action, error);
  } catch (notificationError) {
    console.error(
      `[NAMECHEAP][ACTION] Falha ao enviar alerta de ${action}:`,
      notificationError
    );
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
    await notifyNamecheapActionFailureSafely(
      "consulta de saldo antes do pagamento",
      error instanceof Error ? error.message : String(error)
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
    await notifyNamecheapActionFailureSafely(
      "consulta de saldo antes do pagamento",
      `A Namecheap retornou a moeda inesperada ${balances.Currency}.`
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

  return { ok: true };
}
