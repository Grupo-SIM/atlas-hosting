import { NextRequest, NextResponse } from "next/server";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { inArray } from "drizzle-orm";

// Popular TLDs - only well-known, valid TLDs that Namecheap actually supports
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

// Extended list of common TLDs
const extendedTlds: `.${string}`[] = [
  ...popularTlds,
  ".info",
  ".biz",
  ".us",
  ".me",
  ".tv",
  ".cc",
  ".ws",
  ".name",
  ".mobi",
  ".asia",
  ".tel",
  ".pro",
  ".travel",
  ".jobs",
  ".edu",
  ".gov",
  ".mil",
  ".int",
  ".aero",
  ".coop",
  ".museum",
  ".cat",
  ".xxx",
  ".post",
  ".geo",
  ".xxx",
  ".jobs",
  ".tel",
  ".mobi",
  ".asia",
  ".travel",
  ".pro",
  ".biz",
  ".info",
  ".name",
  ".us",
  ".uk",
  ".ca",
  ".au",
  ".de",
  ".fr",
  ".it",
  ".es",
  ".nl",
  ".br",
  ".mx",
  ".ar",
  ".cl",
  ".co.uk",
  ".com.br",
  ".com.mx",
  ".com.ar",
];

export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NAMECHEAP_API_USER || !process.env.NAMECHEAP_API_KEY || !process.env.PUBLIC_IP) {
      console.error("Missing Namecheap API environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Extract domain name (remove TLD if provided)
    const domainNameOnly = query.includes(".")
      ? query.split(".")[0]
      : query;

    // Use only well-known, valid TLDs
    // Filter out TLDs that contain numbers, special characters, or are too short/long
    // This ensures we only search for domains that Namecheap actually supports
    const isValidTld = (tld: string): boolean => {
      // Remove the dot
      const tldName = tld.replace(/^\./, "");
      // Must be 2-63 characters (ICANN standard)
      if (tldName.length < 2 || tldName.length > 63) return false;
      // Must contain only letters, numbers, and hyphens
      if (!/^[a-z0-9-]+$/.test(tldName)) return false;
      // Must start and end with a letter or number (not hyphen)
      if (!/^[a-z0-9].*[a-z0-9]$/.test(tldName)) return false;
      // Exclude TLDs that start with numbers (like .0db, .0z, .1, .35, etc.)
      if (/^[0-9]/.test(tldName)) return false;
      // Exclude very short TLDs that are likely invalid (like .0z, .1, etc.)
      if (tldName.length <= 2 && /^[0-9]/.test(tldName)) return false;
      return true;
    };

    // Use only popular, well-known TLDs to ensure we only get valid results
    // Don't fetch from API as it may return TLDs that aren't actually available
    let tldsToUse = popularTlds.filter(isValidTld);

    // Build list of domains to check
    let domainsToSearch = tldsToUse.map((tld) => `${domainNameOnly}${tld}`);
    if (query.includes(".") && !domainsToSearch.includes(query)) {
      domainsToSearch.unshift(query);
    }
    domainsToSearch = [...new Set(domainsToSearch)];

    // Namecheap API allows max 50 domains per request, but URL length limits may cause 406 errors
    // Using a more conservative limit of 30 domains per request to avoid URL length issues
    const MAX_DOMAINS_PER_REQUEST = 30;
    const domainBatches: string[][] = [];
    
    for (let i = 0; i < domainsToSearch.length; i += MAX_DOMAINS_PER_REQUEST) {
      domainBatches.push(domainsToSearch.slice(i, i + MAX_DOMAINS_PER_REQUEST));
    }

    // Check domain availability via Namecheap API (multiple requests if needed)
    let checkResult;
    try {
      const allResults = await Promise.all(
        domainBatches.map((batch) =>
          namecheapApi.check({
            DomainList: batch.join(","),
          })
        )
      );

      // Combine all results
      checkResult = {
        Results: allResults.flatMap((result) => result.Results || []),
      };
    } catch (apiError) {
      console.error("Namecheap API error:", apiError);
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      
      // Check if it's an IP whitelist error
      if (errorMessage.includes("Invalid request IP")) {
        const ipMatch = errorMessage.match(/Invalid request IP: (\d+\.\d+\.\d+\.\d+)/);
        const detectedIP = ipMatch ? ipMatch[1] : process.env.PUBLIC_IP;
        
        return NextResponse.json(
          { 
            error: "IP não autorizado na Namecheap",
            details: `O IP ${detectedIP} precisa ser adicionado à whitelist da Namecheap. Acesse o painel da Namecheap e adicione este IP à lista de permissões da API.`,
            detectedIP,
            configuredIP: process.env.PUBLIC_IP
          },
          { status: 403 }
        );
      }
      
      // Check if it's a 406 error (URL too long or not acceptable)
      if (errorMessage.includes("status code 406") || errorMessage.includes("406")) {
        console.error(`URL length issue detected. Domains searched: ${domainsToSearch.length}, Batches: ${domainBatches.length}`);
        return NextResponse.json(
          { 
            error: "Erro ao buscar domínios",
            details: "A requisição foi muito grande. Tente buscar com menos TLDs ou um termo mais específico.",
            suggestion: "A busca foi limitada para evitar problemas. Alguns TLDs podem não ter sido verificados."
          },
          { status: 400 }
        );
      }
      
      throw new Error(`Namecheap API error: ${errorMessage}`);
    }

    if (!checkResult?.Results || checkResult.Results.length === 0) {
      return NextResponse.json({
        main: {
          domain: query,
          available: false,
          priceBRL: 0,
          renewBRL: 0,
          transferBRL: 0,
          isPremium: false,
        },
        suggestions: [],
      });
    }

    // Get pricing from database or API
    let pricings: Array<{ tld: string; price?: number | null; renew?: number | null; transfer?: number | null }> = [];
    let pricingRecord: Record<string, { tld: string; price?: number | null; renew?: number | null; transfer?: number | null }> = {};
    
    try {
      const tlds = domainsToSearch.map((d) => d.split(".").pop() as string).filter(Boolean);
      
      if (tlds.length > 0) {
        try {
          // Try to get pricing from database first
          pricings = await db.query.pgDomainPricingCache.findMany({
            where: inArray(pgDomainPricingCache.tld, tlds),
          });
          
          // If no pricing data found, try to refresh cache
          if (pricings.length === 0) {
            console.log("No pricing data in cache. Refreshing cache now...");
            try {
              await namecheapApi.refreshDomainPricingCache();
              
              // Fetch pricing again after refresh
              pricings = await db.query.pgDomainPricingCache.findMany({
                where: inArray(pgDomainPricingCache.tld, tlds),
              });
              
              console.log(`Cache refreshed. Found ${pricings.length} pricing entries.`);
            } catch (refreshError) {
              console.error("Error refreshing cache:", refreshError);
            }
          }
        } catch (dbError) {
          console.warn("Database not available, fetching prices directly from API...");
        }
        
        // If still no pricing from DB, fetch directly from API
        if (pricings.length === 0) {
          console.log("Fetching pricing directly from Namecheap API...");
          try {
            const uniqueTlds = [...new Set(tlds)];
            const apiPricings = await Promise.all(
              uniqueTlds.map(async (tld) => {
                try {
                  // Fetch REGISTER pricing (getPricing uses ActionName: "REGISTER" by default)
                  const registerData = await namecheapApi.getPricing(tld);
                  
                  // getPricing returns array of ProductPricingInfo
                  // Each product has Prices array with ProductPriceDetail
                  const registerProduct = registerData.find((p) => 
                    p.Name.toLowerCase() === `.${tld.toLowerCase()}` || 
                    p.Name.toLowerCase() === tld.toLowerCase()
                  ) || registerData[0]; // Fallback to first product
                  
                  // Find the price for 1 year registration
                  const registerPrice = registerProduct?.Prices.find(
                    (p) => p.Duration === 1 && p.DurationType === "YEAR"
                  );
                  
                  // Check currency - Price can be in USD or BRL
                  const currency = registerPrice?.Currency?.toUpperCase() || "USD";
                  const rawPrice = registerPrice?.YourPrice ?? registerPrice?.Price ?? 0;
                  
                  // If price is already in BRL, use it directly; otherwise it's in USD
                  const priceUSD = currency === "BRL" ? 0 : rawPrice;
                  const priceBRL = currency === "BRL" ? rawPrice : 0;
                  
                  // For renew and transfer, we'll estimate based on register price
                  // In a full implementation, you'd fetch these separately
                  return {
                    tld,
                    price: priceUSD > 0 ? priceUSD : (priceBRL > 0 ? priceBRL : null),
                    renew: priceUSD > 0 ? priceUSD * 1.1 : (priceBRL > 0 ? priceBRL * 1.1 : null),
                    transfer: priceUSD > 0 ? priceUSD * 0.8 : (priceBRL > 0 ? priceBRL * 0.8 : null),
                    currency: currency, // Store currency for later use
                  };
                } catch (error) {
                  console.error(`Error fetching pricing for ${tld}:`, error);
                  return { tld, price: null, renew: null, transfer: null };
                }
              })
            );
            
            pricings = apiPricings.filter((p) => p.price !== null);
            console.log(`Fetched ${pricings.length} pricing entries from API.`);
          } catch (apiError) {
            console.error("Error fetching pricing from API:", apiError);
          }
        }
      }
      
      pricingRecord = Object.fromEntries(pricings.map((p) => [p.tld, p]));
    } catch (error) {
      console.error("Error getting pricing:", error);
    }

    // Get domain fee from system config
    let systemConfig;
    // Default fee: 1.1 = 10% markup (more reasonable than 2x)
    // If domainFee in DB is 5.0, it means 5% markup, so fee = 1.05
    let fee = 1.1; // Default 10% markup
    try {
      systemConfig = await db.query.pgSystemConfig.findFirst();
      if (systemConfig) {
        // domainFee is a percentage (e.g., 5.0 = 5%), convert to multiplier
        const feePercentage = systemConfig.domainFee ?? 5.0;
        fee = 1 + (feePercentage / 100);
      }
    } catch (dbError) {
      console.error("Database error fetching system config:", dbError);
      // Use default fee if database query fails
      systemConfig = null;
    }

    // Filter results to only include domains with valid TLDs
    // This ensures we don't return domains that Namecheap doesn't actually support
    const validTldsSet = new Set(tldsToUse.map(tld => tld.replace(/^\./, "").toLowerCase()));
    
    const isValidDomainResult = (domain: string): boolean => {
      const parts = domain.split(".");
      if (parts.length < 2) return false;
      const tld = parts.slice(-1)[0].toLowerCase();
      // Only return domains whose TLD we actually searched for
      return validTldsSet.has(tld);
    };

    // Map results with pricing, filtering out invalid domains
    const domainDataMapped = await Promise.all(
      checkResult.Results
        .filter((domainDetail) => isValidDomainResult(domainDetail.Domain))
        .map(async (domainDetail) => {
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

        // Use premium prices if domain is premium, otherwise use standard prices from DB/API
        let priceUSD = 0;
        let renewUSD = 0;
        let transferUSD = 0;
        let priceBRLDirect = 0;
        let renewBRLDirect = 0;
        let transferBRLDirect = 0;
        let useDirectBRL = false;

        if (domainDetail.IsPremiumName) {
          // Premium domains use premium pricing from API
          // PremiumRegistrationPrice is already converted to BRL by the API wrapper
          const premiumPriceBRL = domainDetail.PremiumRegistrationPrice ?? 0;
          const premiumRenewBRL = domainDetail.PremiumRenewalPrice ?? 0;
          const premiumTransferBRL = domainDetail.PremiumTransferPrice ?? 0;
          
          // If premium prices are 0, try to fetch from getPricing
          if (premiumPriceBRL === 0) {
            try {
              const tld = fullDomainName.split(".").pop() as string;
              const pricingData = await namecheapApi.getPricing(tld);
              const premiumProduct = pricingData.find((p) => 
                p.Name.toLowerCase() === `.${tld.toLowerCase()}` || 
                p.Name.toLowerCase() === tld.toLowerCase()
              ) || pricingData[0];
              
              const premiumPrice = premiumProduct?.Prices.find(
                (p) => p.Duration === 1 && p.DurationType === "YEAR"
              );
              
              if (premiumPrice) {
                const currency = premiumPrice.Currency?.toUpperCase() || "USD";
                const rawPrice = premiumPrice.YourPrice ?? premiumPrice.Price ?? 0;
                
                if (currency === "BRL") {
                  useDirectBRL = true;
                  priceBRLDirect = rawPrice;
                  renewBRLDirect = rawPrice * 1.1;
                  transferBRLDirect = rawPrice * 0.8;
                } else {
                  priceUSD = rawPrice;
                  renewUSD = rawPrice * 1.1;
                  transferUSD = rawPrice * 0.8;
                }
              }
            } catch (error) {
              console.error(`Error fetching premium pricing for ${fullDomainName}:`, error);
            }
          } else {
            // Use premium prices directly (already in BRL)
            useDirectBRL = true;
            priceBRLDirect = premiumPriceBRL;
            renewBRLDirect = premiumRenewBRL;
            transferBRLDirect = premiumTransferBRL;
          }
        } else if (standardBrlPrices) {
          // Check if prices are already in BRL (from API) or USD (from DB)
          const pricingCurrency = (standardBrlPrices as any).currency;
          
          if (pricingCurrency === "BRL") {
            // Prices are already in BRL, use directly
            useDirectBRL = true;
            priceBRLDirect = (standardBrlPrices.price ?? 0);
            renewBRLDirect = (standardBrlPrices.renew ?? 0);
            transferBRLDirect = (standardBrlPrices.transfer ?? 0);
          } else {
            // Prices are in USD, need conversion
            priceUSD = standardBrlPrices.price ?? 0;
            renewUSD = standardBrlPrices.renew ?? 0;
            transferUSD = standardBrlPrices.transfer ?? 0;
          }
        }
        // If no pricing available, prices remain 0

        let priceBRL = 0;
        let renewBRL = 0;
        let transferBRL = 0;

        try {
          if (useDirectBRL) {
            // Prices already in BRL, just apply fee
            const basePrice = priceBRLDirect;
            priceBRL = basePrice * fee;
            renewBRL = renewBRLDirect * fee;
            transferBRL = transferBRLDirect * fee;
            console.log(`[${fullDomainName}] Base: R$ ${basePrice.toFixed(2)}, Fee: ${fee}, Final: R$ ${priceBRL.toFixed(2)}`);
          } else if (priceUSD > 0) {
            // Convert from USD to BRL and apply fee
            priceBRL = (await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: priceUSD,
            })) * fee;
            renewBRL = (await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: renewUSD,
            })) * fee;
            transferBRL = (await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: transferUSD,
            })) * fee;
          }
        } catch (currencyError) {
          console.error("Currency conversion error:", currencyError);
          // Continue with 0 prices if conversion fails
        }

        return {
          domain: fullDomainName,
          available: domainDetail.Available,
          priceBRL,
          renewBRL,
          transferBRL,
          isPremium: domainDetail.IsPremiumName,
        };
      })
    );

    // Find main domain (the one searched) or use first result
    let mainDomainData = domainDataMapped.find(
      (item) => item.domain.toLowerCase() === query.toLowerCase()
    );
    if (!mainDomainData) {
      mainDomainData =
        domainDataMapped.length > 0
          ? domainDataMapped[0]
          : {
              domain: query,
              available: false,
              priceBRL: 0,
              renewBRL: 0,
              transferBRL: 0,
              isPremium: false,
            };
    }

    return NextResponse.json({
      main: mainDomainData,
      suggestions: domainDataMapped.filter(
        (item) => item.domain.toLowerCase() !== mainDomainData?.domain.toLowerCase()
      ),
    });
  } catch (error) {
    console.error("Error searching domains:", error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        error: "Failed to search domains",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

