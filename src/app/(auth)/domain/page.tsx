import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import { PaginatedTldTable } from "@/components/domains/PaginatedTldTable";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import type { DomainPageParams } from "./types";
import type { OrganizationDomain } from "@/lib/db/schema/tables/organization";
import { getDomainData, popularExtensions } from "./utils";
import RegisterDomainSearch from "./register/components/RegisterDomainSearch";
import { TransferForm } from "./register/components/TransferForm";
import { TransferDomainsList } from "./register/components/TransferDomainsList";
import { NameserverGuide } from "./register/components/NameserverGuide";
import { createDomainInvoice } from "@/app/actions";
import currencyConversion from "@/lib/server/apis/currency";
import { query } from "dns-query";

interface DomainMainPageProps {
  searchParams: Promise<DomainPageParams & { tab?: string }>;
}

async function getAllDomainPricesFromDb(tlds: string[]) {
  const domainPricesFromDb = await db
    .select()
    .from(pgDomainPricingCache)
    .where(inArray(pgDomainPricingCache.tld, tlds));

  const convertedPrices = await Promise.all(
    domainPricesFromDb.map(async (item) => {
      const registrationPrice = item.price
        ? await currencyConversion.convert({
            from: "usd",
            to: "brl",
            amount: item.price,
          })
        : 0;

      const renewalPrice = item.renew
        ? await currencyConversion.convert({
            from: "usd",
            to: "brl",
            amount: item.renew,
          })
        : 0;

      const transferPrice = item.transfer
        ? await currencyConversion.convert({
            from: "usd",
            to: "brl",
            amount: item.transfer,
          })
        : 0;

      return {
        tld: item.tld,
        price: item.price ?? undefined,
        renew: item.renew ?? undefined,
        transfer: item.transfer ?? undefined,
        minRegisterYears: item.minRegisterYears ?? undefined,
        maxRegisterYears: item.maxRegisterYears ?? undefined,
        registrationPrice,
        renewalPrice,
        transferPrice,
      };
    })
  );

  return convertedPrices;
}

export default async function DomainPage({
  searchParams,
}: DomainMainPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || "register";
  const domain = resolvedSearchParams.domain
    ? String(resolvedSearchParams.domain).trim()
    : "";

  // Validate tab parameter
  if (activeTab !== "register" && activeTab !== "transfer") {
    redirect("/domain?tab=register");
  }

  const user = await getUser();

  // Get existing domains that are in transfer status (active: false)
  const transferDomains = user.organization.domains.filter(
    (d: OrganizationDomain) => !d.active
  );

  let isError = false;
  let domainData = null;

  const allDomainPricesFromDbPromise = getAllDomainPricesFromDb(
    popularExtensions.map((tld: string) => tld.substring(1))
  );

  // Handle domain search for register tab
  if (domain && activeTab === "register") {
    try {
      domainData = await getDomainData(domain);
    } catch (err) {
      if (err instanceof Error && err.message.includes("pricing_unavailable")) {
        isError = true;
      }
    }
  }

  // Handle domain registration confirmation
  if (resolvedSearchParams.confirm && domain) {
    const redirectUrl = await createDomainInvoice({
      whoisguard: resolvedSearchParams.whoisguard,
      domain: domain,
      years: resolvedSearchParams.years ?? "1",
    });

    if (redirectUrl) {
      redirect(redirectUrl);
    }
  }

  Promise.all(
    transferDomains.map(async (domain: OrganizationDomain) => {
      // check if already registered the nameservers
      const done = [];
      const r = await query(
        {
          question: {
            name: domain.domain,
            type: "NS",
          },
        },
        { endpoints: ["1.1.1.1", "8.8.8.8"] }
      );
      if (
        !r.answers?.some(
          (answer) =>
            answer.type === "NS" &&
            [
              "dns1.registrar-servers.com",
              "dns2.registrar-servers.com",
            ].includes(answer.data.trim())
        )
      ) {
        console.log(`Nameservers already registered for ${domain.domain}`);
      } else {
        done.push(domain.domain);
      }
    })
  );

  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto">
        <TabsTrigger value="register" asChild>
          <Link href="/domain?tab=register">Encontrar novo domínio</Link>
        </TabsTrigger>
        <TabsTrigger value="transfer" asChild>
          <Link href="/domain?tab=transfer" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Transferir domínio existente
          </Link>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="register" className="space-y-8 mt-8">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Digite no campo de pesquisa o nome de domínio que você deseja e
            descubra se ele está disponível!
          </p>
          <RegisterDomainSearch domain={domain} />
        </div>

        {/* TODO: reativar quando necessário */}
        {/* <Suspense fallback={<div>Carregando extensões de domínio...</div>}>
          <DomainExtensionsGrid
            allDomainPricesFromDbPromise={allDomainPricesFromDbPromise}
          />
        </Suspense> */}

        {domain && (
          <Suspense fallback={<div>Verificando disponibilidade...</div>}>
            {isError ? (
              <DomainErrorCard />
            ) : (
              <DomainSearchResults searchParams={resolvedSearchParams} />
            )}
          </Suspense>
        )}
      </TabsContent>

      <TabsContent value="transfer" className="space-y-8 mt-8">
        <div className="grid grid-cols-[1fr_auto] gap-8">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Transferir Domínio Existente
              </CardTitle>
              <CardDescription>
                Adicione seu domínio existente à sua organização Atlas Hosting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TransferForm defaultDomain={domain} />

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">
                  Como funciona a transferência:
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Adicione seu domínio existente</p>
                  <p>• Configure os nameservers no seu registrador atual</p>
                  <p>• Aguarde a propagação DNS (1-24 horas)</p>
                  <p>• Seu domínio ficará ativo na organização</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-2xl flex flex-col">
            <CardHeader>
              <CardTitle>Guia de Transferência</CardTitle>
              <CardDescription>
                Instruções para transferir seu domínio para a Atlas Hosting
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 justify-center h-full">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Nameservers Atlas Hosting
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-muted rounded-md font-mono text-sm">
                    dns1.registrar-servers.com
                  </div>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm">
                    dns2.registrar-servers.com
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <NameserverGuide />
              </div>
            </CardContent>
          </Card>
        </div>

        <TransferDomainsList domains={transferDomains} />
      </TabsContent>
    </Tabs>
  );
}

// Domain Extensions Grid Component
async function DomainExtensionsGrid({
  allDomainPricesFromDbPromise,
}: {
  allDomainPricesFromDbPromise: Promise<
    Array<{
      tld: string;
      price?: number;
      renew?: number;
      transfer?: number;
      minRegisterYears?: number;
      maxRegisterYears?: number;
      registrationPrice: number;
      renewalPrice: number;
      transferPrice: number;
    }>
  >;
}) {
  const allTldData = await allDomainPricesFromDbPromise;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Extensões de Domínio Populares</CardTitle>
          <CardDescription>
            Escolha entre nossas extensões mais populares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaginatedTldTable allTldData={allTldData} />
        </CardContent>
      </Card>
    </div>
  );
}

// Domain Search Results Component
function DomainSearchResults({
  searchParams,
}: {
  searchParams: DomainPageParams;
}) {
  const domainDataPromise = searchParams.domain
    ? getDomainData(searchParams.domain)
    : Promise.resolve(null);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <DomainResult searchParams={searchParams} />
      <DomainSuggestions
        domainDataPromise={domainDataPromise}
        searchQuery={searchParams.domain || ""}
      />
    </div>
  );
}

// Domain Error Card Component
function DomainErrorCard() {
  return (
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
            O domínio que você pesquisou não é válido ou não está disponível
            para registro.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
