import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
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
import { toBrl } from "@/lib/utils";
import "react-loading-skeleton/dist/skeleton.css";

import { inArray } from "drizzle-orm";
import RegisterDomainSearch from "@/app/(auth)/domain/register/components/RegisterDomainSearch";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import type {
  DomainData,
  DomainPageParams,
  DomainPriceInfo,
  DomainPriceInfoFromDb,
} from "./types";
import { getDomainData, popularExtensions } from "./utils";

export default async function DomainsPage({
  searchParams: searchParamsProp,
}: {
  searchParams: Promise<DomainPageParams>;
}) {
  const resolvedSearchParams = await searchParamsProp;
  const searchQuery = resolvedSearchParams.search
    ? String(resolvedSearchParams.search).trim()
    : "";

  let isError = false;

  const allDomainPricesFromDbPromise = getAllDomainPricesFromDb(
    popularExtensions.map(tld => tld.substring(1))
  );

  const domainDataPromise = (async () => {
    return new Promise<DomainData | null>((resolve, reject) => {
      if (!searchQuery || searchQuery.trim() === "") {
        isError = false;
        resolve(null);
        return;
      }

      try {
        return getDomainData(searchQuery);
      } catch (err) {
        if (
          err instanceof Error &&
          err.message.includes("pricing_unavailable")
        ) {
          isError = true;
          reject(err);
        }
        isError = true;
        resolve(null);
      }
    });
  })().catch(err => {
    throw err;
  });

  return (
    <div className="h-full max-h-full space-y-8 p-6">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="font-bold text-3xl">Compre um Novo Domínio</h1>

        <div className="inline-flex w-full max-w-2xl rounded-full bg-white p-1 dark:bg-accent">
          <Button className="flex-1 rounded-full bg-primary" variant="default">
            Encontrar novo domínio
          </Button>
          <Button className="flex-1 rounded-full" variant="ghost">
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar domínio usando IA
          </Button>
        </div>

        <p className="text-muted-foreground">
          Digite no campo de pesquisa o nome de domínio que você deseja e
          descubra se ele está disponível!
        </p>

        <RegisterDomainSearch />
      </div>

      <DomainExtensionsGrid
        allDomainPricesFromDbPromise={allDomainPricesFromDbPromise}
      />

      {isError ? (
        <div className="mx-auto max-w-4xl">
          <Card className="border-destructive/80">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 h-16 w-16">
                <svg
                  className="h-full w-full text-destructive"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <title>Erro ao Buscar Domínio</title>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" x2="9" y1="9" y2="15" />
                  <line x1="9" x2="15" y1="9" y2="15" />
                </svg>
              </div>
              <h2 className="mb-2 font-semibold text-2xl text-destructive">
                Domínio Inválido
              </h2>
              <p className="mb-4 text-muted-foreground">
                O domínio &quot;
                <span className="font-medium">{searchQuery}</span>&quot; não é
                válido ou não pode ser adquirido no momento.
              </p>
              <p className="mb-6 text-muted-foreground text-sm">
                Verifique se o nome do domínio está correto ou tente pesquisar
                por uma extensão diferente.
              </p>
              <Button asChild={true} variant="outline">
                <Link href="/domains/register">Fazer uma nova pesquisa</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        searchQuery && (
          <div className="mx-auto max-w-4xl">
            <Tabs defaultValue="results">
              <TabsList className="mb-4">
                <TabsTrigger value="results">Resultados</TabsTrigger>
                <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
              </TabsList>
              <TabsContent value="results">
                <Suspense
                  fallback={
                    <Skeleton
                      containerClassName="space-y-3"
                      count={3}
                      height={30}
                    />
                  }
                >
                  <DomainResult searchParams={resolvedSearchParams} />
                </Suspense>
              </TabsContent>
              <TabsContent value="suggestions">
                <Suspense
                  fallback={
                    <Skeleton
                      containerClassName="space-y-4"
                      count={5}
                      height={50}
                    />
                  }
                >
                  {!!resolvedSearchParams.error && (
                    <DomainSuggestions
                      domainDataPromise={domainDataPromise}
                      searchQuery={searchQuery}
                    />
                  )}
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>
        )
      )}

      {!searchQuery && (
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 h-16 w-16">
              <svg
                className="h-full w-full text-primary"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <title>Registrar Domínio</title>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </div>
            <h2 className="mb-2 font-semibold text-2xl">
              Registre um domínio para colocar seu site online
            </h2>
            <p className="mb-6 text-muted-foreground">
              Registre um novo domínio ou configure suas zonas DNS.
            </p>
            <div className="space-y-3">
              <Button asChild={true} className="w-full" size="lg">
                <Link href="#search">Comprar novo domínio</Link>
              </Button>
              <Button
                asChild={true}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <Link href="/domains">Gerenciar domínios existentes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full TLD Table */}
      {/* <div className="max-w-6xl mx-auto">
        <Suspense fallback={<TldPriceTableSkeleton />}>
          <TldPriceSectionFromDb
            allDomainPricesFromDbPromise={allDomainPricesFromDbPromise}
          />
        </Suspense>
      </div> */}
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
        <Input className="mt-2" placeholder="Pesquisar TLD" type="search" />
      </CardHeader>
      <CardContent>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TLD</TableHead>
                <TableHead className="hidden text-right sm:table-cell">
                  Registro (BRL)
                </TableHead>
                <TableHead className="text-right">Renovação (BRL)</TableHead>
                <TableHead className="text-right">
                  Transferência (BRL)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...new Array(ITEMS_PER_TLD_PAGE_SKELETON)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: necessary for skeletons
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <Skeleton height="1rem" width="6rem" />
                  </TableCell>
                  <TableCell className="hidden text-right sm:table-cell">
                    <Skeleton height="1rem" width="6rem" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton height="1rem" width="6rem" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton height="1rem" width="6rem" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mx-auto flex w-full justify-center pt-4">
            <Skeleton height="2.25rem" width="15rem" />
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
    allDomainPricesFromDb.map(async item => {
      // Assuming your currencyConversion.convert can handle null/undefined gracefully or we check
      const priceBrl =
        item.priceUSD != null
          ? await currencyConversion.convert({
              amount: item.priceUSD,
              from: "usd",
              to: "brl",
            })
          : undefined;
      const renewBrl =
        item.renewUSD != null
          ? await currencyConversion.convert({
              amount: item.renewUSD,
              from: "usd",
              to: "brl",
            })
          : undefined;
      const transferBrl =
        item.transferUSD != null
          ? await currencyConversion.convert({
              amount: item.transferUSD,
              from: "usd",
              to: "brl",
            })
          : undefined;

      return {
        maxRegisterYears: item.maxRegisterYears ?? undefined,
        minRegisterYears: item.minRegisterYears ?? undefined,
        price: priceBrl, // Now BRL
        renew: renewBrl, // Now BRL
        tld: item.tld,
        transfer: transferBrl, // Now BRL
      };
    })
  );

  return <PaginatedTldTable allTldData={convertedPricesForTable} />;
}

// This function now fetches USD prices from your Drizzle DB cache
async function getAllDomainPricesFromDb(
  domains?: string[]
): Promise<DomainPriceInfoFromDb[]> {
  try {
    const cachedPrices = await db.query.pgDomainPricingCache.findMany({
      where:
        domains && domains.length > 0
          ? inArray(pgDomainPricingCache.tld, domains)
          : undefined,
    });

    if (!cachedPrices || cachedPrices.length === 0) {
      return [];
    }

    return cachedPrices.map(item => ({
      maxRegisterYears: item.maxRegisterYears,
      minRegisterYears: item.minRegisterYears,
      priceUSD: item.price,
      renewUSD: item.renew,
      tld: item.tld,
      transferUSD: item.transfer,
    }));
  } catch (_error) {
    return [];
  }
}

// function DomainExtensionsGridSkeleton() {
//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
//       {[...new Array(6)].map((_, i) => (
//         <Card key={`skeleton-${i}`} className="text-center">
//           <CardContent className="pt-6">
//             <Skeleton width="4rem" height="1.125rem" className="mx-auto mb-2" />
//             <Skeleton width="5rem" height="0.875rem" className="mx-auto" />
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }

async function DomainExtensionsGrid({
  allDomainPricesFromDbPromise,
}: {
  allDomainPricesFromDbPromise: Promise<DomainPriceInfoFromDb[]>;
}) {
  const allDomainPricesFromDb = await allDomainPricesFromDbPromise;

  // Get pricing for popular extensions
  const extensionsWithPricing = await Promise.all(
    popularExtensions.map(async ext => {
      const tldName = ext.substring(1); // Remove the dot
      const tldData = allDomainPricesFromDb.find(item => item.tld === tldName);

      if (tldData?.priceUSD) {
        const priceBrl = await currencyConversion.convert({
          amount: tldData.priceUSD,
          from: "usd",
          to: "brl",
        });

        return {
          extension: ext,
          price: toBrl(priceBrl),
        };
      }

      return {
        extension: ext,
        price: "Consulte",
      };
    })
  );

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {extensionsWithPricing.map(domain => (
        <Card className="text-center" key={domain.extension}>
          <CardContent className="pt-6">
            <p className="font-semibold text-lg">{domain.extension}</p>
            <p className="text-muted-foreground text-sm">{domain.price}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const ITEMS_PER_TLD_PAGE_SKELETON = 10;
