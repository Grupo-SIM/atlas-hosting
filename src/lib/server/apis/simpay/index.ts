/**
 * Cliente Simpay para Atlas Hosting.
 *
 * Envia pagamentos de cartão de crédito para a plataforma Simpay (back-simpay),
 * que por sua vez processa via DOM Pagamentos internamente.
 *
 * Endpoints utilizados:
 *   POST /atlas/payments/credit-card  — pagamento com cartão (domínio ou assinatura)
 *   GET  /atlas/payments/status/:id   — consulta de status
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

class SimpayApi {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.SIMPAY_API_URL || "https://api.simpay.com.br";
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async createCardPayment(
    params: SimpayCardPaymentParams
  ): Promise<SimpayPaymentResponse> {
    const url = `${this.baseUrl}/atlas/payments/credit-card`;

    console.log(`[SIMPAY] → Enviando pagamento de cartão para Simpay`, {
      url,
      price: params.price,
      email: params.email,
      installments: params.installments,
      description: params.description,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[SIMPAY] ✗ Erro na requisição (${response.status}):`, data);
      throw new Error(
        data?.message || `Erro ao processar pagamento via Simpay (HTTP ${response.status})`
      );
    }

    console.log(`[SIMPAY] ✓ Pagamento criado com sucesso:`, {
      transactionId: data.transactionId,
      paymentId: data.paymentId,
      status: data.status,
    });

    return data as SimpayPaymentResponse;
  }

  async getPaymentStatus(paymentId: string): Promise<{ paymentId: string; status: string }> {
    const url = `${this.baseUrl}/atlas/payments/status/${paymentId}`;

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
}

const simpayApi = new SimpayApi();
export default simpayApi;
