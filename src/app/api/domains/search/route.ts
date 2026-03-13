import { NextRequest, NextResponse } from "next/server";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { inArray } from "drizzle-orm";

// TLDs suportados pela Namecheap (single-level apenas)
const SUPPORTED_TLDS: `.${string}`[] = [
  ".com", ".net", ".org", ".io", ".dev", ".co", ".app",
  ".online", ".xyz", ".site", ".store", ".tech", ".space",
  ".cloud", ".world", ".live", ".art", ".design", ".fit",
  ".ink", ".inc",
];

// Padrões de TLDs NÃO suportados pela Namecheap
const UNSUPPORTED_TLD_PATTERNS = [
  /\.com\.br$/, /\.net\.br$/, /\.org\.br$/, /\.br$/,
  /\.com\.mx$/, /\.com\.ar$/, /\.co\.uk$/,
];

const isUnsupportedTld = (domain: string): boolean =>
  UNSUPPORTED_TLD_PATTERNS.some((re) => re.test(domain.toLowerCase()));

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NAMECHEAP_API_USER || !process.env.NAMECHEAP_API_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    // Se o usuário pesquisou um TLD não suportado, retorna mensagem clara
    if (isUnsupportedTld(query)) {
      const tld = query.includes(".") ? query.split(".").slice(1).join(".") : "";
      return NextResponse.json({
        main: {
          domain: query,
          available: false,
          priceBRL: 0,
          renewBRL: 0,
          transferBRL: 0,
          isPremium: false,
          unavailableReason: `Domínios .${tld} não estão disponíveis em nossa plataforma no momento.`,
        },
        suggestions: [],
        pagination: { page: 1, pageSize, total: 0, totalPages: 0 },
      });
    }

    const domainNameOnly = query.includes(".") ? query.split(".")[0] : query;
    const queryTld = query.includes(".")
      ? query.split(".").slice(1).join(".").toLowerCase()
      : "";

    // Monta lista de domínios a checar
    let domainsToSearch = SUPPORTED_TLDS.map((tld) => `${domainNameOnly}${tld}`);

    // Adiciona o domínio exato se for single-level e suportado
    if (queryTld && query.split(".").length === 2 && !domainsToSearch.includes(query)) {
      domainsToSearch.unshift(query);
    }
    domainsToSearch = [...new Set(domainsToSearch)];

    // Batches (Namecheap aceita até 50, usamos 30 por segurança)
    const MAX_PER_BATCH = 30;
    const batches: string[][] = [];
    for (let i = 0; i < domainsToSearch.length; i += MAX_PER_BATCH) {
      batches.push(domainsToSearch.slice(i, i + MAX_PER_BATCH));
    }

    // Checa disponibilidade via Namecheap
    const batchResults = await Promise.allSettled(
      batches.map((batch) => namecheapApi.check({ DomainList: batch.join(",") }))
    );

    const results = batchResults.flatMap((r) => {
      if (r.status === "fulfilled") return r.value.Results ?? [];
      console.error("Namecheap batch failed:", r.reason);
      return [];
    });

    // Se todos os batches falharam, verifica o tipo de erro
    if (results.length === 0 && batchResults.every((r) => r.status === "rejected")) {
      const firstError = (batchResults[0] as PromiseRejectedResult).reason;
      const msg = firstError instanceof Error ? firstError.message : String(firstError);

      if (msg.includes("Invalid request IP") || msg.includes("5050166")) {
        const ip =
          msg.match(/Invalid request IP: (\d+\.\d+\.\d+\.\d+)/)?.[1] ??
          process.env.PUBLIC_IP ??
          "desconhecido";
        return NextResponse.json(
          { error: "IP não autorizado na Namecheap", detectedIP: ip },
          { status: 403 }
        );
      }
      throw new Error(msg);
    }

    // Taxa de margem
    const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
    let fee = 1;
    if (feeEnabled) {
      try {
        const config = await db.query.pgSystemConfig.findFirst();
        fee = config ? 1 + (config.domainFee ?? 5) / 100 : 1.05;
      } catch { fee = 1.05; }
    }

    // Taxa de câmbio USD→BRL (uma única chamada)
    let usdToBrl = 1;
    try {
      usdToBrl = await currencyConversion.convert({ from: "usd", to: "brl", amount: 1 });
    } catch { /* usa 1 como fallback */ }

    // Preços do DB cache
    const tldKeys = [
      ...new Set(domainsToSearch.map((d) => d.split(".").pop()!).filter(Boolean)),
    ];
    let pricingRows: Array<{
      tld: string;
      price?: number | null;
      renew?: number | null;
      transfer?: number | null;
      currency?: string;
    }> = [];

    try {
      pricingRows = await db.query.pgDomainPricingCache.findMany({
        where: inArray(pgDomainPricingCache.tld, tldKeys),
      });
    } catch { /* sem DB */ }

    // Fallback: busca direto na Namecheap para TLDs sem cache
    if (pricingRows.length === 0) {
      const settled = await Promise.allSettled(
        tldKeys.map(async (tld) => {
          try {
            const data = await namecheapApi.getPricing(tld);
            const p = data[0]?.Prices.find(
              (x) => x.Duration === 1 && x.DurationType === "YEAR"
            );
            const raw = p?.YourPrice ?? p?.Price ?? 0;
            const currency = p?.Currency?.toUpperCase() ?? "USD";
            return { tld, price: raw, renew: raw * 1.1, transfer: raw * 0.8, currency };
          } catch {
            return { tld, price: null, renew: null, transfer: null };
          }
        })
      );
      pricingRows = settled
        .filter((r) => r.status === "fulfilled")
        .map((r) => (r as PromiseFulfilledResult<typeof pricingRows[0]>).value)
        .filter((p) => p.price != null);
    }

    const pricingMap = Object.fromEntries(pricingRows.map((p) => [p.tld, p]));

    // TLDs válidos para filtrar resultados
    const validTlds = new Set(
      SUPPORTED_TLDS.map((t) => t.replace(/^\./, "").toLowerCase())
    );
    if (queryTld && query.split(".").length === 2) validTlds.add(queryTld);

    // Mapeia resultados
    const mapped = await Promise.all(
      results
        .filter((d) => {
          const tld = d.Domain.split(".").pop()?.toLowerCase() ?? "";
          return validTlds.has(tld);
        })
        .map(async (d) => {
          const tldKey = (() => {
            let best = "";
            for (const k of Object.keys(pricingMap)) {
              if (
                d.Domain.toLowerCase().endsWith(`.${k}`) &&
                k.length > best.length
              )
                best = k;
            }
            return best || d.Domain.split(".").pop()!.toLowerCase();
          })();

          const pricing = pricingMap[tldKey];
          let priceBRL = 0, renewBRL = 0, transferBRL = 0;

          if (d.IsPremiumName && (d.PremiumRegistrationPrice ?? 0) > 0) {
            priceBRL = (d.PremiumRegistrationPrice ?? 0) * fee;
            renewBRL = (d.PremiumRenewalPrice ?? 0) * fee;
            transferBRL = (d.PremiumTransferPrice ?? 0) * fee;
          } else if (pricing?.price) {
            const alreadyBrl = (pricing as { currency?: string }).currency === "BRL";
            priceBRL =
              (alreadyBrl ? (pricing.price ?? 0) : (pricing.price ?? 0) * usdToBrl) * fee;
            renewBRL =
              (alreadyBrl ? (pricing.renew ?? 0) : (pricing.renew ?? 0) * usdToBrl) * fee;
            transferBRL =
              (alreadyBrl
                ? (pricing.transfer ?? 0)
                : (pricing.transfer ?? 0) * usdToBrl) * fee;
          }

          return {
            domain: d.Domain,
            available: d.Available,
            priceBRL,
            renewBRL,
            transferBRL,
            isPremium: d.IsPremiumName,
          };
        })
    );

    const mainDomain =
      mapped.find((r) => r.domain.toLowerCase() === query.toLowerCase()) ??
      mapped.find((r) => r.available) ??
      mapped[0] ?? {
        domain: query,
        available: false,
        priceBRL: 0,
        renewBRL: 0,
        transferBRL: 0,
        isPremium: false,
      };

    const suggestions = mapped.filter(
      (r) => r.domain.toLowerCase() !== mainDomain.domain.toLowerCase()
    );
    const pagedSuggestions = suggestions.slice((page - 1) * pageSize, page * pageSize);

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
    console.error("Domain search error:", error);
    return NextResponse.json(
      {
        error: "Failed to search domains",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
