import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
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
import currencyConversion from "@/lib/server/apis/currency";
import nameSilo from "@/lib/server/apis/namesilo";
import { Domain, RegistrationData } from "@/lib/server/apis/namesilo/types";
import { toBrl } from "@/lib/utils";
import { chunk } from "lodash";
import { Search } from "lucide-react";
import { cache, Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const searchQuery = params.search ? params.search.toString().trim() : "";

  async function getDomainPrices() {
    const result = await nameSilo.getDomainPrices();

    if (!result) {
      return [];
    }

    const entries = Object.entries(result).filter(
      ([key]) => !["code", "detail"].includes(key)
    ) as [string, RegistrationData][];

    const data = entries.map(([key, value]) => ({
      tld: key,
      price: value.registration,
      renew: value.renew,
      transfer: value.transfer,
    }));

    const prices = data.map((item) => [item.price, item.renew, item.transfer]);
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

  const domainData = getDomainData(searchQuery);
  const domainPrices = getDomainPrices();

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
                  <DomainResult searchQuery={searchQuery} />
                </TabsContent>

                <TabsContent value="suggestions">
                  <Suspense fallback={<Skeleton count={5} height={50} />}>
                    <DomainSuggestions
                      domainData={domainData}
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
          <CardDescription>Preços para todos os TLDs populares</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>TLD</TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  Registro
                </TableHead>
                <TableHead className="text-right">Renovação</TableHead>
                <TableHead className="text-right">Transferência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Suspense
                fallback={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-left">
                      <span>
                        <Skeleton width="6rem" height="1rem" />
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span>
                        <Skeleton width="6rem" height="1rem" />
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span>
                        <Skeleton width="6rem" height="1rem" />
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span>
                        <Skeleton width="6rem" height="1rem" />
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              >
                <DomainPriceTableRows items={domainPrices} />
              </Suspense>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

async function DomainPriceTableRows({
  items,
}: {
  items: Promise<
    {
      tld: string;
      price: number;
      renew: number;
      transfer: number;
    }[]
  >;
}) {
  const resolvedItems = await items;
  return resolvedItems.map((item) => (
    <TableRow key={item.tld}>
      <TableCell className="font-medium">.{item.tld}</TableCell>
      <TableCell className="hidden sm:table-cell text-right">
        {toBrl(item.price)}
      </TableCell>
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
} | null;

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

export const getDomainData = cache(async function getDomainData(
  searchQuery: string
): Promise<DomainData> {
  if (searchQuery) {
    const domainName = searchQuery.split(".")[0];
    const domainsToSearch = recommendedTlds.map((tld) => `${domainName}${tld}`);

    if (!domainsToSearch.includes(searchQuery)) {
      domainsToSearch.unshift(searchQuery);
    }

    const result = await nameSilo.checkDomainAvailability(domainsToSearch);

    const availableDomains = result?.available ?? [];
    const unavailableDomains =
      (Array.isArray(result?.unavailable) ? result?.unavailable : []) ?? [];

    const domainData: DomainWithAvailability[] = availableDomains
      .map((domain) => ({
        ...domain,
        available: true,
      }))
      .concat(
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
      amounts: domainData.map((item) => item.price),
    });

    domainData.forEach((item, index) => {
      item.price = prices[index];
    });

    const renewPrices = await currencyConversion.convertMultiple({
      from: "usd",
      to: "brl",
      amounts: domainData.map((item) => item.renew),
    });

    domainData.forEach((item, index) => {
      item.renew = renewPrices[index];
    });

    const mainDomainData = domainData.find(
      (item) => item.domain === searchQuery
    )!;

    return {
      available: mainDomainData?.available,
      domain: mainDomainData,
      extraDomains: domainData.filter((item) => item.domain !== searchQuery),
    };
  }

  return null;
});
