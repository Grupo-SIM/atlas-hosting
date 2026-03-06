// src/lib/server/apis/umbler/index.ts
// Umbler API wrapper for Brazilian domain registration
// Docs: https://api.umbler.com/docs

import axios, { type AxiosInstance } from "axios";
import type {
  DomainExtensionAvailabilityStatus,
  UmblerDomainRegistration,
  UmblerRegisterDomainBody,
  UmblerTldPrice,
} from "./types";

// Brazilian TLDs supported by Umbler
export const BR_TLDS = [
  "com.br",
  "net.br",
  "org.br",
  "nom.br",
  "ind.br",
  "adv.br",
  "arq.br",
  "bio.br",
  "eng.br",
  "med.br",
  "vet.br",
] as const;

export type BrTld = (typeof BR_TLDS)[number];

/**
 * Umbler pricing table — set these to YOUR COST from Umbler (in BRL).
 * The route.ts will apply your margin on top of these values.
 * Update whenever Umbler changes their prices.
 *
 * How to find current prices: log in to umbler.com → Domínios → Registrar
 */
export const UMBLER_TLD_PRICES: Record<string, UmblerTldPrice> = {
  "com.br": { tld: "com.br", registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "net.br":  { tld: "net.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "org.br":  { tld: "org.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "nom.br":  { tld: "nom.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "ind.br":  { tld: "ind.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "adv.br":  { tld: "adv.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "arq.br":  { tld: "arq.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "bio.br":  { tld: "bio.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "eng.br":  { tld: "eng.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "med.br":  { tld: "med.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
  "vet.br":  { tld: "vet.br",  registerBRL: 40.0, renewBRL: 40.0, transferBRL: 40.0 },
};

export class UmblerApiWrapper {
  private readonly client: AxiosInstance;
  private readonly userId: string;
  private readonly apiToken: string;

  constructor() {
    this.userId = process.env.UMBLER_USER_ID ?? "";
    this.apiToken = process.env.UMBLER_API_TOKEN ?? "";

    // Basic auth: base64(userId:apiToken)
    const credentials = Buffer.from(`${this.userId}:${this.apiToken}`).toString("base64");

    this.client = axios.create({
      baseURL: "https://api.umbler.com",
      timeout: 30_000,
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  get isConfigured(): boolean {
    return Boolean(this.userId && this.apiToken);
  }

  // ── Domain Availability ─────────────────────────────────────────────────

  /**
   * Check availability for a full domain name.
   * The Umbler API returns availability for multiple TLD variants automatically.
   *
   * @param domainName  Full domain or just the SLD — e.g. "meusite" or "meusite.com.br"
   */
  async checkAvailability(
    domainName: string
  ): Promise<DomainExtensionAvailabilityStatus[]> {
    // Strip TLD if provided — Umbler checks all .br variants automatically
    const sld = domainName.includes(".") ? domainName.split(".")[0] : domainName;

    const { data } = await this.client.get<DomainExtensionAvailabilityStatus[]>(
      `/v1/domain-registrations/isavailable/${encodeURIComponent(sld)}`
    );

    // Filter to only .br TLDs we support and have pricing for
    return data.filter((r) => {
      const tld = r.domain.includes(".")
        ? r.domain.split(".").slice(1).join(".")
        : "";
      return tld in UMBLER_TLD_PRICES;
    });
  }

  // ── Pricing ─────────────────────────────────────────────────────────────

  /**
   * Get the stored cost price for a .br TLD.
   * Update UMBLER_TLD_PRICES above when Umbler changes their prices.
   */
  getPriceForTld(tld: string): UmblerTldPrice | null {
    return UMBLER_TLD_PRICES[tld] ?? null;
  }

  // ── Domain Registration ─────────────────────────────────────────────────

  /**
   * Register a domain through Umbler.
   * For .com.br, document must be a valid CPF or CNPJ.
   */
  async registerDomain(
    body: UmblerRegisterDomainBody
  ): Promise<UmblerDomainRegistration> {
    const { data } = await this.client.post<UmblerDomainRegistration>(
      "/v1/domain-registrations",
      body
    );
    return data;
  }

  // ── Domain Info ─────────────────────────────────────────────────────────

  async getDomainInfo(domain: string): Promise<UmblerDomainRegistration> {
    const { data } = await this.client.get<UmblerDomainRegistration>(
      `/v1/domain-registrations/${encodeURIComponent(domain)}`
    );
    return data;
  }

  async listDomains(): Promise<UmblerDomainRegistration[]> {
    const { data } = await this.client.get<UmblerDomainRegistration[]>(
      "/v1/domain-registrations"
    );
    return data;
  }
}

export const umblerApi = new UmblerApiWrapper();
export default umblerApi;
