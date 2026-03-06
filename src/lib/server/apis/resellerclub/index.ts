// src/lib/server/apis/resellerclub/index.ts
// ResellerClub (LogicBoxes) API wrapper
// Docs: https://manage.resellerclub.com/kb/answer/752

import axios, { type AxiosInstance } from "axios";
import type {
  DomainAvailabilityResult,
  DomainAvailabilityStatus,
  DomainInfo,
  RawAvailabilityResponse,
  RegisterDomainParams,
  RegisterDomainResult,
  ResellerClubContact,
  ResellerCostPrice,
} from "./types";

// Brazilian TLDs supported by ResellerClub
export const BR_TLDS = [
  "com.br",
  "net.br",
  "org.br",
  "nom.br",
  "ind.br",
  "art.br",
] as const;

export type BrTld = (typeof BR_TLDS)[number];

// Product keys that map to .br TLDs in the ResellerClub pricing API
const TLD_TO_PRODUCT_KEY: Record<string, string> = {
  "com.br": "dotbr",
  "net.br": "dotnetbr",
  "org.br": "dotorgbr",
  "nom.br": "dotnombr",
  "ind.br": "dotindbr",
  "art.br": "dotartbr",
};

export class ResellerClubApiWrapper {
  private readonly client: AxiosInstance;
  private readonly authUserId: string;
  private readonly apiKey: string;

  /** In-memory pricing cache (refreshed every 6 hours) */
  private pricingCache: Map<string, ResellerCostPrice> = new Map();
  private pricingCacheTimestamp = 0;
  private readonly PRICING_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

  constructor() {
    const sandbox = process.env.RESELLERCLUB_SANDBOX === "true";
    const baseURL = sandbox
      ? "https://test.httpapi.com/api"
      : "https://httpapi.com/api";

    this.authUserId = process.env.RESELLERCLUB_AUTH_USER_ID ?? "";
    this.apiKey = process.env.RESELLERCLUB_API_KEY ?? "";

    this.client = axios.create({ baseURL, timeout: 30_000 });
  }

  /** Base query params added to every request */
  private get auth() {
    return {
      "auth-userid": this.authUserId,
      "api-key": this.apiKey,
    };
  }

  // ── Domain Availability ─────────────────────────────────────────────────

  /**
   * Check availability for a single domain name across multiple .br TLDs.
   * @param domainName  The SLD only, e.g. "meusite" (no TLD)
   * @param tlds        Subset of BR_TLDS to check (defaults to all)
   */
  async checkAvailability(
    domainName: string,
    tlds: string[] = [...BR_TLDS]
  ): Promise<DomainAvailabilityResult[]> {
    const params: Record<string, string | string[]> = {
      ...this.auth,
      "domain-name": domainName,
      "tlds[]": tlds,
    };

    const { data } = await this.client.get<RawAvailabilityResponse>(
      "/domains/available.json",
      { params }
    );

    return Object.entries(data).map(([domain, result]) => ({
      domain,
      status: result.status as DomainAvailabilityStatus,
      classkey: result.classkey,
    }));
  }

  /**
   * Check availability for multiple full domain names (e.g. ["meusite.com.br", "meusite.net.br"]).
   */
  async checkMultiple(
    fullDomains: string[]
  ): Promise<DomainAvailabilityResult[]> {
    if (fullDomains.length === 0) return [];

    // Group by domain name (SLD) so we can batch TLDs together
    const grouped: Record<string, string[]> = {};
    for (const full of fullDomains) {
      const dotIdx = full.indexOf(".");
      if (dotIdx === -1) continue;
      const sld = full.slice(0, dotIdx);
      const tld = full.slice(dotIdx + 1);
      if (!grouped[sld]) grouped[sld] = [];
      grouped[sld].push(tld);
    }

    const results = await Promise.allSettled(
      Object.entries(grouped).map(([sld, tlds]) =>
        this.checkAvailability(sld, tlds)
      )
    );

    return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  }

  // ── Pricing ─────────────────────────────────────────────────────────────

  /**
   * Fetch reseller cost prices for all supported .br TLDs.
   * Results are cached in memory for PRICING_CACHE_TTL ms.
   */
  async getPricingAll(): Promise<Map<string, ResellerCostPrice>> {
    const now = Date.now();
    if (
      this.pricingCache.size > 0 &&
      now - this.pricingCacheTimestamp < this.PRICING_CACHE_TTL
    ) {
      return this.pricingCache;
    }

    const productKeys = Object.values(TLD_TO_PRODUCT_KEY);

    // The ResellerClub pricing endpoint accepts product-key[] repeated params
    const params: Record<string, string | string[]> = {
      ...this.auth,
      "product-key[]": productKeys,
    };

    const { data } = await this.client.get<Record<string, unknown>>(
      "/products/reseller-cost-price.json",
      { params }
    );

    const newCache = new Map<string, ResellerCostPrice>();
    const tldByKey = Object.fromEntries(
      Object.entries(TLD_TO_PRODUCT_KEY).map(([tld, key]) => [key, tld])
    );

    for (const [productKey, info] of Object.entries(data)) {
      const tld = tldByKey[productKey];
      if (!tld || typeof info !== "object" || info === null) continue;

      const priceInfo = info as Record<string, unknown>;
      const addCost = Number(
        (priceInfo["add"] as Record<string, string> | undefined)?.[
          "1"
        ] ?? 0
      );
      const renewCost = Number(
        (priceInfo["renew"] as Record<string, string> | undefined)?.[
          "1"
        ] ?? 0
      );
      const transferCost = Number(
        (priceInfo["transfer"] as Record<string, string> | undefined)?.[
          "1"
        ] ?? 0
      );
      const currency = String(priceInfo["currency"] ?? "USD");

      newCache.set(tld, {
        productKey,
        tld,
        addCost,
        renewCost,
        transferCost,
        currency,
      });
    }

    this.pricingCache = newCache;
    this.pricingCacheTimestamp = now;
    return newCache;
  }

  /**
   * Get reseller cost price for a specific TLD.
   */
  async getPricingForTld(tld: string): Promise<ResellerCostPrice | null> {
    const all = await this.getPricingAll();
    return all.get(tld) ?? null;
  }

  // ── Domain Registration ─────────────────────────────────────────────────

  /**
   * Register a domain through ResellerClub.
   * The customer contact details must be passed in full.
   */
  async registerDomain(
    params: RegisterDomainParams
  ): Promise<RegisterDomainResult> {
    const {
      domainName,
      years,
      registrant,
      admin,
      tech,
      billing,
      nameservers,
      privacyProtection = false,
      autoRenew = false,
    } = params;

    // Contacts must be created first in ResellerClub, or you pass existing contact IDs.
    // Here we create them inline using the contact creation API and then register.
    const registrantId = await this._getOrCreateContact(registrant);
    const adminId = await this._getOrCreateContact(admin);
    const techId = await this._getOrCreateContact(tech);
    const billingId = await this._getOrCreateContact(billing);

    const tld = domainName.includes(".")
      ? domainName.slice(domainName.indexOf(".") + 1)
      : "";

    const payload: Record<string, string | number | boolean | string[]> = {
      ...this.auth,
      "domain-name": domainName,
      years,
      "ns[]": nameservers,
      "customer-id": this.authUserId, // Reseller acting as customer
      "reg-contact-id": registrantId,
      "admin-contact-id": adminId,
      "tech-contact-id": techId,
      "billing-contact-id": billingId,
      "invoice-option": "NoInvoice",
      "protect-privacy": privacyProtection,
      "auto-renew": autoRenew,
    };

    const { data } = await this.client.post<Record<string, unknown>>(
      "/domains/register.json",
      null,
      { params: payload }
    );

    return {
      entityId: Number(data["entityid"] ?? 0),
      description: String(data["description"] ?? ""),
      status: String(data["status"] ?? ""),
      chargedAmount: data["actiontypestatus"]
        ? Number(data["actiontypestatus"])
        : undefined,
      actionTypeStatus: String(data["actiontypestatus"] ?? ""),
    };
  }

  // ── Domain Info ─────────────────────────────────────────────────────────

  async getDomainInfo(domainName: string): Promise<DomainInfo> {
    const { data } = await this.client.get<Record<string, unknown>>(
      "/domains/details-by-name.json",
      {
        params: {
          ...this.auth,
          "domain-name": domainName,
          options: "All",
        },
      }
    );

    const ns = (data["ns"] as string[] | undefined) ?? [];
    return {
      entityId: Number(data["entityid"] ?? 0),
      domainName: String(data["domainname"] ?? domainName),
      status: String(data["domainstatus"] ?? ""),
      expiryDate: String(data["endtime"] ?? ""),
      createdDate: String(data["starttime"] ?? ""),
      autoRenew: data["autoRenew"] === true || data["autoRenew"] === "true",
      privacyProtection:
        data["privacyprotectedallowed"] === true ||
        data["privacyprotectedallowed"] === "true",
      nameservers: Array.isArray(ns) ? ns : [ns],
    };
  }

  // ── Contact Management ───────────────────────────────────────────────────

  /**
   * Create a contact in ResellerClub and return its contact ID.
   * In a real implementation you'd cache contacts per customer.
   */
  private async _getOrCreateContact(
    contact: ResellerClubContact
  ): Promise<number> {
    const params: Record<string, string | number> = {
      ...this.auth,
      name: contact.name,
      company: contact.company ?? contact.name,
      email: contact.email,
      "address-line-1": contact.address1,
      city: contact.city,
      state: contact.state,
      country: contact.country,
      zipcode: contact.zipcode,
      "phone-cc": contact.phoneCountryCode,
      phone: contact.phone,
      "customer-id": this.authUserId,
      type: "Contact",
    };

    if (contact.address2) params["address-line-2"] = contact.address2;

    const { data } = await this.client.post<string | number>(
      "/contacts/add.json",
      null,
      { params }
    );

    return Number(data);
  }
}

export const resellerClubApi = new ResellerClubApiWrapper();
export default resellerClubApi;
