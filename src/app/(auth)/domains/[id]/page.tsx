import { and, eq } from "drizzle-orm";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { getAtlasNameservers } from "@/lib/server/domains/dns-config";
import { discoverPublicDnsRecords } from "@/lib/server/domains/public-dns";
import { DnsRecordsManager } from "../../dns/components/DnsRecordManager";
import { getCachedPleskDnsRecords } from "../../dns/plesk-utils";
import { DomainDnsControls } from "./DomainDnsControls";

const statusLabels: Record<string, string> = {
  awaiting_nameservers: "Aguardando nameservers",
  connected: "Conectado",
  error: "Erro na conexão",
  pending_verification: "Aguardando verificação",
  unmanaged: "DNS externo",
};

export default async function DomainDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const domain = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.id, id),
      eq(pgOrganizationDomains.organizationId, user.organization.id)
    ),
  });
  if (!domain) notFound();

  let records = [] as Awaited<ReturnType<typeof discoverPublicDnsRecords>>;
  let error: string | null = null;
  try {
    records =
      domain.dnsMode === "atlas"
        ? (await getCachedPleskDnsRecords(domain.domain)).records
        : await discoverPublicDnsRecords(domain.domain);
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Não foi possível carregar os registros DNS.";
  }
  const nameservers = domain.expectedNameservers?.length
    ? domain.expectedNameservers
    : getAtlasNameservers();

  return (
    <div className="space-y-6 p-4 pb-16 md:p-6">
      <div className="flex items-start gap-4">
        <Button asChild size="icon" variant="outline">
          <Link href="/domains">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
              {domain.domain}
            </h1>
            <Badge
              variant={
                domain.connectionStatus === "error" ? "destructive" : "outline"
              }
            >
              {statusLabels[domain.connectionStatus] || domain.connectionStatus}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Detalhes, conexão e registros DNS do domínio
          </p>
        </div>
      </div>

      <Tabs defaultValue="dns">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="dns">Registros DNS</TabsTrigger>
        </TabsList>
        <TabsContent className="space-y-5" value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5" />
                Informações do domínio
              </CardTitle>
              <CardDescription>Estado da conexão com o Atlas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">Propriedade</p>
                <p className="flex items-center gap-2 font-medium">
                  {domain.active ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                  {domain.active ? "Verificada" : "Pendente"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Modo DNS</p>
                <p className="font-medium">
                  {domain.dnsMode === "atlas"
                    ? "Gerenciado pelo Atlas"
                    : "Provedor atual"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Registrador</p>
                <p className="font-medium">
                  {domain.registrarProvider === "namecheap"
                    ? "Namecheap (via Atlas)"
                    : "Externo"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="space-y-5" value="dns">
          <DomainDnsControls
            canSwitchMode={domain.registrarProvider !== "namecheap"}
            connectionStatus={domain.connectionStatus}
            dnsMode={domain.dnsMode}
            domainId={domain.id}
            nameservers={nameservers}
          />
          {domain.dnsMode === "external" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Visualização pública parcial</AlertTitle>
              <AlertDescription>
                Servidores DNS não permitem listar uma zona completa. Exibimos
                registros comuns detectados publicamente; subdomínios
                desconhecidos podem não aparecer.
              </AlertDescription>
            </Alert>
          )}
          {domain.lastDnsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Falha na conexão DNS</AlertTitle>
              <AlertDescription>{domain.lastDnsError}</AlertDescription>
            </Alert>
          )}
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registros indisponíveis</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <DnsRecordsManager
              domainName={domain.domain}
              initialRecords={records}
              isUsingOurDNS={domain.dnsMode === "atlas"}
              readOnly={
                domain.dnsMode !== "atlas" ||
                domain.connectionStatus !== "connected"
              }
              sld=""
              tld=""
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
