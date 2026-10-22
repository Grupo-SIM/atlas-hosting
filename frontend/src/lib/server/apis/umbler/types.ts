// Umbler API Types
// Docs: https://api.umbler.com/docs

// ── Domain Availability ────────────────────────────────────────────────────

export type UmblerDomainStatus =
  | "Available"
  | "Unavailable"
  | "Invalid"
  | string;

export interface DomainExtensionAvailabilityStatus {
  domain: string;
  status: UmblerDomainStatus;
}

// ── Domain Registration ────────────────────────────────────────────────────

export interface UmblerRegisterDomainBody {
  /** Full domain name, e.g. "meusite.com.br" */
  domain: string;
  /** Number of years to register (usually 1) */
  renewalYears: number;
  /** Owner full name */
  customerName: string;
  /** Company name (optional) */
  companyName?: string;
  /** CPF or CNPJ (required for .com.br) */
  document: string;
  address: string;
  district: string;
  city: string;
  /** State abbreviation, e.g. "SP" */
  uf: string;
  /** Country name, e.g. "Brazil" */
  country: string;
  postalCode: string;
  /** Phone with country code, e.g. "+5511999999999" */
  phoneNumber: string;
  email: string;
  /** Whether to auto-recharge Umbler account to cover renewal */
  autoRecharge?: boolean;
}

export interface UmblerDomainRegistration {
  domain: string;
  automaticRenewal: string;
}

// ── Pricing (manually configured — Umbler has no pricing API) ──────────────

export interface UmblerTldPrice {
  /** e.g. "com.br" */
  tld: string;
  /** Registration price in BRL (your cost from Umbler) */
  registerBRL: number;
  /** Renewal price in BRL */
  renewBRL: number;
  /** Transfer price in BRL */
  transferBRL: number;
}
