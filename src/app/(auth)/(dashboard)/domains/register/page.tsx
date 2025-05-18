
import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import currencyConversion from "@/lib/server/apis/currency";
import nameSilo from "@/lib/server/apis/namesilo";
import { Domain, RegistrationData } from "@/lib/server/apis/namesilo/types";
import { cn, toBrl } from "@/lib/utils";
import { chunk } from "lodash";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { cache, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DomainSearchForm from "./DomainSearchForm";

const PRICES_ITEMS_PER_PAGE = 10;

export default function DomainsPage({ 
  searchParams // Corrected prop name here
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Registrar novo domínio</h1>
        <p className="text-muted-foreground mt-1">
            Pesquise, registre e gerencie nomes de domínio para seus sites
        </p>
      </div>

      <Suspense fallback={<DomainsPageSkeleton />}>
        <DomainsPageCoreContent searchParams={searchParams} /> 
      </Suspense>
    </div>
  );
}

async function getDomainPrices() {
  const result = await nameSilo.getDomainPrices();

  if (!result) {
    return [];
  }
  
  const entries = Object.entries(result).filter(([key]) => !(["code", "detail"].includes(key))) as [string, RegistrationData][];

  const data = entries.map(([key, value]) => ({
    tld: key,
    price: value.registration,
    renew: value.renew,
    transfer: value.transfer,
  }));

  const prices = data.map(item => [item.price, item.renew, item.transfer]);
  const convertedPrices = await currencyConversion.convertMultiple({
    from: "usd",
    to: "brl",
    amounts: prices.flat(),
  });

  const convertedData = chunk(convertedPrices, 3).map((chunk, index) => ({
    tld: data[index].tld,
    price: chunk[0],
    renew: chunk[1],
    transfer: chunk[2],
  }));

  return convertedData;
}

// Define the core logic for fetching domain data
const fetchDomainDataLogic = async (searchQueryString: string): Promise<DomainData> => {
  if (!searchQueryString) {
    return null;
  }
  const domainName = searchQueryString.split(".")[0];
  const domainsToSearch = recommendedTlds.map((tld) => `${domainName}${tld}`);

  if (!domainsToSearch.includes(searchQueryString)) {
    domainsToSearch.unshift(searchQueryString);
  }

  const result = await nameSilo.checkDomainAvailability(domainsToSearch);

  const availableDomains = result?.available ?? [];

  const unavailableDomains = (() => {
    if (!result?.unavailable) {
      return [];
    }
    return Array.isArray(result?.unavailable ?? []) ? result.unavailable : [];
  })();

  const domainDataList: DomainWithAvailability[] = availableDomains.map((domain) => ({
    ...domain,
    available: true,
  })).concat(
    ...unavailableDomains.map((domain) => ({
      domain: domain,
      price: 0,
      duration: -1,
      premium: 0,
      renew: 0,
      available: false,
    }))
  );

  const prices = await currencyConversion.convertMultiple({
    from: "usd",
    to: "brl",
    amounts: domainDataList.map((item) => item.price),
  });

  domainDataList.forEach((item, index) => {
    item.price = prices[index];
  });

  const renewPrices = await currencyConversion.convertMultiple({
    from: "usd",
    to: "brl",
    amounts: domainDataList.map((item) => item.renew),
  });

  domainDataList.forEach((item, index) => {
    item.renew = renewPrices[index];
  });

  const mainDomainData = domainDataList.find((item) => item.domain === searchQueryString)!;
    
  return {
    available: mainDomainData?.available,
    domain: mainDomainData,
    extraDomains: domainDataList.filter((item) => item.domain !== searchQueryString),
  };
};

// Create a cached version of the fetching logic
const getDomainDataCached = cache(
  fetchDomainDataLogic,
);

function DomainsPageSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Encontre o Nome de Domínio Perfeito</CardTitle>
          <CardDescription>
            Digite um nome de domínio para verificar a disponibilidade ou obter sugestões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Skeleton height={40} className="w-full pl-10" />
            </div>
            <Skeleton height={40} width={110} /> {/* Adjusted width for "Pesquisar" or similar label */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preços de Nomes de Domínio</CardTitle>
          <CardDescription>Preços para todos os TLDs populares</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TLD</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Registro</TableHead>
                <TableHead className="text-right">Renovação</TableHead>
                <TableHead className="text-right">Transferência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: PRICES_ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={`skeleton-price-${i}`}>
                  <TableCell><Skeleton width="6rem" height="1rem" /></TableCell>
                  <TableCell className="hidden sm:table-cell text-right"><Skeleton width="6rem" height="1rem" /></TableCell>
                  <TableCell className="text-right"><Skeleton width="6rem" height="1rem" /></TableCell>
                  <TableCell className="text-right"><Skeleton width="6rem" height="1rem" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-center">
            <Skeleton height={36} width={250} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

async function DomainsPageCoreContent({
  searchParams: searchParamsPromise // Keep this as searchParams to match the expected prop name
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParamsPromise;

  const searchQuery = typeof resolvedSearchParams?.search === "string" ? resolvedSearchParams.search.trim() : "";
  const currentTab = typeof resolvedSearchParams?.tab === "string" ? resolvedSearchParams.tab : "results";
  const pricesPage = parseInt(typeof resolvedSearchParams?.pricesPage === "string" ? resolvedSearchParams.pricesPage : "1", 10) || 1;

  // getDomainData is now defined inside DomainsPageCoreContent or passed if needed
  async function getDomainData(): Promise<DomainData> {
    return getDomainDataCached(searchQuery);
  }

  const domainData = await getDomainData(); // domainData is resolved here
  const allDomainPrices = await getDomainPrices();
  const pathname = "/domains/register";

  // ... (pagination logic, createTabLink, createPricePageNavigationLink, renderPageNumbers)
  const totalPrices = allDomainPrices.length;
  const totalPricesPages = Math.ceil(totalPrices / PRICES_ITEMS_PER_PAGE);
  const pricesStartIndex = (pricesPage - 1) * PRICES_ITEMS_PER_PAGE;
  const pricesEndIndex = pricesStartIndex + PRICES_ITEMS_PER_PAGE;
  const currentDomainPricesForPage = allDomainPrices.slice(pricesStartIndex, pricesEndIndex);

  const createTabLink = (tabValue: string): string => {
    const newQuery = new URLSearchParams();
    if (searchQuery) newQuery.set("search", searchQuery);
    newQuery.set("tab", tabValue);
    newQuery.set("page", "1"); 
    newQuery.set("pricesPage", "1"); 
    return `${pathname}?${newQuery.toString()}`;
  };

  const createPricePageNavigationLink = (newPage: number): string => {
    const currentParams = new URLSearchParams(resolvedSearchParams as Record<string, string>); // Use resolvedSearchParams
    currentParams.set("pricesPage", newPage.toString());
    return `${pathname}?${currentParams.toString()}`;
  };
  
  const renderPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const MAX_VISIBLE_BUTTONS = 5; 

    if (totalPricesPages <= 1) return [];

    if (totalPricesPages <= MAX_VISIBLE_BUTTONS + 2) { 
      for (let i = 1; i <= totalPricesPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1); 

      let rangeStart = Math.max(2, pricesPage - Math.floor((MAX_VISIBLE_BUTTONS - 2) / 2));
      let rangeEnd = Math.min(totalPricesPages - 1, pricesPage + Math.ceil((MAX_VISIBLE_BUTTONS - 2) / 2));
      
      if (pricesPage < MAX_VISIBLE_BUTTONS -1) {
        rangeEnd = MAX_VISIBLE_BUTTONS -1;
      }
      if (pricesPage > totalPricesPages - (MAX_VISIBLE_BUTTONS - 2)) {
        rangeStart = totalPricesPages - (MAX_VISIBLE_BUTTONS - 2);
      }

      if (rangeStart > 2) {
        pageNumbers.push("...");
      }

      for (let i = rangeStart; i <= rangeEnd; i++) {
        pageNumbers.push(i);
      }

      if (rangeEnd < totalPricesPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPricesPages); 
    }
    
    const uniquePageNumbers: (string | number)[] = [];
    let lastPushed: string | number | undefined;
    for (const p of pageNumbers) {
      if (p === "..." && lastPushed === "...") continue;
      if (p === lastPushed) continue;
      uniquePageNumbers.push(p);
      lastPushed = p;
    }
    return uniquePageNumbers;
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Encontre o Nome de Domínio Perfeito</CardTitle>
          <CardDescription>
              Digite um nome de domínio para verificar a disponibilidade ou obter sugestões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DomainSearchForm searchQuery={searchQuery} />

          {searchQuery && (
            <div className="mt-8">
              <Tabs defaultValue={currentTab} value={currentTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="results" asChild>
                    <Link href={createTabLink("results")} scroll={false}>Resultados</Link>
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" asChild>
                    <Link href={createTabLink("suggestions")} scroll={false}>Sugestões</Link>
                  </TabsTrigger>
                </TabsList>
                  
                <TabsContent value="results">
                  <DomainResult
                    domainData={Promise.resolve(domainData)} // Wrap resolved data in Promise.resolve()
                    searchQuery={searchQuery}
                  />
                </TabsContent>
                  
                <TabsContent value="suggestions">
                  <Suspense fallback={<Skeleton count={5} height={50} />}>
                    <DomainSuggestions
                      domainData={Promise.resolve(domainData)} // Wrap resolved data in Promise.resolve()
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
        {/* ... Card content for domain prices ... */}
        <CardHeader>
          <CardTitle>Preços de Nomes de Domínio</CardTitle>
          <CardDescription>Preços para todos os TLDs populares</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TLD</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Registro</TableHead>
                <TableHead className="text-right">Renovação</TableHead>
                <TableHead className="text-right">Transferência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Suspense fallback={
                Array.from({ length: PRICES_ITEMS_PER_PAGE }).map((_, i) => (
                  <TableRow key={`skeleton-row-${i}`}>
                    <TableCell className="font-medium text-left">
                      <span><Skeleton width="6rem" height="1rem" /></span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right">
                      <span><Skeleton width="6rem" height="1rem" /></span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span><Skeleton width="6rem" height="1rem" /></span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span><Skeleton width="6rem" height="1rem" /></span>
                    </TableCell>
                  </TableRow>
                ))
              }>
                <DomainPriceTableRows items={currentDomainPricesForPage} />
              </Suspense>
            </TableBody>
          </Table>
          {totalPricesPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  {pricesPage > 1 ? (
                    <PaginationPrevious href={createPricePageNavigationLink(pricesPage - 1)} />
                  ) : (
                    <span className={cn(buttonVariants({ variant: "ghost", size: "default" }), "gap-1 pl-2.5 opacity-50 cursor-not-allowed")}>
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </span>
                  )}
                </PaginationItem>
                {renderPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {typeof page === "number" ? (
                      <PaginationLink
                        href={createPricePageNavigationLink(page)}
                        isActive={pricesPage === page}
                      >
                        {page}
                      </PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  {pricesPage < totalPricesPages ? (
                    <PaginationNext href={createPricePageNavigationLink(pricesPage + 1)} />
                  ) : (
                    <span className={cn(buttonVariants({ variant: "ghost", size: "default" }), "gap-1 pr-2.5 opacity-50 cursor-not-allowed")}>
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </>
  );
}

async function DomainPriceTableRows({ items }: {
  items: {
    tld: string;
    price: number;
    renew: number;
    transfer: number;
  }[];
}) {
  // const resolvedItems = await items; // No longer a promise
  return items.map(item => (
    <TableRow key={item.tld}>
      <TableCell className="font-medium">.{item.tld}</TableCell>
      <TableCell className="hidden sm:table-cell text-right">{toBrl(item.price)}</TableCell>
      <TableCell className="text-right">{toBrl(item.renew)}</TableCell>
      <TableCell className="text-right">{toBrl(item.transfer)}</TableCell>
    </TableRow>
  ));
}

export type DomainWithAvailability = Domain & { available: boolean };

export type DomainData = {
    available: boolean;
    domain: DomainWithAvailability;
    extraDomains: DomainWithAvailability[];
} | null

const recommendedTlds: `.${string}`[] = [".com", ".net", ".org", ".io", ".dev", ".co", ".app", ".online"];