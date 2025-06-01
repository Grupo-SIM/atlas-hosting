// src/types.ts

/**
 * Common interface for timestamps returned by the deSEC API.
 */
export type ISOTimestamp = string; // e.g., "2019-09-18T16:32:16.510368Z"

/**
 * Represents a Captcha challenge from deSEC.
 */
export interface CaptchaResponse {
  id: string;
  challenge: string; // Base64-encoded PNG image
}

/**
 * Represents a deSEC user account.
 */
export interface AccountInfo {
  created: ISOTimestamp;
  domains_under_management: number;
  email: string;
  id: string;
  limit_domains: number;
  outreach_preference: boolean;
}

/**
 * Payload for registering a new account.
 */
export interface RegisterAccountPayload {
  email: string;
  password?: string | null;
  captcha?: {
    id: string;
    solution: string;
  };
  domain?: string;
  outreach_preference?: boolean;
}

/**
 * Payload for logging in.
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Response for a successful login, containing token details.
 */
export interface LoginResponse {
  token: string; // The actual token secret (read-once)
  allowed_subnets: string;
  created: ISOTimestamp;
  id: string;
  is_valid: boolean;
  last_used: ISOTimestamp | null;
  max_age: string | null;
  max_unused_period: string | null;
  name: string;
  perm_manage_tokens: boolean;
  // Other permissions might be present depending on the token type
  perm_create_domain?: boolean;
  perm_delete_domain?: boolean;
}

/**
 * Payload for requesting a password reset.
 */
export interface RequestPasswordResetPayload {
  email: string;
  captcha: {
    id: string;
    solution: string;
  };
}

/**
 * Payload for changing email address.
 */
export interface ChangeEmailPayload {
  email: string;
  password: string;
  new_email: string;
}

/**
 * Payload for deleting an account.
 */
export interface DeleteAccountPayload {
  email: string;
  password: string;
}

/**
 * Payload for confirming password reset.
 */
export interface ConfirmPasswordResetPayload {
  new_password: string;
}

/**
 * Represents a deSEC authentication token.
 */
export interface Token {
  id: string;
  created: ISOTimestamp;
  last_used: ISOTimestamp | null;
  owner: string;
  user_override: string | null;
  max_age: string | null; // e.g., "P30D" for 30 days
  max_unused_period: string | null; // e.g., "PT1H" for 1 hour
  name: string;
  perm_create_domain: boolean;
  perm_delete_domain: boolean;
  perm_manage_tokens: boolean;
  allowed_subnets: string;
  auto_policy: boolean;
  token?: string; // Only returned upon creation
  is_valid: boolean;
}

/**
 * Payload for creating a new token.
 */
export interface CreateTokenPayload {
  name: string;
  allowed_subnets?: string;
  perm_create_domain?: boolean;
  perm_delete_domain?: boolean;
  perm_manage_tokens?: boolean;
  max_age?: string | null;
  max_unused_period?: string | null;
  auto_policy?: boolean;
  user_override?: string | null;
}

/**
 * Payload for modifying an existing token (PATCH).
 */
export type ModifyTokenPayload = Partial<
  Omit<CreateTokenPayload, "user_override">
> & {
  user_override?: string | null;
};

/**
 * Payload for replacing an existing token (PUT).
 */
export type ReplaceTokenPayload = CreateTokenPayload;

/**
 * Represents a deSEC token policy for RRsets.
 */
export interface TokenPolicy {
  id: string;
  domain: string | null; // null for default policy
  subname: string | null; // null for default policy
  type: string | null; // null for default policy
  perm_write: boolean;
}

/**
 * Payload for creating a new token policy.
 */
export interface CreateTokenPolicyPayload {
  domain: string | null;
  subname: string | null;
  type: string | null;
  perm_write?: boolean;
}

/**
 * Payload for modifying an existing token policy (PATCH).
 */
export type ModifyTokenPolicyPayload = Partial<CreateTokenPolicyPayload>;

/**
 * Payload for replacing an existing token policy (PUT).
 */
export type ReplaceTokenPolicyPayload = CreateTokenPolicyPayload;

/**
 * Represents DNSSEC public key information.
 */
export interface DNSSECKeyInfo {
  flags: number;
  protocol: number;
  algorithm: number;
  public_key: string;
  managed: boolean;
  ds: Array<{
    key_tag: number;
    algorithm: number;
    digest_type: number;
    digest: string;
  }>;
}

/**
 * Represents a deSEC DNS domain.
 */
export interface Domain {
  created: ISOTimestamp;
  keys?: DNSSECKeyInfo; // Omitted in list view
  minimum_ttl: number;
  name: string;
  published: ISOTimestamp;
  touched: ISOTimestamp;
  zonefile?: string; // Write-only on creation
}

/**
 * Payload for creating a new domain.
 */
export interface CreateDomainPayload {
  name: string;
  zonefile?: string;
}

/**
 * Represents a deSEC DNS Resource Record Set (RRset).
 */
export interface RRset {
  created: ISOTimestamp;
  domain: string;
  name: string; // Full DNS name (e.g., "www.example.com.")
  records: string; // Array of record content strings
  subname: string; // Subdomain string (e.g., "www", "_443._tcp.www")
  ttl: number; // Time-to-live in seconds
  type: string; // RRset type (e.g., "A", "AAAA", "MX", "TXT")
  touched: ISOTimestamp;
}

/**
 * Payload for creating a new RRset.
 */
export interface CreateRRsetPayload {
  subname: string;
  type: string;
  ttl: number;
  records: string[];
}

/**
 * Payload for modifying an existing RRset (PATCH).
 */
export type ModifyRRsetPayload = Partial<
  Omit<CreateRRsetPayload, "subname" | "type">
>;

/**
 * Payload for replacing an existing RRset (PUT).
 */
export type ReplaceRRsetPayload = CreateRRsetPayload;

/**
 * Payload for bulk RRset operations (PATCH/PUT).
 * Requires subname and type for identification.
 */
export type BulkRRsetPayload = Array<
  CreateRRsetPayload | (ModifyRRsetPayload & { subname: string; type: string })
>;

/**
 * Response for DynDNS update.
 */
export type DynDNSUpdateResponse = "good" | string; // 'good' on success, or an error message
