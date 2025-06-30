import type { DomainData } from "@/app/(auth)/domain/(register-transfer)/types";
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

    const pricings = await db.query.pgDomainPricingCache.findMany({
      where: inArray(
        pgDomainPricingCache.tld,
        domainsToSearch.map((d) => d.split(".").pop() as string)
      ),
    });

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

        const fee =
          1 + ((await db.query.pgSystemConfig.findFirst())?.domainFee ?? 1);

        return {
          domain: fullDomainName,
          available: domainDetail.Available,
          priceBRL:
            (await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: standardBrlPrices.price ?? 0,
            })) * fee,
          renewBRL:
            (await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: standardBrlPrices.renew ?? 0,
            })) * fee,
          transferBRL:
            (await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: standardBrlPrices.transfer ?? 0,
            })) * fee,
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
