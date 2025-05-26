import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import { PaginatedTldTable } from "@/components/domains/PaginatedTldTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import type {
  DomainsCheckUserParams,
  UsersGetPricingUserParams,
} from "@/lib/server/apis/namecheap/types";
import { Search } from "lucide-react";
import { Metadata } from "next";
import { cache, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { db } from "@/lib/db";
import { pgDomainPricingCache as domainPricingCacheTable } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import RegisterDomainSearch from "./components/RegisterDomainSearch";

export const experimental_ppr = true;

// Types remain the same
export type DomainPriceInfo = {
  tld: string;
  price?: number;
  renew?: number;
  transfer?: number;
  minRegisterYears?: number;
  maxRegisterYears?: number;
  description?: string;
};

export const metadata: Metadata = {
  title: "Registrar Domínio | Sua Plataforma",
  description: "Pesquise, registre e gerencie nomes de domínio.",
};

export type DomainPriceInfoFromDb = {
  tld: string;
  priceUSD?: number | null; // Registration price in USD from DB
  renewUSD?: number | null; // Renewal price in USD from DB
  transferUSD?: number | null; // Transfer price in USD from DB
  minRegisterYears?: number | null;
  maxRegisterYears?: number | null;
  // description might come from a separate getTldList call if needed
};

export type DomainWithAvailability = {
  domain: string;
  available: boolean;
  priceBRL: number; // Final BRL price (premium or standard)
  renewBRL: number; // Final BRL price
  transferBRL: number; // Final BRL price
  isPremium: boolean;
};

export type DomainData = {
  available: boolean;
  domain: DomainWithAvailability;
  extraDomains: DomainWithAvailability[];
} | null;

// This function now fetches USD prices from your Drizzle DB cache
async function getAllDomainPricesFromDb(): Promise<DomainPriceInfoFromDb[]> {
  try {
    console.log("Fetching TLD prices (USD) from database cache...");
    const cachedPrices = await db
      .select({
        tld: domainPricingCacheTable.tld,
        priceUSD: domainPricingCacheTable.price, // This is USD registration price
        renewUSD: domainPricingCacheTable.renew, // USD renewal price
        transferUSD: domainPricingCacheTable.transfer, // USD transfer price
        minRegisterYears: domainPricingCacheTable.minRegisterYears,
        maxRegisterYears: domainPricingCacheTable.maxRegisterYears,
      })
      .from(domainPricingCacheTable)
      .orderBy(domainPricingCacheTable.tld);

    if (!cachedPrices || cachedPrices.length === 0) {
      console.warn("No TLD prices found in the database cache.");
    }
    return cachedPrices.map((item) => ({
      tld: item.tld,
      priceUSD: item.priceUSD,
      renewUSD: item.renewUSD,
      transferUSD: item.transferUSD,
      minRegisterYears: item.minRegisterYears,
      maxRegisterYears: item.maxRegisterYears,
    }));
  } catch (error) {
    console.error("Error fetching TLD prices from database cache:", error);
    return [];
  }
}

const recommendedTlds: `.${string}`[] = [
  ".com",
  ".net",
  ".org",
  ".io",
  ".dev",
  ".co",
  ".app",
  ".online",
];

// Cached API calls
const getPricing = cache(async (params: UsersGetPricingUserParams) =>
  namecheapApi.getPricing(params)
);
const check = cache(async (params: DomainsCheckUserParams) =>
  namecheapApi.check(params)
);

// Helper to get the standard pricing map (USD prices, converted to BRL by namecheapApi.getPricing)
// This map will contain BRL prices because namecheapApi.getPricing's parser converts them.
const getStandardPricingMapBRL = cache(
  async (): Promise<
    Map<string, { register?: number; renew?: number; transfer?: number }>
  > => {
    const pricingResult = await getPricing({ ProductType: "DOMAIN" }); // This returns BRL prices
    const newPricingMap = new Map<
      string,
      { register?: number; renew?: number; transfer?: number }
    >();
    if (pricingResult?.ProductType?.Categories) {
      pricingResult.ProductType.Categories.forEach((category) => {
        const actionType = category.Name.toUpperCase();
        category.Products.forEach((product) => {
          const tldName = product.Name.toLowerCase();
          const priceDetail = product.Prices.find(
            (p) => p.Duration === 1 && p.DurationType === "YEAR"
          );
          if (priceDetail) {
            if (!newPricingMap.has(tldName)) newPricingMap.set(tldName, {});
            const tldPrices = newPricingMap.get(tldName)!;
            // Prices from getPricing are already BRL
            if (actionType === "REGISTER")
              tldPrices.register = priceDetail.Price; // BRL
            else if (actionType === "RENEW")
              tldPrices.renew = priceDetail.Price; // BRL
            else if (actionType === "TRANSFER")
              tldPrices.transfer = priceDetail.Price; // BRL
          }
        });
      });
    }
    return newPricingMap;
  }
);

export const getDomainData = cache(async function getDomainData(
  searchQuery: string
): Promise<DomainData> {
  if (!searchQuery || searchQuery.trim() === "") return null;

  const domainNameOnly = searchQuery.includes(".")
    ? searchQuery.split(".")[0]
    : searchQuery;
  let domainsToSearch = recommendedTlds.map((tld) => `${domainNameOnly}${tld}`);
  if (searchQuery.includes(".") && !domainsToSearch.includes(searchQuery)) {
    domainsToSearch.unshift(searchQuery);
  }
  domainsToSearch = [...new Set(domainsToSearch)];

  try {
    const [checkResult, standardPricingMapBRL] = await Promise.all([
      check({ DomainList: domainsToSearch.join(",") }),
      getStandardPricingMapBRL(),
    ]);

    if (!checkResult?.Results || checkResult.Results.length === 0) return null;

    const domainDataMapped: DomainWithAvailability[] = checkResult.Results.map(
      (domainDetail) => {
        const fullDomainName = domainDetail.Domain;
        let tldForLookup = "";
        const parts = fullDomainName.split(".");
        if (parts.length > 1) {
          let bestMatch = "";
          for (const knownTld of standardPricingMapBRL.keys()) {
            if (fullDomainName.toLowerCase().endsWith("." + knownTld)) {
              if (knownTld.length > bestMatch.length) bestMatch = knownTld;
            }
          }
          tldForLookup =
            bestMatch ||
            parts
              .slice(parts.length > 2 ? -2 : -1)
              .join(".")
              .toLowerCase();
        }

        const standardBRLPrices = standardPricingMapBRL.get(tldForLookup);
        // Prices from 'check' (Premium...Price) are already BRL via _parseDomainsCheckResponse
        const regPriceBRL = domainDetail.IsPremiumName
          ? (domainDetail.PremiumRegistrationPrice ?? 0)
          : (standardBRLPrices?.register ?? 0);
        const renPriceBRL = domainDetail.IsPremiumName
          ? (domainDetail.PremiumRenewalPrice ?? 0)
          : (standardBRLPrices?.renew ?? 0);
        const tranPriceBRL = domainDetail.IsPremiumName
          ? (domainDetail.PremiumTransferPrice ?? 0)
          : (standardBRLPrices?.transfer ?? 0);

        return {
          domain: fullDomainName,
          available: domainDetail.Available,
          priceBRL: regPriceBRL,
          renewBRL: renPriceBRL,
          transferBRL: tranPriceBRL,
          isPremium: domainDetail.IsPremiumName,
        };
      }
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
          item.domain.toLowerCase() !== mainDomainData!.domain.toLowerCase()
      ),
    };
  } catch (error) {
    console.error(`Error in getDomainData for "${searchQuery}":`, error);
    return null;
  }
});

const ITEMS_PER_TLD_PAGE_SKELETON = 10;

export default async function DomainsPage({
  searchParams: searchParamsProp,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParamsProp;
  const searchQuery = resolvedSearchParams.search
    ? String(resolvedSearchParams.search).trim()
    : "";

  const allDomainPricesFromDbPromise = getAllDomainPricesFromDb(); // Fetches USD prices from DB
  const domainDataPromise = getDomainData(searchQuery); // Provides BRL prices

  return (
    <div className="space-y-6 p-6 pb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Registrar novo domínio
        </h1>
        <p className="text-muted-foreground mt-1">
          Pesquise, registre e gerencie nomes de domínio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Encontre o Nome de Domínio Perfeito</CardTitle>
          <CardDescription>
            Digite um nome ou palavra-chave para verificar a disponibilidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterDomainSearch />
          {searchQuery && (
            <div className="mt-8">
              <Tabs defaultValue="results">
                <TabsList className="mb-4">
                  <TabsTrigger value="results">Resultados</TabsTrigger>
                  <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
                </TabsList>
                <TabsContent value="results">
                  <Suspense
                    fallback={
                      <Skeleton
                        count={3}
                        height={30}
                        containerClassName="space-y-3"
                      />
                    }
                  >
                    <DomainResult searchQuery={searchQuery} />
                  </Suspense>
                </TabsContent>
                <TabsContent value="suggestions">
                  <Suspense
                    fallback={
                      <Skeleton
                        count={5}
                        height={50}
                        containerClassName="space-y-4"
                      />
                    }
                  >
                    <DomainSuggestions
                      domainDataPromise={domainDataPromise}
                      searchQuery={searchQuery}
                    />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      <Suspense fallback={<TldPriceTableSkeleton />}>
        <TldPriceSectionFromDb
          allDomainPricesFromDbPromise={allDomainPricesFromDbPromise}
        />
      </Suspense>
    </div>
  );
}

function TldPriceTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preços de Nomes de Domínio (BRL)</CardTitle>
        <CardDescription>
          Lista de TLDs com preços de registro em BRL (convertidos de USD,
          atualizado diariamente).
        </CardDescription>
        <Input type="search" placeholder="Pesquisar TLD" className="mt-2" />
      </CardHeader>
      <CardContent>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TLD</TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  Registro (BRL)
                </TableHead>
                <TableHead className="text-right">Renovação (BRL)</TableHead>
                <TableHead className="text-right">
                  Transferência (BRL)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(ITEMS_PER_TLD_PAGE_SKELETON)].map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <Skeleton width="6rem" height="1rem" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    <Skeleton width="6rem" height="1rem" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton width="6rem" height="1rem" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton width="6rem" height="1rem" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mx-auto flex w-full justify-center pt-4">
            <Skeleton width="15rem" height="2.25rem" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function TldPriceSectionFromDb({
  allDomainPricesFromDbPromise,
}: {
  allDomainPricesFromDbPromise: Promise<DomainPriceInfoFromDb[]>;
}) {
  const allDomainPricesFromDb = await allDomainPricesFromDbPromise;

  const convertedPricesForTable: DomainPriceInfo[] = await Promise.all(
    allDomainPricesFromDb.map(async (item) => {
      // Assuming your currencyConversion.convert can handle null/undefined gracefully or we check
      const priceBRL =
        item.priceUSD != null
          ? await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: item.priceUSD,
            })
          : undefined;
      const renewBRL =
        item.renewUSD != null
          ? await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: item.renewUSD,
            })
          : undefined;
      const transferBRL =
        item.transferUSD != null
          ? await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: item.transferUSD,
            })
          : undefined;

      return {
        tld: item.tld,
        price: priceBRL, // Now BRL
        renew: renewBRL, // Now BRL
        transfer: transferBRL, // Now BRL
        minRegisterYears: item.minRegisterYears ?? undefined,
        maxRegisterYears: item.maxRegisterYears ?? undefined,
      };
    })
  );

  return <PaginatedTldTable allTldData={convertedPricesForTable} />;
}
