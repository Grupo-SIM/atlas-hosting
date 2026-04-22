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

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isNamecheapRateLimit(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /too many requests/i.test(msg) ||
    /500000/i.test(msg) ||
    /rate ?limit/i.test(msg)
  );
}

async function namecheapCheckBatch(domainList: string): Promise<Awaited<ReturnType<typeof namecheapApi.check>>> {
  try {
    return await namecheapApi.check({ DomainList: domainList });
  } catch (e) {
    if (isNamecheapRateLimit(e)) {
      await sleep(2000);
      return await namecheapApi.check({ DomainList: domainList });
    }
    throw e;
  }
}

// Cache de resultados em memória (simples para dev/pequena escala)
const SEARCH_CACHE = new Map<string, {
  data: any;
  timestamp: number;
}>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutos

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NAMECHEAP_API_USER || !process.env.NAMECHEAP_API_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() ?? "";
    const pageString = searchParams.get("page") || "1";
    const pageSizeString = searchParams.get("pageSize") || "20";
    const page = Math.max(1, parseInt(pageString, 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(pageSizeString, 10)));

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    // 1. Verificamos Cache primeiro
    const cacheKey = query.toLowerCase();
    const cached = SEARCH_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      const suggestions = cached.data.suggestions;
      const pagedSuggestions = suggestions.slice((page - 1) * pageSize, page * pageSize);
      return NextResponse.json({
        main: cached.data.main,
        suggestions: pagedSuggestions,
        pagination: {
          page,
          pageSize,
          total: suggestions.length,
          totalPages: Math.ceil(suggestions.length / pageSize),
        },
      });
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

    // Batches (Namecheap aceita até 50)
    const MAX_PER_BATCH = 50; 
    const batches: string[][] = [];
    for (let i = 0; i < domainsToSearch.length; i += MAX_PER_BATCH) {
      batches.push(domainsToSearch.slice(i, i + MAX_PER_BATCH));
    }

    // Checa disponibilidade. Se for apenas 1 lote, não precisa de sleep.
    const batchResults: PromiseSettledResult<Awaited<ReturnType<typeof namecheapApi.check>>>[] = [];
    if (batches.length === 1) {
      const batch = batches[0]!;
      try {
        const value = await namecheapCheckBatch(batch.join(","));
        batchResults.push({ status: "fulfilled", value });
      } catch (reason) {
        batchResults.push({ status: "rejected", reason });
      }
    } else {
      for (let i = 0; i < batches.length; i++) {
        if (i > 0) await sleep(600);
        const batch = batches[i]!;
        try {
          const value = await namecheapCheckBatch(batch.join(","));
          batchResults.push({ status: "fulfilled", value });
        } catch (reason) {
          batchResults.push({ status: "rejected", reason });
        }
      }
    }

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

    // Taxa de câmbio USD→BRL (uma única chamada)
    let usdToBrl = 5.90; // Fallback conservador e seguro (nunca 1.0)
    try {
      const val = await currencyConversion.convert({ from: "usd", to: "brl", amount: 1 });
      if (val > 0) usdToBrl = val;
    } catch { /* usa o fallback de 5.90 */ }

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

    // Só chama getPricing para TLDs que faltam no DB, em paralelo (limitado ou staggered)
    const missingTlds = tldKeys.filter((tld) => !pricingRows.some((p) => p.tld === tld));
    if (missingTlds.length > 0) {
      // Usamos Promise.all para ser mais rápido, Namecheap aguenta algumas requisições paralelas de pricing
      await Promise.all(
        missingTlds.map(async (tld, index) => {
          if (index > 0) await sleep(Math.floor(Math.random() * 100));
          try {
            const data = await namecheapApi.getPricing(tld);
            const p = data[0]?.Prices.find((x) => x.Duration === 1 && x.DurationType === "YEAR");
            const raw = p?.YourPrice ?? p?.Price ?? 0;
            if (raw > 0) {
              const currency = p?.Currency?.toUpperCase() ?? "USD";
              pricingRows.push({
                tld,
                price: raw,
                renew: raw * 1.1,
                transfer: raw * 0.8,
                currency,
              });
            }
          } catch (e) {
            console.error(`Error fetching pricing for ${tld}:`, e);
          }
        })
      );
    }

    const pricingMap = Object.fromEntries(pricingRows.map((p) => [p.tld, p]));

    // TLDs válidos para filtrar resultados
    const validTlds = new Set(SUPPORTED_TLDS.map((t) => t.replace(/^\./, "").toLowerCase()));
    if (queryTld && query.split(".").length === 2) validTlds.add(queryTld);

    // Mapeia resultados
    const mapped = (await Promise.all(
      results
        .filter((d) => {
          const tld = d.Domain.split(".").pop()?.toLowerCase() ?? "";
          return validTlds.has(tld);
        })
        .map(async (d) => {
          const tldKey = (() => {
            let best = "";
            for (const k of Object.keys(pricingMap)) {
              if (d.Domain.toLowerCase().endsWith(`.${k}`) && k.length > best.length) best = k;
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
            priceBRL = (alreadyBrl ? (pricing.price ?? 0) : (pricing.price ?? 0) * usdToBrl) * fee;
            renewBRL = (alreadyBrl ? (pricing.renew ?? 0) : (pricing.renew ?? 0) * usdToBrl) * fee;
            transferBRL = (alreadyBrl ? (pricing.transfer ?? 0) : (pricing.transfer ?? 0) * usdToBrl) * fee;
          }

          // Segurança: Se o preço deu 0 e o domínio estava "disponível", forçamos indisponível
          // para nunca exibir preço 0 para algo que o usuário queira comprar.
          // Premium: se for premium e tiver preço, consideramos disponível mesmo que o Available da NC venha false.
          const isActuallyAvailable = (d.Available || (d.IsPremiumName && priceBRL > 0)) && priceBRL > 0;

          return {
            domain: d.Domain,
            available: isActuallyAvailable,
            priceBRL,
            renewBRL,
            transferBRL,
            isPremium: d.IsPremiumName,
          };
        })
    )).filter(r => !r.available || r.priceBRL > 0); // Filtra qualquer erro residual de preço 0 em disponíveis

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

    const suggestions = mapped.filter((r) => r.domain.toLowerCase() !== mainDomain.domain.toLowerCase());

    // 2. Salva no Cache antes de paginar
    const finalData = { main: mainDomain, suggestions };
    SEARCH_CACHE.set(cacheKey, { data: finalData, timestamp: Date.now() });

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
