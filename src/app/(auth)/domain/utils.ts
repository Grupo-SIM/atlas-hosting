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

    let pricings: Array<{ tld: string; price: number | null; renew: number | null; transfer: number | null; currency?: string | null; allPrices?: Record<number, number> }> =
      await db.query.pgDomainPricingCache.findMany({
        where: inArray(pgDomainPricingCache.tld, tldKeys),
      });

    // Fallback: busca direto na Namecheap para TLDs sem cache
    const missingTlds = tldKeys.filter((t) => !pricings.some((p) => p.tld === t));
    if (missingTlds.length > 0) {
      const settled = await Promise.allSettled(
        missingTlds.map(async (tld) => {
          const pricingData = await namecheapApi.getPricing(tld);
          const categories = pricingData?.ProductType?.Categories || [];
          
          const regCat = categories.find(c => c.Name.toUpperCase() === "REGISTER");
          const renewCat = categories.find(c => c.Name.toUpperCase() === "RENEW");
          const transCat = categories.find(c => c.Name.toUpperCase() === "TRANSFER");

          const get1YearPrice = (cat: any) => {
            const products = cat?.Products || [];
            const prod = products.find((p: any) => p.Name.toLowerCase() === tld.toLowerCase());
            if (!prod) return 0;
            const priceDetail = prod.Prices.find((p: any) => p.Duration === 1 && p.DurationType === "YEAR");
            return priceDetail?.YourPrice ?? priceDetail?.Price ?? 0;
          };

          const getAllYearPrices = (cat: any) => {
            const products = cat?.Products || [];
            const prod = products.find((p: any) => p.Name.toLowerCase() === tld.toLowerCase());
            if (!prod) return {};
            
            const yearPrices: Record<number, number> = {};
            prod.Prices.forEach((p: any) => {
              if (p.DurationType === "YEAR" && p.Duration >= 1 && p.Duration <= 10) {
                yearPrices[p.Duration] = p.YourPrice ?? p.Price ?? 0;
              }
            });
            return yearPrices;
          };

          const regPrices = getAllYearPrices(regCat);
          const p1 = regPrices[1] || 0;
          const renew = get1YearPrice(renewCat) || p1 * 1.2;
          const transfer = get1YearPrice(transCat) || p1;

          return { 
            tld, 
            price: p1, 
            renew: renew, 
            transfer: transfer, 
            currency: "USD",
            allPrices: regPrices
          };
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
    if (feeEnabled) {
      try {
        const envFeeValue = process.env.DOMAIN_PROFIT_FEE || process.env.NAMESILO_PROFIT_FEE;
        const envFee = envFeeValue ? parseFloat(envFeeValue) : undefined;
        // Se o valor no env for 0.20, tratamos como 20%. Se for 20, tratamos como 20%.
        const envFeeNormalized = envFee !== undefined ? (envFee > 0 && envFee < 1 ? envFee * 100 : envFee) : undefined;
        
        const config = await db.query.pgSystemConfig.findFirst();
        const finalFeePercent = envFeeNormalized ?? config?.domainFee ?? 20;
        fee = 1 + finalFeePercent / 100;
      } catch { 
        fee = 1.20; 
      }
    }

    // Fetch USD→BRL rate once for all conversions and increments
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

      const alreadyBrl = standardBrlPrices?.currency === "BRL";
      const toPrice = (amount: number) =>
        alreadyBrl ? amount : amount * usdToBrlRate;

      let priceBRL = 0;
      let renewBRL = 0;
      let transferBRL = 0;

      if (domainDetail.IsPremiumName && (domainDetail.PremiumRegistrationPrice ?? 0) > 0) {
        priceBRL = toPrice(domainDetail.PremiumRegistrationPrice ?? 0) * fee;
        renewBRL = toPrice(domainDetail.PremiumRenewalPrice ?? 0) * fee;
        transferBRL = toPrice(domainDetail.PremiumTransferPrice ?? 0) * fee;
      } else if (standardBrlPrices?.price) {
        priceBRL = toPrice(standardBrlPrices.price ?? 0) * fee;
        renewBRL = toPrice(standardBrlPrices.renew ?? 0) * fee;
        transferBRL = toPrice(standardBrlPrices.transfer ?? 0) * fee;
      }

      let multiYearPricesBRL: Record<number, number> = {};

      if (standardBrlPrices?.allPrices && Object.keys(standardBrlPrices.allPrices).length > 0) {
        for (const [year, usdPrice] of Object.entries(standardBrlPrices.allPrices)) {
          const yearNum = parseInt(year, 10);
          multiYearPricesBRL[yearNum] = Math.round(toPrice(usdPrice as number) * fee * 100) / 100;
        }
      } else {
        // Fallback robusto caso não tenhamos a tabela
        multiYearPricesBRL[1] = priceBRL;
        for (let year = 2; year <= 10; year++) {
          const total = priceBRL + (renewBRL * (year - 1));
          multiYearPricesBRL[year] = Math.round(total * 100) / 100;
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
              multiYearPricesBRL: undefined,
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
