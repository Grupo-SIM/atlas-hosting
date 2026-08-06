import { isError } from "lodash";
import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import NoDomains from "@/components/domains/NoDomains";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { getUserCurrentDomain } from "@/lib/server/utils";
import { DnsRecordsManager } from "./components/DnsRecordManager";
import { type CachedPleskDnsData, getCachedPleskDnsRecords } from "./plesk-utils";

export const metadata: Metadata = {
  description:
    "Gerencie os registros DNS do seu domínio facilmente com o Atlas Hosting.",
  title: "Gerenciamento de DNS - Atlas Hosting",
};

export default async function DnsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain: domainFromQuery } = await searchParams;
  const user = await getUser();

  // Se veio domain na query, tentamos achar na organização
  let domain = null;
  if (domainFromQuery) {
    domain = user.organization.domains.find(d => d.domain === domainFromQuery);
  }

  // Fallback para o domínio selecionado se não veio na query ou não foi encontrado
  if (!domain) {
    domain = await getUserCurrentDomain(user);
  }

  if (!domain) {
    return (
      <Card className="mx-auto mt-8 max-w-2xl">
        <NoDomains />
      </Card>
    );
  }

  const domainName = domain.domain;

  let initialDnsData: CachedPleskDnsData | null = null;
  let fetchError: string | null = null;

  try {
    initialDnsData = await getCachedPleskDnsRecords(domainName);
  } catch (error) {
    console.error(`Erro ao carregar a página DNS para ${domainName}:`, error);
    fetchError = isError(error)
      ? error.message
      : "Falha ao carregar as informações de DNS para este domínio. Por favor, tente novamente mais tarde.";
    // If parseDomainForSldTld fails within getCachedDnsRecords, it will also be caught here.
  }

  const breadcrumbItems = [
    { href: "/sites", label: "Sites" }, // Adjust href as needed
    { href: `/sites/${domainName}`, label: domainName }, // Adjust href as needed
    { label: "Gerenciamento de DNS" },
  ];

  return (
    <div className="space-y-6 p-4 pb-16 md:p-6">
      {/* <Breadcrumb items={breadcrumbItems} /> */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
              Editor de Zona DNS
            </h1>
            <p className="text-muted-foreground">
              Gerenciar registros DNS para {domainName}
            </p>
          </div>
        </div>
      </div>

      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar Dados DNS</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!fetchError && initialDnsData && !initialDnsData.isUsingOurDNS && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Domínio Não Está Usando Nossos Nameservers</AlertTitle>
          <AlertDescription>
            O domínio <span className="font-semibold">{domainName}</span> pode
            não estar usando os nameservers padrão da Namecheap. As alterações
            feitas aqui podem não ter efeito a menos que você aponte seu domínio
            para os nameservers da Namecheap. Você ainda pode gerenciar os
            registros; se você mudar para o DNS da Namecheap, esses registros
            serão usados.
          </AlertDescription>
        </Alert>
      )}

      {!fetchError && initialDnsData && (
        <DnsRecordsManager
          domainName={domainName}
          initialRecords={initialDnsData.records}
          isUsingOurDNS={initialDnsData.isUsingOurDNS}
          sld={initialDnsData.sld}
          tld={initialDnsData.tld}
        />
      )}
      {!fetchError &&
        !initialDnsData && ( // Case where getCachedDnsRecords resolved but data is null (shouldn't happen with current setup)
          <Card>
            <CardHeader>
              <CardTitle>Informações de DNS Indisponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Não foi possível recuperar os registros DNS para {domainName}{" "}
                neste momento. O domínio pode não estar configurado para
                gerenciamento de DNS ou ocorreu um problema inesperado.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
