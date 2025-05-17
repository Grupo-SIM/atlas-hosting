export type PixKeyType = "EMAIL" | "CPF" | "CNPJ" | "CHAVE_ALEATORIA";

export interface CreateRecurrentPaymentParams {
  userId: string;
  token: string;
  frequency: FrequencyType;
  value: number;
  description: string;
  externalReference: string;
  newClient?: CreateClientParams;
}

export interface CreateSubscriptionParams {
  customerId: string;
  planId?: string;
  autoRecurring?: AutoRecurring;
  paymentMethod: "credit_card";
  card?: Card;
  cashbackActive?: boolean;
  postbackUrl?: string;
  metadata?: string;
  startInvoiceDate: Date;
  externalReference: string;
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
  frequencyType?: FrequencyType;
  repetitions?: number;
  billingType?: "prepaid" | "postpaid" | "exact_day";
  billingDay?: number;
  retryDays?: number;
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
  receivers: Receiver
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
  type: string;
  data: {
    customer: Customer;
    subscription: Subscription;
    plan: Plan;
  };
}