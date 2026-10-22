import { inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { getDomainPricing, namecheapApi } from "@/lib/server/apis/namecheap";

// TLDs suportados pela Namecheap (single-level apenas)
const SUPPORTED_TLDS: `.${string}`[] = [
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

// Padrões de TLDs NÃO suportados pela Namecheap
const UNSUPPORTED_TLD_PATTERNS = [
  /\.com\.br$/,
  /\.net\.br$/,
  /\.org\.br$/,
  /\.br$/,
  /\.com\.mx$/,
  /\.com\.ar$/,
  /\.co\.uk$/,
];

const isUnsupportedTld = (domain: string): boolean =>
  UNSUPPORTED_TLD_PATTERNS.some(re => re.test(domain.toLowerCase()));

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function isNamecheapRateLimit(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /too many requests/i.test(msg) ||
    /500000/i.test(msg) ||
    /rate ?limit/i.test(msg)
  );
}

async function namecheapCheckBatch(
  domainList: string
): Promise<Awaited<ReturnType<typeof namecheapApi.check>>> {
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
const SEARCH_CACHE = new Map<
  string,
  {
    data: any;
    timestamp: number;
  }
>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutos

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NAMECHEAP_API_USER || !process.env.NAMECHEAP_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() ?? "";
    const pageString = searchParams.get("page") || "1";
    const pageSizeString = searchParams.get("pageSize") || "20";
    const page = Math.max(1, Number.parseInt(pageString, 10));
    const pageSize = Math.min(
      50,
      Math.max(5, Number.parseInt(pageSizeString, 10))
    );

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // 1. Verificamos Cache primeiro
    const cacheKey = query.toLowerCase();
    const cached = SEARCH_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      const suggestions = cached.data.suggestions;
      const pagedSuggestions = suggestions.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      return NextResponse.json({
        main: cached.data.main,
        pagination: {
          page,
          pageSize,
          total: suggestions.length,
          totalPages: Math.ceil(suggestions.length / pageSize),
        },
        suggestions: pagedSuggestions,
      });
    }

    // Se o usuário pesquisou um TLD não suportado, retorna mensagem clara
    if (isUnsupportedTld(query)) {
      const tld = query.includes(".")
        ? query.split(".").slice(1).join(".")
        : "";
      return NextResponse.json({
        main: {
          available: false,
          domain: query,
          isPremium: false,
          priceBRL: 0,
          renewBRL: 0,
          transferBRL: 0,
          unavailableReason: `Domínios .${tld} não estão disponíveis em nossa plataforma no momento.`,
        },
        pagination: { page: 1, pageSize, total: 0, totalPages: 0 },
        suggestions: [],
      });
    }

    const domainNameOnly = query.includes(".") ? query.split(".")[0] : query;
    const queryTld = query.includes(".")
      ? query.split(".").slice(1).join(".").toLowerCase()
      : "";

    // Monta lista de domínios a checar
    let domainsToSearch = SUPPORTED_TLDS.map(tld => `${domainNameOnly}${tld}`);

    // Adiciona o domínio exato se for single-level e suportado
    if (
      queryTld &&
      query.split(".").length === 2 &&
      !domainsToSearch.includes(query)
    ) {
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
    const batchResults: PromiseSettledResult<
      Awaited<ReturnType<typeof namecheapApi.check>>
    >[] = [];
    if (batches.length === 1) {
      const batch = batches[0]!;
      try {
        const value = await namecheapCheckBatch(batch.join(","));
        batchResults.push({ status: "fulfilled", value });
      } catch (reason) {
        batchResults.push({ reason, status: "rejected" });
      }
    } else {
      for (let i = 0; i < batches.length; i++) {
        if (i > 0) await sleep(600);
        const batch = batches[i]!;
        try {
          const value = await namecheapCheckBatch(batch.join(","));
          batchResults.push({ status: "fulfilled", value });
        } catch (reason) {
          batchResults.push({ reason, status: "rejected" });
        }
      }
    }

    const results = batchResults.flatMap(r => {
      if (r.status === "fulfilled") return r.value.Results ?? [];
      console.error("Namecheap batch failed:", r.reason);
      return [];
    });

    // Se todos os batches falharam, verifica o tipo de erro
    if (
      results.length === 0 &&
      batchResults.every(r => r.status === "rejected")
    ) {
      const firstError = (batchResults[0] as PromiseRejectedResult).reason;
      const msg =
        firstError instanceof Error ? firstError.message : String(firstError);

      if (msg.includes("Invalid request IP") || msg.includes("5050166")) {
        const ip =
          msg.match(/Invalid request IP: (\d+\.\d+\.\d+\.\d+)/)?.[1] ??
          process.env.PUBLIC_IP ??
          "desconhecido";
        return NextResponse.json(
          { detectedIP: ip, error: "Serviço de pesquisa de domínios indisponível" },
          { status: 403 }
        );
      }
      throw new Error(msg);
    }

    // Taxa de margem
    const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
    let fee = 1;
    let fixedFee = 0;
    if (feeEnabled) {
      try {
        const envFeeValue =
          process.env.DOMAIN_PROFIT_FEE || process.env.NAMESILO_PROFIT_FEE;
        const envFee = envFeeValue ? Number.parseFloat(envFeeValue) : undefined;
        // Se o valor no env for 0.20, tratamos como 20%. Se for 20, tratamos como 20%.
        const envFeeNormalized =
          envFee !== undefined
            ? envFee > 0 && envFee < 1
              ? envFee * 100
              : envFee
            : undefined;

        const config = await db.query.pgSystemConfig.findFirst();
        const finalFeePercent = envFeeNormalized ?? config?.domainFee ?? 20;
        fee = 1 + finalFeePercent / 100;

        const envFixedFeeValue = process.env.DOMAIN_FIXED_FEE;
        fixedFee = envFixedFeeValue ? Number.parseFloat(envFixedFeeValue) : 0;
      } catch {
        fee = 1.2;
        fixedFee = 0;
      }
    }

    // Taxa de câmbio USD→BRL (uma única chamada)
    let usdToBrl = 5.9; // Fallback conservador e seguro (nunca 1.0)
    try {
      const val = await currencyConversion.convert({
        amount: 1,
        from: "usd",
        to: "brl",
      });
      if (val > 0) usdToBrl = val;
    } catch {
      /* usa o fallback de 5.90 */
    }

    // Preços do DB cache
    const tldKeys = [
      ...new Set(domainsToSearch.map(d => d.split(".").pop()!).filter(Boolean)),
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
    } catch {
      /* sem DB */
    }

    // Só chama getPricing para TLDs que faltam no DB, em paralelo (limitado ou staggered)
    const missingTlds = tldKeys.filter(
      tld => !pricingRows.some(p => p.tld === tld)
    );
    if (missingTlds.length > 0) {
      // Usamos Promise.all para ser mais rápido, Namecheap aguenta algumas requisições paralelas de pricing
      await Promise.all(
        missingTlds.map(async (tld, index) => {
          if (index > 0) await sleep(Math.floor(Math.random() * 100));
          try {
            const product = await getDomainPricing(tld);
            const p = product?.Prices.find(
              (x: any) => x.Duration === 1 && x.DurationType === "YEAR"
            );
            const raw = p?.YourPrice ?? p?.Price ?? 0;
            if (raw > 0) {
              const currency = p?.Currency?.toUpperCase() ?? "USD";
              pricingRows.push({
                currency,
                price: raw,
                renew: raw * 1.1,
                tld,
                transfer: raw * 0.8,
              });
            }
          } catch (e) {
            console.error(`Error fetching pricing for ${tld}:`, e);
          }
        })
      );
    }

    const pricingMap = Object.fromEntries(pricingRows.map(p => [p.tld, p]));

    // TLDs válidos para filtrar resultados
    const validTlds = new Set(
      SUPPORTED_TLDS.map(t => t.replace(/^\./, "").toLowerCase())
    );
    if (queryTld && query.split(".").length === 2) validTlds.add(queryTld);

    // Mapeia resultados
    const mapped = (
      await Promise.all(
        results
          .filter(d => {
            const tld = d.Domain.split(".").pop()?.toLowerCase() ?? "";
            return validTlds.has(tld);
          })
          .map(async d => {
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
            let priceBRL = 0,
              renewBRL = 0,
              transferBRL = 0;

            if (d.IsPremiumName && (d.PremiumRegistrationPrice ?? 0) > 0) {
              priceBRL =
                (d.PremiumRegistrationPrice ?? 0) * usdToBrl * fee + fixedFee;
              renewBRL =
                (d.PremiumRenewalPrice ?? 0) * usdToBrl * fee + fixedFee;
              transferBRL =
                (d.PremiumTransferPrice ?? 0) * usdToBrl * fee + fixedFee;
            } else if (pricing?.price) {
              const alreadyBrl =
                (pricing as { currency?: string }).currency === "BRL";
              priceBRL =
                (alreadyBrl
                  ? (pricing.price ?? 0)
                  : (pricing.price ?? 0) * usdToBrl) *
                  fee +
                fixedFee;
              renewBRL =
                (alreadyBrl
                  ? (pricing.renew ?? 0)
                  : (pricing.renew ?? 0) * usdToBrl) *
                  fee +
                fixedFee;
              transferBRL =
                (alreadyBrl
                  ? (pricing.transfer ?? 0)
                  : (pricing.transfer ?? 0) * usdToBrl) *
                  fee +
                fixedFee;
            }

            // Segurança: Se o preço deu 0 e o domínio estava "disponível", forçamos indisponível
            // para nunca exibir preço 0 para algo que o usuário queira comprar.
            // Premium: se for premium e tiver preço, consideramos disponível mesmo que o Available da NC venha false.
            const isActuallyAvailable =
              (d.Available || (d.IsPremiumName && priceBRL > 0)) &&
              priceBRL > 0;

            return {
              available: isActuallyAvailable,
              domain: d.Domain,
              isPremium: d.IsPremiumName,
              priceBRL,
              renewBRL,
              transferBRL,
            };
          })
      )
    ).filter(r => !r.available || r.priceBRL > 0); // Filtra qualquer erro residual de preço 0 em disponíveis

    const mainDomain = mapped.find(
      r => r.domain.toLowerCase() === query.toLowerCase()
    ) ??
      mapped.find(r => r.available) ??
      mapped[0] ?? {
        available: false,
        domain: query,
        isPremium: false,
        priceBRL: 0,
        renewBRL: 0,
        transferBRL: 0,
      };

    const suggestions = mapped.filter(
      r => r.domain.toLowerCase() !== mainDomain.domain.toLowerCase()
    );

    // 2. Salva no Cache antes de paginar
    const finalData = { main: mainDomain, suggestions };
    SEARCH_CACHE.set(cacheKey, { data: finalData, timestamp: Date.now() });

    const pagedSuggestions = suggestions.slice(
      (page - 1) * pageSize,
      page * pageSize
    );

    return NextResponse.json({
      main: mainDomain,
      pagination: {
        page,
        pageSize,
        total: suggestions.length,
        totalPages: Math.ceil(suggestions.length / pageSize),
      },
      suggestions: pagedSuggestions,
    });
  } catch (error) {
    console.error("Domain search error:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Failed to search domains",
      },
      { status: 500 }
    );
  }
}
