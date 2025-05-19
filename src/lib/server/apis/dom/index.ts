import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import axios, { AxiosInstance } from "axios";
import { eq } from "drizzle-orm";
import { CreateClientParams, CreateRecurrentPaymentParams, CreateSubscriptionParams, PixKeyType, WithDrawFundsParams, Receiver, PayloadWebhook } from "./types";
import { signPayload } from "./signature";
import jwt from "jsonwebtoken";
import { getDay, startOfToday } from "date-fns";

export class DomApi {
  private api: AxiosInstance;
  private privateKeyPath: string;
  private tokenApi: string;

  constructor() {
    this.tokenApi = process.env.DOM_API_KEY!;

    this.privateKeyPath = process.env.DOM_WITHDRAWAL_SIGNATURE_KEY_PATH!;

    this.api = axios.create({
      baseURL: "https://hml-apiv3.dompagamentos.com.br/checkout/sandbox",
      headers: {
        "Authorization": `Bearer ${this.tokenApi}`,
      }
    });
  }

  public async createSubscription(userId: string, invoiceId: string) {}

  public async createRecurrentPayment({
    token,
    planId,
    value,
    description,
    userId,
    externalReference,
    newClient
  }: CreateRecurrentPaymentParams) {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    let domId = user.domId;

    if (!domId) {
      if (!newClient) {
        throw new Error("User does not have a DOM ID");
      }

      const client = await this.createClient(newClient);
      domId = client.id;
    }

    const params: CreateSubscriptionParams = {
      card: {
        token,
        installments: 1
      },
      customerId: domId,
      externalReference,
      paymentMethod: "credit_card",
      startInvoiceDate: new Date(),
      autoRecurring: {
        description,
        value,
        billingDay: getDay(new Date()),
        frequencyType: "MONTH",
      },
      cashbackActive: true,
      postbackUrl: process.env.PUBLIC_URL + "/api/webhook/dom",
    };

    const { data } = await this.api.post("/recurrence/subscriptions", params);

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
    userId
  }: CreateClientParams) {
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    const { data } = await this.api.post<CreateClientParams & { id: string }>("/customers", {
      name,
      email,
      document,
      documentType: document.length === 11 ? "CPF" : "CNPJ",
      codeExternal,
      gender,
      birthdate,
      mobilePhone,
      address,
    });

    return data;
  }

  /**
   * Withdraw funds from the DOM account
   * @param amount Valor da transferência
   * @param reference Invoice Id - Chave de idempotência, para evitar que seja realizada mais de uma transferência para essa chave.
   * @param userId Id do usuário relacionado ao invoice, utilizado em {@link Receiver}["external_reference"]
   * @throws Error se alguma variável de ambiente necessária não estiver definida
   */
  public async withdrawFunds(amount: number, reference: string, userId: string) {
    const payload: WithDrawFundsParams = {
      description: reference,
      receivers: {
        name: process.env.DOM_WITHDRAWAL_RECEIVER_NAME!,
        document: process.env.DOM_WITHDRAWAL_RECEIVER_DOCUMENT!,
        pix_key_type: process.env.DOM_WITHDRAWAL_KEY_TYPE! as PixKeyType,
        pix_key: process.env.DOM_WITHDRAWAL_PIX_KEY!,
        amount,
        idempotency_key: reference,
        external_reference: reference,
      }
    };

    const signature = signPayload(payload, this.privateKeyPath);

    const { data } = await this.api.post<WithDrawFundsParams & { id: string }>("/withdrawals", {
      ...payload,
      signature,
    });
  }

  public verifyWebhookSignature(signature: string): PayloadWebhook | null {
    try {
      const payload = jwt.verify(signature, this.tokenApi, { algorithms: ["HS256"] }) as PayloadWebhook;
      return payload;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return null;
    }
  }
}

const domApi = new DomApi();
export default domApi;