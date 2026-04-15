import type { DomainData } from "@/app/(auth)/domain/types";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import type { DomainsCheckUserParams } from "@/lib/server/apis/namecheap/types";
import { inArray } from "drizzle-orm";
import { cache } from "react";


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

  try {
    const checkResult = await check({ DomainList: domainsToSearch.join(",") });

    if (!checkResult?.Results || checkResult.Results.length === 0) {
      return null;
    }

    const tldKeys = [...new Set(domainsToSearch.map((d) => d.split(".").pop() as string))];

    let pricings: Array<{ tld: string; price: number | null; renew: number | null; transfer: number | null; currency?: string | null }> =
      await db.query.pgDomainPricingCache.findMany({
        where: inArray(pgDomainPricingCache.tld, tldKeys),
      });

    // Fallback: busca direto na Namecheap para TLDs sem cache
    const missingTlds = tldKeys.filter((t) => !pricings.some((p) => p.tld === t));
    if (missingTlds.length > 0) {
      const settled = await Promise.allSettled(
        missingTlds.map(async (tld) => {
          const data = await namecheapApi.getPricing(tld);
          const p = data[0]?.Prices.find(
            (x) => x.Duration === 1 && x.DurationType === "YEAR"
          );
          const raw = p?.YourPrice ?? p?.Price ?? 0;
          return { tld, price: raw, renew: raw * 1.1, transfer: raw * 0.8, currency: p?.Currency?.toUpperCase() ?? "USD" };
        })
      );
      for (const result of settled) {
        if (result.status === "fulfilled" && result.value.price) {
          pricings.push(result.value);
        }
      }
    }

    const pricingRecord = Object.fromEntries(pricings.map((p) => [p.tld, p]));

    // Fetch config and exchange rate once, outside the loop
    const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
    let fee = 1;
    const flatFee = feeEnabled ? 4 : 0;
    if (feeEnabled) {
      try {
        const config = await db.query.pgSystemConfig.findFirst();
        fee = config ? 1 + (config.domainFee ?? 10) / 100 : 1.10;
      } catch { fee = 1.10; }
    }

    // Pre-fetch USD→BRL rate once for all conversions
    const hasUsdPricing = Object.values(pricingRecord).some(
      (p) => p.currency !== "BRL" && (p.price || p.renew || p.transfer)
    );
    let usdToBrlRate = 1;
    if (hasUsdPricing) {
      const [sampleBrl] = await currencyConversion.convertMultiple({
        from: "usd",
        to: "brl",
        amounts: [1],
      });
      usdToBrlRate = sampleBrl;
    }

    const domainDataMapped = checkResult.Results.map((domainDetail) => {
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

      if (!standardBrlPrices) {
        return {
          domain: fullDomainName,
          available: domainDetail.Available,
          priceBRL: 0,
          renewBRL: 0,
          transferBRL: 0,
          isPremium: domainDetail.IsPremiumName,
        };
      }

      const alreadyBrl = standardBrlPrices.currency === "BRL";
      const toPrice = (amount: number) =>
        alreadyBrl ? amount : amount * usdToBrlRate;

      return {
        domain: fullDomainName,
        available: domainDetail.Available,
        priceBRL: toPrice(standardBrlPrices.price ?? 0) * fee + flatFee,
        renewBRL: toPrice(standardBrlPrices.renew ?? 0) * fee + flatFee,
        transferBRL: toPrice(standardBrlPrices.transfer ?? 0) * fee + flatFee,
        isPremium: domainDetail.IsPremiumName,
      };
    });

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
  } catch (error) {
    console.error("Error fetching domain data:", error);
    return null;
  }
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
