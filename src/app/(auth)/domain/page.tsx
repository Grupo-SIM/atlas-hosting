import { Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createDomainBundleInvoice, createDomainInvoice } from "@/app/actions";
import { DomainResult } from "@/components/domains/DomainResult";
import { DomainSuggestions } from "@/components/domains/DomainSuggestions";
import { PageBackButton } from "@/components/layouts/components/PageBackButton";
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
import { createDomainVerificationRecord } from "@/lib/server/domains/verification";
import { DomainBundleSection } from "./register/components/DomainBundleSection";
import RegisterDomainSearch from "./register/components/RegisterDomainSearch";
import { TransferDomainsList } from "./register/components/TransferDomainsList";
import { TransferForm } from "./register/components/TransferForm";
import type { DomainPageParams } from "./types";
import { getDomainData } from "./utils";

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
  const verificationSecret =
    process.env.DOMAIN_VERIFICATION_SECRET || process.env.AUTH_SECRET;
  const verificationRecords = verificationSecret
    ? Object.fromEntries(
        transferDomains.map(item => [
          item.id,
          createDomainVerificationRecord(
            item.domain,
            user.organization.id,
            verificationSecret
          ),
        ])
      )
    : {};

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
      <PageBackButton />
      <div className="mx-auto mb-8 flex w-full max-w-2xl rounded-xl bg-muted/50 p-1">
        <Link
          className={`flex flex-1 items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === "register"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground/80"
          }`}
          href="/domain?tab=register"
        >
          Encontrar novo domínio
        </Link>
        <Link
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
            activeTab === "transfer"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground/80"
          }`}
          href="/domain?tab=transfer"
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
                  Conectar Domínio Existente
                </CardTitle>
                <CardDescription>
                  Adicione seu domínio existente à sua organização Atlas Hosting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <TransferForm defaultDomain={domain} />

                <div className="border-t pt-6">
                  <h3 className="mb-3 font-semibold">
                    Como funciona a conexão:
                  </h3>
                  <div className="space-y-2 text-muted-foreground text-sm">
                    <p>
                      • Escolha se o Atlas gerenciará o DNS ou apenas
                      acompanhará o domínio
                    </p>
                    <p>
                      • Crie o registro TXT exibido para comprovar a propriedade
                    </p>
                    <p>• Clique em &quot;Verificar&quot; após a propagação</p>
                    <p>
                      • No modo gerenciado, siga as instruções de nameservers
                      nos detalhes do domínio
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex max-w-2xl flex-col">
              <CardHeader>
                <CardTitle>Guia de Configuração</CardTitle>
                <CardDescription>
                  Conexão segura, sem transferência de registrador
                </CardDescription>
              </CardHeader>
              <CardContent className="flex h-full flex-col justify-center gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    O que será alterado?
                  </h3>
                  <div className="space-y-2">
                    <div className="rounded-md bg-muted p-3 text-sm">
                      Primeiro, apenas um TXT de verificação. O Atlas só
                      solicitará a troca de nameservers se você escolher o
                      gerenciamento pelo Atlas.
                    </div>
                    <p className="text-muted-foreground text-xs">
                      No modo informativo, seus registros e nameservers
                      continuam intocados no provedor atual.
                    </p>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-medium text-sm">
                      Fluxo do modo gerenciado:
                    </h4>
                    <ol className="list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                      <li>Verifique a propriedade por TXT</li>
                      <li>Revise os nameservers Atlas atribuídos</li>
                      <li>Substitua os nameservers no registrador</li>
                      <li>Confirme a propagação no Atlas</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <TransferDomainsList
            domains={transferDomains}
            verificationRecords={verificationRecords}
          />
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
