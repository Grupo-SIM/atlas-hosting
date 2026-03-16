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

    let fee = 1.05;
    if (process.env.DOMAIN_FEE_ENABLED !== "false") {
      try {
        const config = await db.query.pgSystemConfig.findFirst();
        fee = config ? 1 + (config.domainFee ?? 5) / 100 : 1.05;
      } catch {
        fee = 1.05;
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

        if (!pricing) {
          return {
            domain: fullDomainName,
            available: domainDetail.Available,
            priceBRL: 0,
            renewBRL: 0,
            transferBRL: 0,
            isPremium: domainDetail.IsPremiumName,
          };
        }

        const alreadyBrl = pricing.currency === "BRL";
        const toPrice = async (amount: number) =>
          alreadyBrl
            ? amount
            : await currencyConversion.convert({ from: "usd", to: "brl", amount });

        return {
          domain: fullDomainName,
          available: domainDetail.Available,
          priceBRL: (await toPrice(pricing.price ?? 0)) * fee,
          renewBRL: (await toPrice(pricing.renew ?? 0)) * fee,
          transferBRL: (await toPrice(pricing.transfer ?? 0)) * fee,
          isPremium: domainDetail.IsPremiumName,
        };
      })
    );
  } catch {
    return [];
  }
}
