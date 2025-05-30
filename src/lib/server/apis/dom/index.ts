import { db } from "@/lib/db";
import { pgOrganization, pgUser } from "@/lib/db/schema";
import axios, { type AxiosInstance } from "axios";
import { eq } from "drizzle-orm";
import {
  type CreateClientParams,
  type CreateRecurrentPaymentParams,
  type CreateSubscriptionParams,
  type PixKeyType,
  type WithDrawFundsParams,
  Receiver,
  type PayloadWebhook,
} from "./types";
import { signPayload } from "./signature";
import jwt from "jsonwebtoken";
import { getDay, getDaysInMonth, startOfToday } from "date-fns";

export class DomApi {
  private api: AxiosInstance;
  private privateKeyPath: string;
  private tokenApi: string;

  constructor() {
    this.tokenApi = process.env.DOM_API_KEY!;

    this.privateKeyPath = process.env.DOM_WITHDRAWAL_SIGNATURE_KEY_PATH!;

    this.api = axios.create({
      baseURL: "https://apiv3.dompagamentos.com.br/checkout/production/",
      headers: {
        Authorization: `Bearer ${this.tokenApi}`,
      },
    });
  }

  public async createSubscription(userId: string, invoiceId: string) {}

  public async createRecurrentPayment({
    card,
    planId,
    value,
    description,
    userId,
    externalReference,
    newClient,
  }: CreateRecurrentPaymentParams) {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: {
        organization: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let domId = user.organization.domId;

    if (!domId) {
      if (!newClient) {
        throw new Error("User does not have a DOM ID");
      }

      const client = await this.createClient(newClient);

      await db
        .update(pgOrganization)
        .set({
          domId: client.id,
        })
        .where(eq(pgOrganization.id, user.organization.id));

      domId = client.id;
    }

    let billingDay = new Date().getDate();

    if (billingDay > 28) {
      billingDay = 1;
    }

    const {
      data: { token: cardToken },
    } = await this.api.post<{ token: string }>(
      `/customers/${domId}/card-token`,
      card,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const params: CreateSubscriptionParams = {
      card: {
        token: cardToken,
        installments: 1,
      },
      customer_id: domId,
      external_reference: externalReference,
      payment_method: "credit_card",
      auto_recurring: {
        description,
        value,
        billing_day: billingDay,
        frequency_type: "MONTH",
        billing_type: "prepaid",
        retry_days: 3,
        frequency: 1,
      },
      cashback_active: true,
      postbackurl: process.env.PUBLIC_URL + "/webhook/dom",
    };

    console.log(params);

    const { data } = await this.api.post("/recurrence/subscriptions", params);

    console.log(data);

    return data;
  }

  public async createClient({
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
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { data } = await this.api.post<CreateClientParams & { id: string }>(
      "/customers",
      {
        name,
        email,
        document,
        document_type: document.length === 11 ? "CPF" : "CNPJ",
        code_external: codeExternal,
        // gender,
        // birthdate,
        mobile_phone: mobilePhone,
        address,
      }
    );

    return data;
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

  public verifyWebhookSignature(signature: string): PayloadWebhook | null {
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
}

const domApi = new DomApi();
export default domApi;
