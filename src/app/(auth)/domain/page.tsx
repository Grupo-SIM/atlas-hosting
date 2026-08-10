import { Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createDomainBundleInvoice, createDomainInvoice } from "@/app/actions";
import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DomainBundleSection } from "./register/components/DomainBundleSection";
import RegisterDomainSearch from "./register/components/RegisterDomainSearch";
import { TransferForm } from "./register/components/TransferForm";
import type { DomainPageParams } from "./types";
import { getDomainData } from "./utils";

interface DomainMainPageProps {
  searchParams: Promise<DomainPageParams & { tab?: string }>;
}

function getReturnTo(value: string | undefined): "/domains" | "/home" {
  return value === "/domains" ? "/domains" : "/home";
}

function getDomainTabHref(tab: "register" | "transfer", returnTo: string) {
  const params = new URLSearchParams({ returnTo, tab });
  return `/domain?${params.toString()}`;
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
  const returnTo = getReturnTo(resolvedSearchParams.returnTo);
  const domain = resolvedSearchParams.domain
    ? String(resolvedSearchParams.domain).trim()
    : "";
  const bundleDomains = parseBundleDomains(resolvedSearchParams.bundle);

  // Validate tab parameter
  if (activeTab !== "register" && activeTab !== "transfer") {
    redirect(getDomainTabHref("register", returnTo));
  }

  let isError = false;
  // Handle domain search for register tab
  if (domain && activeTab === "register") {
    try {
      await getDomainData(domain);
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

  return (
    <div className="w-full">
      <div className="mx-auto mb-8 flex w-full max-w-2xl rounded-xl bg-muted/50 p-1">
        <Link
          className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === "register"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground/80"
          }`}
          href={getDomainTabHref("register", returnTo)}
        >
          Encontrar novo domínio
        </Link>
        <Link
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === "transfer"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground/80"
          }`}
          href={getDomainTabHref("transfer", returnTo)}
        >
          <Sparkles className="h-4 w-4" />
          Conectar domínio existente
        </Link>
      </div>

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
            <RegisterDomainSearch domain={domain} returnTo={returnTo} />
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

        <TabsContent className="mt-6" value="transfer">
          <div className="mx-auto max-w-5xl space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Conectar domínio existente</CardTitle>
                <CardDescription>
                  Adicione o domínio sem transferir o registro para o Atlas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransferForm defaultDomain={domain} />
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardContent className="grid gap-4 p-5 text-sm md:grid-cols-3">
                <div>
                  <p className="font-medium">1. Comprove a propriedade</p>
                  <p className="mt-1 text-muted-foreground">
                    Abra as instruções na lista de domínios, adicione o TXT e
                    verifique.
                  </p>
                </div>
                <div>
                  <p className="font-medium">2. Escolha como usar o DNS</p>
                  <p className="mt-1 text-muted-foreground">
                    O Atlas pode gerenciar os registros ou apenas acompanhar o
                    domínio.
                  </p>
                </div>
                <div>
                  <p className="font-medium">3. Conclua nos detalhes</p>
                  <p className="mt-1 text-muted-foreground">
                    Após verificar, você seguirá automaticamente para as
                    próximas instruções.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
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
        returnTo={searchParams.returnTo}
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
