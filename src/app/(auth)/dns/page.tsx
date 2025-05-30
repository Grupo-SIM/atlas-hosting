// src/app/(authenticated)/(dashboard)/sites/[domain]/dns/page.tsx
import { getUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { getCachedDnsRecords, type CachedDnsData } from "./utils";
import { DnsRecordsManager } from "./components/DnsRecordManager";
import { getUserCurrentDomain } from "@/lib/server/utils";
import { isError } from "lodash";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciamento de DNS - Atlas Hosting",
  description:
    "Gerencie os registros DNS do seu domínio facilmente com o Atlas Hosting.",
};

export default async function DnsManagementPage({
  params,
}: { params: { domain: string } }) {
  const user = await getUser();
  const domain = await getUserCurrentDomain(user);

  if (!domain) {
    notFound();
  }

  const domainName = domain.Name;

  let initialDnsData: CachedDnsData | null = null;
  let fetchError: string | null = null;

  try {
    initialDnsData = await getCachedDnsRecords(domainName);
  } catch (error) {
    console.error(`Erro ao carregar a página DNS para ${domainName}:`, error);
    fetchError = isError(error)
      ? error.message
      : "Falha ao carregar as informações de DNS para este domínio. Por favor, tente novamente mais tarde.";
    // If parseDomainForSldTld fails within getCachedDnsRecords, it will also be caught here.
  }

  const breadcrumbItems = [
    { label: "Sites", href: "/sites" }, // Adjust href as needed
    { label: domainName, href: `/sites/${params.domain}` }, // Adjust href as needed
    { label: "Gerenciamento de DNS" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 pb-16">
      {/* <Breadcrumb items={breadcrumbItems} /> */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Editor de Zona DNS
          </h1>
          <p className="text-muted-foreground">
            Gerenciar registros DNS para {domainName}
          </p>
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
          sld={initialDnsData.sld}
          tld={initialDnsData.tld}
          isUsingOurDNS={initialDnsData.isUsingOurDNS}
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
