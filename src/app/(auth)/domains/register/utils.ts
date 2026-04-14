import { namecheapApi } from "@/lib/server/apis/namecheap";
import type {
  DomainsCheckCleanedResponse,
  DomainsCheckUserParams,
} from "@/lib/server/apis/namecheap/types";
import { cache } from "react";
import type { DomainPricing } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import type { DomainData } from "@/app/(auth)/domains/register/types";

export const getDomainData = cache(async function getDomainData(
  searchQuery: string
): Promise<DomainData> {
  "use cache";

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
    namecheapApi.getPricing(),
  ]);

  if (!checkResult?.Results || checkResult.Results.length === 0) {
    return null;
  }

  const pricingRecord = Object.fromEntries(pricings.map((p) => [p.tld, p]));

  const domainDataMapped = await Promise.all(
    checkResult.Results.map(async (domainDetail) => {
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

      return {
        domain: fullDomainName,
        available: domainDetail.Available,
        priceBRL: await currencyConversion.convert({
          from: "usd",
          to: "brl",
          amount: standardBrlPrices.price ?? 0,
        }),
        renewBRL: await currencyConversion.convert({
          from: "usd",
          to: "brl",
          amount: standardBrlPrices.renew ?? 0,
        }),
        transferBRL: await currencyConversion.convert({
          from: "usd",
          to: "brl",
          amount: standardBrlPrices.transfer ?? 0,
        }),
        isPremium: domainDetail.IsPremiumName,
      };
    })
  );

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
