export type PixKeyType = "EMAIL" | "CPF" | "CNPJ" | "CHAVE_ALEATORIA";

export interface CreateRecurrentPaymentParams {
  userId: string;
  frequency: FrequencyType;
  value: number;
  description: string;
  externalReference: string;
  planId?: string;
  newClient?: CreateClientParams;
  card:
    | {
        number: string;
        holder_name: string;
        holder_document: string;
        exp_month: number;
        exp_year: number;
        cvv: string;
      }
    | {
        token: string;
        installments?: number;
      };
}

export interface CreateSubscriptionParams {
  customer_id: string;
  plan_id?: string;
  auto_recurring?: AutoRecurring;
  payment_method: "credit_card";
  card?: Card;
  cashback_active?: boolean;
  postbackurl?: string;
  metadata?: string;
  start_invoice_date?: string;
  external_reference: string;
}

export interface Card {
  installments: number;
  token: string;
}

export type FrequencyType = "DAY" | "WEEK" | "MONTH" | "YEAR";

export interface AutoRecurring {
  description: string;
  value: number;
  frequency?: number;
  frequency_type?: FrequencyType;
  repetitions?: number;
  billing_type?: "prepaid" | "postpaid" | "exact_day";
  billing_day?: number;
  retry_days?: number;
}

export interface CreateClientParams {
  userId: string;
  name: string;
  email: string;
  document: string;
  // documentType: "CPF" | "CNPJ";
  codeExternal?: string;
  gender?: "male" | "female" | "other";
  birthdate?: Date;
  mobilePhone: string;
  address?: Address;
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  zip_code: string;
  city: string;
  state: string;
}

export interface WithDrawFundsParams {
  description: string;
  receivers: Receiver;
}

export interface WithDrawFundsResponse {
  batch_id: string;
  description: string;
  created_at: string;
  postbackUrl: string;
  total_gross: number;
  total_transfer: number;
  total_fee: number;
  receivers: Receiver[];
}

export interface WithDrawFundsError {
  pix_key: string;
  msg: string;
}

export interface WithDrawFundsError400 {
  status: string;
  errors: WithDrawFundsError[];
}

export interface WithDrawFundsError406 {
  status: string;
  msg: string;
}

export interface Receiver {
  /**
   * Nome completo do recebedor.
   */
  name: string;
  /**
   * Documento do recebedor (CPF ou CNPJ)
   */
  document: string;
  /**
   * Tipo da chave pix: EMAIL | CPF | CNPJ | CHAVE_ALEATORIA
   */
  pix_key_type: PixKeyType;
  /**
   * Chave pix
   */
  pix_key: string;
  /**
   * Código externo.
   */
  external_reference?: string;
  /**
   * Valor da transferência
   */
  amount: number;
  /**
   * Chave de idempotência, para evitar que seja realizada mais de uma transferência para essa chave.
   */
  idempotency_key: string;
}

export interface Customer {
  id?: string;
  dom_customer_id?: string;
  email: string;
  name: string;
}

export interface Subscription {
  id: string;
  status?: string; // status from controller example, not strictly in service PayloadWebhook but good to have
  external_reference?: string;
}

export interface Plan {
  id?: string;
  dom_plan_id?: string;
  value?: number; // value is present in controller example and service
  description: string;
  external_reference?: string;
}

export interface PayloadWebhook {
  event: string;
  data: {
    customer: Customer;
    subscription: Subscription;
    plan: Plan;
    external_reference?: string;
  };
}
