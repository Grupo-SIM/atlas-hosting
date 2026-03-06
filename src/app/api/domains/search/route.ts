import { NextRequest, NextResponse } from "next/server";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { umblerApi, UMBLER_TLD_PRICES } from "@/lib/server/apis/umbler";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { inArray } from "drizzle-orm";

// ── TLD lists ──────────────────────────────────────────────────────────────

// International TLDs served by Namecheap
const popularTlds: `.${string}`[] = [
  ".com",
  ".net",
  ".org",
  ".io",
  ".dev",
  ".co",
  ".app",
  ".online",
  ".xyz",
  ".site",
  ".store",
  ".tech",
  ".space",
  ".cloud",
  ".world",
  ".live",
  ".art",
  ".design",
  ".fit",
  ".ink",
  ".inc",
];

// ── Helpers ────────────────────────────────────────────────────────────────

interface DomainResult {
  domain: string;
  available: boolean;
  priceBRL: number;
  renewBRL: number;
  transferBRL: number;
  isPremium: boolean;
  provider: "namecheap" | "umbler";
}

const isValidTld = (tld: string): boolean => {
  const tldName = tld.replace(/^\./, "");
  if (tldName.length < 2 || tldName.length > 63) return false;
  if (!/^[a-z0-9-]+$/.test(tldName)) return false;
  if (!/^[a-z0-9].*[a-z0-9]$/.test(tldName)) return false;
  if (/^[0-9]/.test(tldName)) return false;
  return true;
};

// ── Route handler ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NAMECHEAP_API_USER || !process.env.NAMECHEAP_API_KEY) {
      console.error("Missing Namecheap API environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10))
    );

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Extract SLD (name without TLD)
    const domainNameOnly = query.includes(".")
      ? query.split(".")[0]
      : query;

    // Detect if user explicitly searched for a .br TLD
    const queryTld = query.includes(".")
      ? query.split(".").slice(1).join(".").toLowerCase()
      : "";
    const isBrTld = queryTld.endsWith("br");

    // ── 1. Build Namecheap domain list ───────────────────────────────────
    const ncTldsToUse = popularTlds.filter(isValidTld);
    let ncDomainsToSearch = ncTldsToUse.map(
      (tld) => `${domainNameOnly}${tld}`
    );

    // Include exact query only if it's a single-level, non-.br TLD
    if (query.includes(".") && !ncDomainsToSearch.includes(query)) {
      const parts = query.split(".");
      const isSingleLevel = parts.length === 2;
      if (isSingleLevel && !isBrTld) {
        ncDomainsToSearch.unshift(query);
      }
    }
    ncDomainsToSearch = [...new Set(ncDomainsToSearch)];

    const MAX_PER_BATCH = 30;
    const ncBatches: string[][] = [];
    for (let i = 0; i < ncDomainsToSearch.length; i += MAX_PER_BATCH) {
      ncBatches.push(ncDomainsToSearch.slice(i, i + MAX_PER_BATCH));
    }

    // ── 2. Fire Namecheap + Umbler checks in parallel ─────────────────────
    const [ncBatchResults, umblerResults] = await Promise.all([
      // Namecheap (international TLDs)
      Promise.allSettled(
        ncBatches.map((batch) =>
          namecheapApi.check({ DomainList: batch.join(",") })
        )
      ),
      // Umbler (.br TLDs) — only if credentials are configured
      umblerApi.isConfigured
        ? umblerApi.checkAvailability(domainNameOnly).catch((err) => {
            console.error("Umbler availability check failed:", err);
            return [];
          })
        : Promise.resolve([]),
    ]);

    // Collect Namecheap results
    const ncResults = ncBatchResults.flatMap((r) => {
      if (r.status === "fulfilled") return r.value.Results || [];
      console.error("Namecheap batch failed (skipped):", r.reason);
      return [];
    });

    const allNcFailed =
      ncResults.length === 0 &&
      ncBatchResults.some((r) => r.status === "rejected");

    if (allNcFailed) {
      const firstRejected = ncBatchResults.find(
        (r) => r.status === "rejected"
      ) as PromiseRejectedResult;
      const errorMessage =
        firstRejected.reason instanceof Error
          ? firstRejected.reason.message
          : String(firstRejected.reason);

      if (
        errorMessage.includes("Invalid request IP") ||
        errorMessage.includes("5050166")
      ) {
        const ipMatch = errorMessage.match(/Invalid request IP: (\d+\.\d+\.\d+\.\d+)/);
        const detectedIP = ipMatch?.[1] ?? process.env.PUBLIC_IP ?? "não detectado";
        const isDev = !process.env.VERCEL_ENV;
        return NextResponse.json(
          {
            error: "IP não autorizado na Namecheap",
            details: `O IP ${detectedIP} precisa ser adicionado à whitelist da Namecheap.${isDev ? " (ambiente de desenvolvimento)" : ""}`,
            detectedIP,
            isDev,
          },
          { status: 403 }
        );
      }
      throw new Error(`Namecheap API error: ${errorMessage}`);
    }

    // ── 3. Get system fee multiplier ─────────────────────────────────────
    let fee = 1.05; // default 5%
    try {
      const systemConfig = await db.query.pgSystemConfig.findFirst();
      if (systemConfig) {
        const feePercentage = systemConfig.domainFee ?? 5.0;
        fee = 1 + feePercentage / 100;
      }
    } catch {
      // use default
    }

    // ── 4. Get USD→BRL rate once ─────────────────────────────────────────
    let usdToBrlRate = 1;
    try {
      usdToBrlRate = await currencyConversion.convert({
        from: "usd",
        to: "brl",
        amount: 1,
      });
    } catch {
      console.error("Currency conversion failed, using rate 1");
    }

    // ── 5. Get Namecheap pricing (DB cache → API fallback) ───────────────
    const ncTlds = [
      ...new Set(
        ncDomainsToSearch.map((d) => d.split(".").pop() as string).filter(Boolean)
      ),
    ];

    let ncPricings: Array<{
      tld: string;
      price?: number | null;
      renew?: number | null;
      transfer?: number | null;
      currency?: string;
    }> = [];

    try {
      ncPricings = await db.query.pgDomainPricingCache.findMany({
        where: inArray(pgDomainPricingCache.tld, ncTlds),
      });
    } catch {
      // DB not available
    }

    if (ncPricings.length === 0) {
      const settled = await Promise.allSettled(
        ncTlds.map(async (tld) => {
          try {
            const data = await namecheapApi.getPricing(tld);
            const price1yr = data[0]?.Prices.find(
              (p) => p.Duration === 1 && p.DurationType === "YEAR"
            );
            const currency = price1yr?.Currency?.toUpperCase() ?? "USD";
            const raw = price1yr?.YourPrice ?? price1yr?.Price ?? 0;
            return { tld, price: raw, renew: raw * 1.1, transfer: raw * 0.8, currency };
          } catch {
            return { tld, price: null, renew: null, transfer: null };
          }
        })
      );
      ncPricings = settled
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<typeof ncPricings[0]>).value)
        .filter((p) => p.price !== null);
    }

    const ncPricingRecord = Object.fromEntries(
      ncPricings.map((p) => [p.tld, p])
    );

    // ── 6. Map Namecheap results → DomainResult ───────────────────────────
    const validNcTldsSet = new Set(
      ncTldsToUse.map((t) => t.replace(/^\./, "").toLowerCase())
    );
    if (queryTld && !isBrTld) validNcTldsSet.add(queryTld);

    const ncMapped: DomainResult[] = await Promise.all(
      ncResults
        .filter((d) => {
          const parts = d.Domain.split(".");
          if (parts.length < 2) return false;
          const tld = parts.slice(-1)[0].toLowerCase();
          return validNcTldsSet.has(tld);
        })
        .map(async (d) => {
          const tldForLookup = (() => {
            let best = "";
            for (const k of Object.keys(ncPricingRecord)) {
              if (
                d.Domain.toLowerCase().endsWith(`.${k}`) &&
                k.length > best.length
              )
                best = k;
            }
            return best || d.Domain.split(".").slice(-1)[0].toLowerCase();
          })();

          const pricing = ncPricingRecord[tldForLookup];
          let priceBRL = 0;
          let renewBRL = 0;
          let transferBRL = 0;

          if (d.IsPremiumName && (d.PremiumRegistrationPrice ?? 0) > 0) {
            priceBRL = (d.PremiumRegistrationPrice ?? 0) * fee;
            renewBRL = (d.PremiumRenewalPrice ?? 0) * fee;
            transferBRL = (d.PremiumTransferPrice ?? 0) * fee;
          } else if (pricing?.price) {
            const isAlreadyBrl =
              (pricing as { currency?: string }).currency === "BRL";
            const base = isAlreadyBrl
              ? (pricing.price ?? 0)
              : (pricing.price ?? 0) * usdToBrlRate;
            const baseRenew = isAlreadyBrl
              ? (pricing.renew ?? 0)
              : (pricing.renew ?? 0) * usdToBrlRate;
            const baseTransfer = isAlreadyBrl
              ? (pricing.transfer ?? 0)
              : (pricing.transfer ?? 0) * usdToBrlRate;
            priceBRL = base * fee;
            renewBRL = baseRenew * fee;
            transferBRL = baseTransfer * fee;
          }

          return {
            domain: d.Domain,
            available: d.Available,
            priceBRL,
            renewBRL,
            transferBRL,
            isPremium: d.IsPremiumName,
            provider: "namecheap" as const,
          };
        })
    );

    // ── 7. Map Umbler results → DomainResult ─────────────────────────────
    const umblerMapped: DomainResult[] = (umblerResults as Awaited<ReturnType<typeof umblerApi.checkAvailability>>).map(
      (r) => {
        const tld = r.domain.includes(".")
          ? r.domain.split(".").slice(1).join(".")
          : "";
        const pricing = UMBLER_TLD_PRICES[tld];

        let priceBRL = 0;
        let renewBRL = 0;
        let transferBRL = 0;

        if (pricing) {
          priceBRL = pricing.registerBRL * fee;
          renewBRL = pricing.renewBRL * fee;
          transferBRL = pricing.transferBRL * fee;
        }

        const available = r.status === "Available";

        return {
          domain: r.domain,
          available,
          priceBRL,
          renewBRL,
          transferBRL,
          isPremium: false,
          provider: "umbler" as const,
        };
      }
    );

    // ── 8. Combine, find main, paginate ───────────────────────────────────
    const allResults = [...ncMapped, ...umblerMapped];

    if (allResults.length === 0) {
      return NextResponse.json({
        main: {
          domain: query,
          available: false,
          priceBRL: 0,
          renewBRL: 0,
          transferBRL: 0,
          isPremium: false,
          provider: null,
        },
        suggestions: [],
        pagination: { page: 1, pageSize, total: 0, totalPages: 0 },
      });
    }

    // Main = the domain that exactly matches the query
    let mainDomain = allResults.find(
      (r) => r.domain.toLowerCase() === query.toLowerCase()
    );
    if (!mainDomain) {
      // Prefer first available, otherwise first result
      mainDomain = allResults.find((r) => r.available) ?? allResults[0];
    }

    const suggestions = allResults.filter(
      (r) => r.domain.toLowerCase() !== mainDomain!.domain.toLowerCase()
    );
    const start = (page - 1) * pageSize;
    const pagedSuggestions = suggestions.slice(start, start + pageSize);

    return NextResponse.json({
      main: mainDomain,
      suggestions: pagedSuggestions,
      pagination: {
        page,
        pageSize,
        total: suggestions.length,
        totalPages: Math.ceil(suggestions.length / pageSize),
      },
    });
  } catch (error) {
    console.error("Error searching domains:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Failed to search domains",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
