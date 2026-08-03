import { query } from "dns-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createDomainBundleInvoice, createDomainInvoice } from "@/app/actions";
import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import { PaginatedTldTable } from "@/components/domains/PaginatedTldTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { getUser } from "@/lib/auth";
import type { OrganizationDomain } from "@/lib/db/schema/tables/organization";
import { DomainBundleSection } from "./register/components/DomainBundleSection";
import RegisterDomainSearch from "./register/components/RegisterDomainSearch";
import { TransferDomainsList } from "./register/components/TransferDomainsList";
import { TransferForm } from "./register/components/TransferForm";
import type { DomainPageParams } from "./types";
import { getAllDomainPrices, getDomainData, popularExtensions } from "./utils";

interface DomainMainPageProps {
  searchParams: Promise<DomainPageParams & { tab?: string }>;
}

function parseBundleDomains(raw: string | string[] | undefined): string[] {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s?.trim()) return [];
  return [
    ...new Set(
      s
        .split(",")
        .map(d => d.trim().toLowerCase())
        .filter(d => d.includes("."))
    ),
  ].slice(0, 5);
}

export default async function DomainPage({
  searchParams,
}: DomainMainPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams.tab || "register";
  const domain = resolvedSearchParams.domain
    ? String(resolvedSearchParams.domain).trim()
    : "";
  const bundleDomains = parseBundleDomains(resolvedSearchParams.bundle);

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

  const allDomainPricesFromDbPromise = getAllDomainPrices(
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

  // Pacote (2–5 domínios): uma fatura
  if (resolvedSearchParams.confirm && bundleDomains.length >= 2) {
    const res = await createDomainBundleInvoice({
      domains: bundleDomains,
      whoisguard: resolvedSearchParams.whoisguard === "on" ? "on" : "off",
      years: resolvedSearchParams.years ?? "1",
    });

    if (res && "redirectUrl" in res && res.redirectUrl) {
      redirect(res.redirectUrl);
    }
  }

  // Domínio único
  if (resolvedSearchParams.confirm && domain && bundleDomains.length < 2) {
    const res = await createDomainInvoice({
      domain,
      whoisguard: resolvedSearchParams.whoisguard,
      years: resolvedSearchParams.years ?? "1",
    });

    if (res && "redirectUrl" in res && res.redirectUrl) {
      redirect(res.redirectUrl);
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
        r.answers?.some(
          answer =>
            answer.type === "NS" &&
            [
              "dns1.registrar-servers.com",
              "dns2.registrar-servers.com",
            ].includes(answer.data.trim())
        )
      ) {
        done.push(domain.domain);
      }
    })
  );

  return (
    <div className="w-full">
      {/* Tabs navigation oculta — aba de transferência desativada temporariamente */}
      {/* 
      <div className="flex w-full max-w-2xl mx-auto bg-muted/50 p-1 rounded-xl mb-8">
        <Link 
          href="/domain?tab=register" 
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg transition-all duration-200 font-medium ${
            activeTab === "register" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground/80"
          }`}
        >
          Encontrar novo domínio
        </Link>
        <Link 
          href="/domain?tab=transfer" 
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 font-medium ${
            activeTab === "transfer" 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground/80"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Transferir domínio existente
        </Link>
      </div>
      */}

      <Tabs className="w-full" value={activeTab}>
        {/* Usamos apenas o TabsContent agora, pois a navegação acima muda a URL e o value={activeTab} */}

        <TabsContent className="mt-8 space-y-8" value="register">
          {bundleDomains.length >= 2 ? (
            <Suspense
              fallback={
                <div className="text-center text-muted-foreground">
                  Carregando pacote…
                </div>
              }
            >
              <DomainBundleSection domains={bundleDomains} />
            </Suspense>
          ) : null}

          <div className="space-y-4 text-center">
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

        <TabsContent className="mt-8 space-y-8" value="transfer">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_auto]">
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
                  <h3 className="mb-3 font-semibold">
                    Como funciona a transferência:
                  </h3>
                  <div className="space-y-2 text-muted-foreground text-sm">
                    <p>• Adicione seu domínio existente acima</p>
                    <p>
                      • No painel do seu registrador atual, crie ou edite o{" "}
                      <strong>Registro A</strong>
                    </p>
                    <p>
                      • Aponte o registro A para o IP do nosso servidor:{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {process.env.SERVER_IP || "186.194.55.237"}
                      </code>
                    </p>
                    <p>
                      • Aguarde a propagação DNS (geralmente 5 min a 24 horas)
                    </p>
                    <p>
                      • Clique em &quot;Verificar&quot; para confirmar e ativar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex max-w-2xl flex-col">
              <CardHeader>
                <CardTitle>Guia de Configuração</CardTitle>
                <CardDescription>
                  Como apontar seu domínio para a Atlas Hosting
                </CardDescription>
              </CardHeader>
              <CardContent className="flex h-full flex-col justify-center gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    IP do Servidor Atlas
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md bg-muted p-3 font-mono text-sm">
                      <span>
                        Registro A → {process.env.SERVER_IP || "186.194.55.237"}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      Configure este IP como valor do registro A (tipo A) no seu
                      registrador atual (Hostinger, GoDaddy, Registro.br, etc.)
                    </p>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium text-sm">
                      Passo a passo rápido:
                    </h4>
                    <ol className="list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                      <li>Acesse o painel DNS do seu registrador</li>
                      <li>
                        Encontre ou crie um registro do tipo <strong>A</strong>
                      </li>
                      <li>
                        No campo &quot;Host&quot; ou &quot;Nome&quot;, coloque{" "}
                        <code className="rounded bg-muted px-1 text-xs">@</code>
                      </li>
                      <li>
                        No campo &quot;Valor&quot; ou &quot;Aponta para&quot;,
                        cole:{" "}
                        <code className="rounded bg-muted px-1 text-xs">
                          {process.env.SERVER_IP || "186.194.55.237"}
                        </code>
                      </li>
                      <li>Salve e aguarde a propagação</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TransferDomainsList domains={transferDomains} />
        </TabsContent>
      </Tabs>
    </div>
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
    <div className="mx-auto max-w-4xl">
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
    <div className="mx-auto max-w-4xl space-y-6" key={searchParams.domain}>
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
            O domínio que você pesquisou não é válido ou não está disponível
            para registro.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
