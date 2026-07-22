/**
 * Cliente Simpay para Atlas Hosting.
 *
 * Envia pagamentos de cartão de crédito para a plataforma Simpay (back-simpay),
 * que por sua vez processa via DOM Pagamentos internamente.
 *
 * Endpoints utilizados:
 *   POST /atlas/payments/credit-card — cartão (domínio ou assinatura)
 *   POST /atlas/payments/pix         — PIX (mesmo contrato que renovada, rota atlas)
 *   GET  /atlas/payments/status/:id  — status (ex.: COMPLETED)
 *
 * URL base (primeira definida vence):
 *   ATLAS_SIMPAY_API_URL — use no .env para ignorar SIMPAY_API_URL do sistema (Windows).
 *   SIMPAY_API_URL — fallback
 *   ATLAS_SIMPAY_STORE / SIMPAY_STORE — enviado no body PIX e cartão (rota atlas)
 */

export interface SimpayCardPaymentParams {
  price: number;
  document: string;
  document_type: string;
  email: string;
  name: string;
  mobile_phone?: string;
  description: string;
  holder_name: string;
  token: string;
  bin: string;
  brand: string;
  installments: number;
  /** Loja no Simpay; se omitido, usa ATLAS_SIMPAY_STORE / SIMPAY_STORE / "atlas" */
  store?: string;
}

export interface SimpayPaymentResponse {
  transactionId: string;
  paymentId: string;
  status: string;
  id?: string;
  message?: string;
  payment_info?: {
    installment_amount: number;
    total_amount: number;
    authorization_code?: string;
  };
}

export interface SimpayPixPaymentParams {
  price: number;
  document: string;
  document_type: string;
  email: string;
  name: string;
  mobile_phone: string;
  /** Identificador do produto; use prefixo `atlas ` para conciliação no back Simpay */
  description: string;
  /** Loja no Simpay; se omitido, usa ATLAS_SIMPAY_STORE / SIMPAY_STORE / "atlas" */
  store?: string;
}

export interface SimpayPixCreateResponse {
  pix_qrcode: string;
  pix_content: string;
  id?: string;
  paymentId?: string;
  transactionId?: string;
  message?: string;
}

export interface SimpayWithdrawalParams {
  cpf: string;
  email: string;
  amount: number;
  pixKey: string;
}

export interface SimpayWithdrawalResponse {
  id: string;
  success?: boolean;
  status?: string;
  amount?: number;
  netPayout?: number;
  pixKey?: string;
  rejectionReason?: string;
}

function normalizeSimpayBaseUrl(raw: string | undefined): string {
  const fallback = "https://simpay-back.simintermediacoes.com";
  const s = raw?.trim();
  if (!s) return fallback;
  return s.replace(/\/+$/, "");
}

/** Lido a cada chamada: reflete .env após restart; ATLAS vence SIMPAY (útil vs. env global do SO). */
function resolveSimpayBaseUrl(): string {
  const raw =
    process.env.ATLAS_SIMPAY_API_URL?.trim() ||
    process.env.SIMPAY_API_URL?.trim();
  return normalizeSimpayBaseUrl(raw || undefined);
}

function resolveSimpayStore(override?: string): string {
  const s = override?.trim();
  if (s) return s;
  return (
    process.env.ATLAS_SIMPAY_STORE?.trim() ||
    process.env.SIMPAY_STORE?.trim() ||
    "atlas"
  );
}

/**
 * Erro lançado quando a Simpay/DOM NÃO aprova o pagamento (recusa da operadora,
 * antifraude, etc.). A mensagem é segura para exibir ao cliente final.
 */
export class SimpayPaymentDeclinedError extends Error {
  public readonly gatewayStatus: string;

  constructor(gatewayStatus: string, message?: string) {
    super(
      message ||
        "O pagamento não foi aprovado pela operadora do cartão. Nenhuma cobrança foi efetuada. Verifique os dados do cartão ou tente outro método de pagamento."
    );
    this.name = "SimpayPaymentDeclinedError";
    this.gatewayStatus = gatewayStatus;
  }
}

/** Status retornados pela Simpay/DOM que representam pagamento efetivamente aprovado. */
const APPROVED_PAYMENT_STATUSES = new Set([
  "COMPLETED",
  "PAID",
  "APPROVED",
  "CONFIRMED",
  "AUTHORIZED",
  "CAPTURED",
  "SUCCEEDED",
  "SUCCESS",
  "CHARGE-APPROVED",
]);

export function isApprovedPaymentStatus(status: unknown): boolean {
  if (typeof status !== "string") return false;
  return APPROVED_PAYMENT_STATUSES.has(status.trim().toUpperCase());
}

function formatSimpayErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const m = (data as { message?: unknown }).message;
  if (typeof m === "string") return m;
  if (Array.isArray(m) && m.every((x) => typeof x === "string")) {
    return m.join(" ");
  }
  return undefined;
}

class SimpayApi {
  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async createCardPayment(
    params: SimpayCardPaymentParams
  ): Promise<SimpayPaymentResponse> {
    const url = `${resolveSimpayBaseUrl()}/atlas/payments/credit-card`;
    const { store: storeParam, ...cardFields } = params;
    const body = {
      ...cardFields,
      store: resolveSimpayStore(storeParam),
    };

    console.log(`[SIMPAY] → Enviando pagamento de cartão para Simpay`, {
      url,
      store: body.store,
      price: params.price,
      email: params.email,
      installments: params.installments,
      description: params.description,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SIMPAY] ✗ Erro na requisição (${response.status}):`, data);
      throw new Error(
        formatSimpayErrorMessage(data) ||
          `Erro ao processar pagamento via Simpay (HTTP ${response.status})`
      );
    }

    // HTTP 200 NÃO significa pagamento aprovado: a DOM pode recusar a cobrança
    // (NOT_AUTHORIZED, REJECTED_ANTIFRAUD, PENDING...) e a Simpay repassa isso
    // no campo `status`. Só liberamos o produto com status de aprovação explícito.
    if (!isApprovedPaymentStatus(data?.status)) {
      const gatewayStatus = String(data?.status ?? "UNKNOWN");
      const paymentId = data?.paymentId ?? data?.id;

      // Confirmação secundária: consulta o status antes de recusar, com algumas
      // tentativas — cobre o caso "pending" em que a confirmação da DOM chega
      // via webhook alguns segundos depois da criação.
      if (paymentId) {
        for (let attempt = 1; attempt <= 4; attempt++) {
          try {
            const remote = await this.getPaymentStatus(String(paymentId));
            if (isApprovedPaymentStatus(remote?.status)) {
              console.log(
                `[SIMPAY] ✓ Pagamento confirmado via consulta de status (${remote.status}) após criação retornar "${gatewayStatus}" (tentativa ${attempt}).`
              );
              return data as SimpayPaymentResponse;
            }
            // Status terminal de falha: não adianta insistir.
            if (["FAILED", "EXPIRED", "CHARGEBACK", "NOT_FOUND"].includes(String(remote?.status ?? "").toUpperCase())) {
              break;
            }
          } catch (statusErr) {
            console.error(
              `[SIMPAY] ✗ Falha ao confirmar status do pagamento ${paymentId} (tentativa ${attempt}):`,
              statusErr
            );
          }
          if (attempt < 4) await new Promise((r) => setTimeout(r, 2000));
        }
      }

      console.error(
        `[SIMPAY] ✗ Pagamento NÃO aprovado (status="${gatewayStatus}"). Resposta completa:`,
        data
      );
      throw new SimpayPaymentDeclinedError(gatewayStatus);
    }

    console.log(`[SIMPAY] ✓ Pagamento criado com sucesso:`, {
      transactionId: data.transactionId,
      paymentId: data.paymentId,
      status: data.status,
    });

    return data as SimpayPaymentResponse;
  }

  async createPixPayment(
    params: SimpayPixPaymentParams
  ): Promise<SimpayPixCreateResponse> {
    const url = `${resolveSimpayBaseUrl()}/atlas/payments/pix`;
    const { store: storeParam, ...pixFields } = params;
    const body = {
      ...pixFields,
      store: resolveSimpayStore(storeParam),
    };

    console.log(`[SIMPAY] → Criando cobrança PIX (atlas)`, {
      url,
      store: body.store,
      price: params.price,
      email: params.email,
      description: params.description,
    });

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Falha de rede ao contatar Simpay.";
      throw new Error(
        `${msg} Defina ATLAS_SIMPAY_API_URL ou SIMPAY_API_URL (host acessível pelo servidor; env do Windows sobrescreve o .env).`
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        `Resposta PIX inválida (HTTP ${response.status}). Confira a URL base da Simpay.`
      );
    }

    if (!response.ok) {
      console.error(`[SIMPAY] ✗ Erro PIX (${response.status}):`, data);
      throw new Error(
        formatSimpayErrorMessage(data) ||
          `Erro ao gerar PIX via Simpay (HTTP ${response.status})`
      );
    }

    return data as SimpayPixCreateResponse;
  }

  async getPaymentStatus(paymentId: string): Promise<{ paymentId: string; status: string }> {
    const url = `${resolveSimpayBaseUrl()}/atlas/payments/status/${paymentId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erro ao consultar status do pagamento (HTTP ${response.status})`);
    }

    return data;
  }

  async requestWithdrawal(
    params: SimpayWithdrawalParams
  ): Promise<SimpayWithdrawalResponse> {
    const url = `${resolveSimpayBaseUrl()}/internal/atlas/finance/withdraw`;
    const token =
      process.env.ATLAS_SIMPAY_INTERNAL_TOKEN ||
      process.env.SIMPAY_INTERNAL_TOKEN ||
      process.env.DOM_API_KEY ||
      "91b324f6aa36368c536b4f1f9e75f7565b385737b1aa3a4adf07b8c7d99300c9";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-internal-token": token,
      },
      body: JSON.stringify({
        cpf: params.cpf.replace(/\D/g, ""),
        email: params.email,
        amount: params.amount,
        pixKey: params.pixKey,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        formatSimpayErrorMessage(data) ||
          `Erro ao solicitar saque (HTTP ${response.status})`
      );
    }

    return data as SimpayWithdrawalResponse;
  }

  async getWithdrawalStatus(
    withdrawalId: string
  ): Promise<{ id: string; status: string; rejectionReason?: string }> {
    const url = `${resolveSimpayBaseUrl()}/internal/atlas/finance/withdraw/${withdrawalId}`;
    const token =
      process.env.ATLAS_SIMPAY_INTERNAL_TOKEN ||
      process.env.DOM_API_KEY ||
      "91b324f6aa36368c536b4f1f9e75f7565b385737b1aa3a4adf07b8c7d99300c9";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-internal-token": token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Erro ao consultar status do saque (HTTP ${response.status})`
      );
    }

    return data;
  }

  async getSummary(params: { cpf?: string; email?: string }): Promise<{
    userExists: boolean;
    availableBalance: number;
    pendingWithdraws: number;
    lockedBalance: number;
  }> {
    const query = new URLSearchParams();
    if (params.cpf) query.append("cpf", params.cpf);
    if (params.email) query.append("email", params.email);

    const url = `${resolveSimpayBaseUrl()}/internal/atlas/finance/summary?${query.toString()}`;
    const token =
      process.env.ATLAS_SIMPAY_INTERNAL_TOKEN ||
      process.env.DOM_API_KEY ||
      "dce6be4f-2db4-405b-9f9f-8277031b25ec";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-internal-token": token,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Erro ao consultar sumário (HTTP ${response.status})`);
    }

    return data;
  }
}

const simpayApi = new SimpayApi();
export default simpayApi;
