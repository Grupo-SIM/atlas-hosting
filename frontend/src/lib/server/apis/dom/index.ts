import axios, { type AxiosInstance } from "axios";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { pgOrganization, pgUser } from "@/lib/db/schema";
import {
  type CreateBoletoTransactionParams,
  type CreateClientParams,
  type CreateOneTimePaymentParams,
  type CreateRecurrentPaymentParams,
  type CreateSubscriptionParams,
  type DomTransaction,
  type PayloadWebhook,
  Receiver,
} from "./types";

export class DomApi {
  private api: AxiosInstance;
  private tokenApi: string;

  constructor() {
    this.tokenApi = process.env.DOM_API_KEY as string;

    this.api = axios.create({
      baseURL: "https://apiv3.dompagamentos.com.br/checkout/production/",
      headers: {
        Authorization: `Bearer ${this.tokenApi}`,
      },
    });
  }

  async createSubscription(userId: string, invoiceId: string) {}

  async createRecurrentPayment({
    card,
    planId,
    value,
    description,
    userId,
    externalReference,
    newClient,
  }: CreateRecurrentPaymentParams) {
    console.log(
      "[DOM][createRecurrentPayment] Iniciando pagamento recorrente",
      {
        cardType: "token" in card ? "token" : "raw_card",
        description,
        externalReference,
        hasNewClient: !!newClient,
        userId,
        value,
      }
    );

    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: {
        organization: true,
      },
    });

    if (!user) {
      console.error(
        `[DOM][createRecurrentPayment] Usuário não encontrado: ${userId}`
      );
      throw new Error("User not found");
    }

    console.log("[DOM][createRecurrentPayment] Usuário encontrado:", {
      domId: user.organization?.domId ?? "(sem DOM ID)",
      email: user.email,
      organizationId: user.organization?.id,
      userId: user.id,
    });

    let domId = user.organization?.domId ?? "";

    if (!domId) {
      if (!newClient) {
        console.error(
          "[DOM][createRecurrentPayment] Sem DOM ID e sem dados para criar cliente"
        );
        throw new Error("User does not have a DOM ID");
      }

      console.log("[DOM][createRecurrentPayment] Criando novo cliente DOM...");
      const client = await this.createClient(newClient);
      console.log(
        `[DOM][createRecurrentPayment] Cliente DOM criado: ${client.id}`
      );

      await db
        .update(pgOrganization)
        .set({
          domId: client.id,
        })
        .where(eq(pgOrganization.id, user.organization?.id ?? ""));

      domId = client.id;
    }

    let billingDay = new Date().getDate();

    if (billingDay > 28) {
      billingDay = 1;
    }

    let cardToken = "token" in card ? card.token : "";

    if (!("token" in card)) {
      console.log(
        `[DOM][createRecurrentPayment] Tokenizando cartão para customerId=${domId}...`
      );
      const {
        data: { token },
      } = await this.api.post<{ token: string }>(
        `/customers/${domId}/card-token`,
        card,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      cardToken = token;
      console.log(
        "[DOM][createRecurrentPayment] Cartão tokenizado com sucesso"
      );
    } else {
      cardToken = card.token;
      console.log(
        "[DOM][createRecurrentPayment] Usando token de cartão existente"
      );
    }

    const params: CreateSubscriptionParams = {
      auto_recurring: {
        billing_day: billingDay,
        billing_type: "prepaid",
        description,
        frequency: 1,
        frequency_type: "MONTH",
        retry_days: 3,
        value,
      },
      card: {
        installments: 1,
        token: cardToken,
      },
      cashback_active: true,
      customer_id: domId,
      external_reference: externalReference,
      payment_method: "credit_card",
      postbackurl: `${process.env.PUBLIC_URL}/webhook/dom`,
    };

    console.log(
      "[DOM][createRecurrentPayment] Enviando para DOM API:",
      JSON.stringify(params, null, 2)
    );

    try {
      const { data } = await this.api.post("/recurrence/subscriptions", params);
      console.log(
        "[DOM][createRecurrentPayment] Resposta da DOM API (SUCESSO):",
        JSON.stringify(data, null, 2)
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[DOM][createRecurrentPayment] ERRO na DOM API:", {
          data: JSON.stringify(error.response?.data, null, 2),
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      } else {
        console.error("[DOM][createRecurrentPayment] ERRO inesperado:", error);
      }
      throw error;
    }
  }

  async createOneTimePayment({
    card,
    value,
    description,
    userId,
    externalReference,
  }: CreateOneTimePaymentParams) {
    console.log(
      "[DOM][createOneTimePayment] Iniciando pagamento único (domínio)",
      {
        description,
        externalReference,
        userId,
        value,
      }
    );

    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: { organization: true },
    });

    if (!user) {
      console.error(
        `[DOM][createOneTimePayment] Usuário não encontrado: ${userId}`
      );
      throw new Error("User not found");
    }

    console.log("[DOM][createOneTimePayment] Usuário encontrado:", {
      domId: user.organization?.domId ?? "(sem DOM ID)",
      email: user.email,
      organizationId: user.organization?.id,
      userId: user.id,
    });

    const domId = user.organization?.domId;
    if (!domId) {
      console.error("[DOM][createOneTimePayment] Usuário sem DOM customer ID");
      throw new Error("User does not have a DOM ID");
    }

    const params: CreateSubscriptionParams = {
      auto_recurring: {
        billing_type: "prepaid",
        description,
        frequency: 1,
        frequency_type: "MONTH",
        repetitions: 1,
        retry_days: 3,
        value,
      },
      card: {
        installments: card.installments ?? 1,
        token: card.token,
      },
      cashback_active: true,
      customer_id: domId,
      external_reference: externalReference,
      payment_method: "credit_card",
      postbackurl: `${process.env.PUBLIC_URL}/webhook/dom`,
    };

    console.log(
      "[DOM][createOneTimePayment] Enviando para DOM API (repetitions=1, cobrança única):",
      JSON.stringify(params, null, 2)
    );

    try {
      const { data } = await this.api.post("/recurrence/subscriptions", params);
      console.log(
        "[DOM][createOneTimePayment] Resposta da DOM API (SUCESSO):",
        JSON.stringify(data, null, 2)
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[DOM][createOneTimePayment] ERRO na DOM API:", {
          data: JSON.stringify(error.response?.data, null, 2),
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      } else {
        console.error("[DOM][createOneTimePayment] ERRO inesperado:", error);
      }
      throw error;
    }
  }

  async createClient({
    name,
    email,
    document,
    codeExternal,
    gender,
    birthdate,
    mobilePhone,
    address,
    userId,
  }: CreateClientParams) {
    console.log(
      `[DOM][createClient] Criando cliente DOM para userId=${userId}`,
      {
        codeExternal,
        document: `${document.substring(0, 3)}...${document.slice(-2)}`,
        documentType: document.length === 11 ? "CPF" : "CNPJ",
        email,
        mobilePhone,
        name,
      }
    );

    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
    });

    if (!user) {
      console.error(`[DOM][createClient] Usuário não encontrado: ${userId}`);
      throw new Error("User not found");
    }

    const payload = {
      address,
      code_external: codeExternal,
      document,
      document_type: document.length === 11 ? "CPF" : "CNPJ",
      email,
      // gender,
      // birthdate,
      mobile_phone: mobilePhone,
      name,
    };

    console.log(
      "[DOM][createClient] Enviando para DOM API /customers:",
      JSON.stringify(payload, null, 2)
    );

    try {
      const { data } = await this.api.post<CreateClientParams & { id: string }>(
        "/customers",
        payload
      );
      console.log(
        `[DOM][createClient] Cliente criado com SUCESSO. DOM customer ID: ${data.id}`
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[DOM][createClient] ERRO na DOM API:", {
          data: JSON.stringify(error.response?.data, null, 2),
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });

        // Se o cliente já existe, retorna o ID existente
        if (error.response?.data?.id) {
          console.log(
            `[DOM][createClient] Cliente já existe na DOM, retornando ID: ${error.response.data.id}`
          );
          return { id: error.response.data.id as string };
        }
      } else {
        console.error("[DOM][createClient] ERRO inesperado:", error);
      }

      throw error;
    }
  }

  /**
   * Withdraw funds from the DOM account
   * @param amount Valor da transferência
   * @param reference Invoice Id - Chave de idempotência, para evitar que seja realizada mais de uma transferência para essa chave.
   * @param userId Id do usuário relacionado ao invoice, utilizado em {@link Receiver}["external_reference"]
   * @throws Error se alguma variável de ambiente necessária não estiver definida
   */
  // public async withdrawFunds(
  //   amount: number,
  //   reference: string,
  //   userId: string
  // ) {
  //   const payload: WithDrawFundsParams = {
  //     description: reference,
  //     receivers: {
  //       name: process.env.DOM_WITHDRAWAL_RECEIVER_NAME!,
  //       document: process.env.DOM_WITHDRAWAL_RECEIVER_DOCUMENT!,
  //       pix_key_type: process.env.DOM_WITHDRAWAL_KEY_TYPE! as PixKeyType,
  //       pix_key: process.env.DOM_WITHDRAWAL_PIX_KEY!,
  //       amount,
  //       idempotency_key: reference,
  //       external_reference: reference,
  //     },
  //   };

  //   const signature = signPayload(payload, this.privateKeyPath);

  //   const { data } = await this.api.post<WithDrawFundsParams & { id: string }>(
  //     "/withdrawals",
  //     {
  //       ...payload,
  //       signature,
  //     }
  //   );
  // }

  verifyWebhookSignature(signature: string): PayloadWebhook | null {
    try {
      const payload = jwt.verify(signature, this.tokenApi, {
        algorithms: ["HS256"],
      }) as PayloadWebhook;
      return payload;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return null;
    }
  }

  /**
   * Create a card token for a customer
   * @param userId User ID to get the organization's DOM ID
   * @param cardData Card information for tokenization
   * @returns Card token and metadata
   */
  async createCardToken(
    userId: string,
    cardData: {
      number: string;
      cvv: string;
      exp_month: number;
      exp_year: number;
      holder_name: string;
      holder_document: string;
    }
  ) {
    console.log(
      `[DOM][createCardToken] Tokenizando cartão para userId=${userId}`,
      {
        exp_month: cardData.exp_month,
        exp_year: cardData.exp_year,
        holder_document: `${cardData.holder_document.substring(0, 3)}...`,
        holder_name: cardData.holder_name,
        last4: cardData.number.slice(-4),
      }
    );

    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: {
        organization: true,
      },
    });

    if (!user) {
      console.error(`[DOM][createCardToken] Usuário não encontrado: ${userId}`);
      throw new Error("User not found");
    }

    const domId = user.organization?.domId;
    if (!domId) {
      console.error("[DOM][createCardToken] Usuário sem DOM customer ID");
      throw new Error("User does not have a DOM customer ID");
    }

    console.log(
      `[DOM][createCardToken] Enviando para DOM API /customers/${domId}/card-token`
    );

    try {
      const { data } = await this.api.post<{ token: string }>(
        `/customers/${domId}/card-token`,
        cardData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[DOM][createCardToken] Cartão tokenizado com SUCESSO:", {
        brand: this.detectCardBrand(cardData.number),
        last4: cardData.number.slice(-4),
      });

      return {
        brand: this.detectCardBrand(cardData.number),
        expiryMonth: cardData.exp_month.toString().padStart(2, "0"),
        expiryYear: cardData.exp_year.toString(),
        holderName: cardData.holder_name,
        last4: cardData.number.slice(-4),
        token: data.token,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[DOM][createCardToken] ERRO na DOM API:", {
          data: JSON.stringify(error.response?.data, null, 2),
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
        });
      } else {
        console.error("[DOM][createCardToken] ERRO inesperado:", error);
      }
      throw error;
    }
  }

  /**
   * Delete a card token from DOM API
   * @param userId User ID to get the organization's DOM ID
   * @param cardToken Card token to delete
   */
  async deleteCardToken(userId: string, cardToken: string) {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: {
        organization: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const domId = user.organization?.domId;
    if (!domId) {
      throw new Error("User does not have a DOM customer ID");
    }

    try {
      await this.api.delete(`/customers/${domId}/cards/${cardToken}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error deleting card from DOM:", error);
      // Don't throw here as we still want to delete from our database
      // even if DOM deletion fails
    }
  }

  /**
   * Get card token information from DOM API
   * @param userId User ID to get the organization's DOM ID
   * @param cardToken Card token to fetch information for
   * @returns Card token information
   */
  async getCardToken(userId: string, cardToken: string) {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: {
        organization: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const domId = user.organization?.domId;
    if (!domId) {
      throw new Error("User does not have a DOM customer ID");
    }

    try {
      const { data } = await this.api.get(
        `/customers/${domId}/card-token/${cardToken}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return data;
    } catch (error) {
      console.error("Error fetching card token from DOM:", error);
      throw error;
    }
  }

  /**
   * Get customer information from DOM API
   * @param userId User ID to get the organization's DOM ID
   * @returns Customer information from DOM API
   */
  async getCustomer(userId: string) {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: {
        organization: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const domId = user.organization?.domId;
    if (!domId) {
      throw new Error("User does not have a DOM customer ID");
    }

    try {
      const { data } = await this.api.get(`/customers/${domId}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      return {
        address: data.address,
        document: data.document,
        document_type: data.document_type,
        email: data.email,
        id: data.id,
        mobile_phone: data.mobile_phone,
        name: data.name,
      };
    } catch (error) {
      console.error("Error fetching customer from DOM:", error);
      throw error;
    }
  }

  /**
   * Cria um boleto via POST /transactions (API moderna de transação avulsa da DOM —
   * distinta da API de assinaturas/recorrência usada no resto desta classe).
   * https://dom-pagamentos.readme.io/reference/criar-uma-transacao
   */
  async createBoletoTransaction({
    codExternal,
    value,
    description,
    customer,
    boletoDueDays = 3,
    instructions,
    postbackUrl,
  }: CreateBoletoTransactionParams): Promise<DomTransaction> {
    const payload = {
      cod_external: codExternal,
      customer,
      metadata: description,
      payment: {
        boleto: {
          boleto_due_days: boletoDueDays,
          ...(instructions ? { instructions } : {}),
        },
        payment_method: "boleto" as const,
        total: value,
      },
      postbackUrl: postbackUrl ?? `${process.env.PUBLIC_URL}/webhook/dom`,
    };

    console.log("[DOM][createBoletoTransaction] Criando boleto", {
      codExternal,
      description,
      value,
    });

    try {
      const { data } = await this.api.post<DomTransaction>(
        "transactions",
        payload
      );
      console.log(
        `[DOM][createBoletoTransaction] Boleto criado com SUCESSO: ${data.id}`
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[DOM][createBoletoTransaction] ERRO na DOM API:", {
          data: JSON.stringify(error.response?.data, null, 2),
          message: error.message,
          status: error.response?.status,
        });
      } else {
        console.error("[DOM][createBoletoTransaction] ERRO inesperado:", error);
      }
      throw error;
    }
  }

  /**
   * Consulta o status de uma transação avulsa (boleto/pix/cartão) via GET /transactions/{id}.
   * https://dom-pagamentos.readme.io/reference/consultar-transacao
   */
  async getTransaction(transactionId: string): Promise<DomTransaction> {
    const { data } = await this.api.get<DomTransaction>(
      `transactions/${transactionId}`
    );
    return data;
  }

  /**
   * Verifica a assinatura JWT (HS256, segredo = API token) de um webhook de
   * transação avulsa (CHARGE-*). O JWT decodificado só contém {id, exp} — o "id"
   * deve bater com o id da transação no corpo do webhook, senão é inválido/adulterado.
   * https://dom-pagamentos.readme.io/reference/webhook-verificacao-de-assinatura
   */
  verifyChargeSignature(signature: string): { id: string; exp: number } | null {
    try {
      return jwt.verify(signature, this.tokenApi, {
        algorithms: ["HS256"],
      }) as { id: string; exp: number };
    } catch (error) {
      console.error("[DOM][verifyChargeSignature] Assinatura inválida:", error);
      return null;
    }
  }

  /**
   * Detect card brand from card number
   */
  private detectCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\D/g, "");

    if (number.startsWith("4")) return "Visa";
    if (
      number.startsWith("5") ||
      (number.startsWith("2") &&
        Number.parseInt(number.substring(0, 4), 10) >= 2221 &&
        Number.parseInt(number.substring(0, 4), 10) <= 2720)
    )
      return "Mastercard";
    if (number.startsWith("3")) return "American Express";
    if (number.startsWith("6")) return "Discover";

    return "Unknown";
  }
}

const domApi = new DomApi();
export default domApi;
