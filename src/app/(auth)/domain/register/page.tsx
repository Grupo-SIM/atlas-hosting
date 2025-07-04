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
import Link from "next/link";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { createDomainInvoice } from "@/app/actions";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import { inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import RegisterDomainSearch from "../components/RegisterDomainSearch";
import type {
  DomainPageParams,
  DomainPriceInfo,
  DomainPriceInfoFromDb,
} from "../types";
import { getDomainData, popularExtensions } from "../utils";

export default async function DomainsPage({
  searchParams: searchParamsProp,
}: {
  searchParams: Promise<DomainPageParams>;
}) {
  const resolvedSearchParams = await searchParamsProp;
  const searchQuery = resolvedSearchParams.domain
    ? String(resolvedSearchParams.domain).trim()
    : "";

  let isError = false;

  const allDomainPricesFromDbPromise = getAllDomainPricesFromDb(
    popularExtensions.map((tld) => tld.substring(1))
  );

  const domainDataPromise = (async () => {
    if (!searchQuery || searchQuery.trim() === "") {
      isError = false;
      return null;
    }

    try {
      return getDomainData(searchQuery);
    } catch (err) {
      if (err instanceof Error && err.message.includes("pricing_unavailable")) {
        isError = true;
        throw err;
      }
      isError = true;
      return null;
    }
  })();

  if (resolvedSearchParams.confirm) {
    const redirectUrl = await createDomainInvoice({
      whoisguard: resolvedSearchParams.whoisguard,
      domain: searchQuery,
      years: resolvedSearchParams.years ?? "1",
    });

    if (redirectUrl) {
      redirect(redirectUrl);
    }

    isError = true;
  }

  return (
    <span>
      <TabsContent
        key="rt"
        defaultValue="register"
        value="register"
        className="space-y-8 mt-8"
      >
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Digite no campo de pesquisa o nome de domínio que você deseja e
            descubra se ele está disponível!
          </p>
          <RegisterDomainSearch domain={resolvedSearchParams.domain} />
        </div>

        <DomainExtensionsGrid
          allDomainPricesFromDbPromise={allDomainPricesFromDbPromise}
        />

        {isError ? (
          <div className="max-w-4xl mx-auto">
            <Card className="border-destructive/80">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full text-destructive"
                  >
                    <title>Erro ao Buscar Domínio</title>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-destructive">
                  Domínio Inválido
                </h2>
                <p className="text-muted-foreground mb-4">
                  O domínio &quot;
                  <span className="font-medium">{searchQuery}</span>&quot; não é
                  válido ou não pode ser adquirido no momento.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Verifique se o nome do domínio está correto ou tente pesquisar
                  por uma extensão diferente.
                </p>
                <Button variant="outline" asChild={true}>
                  <Link href="/domain/register">Fazer uma nova pesquisa</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          searchQuery && (
            <div className="max-w-4xl mx-auto">
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
                    <DomainResult
                      searchParams={{
                        ...resolvedSearchParams,
                        domain: searchQuery,
                      }}
                    />
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
          )
        )}

        {!searchQuery && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mb-4">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-full h-full text-primary"
                >
                  <title>Registrar Domínio</title>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Registre um domínio para colocar seu site online
              </h2>
              <p className="text-muted-foreground mb-6">
                Registre um novo domínio ou configure suas zonas DNS.
              </p>
              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild={true}>
                  <Link href="#search">Comprar novo domínio</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  asChild={true}
                >
                  <Link href="/domains">Gerenciar domínios existentes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </span>
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
              {[...new Array(ITEMS_PER_TLD_PAGE_SKELETON)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: necessary for skeletons
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
      const priceBrl =
        item.priceUSD != null
          ? await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: item.priceUSD,
            })
          : undefined;
      const renewBrl =
        item.renewUSD != null
          ? await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: item.renewUSD,
            })
          : undefined;
      const transferBrl =
        item.transferUSD != null
          ? await currencyConversion.convert({
              from: "usd",
              to: "brl",
              amount: item.transferUSD,
            })
          : undefined;

      return {
        tld: item.tld,
        price: priceBrl, // Now BRL
        renew: renewBrl, // Now BRL
        transfer: transferBrl, // Now BRL
        minRegisterYears: item.minRegisterYears ?? undefined,
        maxRegisterYears: item.maxRegisterYears ?? undefined,
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

    return cachedPrices.map((item) => ({
      tld: item.tld,
      priceUSD: item.price,
      renewUSD: item.renew,
      transferUSD: item.transfer,
      minRegisterYears: item.minRegisterYears,
      maxRegisterYears: item.maxRegisterYears,
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
    popularExtensions.map(async (ext) => {
      const tldName = ext.substring(1); // Remove the dot
      const tldData = allDomainPricesFromDb.find(
        (item) => item.tld === tldName
      );

      if (tldData?.priceUSD) {
        const priceBrl = await currencyConversion.convert({
          from: "usd",
          to: "brl",
          amount: tldData.priceUSD,
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
      {extensionsWithPricing.map((domain) => (
        <Card key={domain.extension} className="text-center">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold">{domain.extension}</p>
            <p className="text-sm text-muted-foreground">{domain.price}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const ITEMS_PER_TLD_PAGE_SKELETON = 10;
