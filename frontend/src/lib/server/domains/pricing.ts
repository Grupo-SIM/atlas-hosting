import { db } from "@/lib/db";
import currencyConversion from "@/lib/server/apis/currency";
import namecheapApi from "@/lib/server/apis/namecheap";

/**
 * Markup aplicado sobre o custo do registrador. `DOMAIN_PROFIT_FEE` aceita
 * 0.2, 1.2 ou 20 para 20%; sem a variável vale `system_config.domain_fee`
 * (padrão 30%). `DOMAIN_FEE_ENABLED=false` vende a preço de custo.
 */
export async function getDomainProfitFee(): Promise<number> {
  const feeEnabled = process.env.DOMAIN_FEE_ENABLED !== "false";
  if (!feeEnabled) return 1;

  try {
    const envFeeValue =
      process.env.DOMAIN_PROFIT_FEE || process.env.NAMESILO_PROFIT_FEE;
    const envFee = envFeeValue ? Number.parseFloat(envFeeValue) : undefined;

    let finalFeePercent: number;

    if (envFee !== undefined) {
      // Normalize: 0.2 -> 20, 1.2 -> 20, 20 -> 20
      if (envFee > 0 && envFee < 1) {
        finalFeePercent = envFee * 100;
      } else if (envFee >= 1 && envFee < 5) {
        finalFeePercent = (envFee - 1) * 100;
      } else {
        finalFeePercent = envFee;
      }
    } else {
      const dbConfig = await db.query.pgSystemConfig.findFirst();
      finalFeePercent = dbConfig?.domainFee ?? 30;
    }

    return 1 + finalFeePercent / 100;
  } catch {
    return 1.2;
  }
}

/** Taxa fixa em BRL somada por ano registrado. */
function fixedFeePerYear(): number {
  const env = process.env.DOMAIN_FIXED_FEE;
  return env !== undefined ? Number(env) : 4;
}

export interface DomainQuote {
  available: boolean;
  domain: string;
  isPremium: boolean;
  /** Custo do Atlas junto à Namecheap, em BRL, pelo período inteiro. */
  namecheapCostBrl: number;
  /** O mesmo custo em USD, como cotado no momento. */
  namecheapCostUsd: number;
  /** Preço final ao cliente, em BRL, já com markup e taxa fixa. */
  priceBrl: number;
  years: number;
}

/** O TLD mais específico que a tabela de preços conhece (`com.br` antes de `br`). */
function tldForDomain(domain: string, knownTlds: string[]): string {
  let best = "";
  for (const tld of knownTlds) {
    if (domain.endsWith(`.${tld}`) && tld.length > best.length) best = tld;
  }
  if (best) return best;
  const parts = domain.split(".");
  return parts.slice(parts.length > 2 ? -2 : -1).join(".");
}

/**
 * Cotação de registro de um ou mais domínios: disponibilidade na Namecheap e
 * preço final ao cliente. É a **única** fonte de preço de registro — a tela de
 * publicar, a busca de domínios e a fatura passam por aqui, então o valor
 * mostrado é o valor cobrado.
 *
 * Faz uma única chamada de disponibilidade para a lista inteira e reaproveita a
 * tabela `domain_pricing_cache`; só busca preço na Namecheap para os TLDs que
 * faltam no cache.
 */
export async function quoteDomainList(args: {
  domains: string[];
  years?: string;
}): Promise<DomainQuote[]> {
  const domains = [
    ...new Set(
      args.domains.map(d => d.trim().toLowerCase()).filter(d => d.includes("."))
    ),
  ];
  if (domains.length === 0) return [];

  const years = Math.max(
    1,
    Number.parseInt(args.years?.trim() || "1", 10) || 1
  );

  const [checkResult, cached, fee, usdToBrl] = await Promise.all([
    namecheapApi.check({ DomainList: domains.join(",") }),
    db.query.pgDomainPricingCache.findMany(),
    getDomainProfitFee(),
    currencyConversion.convert({ amount: 1, from: "usd", to: "brl" }),
  ]);

  const pricingByTld = new Map<string, TldPrice>(
    cached.map(row => [
      row.tld,
      { price: row.price ?? 0, renew: row.renew ?? (row.price ?? 0) * 1.1 },
    ])
  );
  const fixedFee = fixedFeePerYear();
  const results: DomainQuote[] = [];

  for (const entry of checkResult?.Results ?? []) {
    const domain = entry.Domain.trim().toLowerCase();
    const isPremium = Boolean(entry.IsPremiumName);
    const premiumUsd = entry.PremiumRegistrationPrice ?? 0;

    let costUsd = 0;
    if (isPremium && premiumUsd > 0) {
      costUsd = premiumUsd * years;
    } else {
      const tld = tldForDomain(domain, [...pricingByTld.keys()]);
      let row = pricingByTld.get(tld);
      if (!row) {
        // TLD fora do cache: busca uma vez e guarda em memória para os próximos.
        const fetched = await pricingForTld(tld);
        if (fetched) {
          row = fetched;
          pricingByTld.set(tld, fetched);
        }
      }
      const registerUsd = row?.price ?? 0;
      const renewUsd = row?.renew ?? registerUsd * 1.1;
      costUsd = registerUsd + renewUsd * (years - 1);
    }

    const costBrl = costUsd * usdToBrl;
    const priceBrl = costUsd > 0 ? costBrl * fee + fixedFee * years : 0;
    results.push({
      // Premium indisponível no `check` ainda pode ser vendido pelo preço premium.
      available:
        (Boolean(entry.Available) || (isPremium && premiumUsd > 0)) &&
        priceBrl > 0,
      domain,
      isPremium,
      namecheapCostBrl: costBrl,
      namecheapCostUsd: costUsd,
      priceBrl,
      years,
    });
  }

  return results;
}

/** Cotação de um domínio só. */
export async function quoteDomainRegistration(args: {
  domain: string;
  years?: string;
}): Promise<DomainQuote> {
  const domain = args.domain.trim().toLowerCase();
  const [quote] = await quoteDomainList({
    domains: [domain],
    years: args.years,
  });
  return (
    quote ?? {
      available: false,
      domain,
      isPremium: false,
      namecheapCostBrl: 0,
      namecheapCostUsd: 0,
      priceBrl: 0,
      years: Math.max(1, Number.parseInt(args.years?.trim() || "1", 10) || 1),
    }
  );
}

interface TldPrice {
  price: number;
  renew: number;
}

/** Preço de registro/renovação de um TLD direto na Namecheap. */
async function pricingForTld(tld: string): Promise<TldPrice | null> {
  try {
    const pricingData = await namecheapApi.getPricing(tld);
    const categories = pricingData?.ProductType?.Categories || [];
    const priceFor = (categoryName: string) => {
      const category = categories.find(
        c => c.Name.toUpperCase() === categoryName
      );
      const product = (category?.Products || []).find(
        // biome-ignore lint/suspicious/noExplicitAny: formato bruto da API Namecheap
        (p: any) => p.Name.toLowerCase() === tld.toLowerCase()
      );
      const detail = product?.Prices.find(
        // biome-ignore lint/suspicious/noExplicitAny: formato bruto da API Namecheap
        (p: any) => p.Duration === 1 && p.DurationType === "YEAR"
      );
      return detail?.YourPrice ?? detail?.Price ?? 0;
    };
    const price = priceFor("REGISTER");
    if (!price) return null;
    return { price, renew: priceFor("RENEW") || price * 1.2 };
  } catch {
    return null;
  }
}
