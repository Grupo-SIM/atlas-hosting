import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import { PaginatedTldTable } from "@/components/domains/PaginatedTldTable"; // Import the new client component
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// Removed Pagination components from here as they are now used within PaginatedTldTable
// and assumed to be imported there from "@/components/ui/pagination"
import {
  Table, // Keep if used by other parts, though PaginatedTldTable now renders its own Table
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // This specific Table import might not be needed directly here anymore
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import namecheapApi from "@/lib/server/apis/namecheap";
import { toBrl } from "@/lib/utils";
import { Search } from "lucide-react";
import { cache, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {
  DomainsCheckUserParams,
  UsersGetPricingUserParams,
} from "@/lib/server/apis/namecheap/types"; // Adjust path if necessary
import { Metadata } from "next";

export const experimental_ppr = true;

export const metadata: Metadata = {
  title: "Registrar domínio - Atlas Hosting",
  description: "Busque e registre seu domínio com facilidade no Atlas Hosting",
};

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

export type DomainWithAvailability = {
  domain: string;
  available: boolean;
  price: number;
  renew: number;
  transfer: number;
  isPremium: boolean;
};

export type DomainData = {
  available: boolean;
  domain: DomainWithAvailability;
  extraDomains: DomainWithAvailability[];
} | null;

// Cached API calls (as you provided)
const getPricing = cache(
  async (params: UsersGetPricingUserParams) =>
    await namecheapApi.getPricing(params)
);
const check = cache(
  async (params: DomainsCheckUserParams) => await namecheapApi.check(params)
);

const getStandardPricingMap = cache(
  async (): Promise<
    Map<string, { register?: number; renew?: number; transfer?: number }>
  > => {
    const pricingResult = await getPricing({ ProductType: "DOMAIN" });
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
            if (!newPricingMap.has(tldName)) {
              newPricingMap.set(tldName, {});
            }
            const tldPrices = newPricingMap.get(tldName)!;
            if (actionType === "REGISTER")
              tldPrices.register = priceDetail.Price;
            else if (actionType === "RENEW")
              tldPrices.renew = priceDetail.Price;
            else if (actionType === "TRANSFER")
              tldPrices.transfer = priceDetail.Price;
          }
        });
      });
    }
    return newPricingMap;
  }
);

// Fetches all TLDs with their price info (no longer returns totalCount separately for client pagination)
async function getAllDomainPrices(): Promise<DomainPriceInfo[]> {
  try {
    const [tldListResult, pricingMap] = await Promise.all([
      namecheapApi.getTldList(),
      getStandardPricingMap(),
    ]);

    if (!tldListResult?.Tlds) {
      console.warn("No TLDs returned from namecheapApi.getTldList");
      return [];
    }

    const items: DomainPriceInfo[] = tldListResult.Tlds.map((tld) => {
      const prices = pricingMap.get(tld.Name.toLowerCase());
      return {
        tld: tld.Name,
        description: tld.Description,
        minRegisterYears: tld.MinRegisterYears,
        maxRegisterYears: tld.MaxRegisterYears,
        price: prices?.register,
        renew: prices?.renew,
        transfer: prices?.transfer,
      };
    });
    return items; // Return the full list
  } catch (error) {
    console.error("Error fetching TLD list or pricing for table:", error);
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

// getDomainData remains the same
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
    const [checkResult, standardPricingMap] = await Promise.all([
      check({ DomainList: domainsToSearch.join(",") }),
      getStandardPricingMap(),
    ]);

    if (!checkResult?.Results || checkResult.Results.length === 0) {
      console.warn("No domain check results for:", searchQuery);
      return null;
    }

    const domainDataMapped: DomainWithAvailability[] = checkResult.Results.map(
      (domainDetail) => {
        const fullDomainName = domainDetail.Domain;
        let tldForLookup = "";
        const parts = fullDomainName.split(".");
        if (parts.length > 1) {
          let bestMatch = "";
          for (const knownTld of standardPricingMap.keys()) {
            if (fullDomainName.toLowerCase().endsWith("." + knownTld)) {
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

        const standardPrices = standardPricingMap.get(tldForLookup);
        const regPrice = domainDetail.IsPremiumName
          ? (domainDetail.PremiumRegistrationPrice ?? 0)
          : (standardPrices?.register ?? 0);
        const renPrice = domainDetail.IsPremiumName
          ? (domainDetail.PremiumRenewalPrice ?? 0)
          : (standardPrices?.renew ?? 0);
        const tranPrice = domainDetail.IsPremiumName
          ? (domainDetail.PremiumTransferPrice ?? 0)
          : (standardPrices?.transfer ?? 0);

        return {
          domain: fullDomainName,
          available: domainDetail.Available,
          price: regPrice,
          renew: renPrice,
          transfer: tranPrice,
          isPremium: domainDetail.IsPremiumName,
        };
      }
    );

    let mainDomainData = domainDataMapped.find(
      (item) => item.domain.toLowerCase() === searchQuery.toLowerCase()
    );
    if (!mainDomainData) {
      if (domainDataMapped.length > 0) {
        mainDomainData = domainDataMapped[0];
      } else {
        mainDomainData = {
          domain: searchQuery,
          available: false,
          price: 0,
          renew: 0,
          transfer: 0,
          isPremium: false,
        };
      }
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

const ITEMS_PER_TLD_PAGE_SKELETON = 10; // For skeleton loader consistency

export default async function DomainsPage({
  searchParams: searchParamsProp,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParamsProp;
  const searchQuery = resolvedSearchParams.search
    ? String(resolvedSearchParams.search).trim()
    : "";
  // currentTldPage from query params is no longer needed here for the table itself

  const allDomainPricesPromise = getAllDomainPrices(); // Fetches all TLDs
  const domainDataPromise = getDomainData(searchQuery);

  return (
    <div className="space-y-6 p-6 pb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Registrar novo domínio
        </h1>
        <p className="text-muted-foreground mt-1">
          Pesquise, registre e gerencie nomes de domínio para seus sites
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Encontre o Nome de Domínio Perfeito</CardTitle>
          <CardDescription>
            Digite um nome de domínio para verificar a disponibilidade ou obter
            sugestões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ex: minhaempresa.com"
                className="pl-10"
                name="search"
                defaultValue={searchQuery}
              />
            </div>
            <Button type="submit">Buscar domínios</Button>
          </form>

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

      <Card>
        <CardHeader>
          <CardTitle>Preços de Nomes de Domínio</CardTitle>
          <CardDescription>
            Lista de TLDs. Os preços (quando disponíveis) são exibidos em BRL.
            (Valores baseados em registro de 1 ano, convertidos de USD.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TLD</TableHead>
                      <TableHead className="hidden sm:table-cell text-right">
                        Registro (BRL)
                      </TableHead>
                      <TableHead className="text-right">
                        Renovação (BRL)
                      </TableHead>
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
                  {" "}
                  {/* Skeleton for pagination controls */}
                  <Skeleton width="15rem" height="2.25rem" />
                </div>
              </div>
            }
          >
            <TldPriceSection allDomainPricesPromise={allDomainPricesPromise} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// New async component to await the promise before passing to client component
async function TldPriceSection({
  allDomainPricesPromise,
}: {
  allDomainPricesPromise: Promise<DomainPriceInfo[]>;
}) {
  const allDomainPrices = await allDomainPricesPromise;
  return <PaginatedTldTable allTldData={allDomainPrices} />;
}
