import { namecheapApi } from "@/lib/server/apis/namecheap";
import type {
  DomainsCheckCleanedResponse,
  DomainsCheckUserParams,
} from "@/lib/server/apis/namecheap/types";
import { cache } from "react";
import type { DomainPricing } from "@/lib/db/schema";
import { db } from "@/lib/db";
import currencyConversion from "@/lib/server/apis/currency";
import type { DomainData } from "@/app/(auth)/domains/register/types";

export const getDomainData = cache(async function getDomainData(
  searchQuery: string
): Promise<DomainData> {


  if (!searchQuery || searchQuery.trim() === "") {
    return null;
  }

  const domainNameOnly = searchQuery.includes(".")
    ? searchQuery.split(".")[0]
    : searchQuery;
  let domainsToSearch = recommendedTlds.map((tld) => `${domainNameOnly}${tld}`);
  if (searchQuery.includes(".") && !domainsToSearch.includes(searchQuery)) {
    domainsToSearch.unshift(searchQuery);
  }
  domainsToSearch = [...new Set(domainsToSearch)];
  const [checkResult, pricings]: [
    DomainsCheckCleanedResponse | null,
    DomainPricing[],
  ] = await Promise.all([
    domainsToSearch.length > 0
      ? check({ DomainList: domainsToSearch.join(",") })
      : Promise.resolve(null),
    db.query.pgDomainPricingCache.findMany(),
  ]);

  if (!checkResult?.Results || checkResult.Results.length === 0) {
    return null;
  }

  const pricingRecord = Object.fromEntries(pricings.map((p) => [p.tld, p]));

  // Fetch exchange rate and fee once for all conversions
  const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
  let fee = 1;
  if (feeEnabled) {
    try {
      const envFeeValue = process.env.DOMAIN_PROFIT_FEE || process.env.NAMESILO_PROFIT_FEE;
      const envFee = envFeeValue ? parseFloat(envFeeValue) : undefined;
      const envFeeNormalized = envFee !== undefined ? (envFee > 0 && envFee < 1 ? envFee * 100 : envFee) : undefined;
      
      const config = await db.query.pgSystemConfig.findFirst();
      const finalFeePercent = envFeeNormalized ?? config?.domainFee ?? 20;
      fee = 1 + finalFeePercent / 100;
    } catch { 
      fee = 1.20; 
    }
  }

  const [usdToBrlRate] = await currencyConversion.convertMultiple({
    from: "usd",
    to: "brl",
    amounts: [1],
  });

  const domainDataMapped = await Promise.all(checkResult.Results.map(async (domainDetail) => {
    const fullDomainName = domainDetail.Domain;
    let tldForLookup = "";
    const parts = fullDomainName.split(".");
    if (parts.length > 1) {
      let bestMatch = "";
      for (const knownTld of Object.keys(pricingRecord)) {
        if (fullDomainName.toLowerCase().endsWith(`.${knownTld}`)) {
          if (knownTld.length > bestMatch.length) {
            bestMatch = knownTld;
          }
        }
      }
      tldForLookup =
        bestMatch ||
        parts
          .slice(parts.length > 2 ? -2 : -1)
          .join(".")
          .toLowerCase();
    }

    const standardBrlPrices = pricingRecord[tldForLookup];
    const toPrice = (amount: number) => amount * usdToBrlRate;

    let priceBRL = 0;
    let renewBRL = 0;
    let transferBRL = 0;

    if (domainDetail.IsPremiumName && (domainDetail.PremiumRegistrationPrice ?? 0) > 0) {
      priceBRL = (domainDetail.PremiumRegistrationPrice ?? 0) * fee;
      renewBRL = (domainDetail.PremiumRenewalPrice ?? 0) * fee;
      transferBRL = (domainDetail.PremiumTransferPrice ?? 0) * fee;
    } else if (standardBrlPrices?.price) {
      priceBRL = toPrice(standardBrlPrices.price ?? 0) * fee;
      renewBRL = toPrice(standardBrlPrices.renew ?? 0) * fee;
      transferBRL = toPrice(standardBrlPrices.transfer ?? 0) * fee;
    }

    let multiYearPricesBRL: Record<number, number> | undefined = undefined;

    // Se for o domínio principal, buscamos os preços de múltiplos anos
    if (fullDomainName.toLowerCase() === searchQuery.toLowerCase()) {
      try {
        const fullPricing = await namecheapApi.getPricing(tldForLookup);
        if (fullPricing && fullPricing[0]?.Prices) {
          multiYearPricesBRL = {};
          for (const p of fullPricing[0].Prices) {
            if (p.DurationType === "YEAR" && p.Duration >= 1 && p.Duration <= 10) {
              const priceInBrl = p.Currency.toUpperCase() === "BRL" 
                ? p.Price 
                : p.Price * usdToBrlRate;
              multiYearPricesBRL[p.Duration] = priceInBrl * fee;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch multi-year pricing", e);
      }
    }

    return {
      domain: fullDomainName,
      available: (domainDetail.Available || (domainDetail.IsPremiumName && priceBRL > 0)) && priceBRL > 0,
      priceBRL,
      renewBRL,
      transferBRL,
      isPremium: domainDetail.IsPremiumName,
      multiYearPricesBRL,
    };
  }));

  let mainDomainData = domainDataMapped.find(
    (item) => item.domain.toLowerCase() === searchQuery.toLowerCase()
  );
  if (!mainDomainData) {
    mainDomainData =
      domainDataMapped.length > 0
        ? domainDataMapped[0]
        : {
            domain: searchQuery,
            available: false,
            priceBRL: 0,
            renewBRL: 0,
            transferBRL: 0,
            isPremium: false,
          };
  }
  return {
    available: mainDomainData.available,
    domain: mainDomainData,
    extraDomains: domainDataMapped.filter(
      (item) =>
        item.domain.toLowerCase() !== mainDomainData?.domain.toLowerCase()
    ),
  };
});

// Get popular domain extensions for the grid
export const popularExtensions = [".com", ".net", ".org", ".io", ".dev", ".co"];

export const recommendedTlds: `.${string}`[] = [
  ".com",
  ".net",
  ".org",
  ".io",
  ".dev",
  ".co",
  ".app",
  ".online",
];

const check = cache(async (params: DomainsCheckUserParams) =>
  namecheapApi.check(params)
);
