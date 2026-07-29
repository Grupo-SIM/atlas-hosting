// ResellerClub (LogicBoxes) API Types

export interface ResellerClubConfig {
  authUserId: string;
  apiKey: string;
  sandbox?: boolean;
}

// ── Domain Availability ────────────────────────────────────────────────────

/** Possible statuses returned by the availability check */
export type DomainAvailabilityStatus =
  | "available"
  | "unavailable"
  | "regthroughus" // registered through the reseller's own account
  | "regthroughothers" // registered through another registrar
  | "unknown";

export interface DomainAvailabilityResult {
  /** e.g. "mysite.com.br" */
  domain: string;
  status: DomainAvailabilityStatus;
  /** Internal product/class key returned by the API */
  classkey?: string;
}

/** Raw availability response: a map of "domain.tld" → result object */
export type RawAvailabilityResponse = Record<
  string,
  { status: string; classkey?: string }
>;

// ── Pricing ────────────────────────────────────────────────────────────────

export interface ResellerCostPrice {
  /** e.g. "dotbr" */
  productKey: string;
  /** e.g. "com.br" */
  tld: string;
  /** Registration cost to you (in account currency) for 1 year */
  addCost: number;
  /** Renewal cost to you for 1 year */
  renewCost: number;
  /** Transfer cost to you for 1 year */
  transferCost: number;
  currency: string;
}

// ── Domain Registration ────────────────────────────────────────────────────

export interface ResellerClubContact {
  name: string;
  company?: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  /** State name or abbreviation */
  state: string;
  /** ISO 3166-1 country code, e.g. "BR" */
  country: string;
  zipcode: string;
  phoneCountryCode: string; // e.g. "55"
  phone: string; // e.g. "11999999999"
  fax?: string;
  faxCountryCode?: string;
}

export interface RegisterDomainParams {
  /** Full domain name, e.g. "mysite.com.br" */
  domainName: string;
  /** Registration period in years */
  years: number;
  /** Namecheap-style contacts (registrant, admin, tech, billing) */
  registrant: ResellerClubContact;
  admin: ResellerClubContact;
  tech: ResellerClubContact;
  billing: ResellerClubContact;
  /** Nameservers (2–13 required) */
  nameservers: string[];
  /** Whether to enable privacy protection (if available for TLD) */
  privacyProtection?: boolean;
  /** Auto-renew flag */
  autoRenew?: boolean;
}

export interface RegisterDomainResult {
  /** ResellerClub domain entity ID */
  entityId: number;
  description: string;
  status: "Success" | "Failed" | string;
  /** Amount charged to the reseller account */
  chargedAmount?: number;
  /** Transaction ID */
  actionTypeStatus?: string;
}

// ── Domain Info ────────────────────────────────────────────────────────────

export interface DomainInfo {
  entityId: number;
  domainName: string;
  status: string;
  expiryDate: string;
  createdDate: string;
  autoRenew: boolean;
  privacyProtection: boolean;
  nameservers: string[];
}
