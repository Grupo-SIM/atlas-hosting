"use server";

import type { DomainWithAvailability } from "@/app/(auth)/domain/types";
import { db } from "@/lib/db";
import { pgDomainPricingCache, pgSystemConfig } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { inArray } from "drizzle-orm";

const extendedTlds: `.${string}`[] = [
  ".club",
  ".info",
  ".biz",
  ".shop",
  ".store",
  ".tech",
  ".site",
  ".website",
  ".space",
  ".pro",
  ".digital",
  ".media",
  ".cloud",
  ".press",
  ".agency",
  ".solutions",
  ".world",
];

export async function loadMoreDomainSuggestions(
  domainName: string
): Promise<DomainWithAvailability[]> {
  const domainsToCheck = extendedTlds.map((tld) => `${domainName}${tld}`);

  try {
    const checkResult = await namecheapApi.check({
      DomainList: domainsToCheck.join(","),
    });

    if (!checkResult?.Results || checkResult.Results.length === 0) return [];

    const tldKeys = extendedTlds.map((t) => t.substring(1));

    let pricings: Array<{
      tld: string;
      price: number | null;
      renew: number | null;
      transfer: number | null;
      currency?: string | null;
    }> = await db.query.pgDomainPricingCache.findMany({
      where: inArray(pgDomainPricingCache.tld, tldKeys),
    });

    const missingTlds = tldKeys.filter((t) => !pricings.some((p) => p.tld === t));
    if (missingTlds.length > 0) {
      const settled = await Promise.allSettled(
        missingTlds.map(async (tld) => {
          const data = await namecheapApi.getPricing(tld);
          const p = data[0]?.Prices.find(
            (x) => x.Duration === 1 && x.DurationType === "YEAR"
          );
          const raw = p?.YourPrice ?? p?.Price ?? 0;
          return {
            tld,
            price: raw,
            renew: raw * 1.1,
            transfer: raw * 0.8,
            currency: p?.Currency?.toUpperCase() ?? "USD",
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

    return await Promise.all(
      checkResult.Results.map(async (domainDetail) => {
        const fullDomainName = domainDetail.Domain;
        const parts = fullDomainName.split(".");
        let tldForLookup = "";

        if (parts.length > 1) {
          let bestMatch = "";
          for (const knownTld of Object.keys(pricingRecord)) {
            if (
              fullDomainName.toLowerCase().endsWith(`.${knownTld}`) &&
              knownTld.length > bestMatch.length
            ) {
              bestMatch = knownTld;
            }
          }
          tldForLookup =
            bestMatch ||
            parts.slice(parts.length > 2 ? -2 : -1).join(".").toLowerCase();
        }

        const pricing = pricingRecord[tldForLookup];
        const alreadyBrl = pricing?.currency === "BRL";
        const toPrice = async (amount: number) =>
          alreadyBrl
            ? amount
            : await currencyConversion.convert({ from: "usd", to: "brl", amount });

        let priceBRL = 0;
        let renewBRL = 0;
        let transferBRL = 0;

        if (domainDetail.IsPremiumName && (domainDetail.PremiumRegistrationPrice ?? 0) > 0) {
          priceBRL = (domainDetail.PremiumRegistrationPrice ?? 0) * fee;
          renewBRL = (domainDetail.PremiumRenewalPrice ?? 0) * fee;
          transferBRL = (domainDetail.PremiumTransferPrice ?? 0) * fee;
        } else if (pricing?.price) {
          priceBRL = (await toPrice(pricing.price ?? 0)) * fee;
          renewBRL = (await toPrice(pricing.renew ?? 0)) * fee;
          transferBRL = (await toPrice(pricing.transfer ?? 0)) * fee;
        }

        return {
          domain: fullDomainName,
          available: (domainDetail.Available || (domainDetail.IsPremiumName && priceBRL > 0)) && priceBRL > 0,
          priceBRL,
          renewBRL,
          transferBRL,
          isPremium: domainDetail.IsPremiumName,
        };
      })
    );
  } catch {
    return [];
  }
}
