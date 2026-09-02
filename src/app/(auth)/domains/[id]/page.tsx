import { and, eq } from "drizzle-orm";
import { AlertCircle, CheckCircle2, Clock, Globe2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  type CloudflareDnsRecord,
  cloudflareApi,
} from "@/lib/server/apis/cloudflare";
import { formatAtlasDnsError } from "@/lib/server/domains/cloudflare-dns";
import { discoverPublicDnsRecords } from "@/lib/server/domains/public-dns";
import { DnsRecordsManager } from "../../dns/components/DnsRecordManager";
import { DomainDnsControls } from "./DomainDnsControls";
import { DomainDnsSetupDialog } from "./DomainDnsSetupDialog";

const statusLabels: Record<string, string> = {
  awaiting_activation: "Aguardando ativação",
  awaiting_nameservers: "Aguardando nameservers",
  connected: "Conectado",
  error: "Erro na conexão",
  migration_required: "Migração disponível",
  pending_verification: "Aguardando verificação",
  provisioning: "Criando zona",
  review_records: "Revisar registros",
  unmanaged: "DNS externo",
};

export default async function DomainDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ setup?: string }>;
}) {
  const { id } = await params;
  const { setup } = await searchParams;
  const user = await getUser();
  const domain = await db.query.pgOrganizationDomains.findFirst({
    where: and(
      eq(pgOrganizationDomains.id, id),
      eq(pgOrganizationDomains.organizationId, user.organization.id)
    ),
  });
  if (!domain) notFound();
  const isAtlasPurchasedDomain = domain.registrarProvider === "namecheap";

  let records: CloudflareDnsRecord[] = [];
  let scannedRecords: CloudflareDnsRecord[] = [];
  let error: string | null = null;
  try {
    if (domain.dnsMode === "cloudflare" && domain.cloudflareZoneId) {
      const [zoneRecords, scan] = await Promise.all([
        cloudflareApi.listDnsRecords(domain.cloudflareZoneId),
        !isAtlasPurchasedDomain && domain.dnsImportStatus === "scanning"
          ? cloudflareApi.listScannedRecords(domain.cloudflareZoneId)
          : Promise.resolve([]),
      ]);
      records = zoneRecords;
      scannedRecords = scan;
    } else {
      records = (await discoverPublicDnsRecords(domain.domain)).map(record => ({
        content: record.Address,
        id: String(record.HostId),
        name: record.Name,
        priority: record.MXPref,
        proxied: false,
        ttl: record.TTL,
        type: record.Type as CloudflareDnsRecord["type"],
      }));
    }
  } catch (caught) {
    error = formatAtlasDnsError(
      caught,
      "Não foi possível carregar os registros DNS."
    );
  }
  const nameservers = domain.expectedNameservers || [];

  return (
    <div className="space-y-6 p-4 pb-16 md:p-6">
      <div className="flex items-start gap-4">
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
                <Globe2 className="h-5 w-5" /> Informações do domínio
              </CardTitle>
              <CardDescription>Estado da conexão com o Atlas.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
                  {domain.dnsMode === "cloudflare"
                    ? "Gerenciado pelo Atlas"
                    : domain.dnsMode === "legacy_plesk"
                      ? "Configuração assistida"
                      : "Somente acompanhamento"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent className="space-y-5" value="dns">
          {!isAtlasPurchasedDomain && (
            <>
              <DomainDnsControls
                dnsMode={domain.dnsMode}
                domainId={domain.id}
                nameservers={nameservers}
                registrarProvider={domain.registrarProvider}
              />
              {domain.dnsMode === "cloudflare" && domain.cloudflareZoneId && (
                <DomainDnsSetupDialog
                  connectionStatus={domain.connectionStatus}
                  dnsImportStatus={domain.dnsImportStatus}
                  domainId={domain.id}
                  initiallyOpen={setup === "records"}
                  lastDnsError={domain.lastDnsError}
                  nameservers={nameservers}
                  scannedRecords={scannedRecords}
                />
              )}
              {domain.dnsMode !== "cloudflare" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Visualização pública parcial</AlertTitle>
                  <AlertDescription>
                    DNS público não permite listar uma zona completa.
                    Subdomínios desconhecidos podem não aparecer.
                  </AlertDescription>
                </Alert>
              )}
              {domain.lastDnsError && !domain.cloudflareZoneId && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Falha na conexão DNS</AlertTitle>
                  <AlertDescription>
                    {domain.lastDnsError.replace(
                      /cloudflare/gi,
                      "serviço de DNS do Atlas"
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registros indisponíveis</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <DnsRecordsManager
              domainId={domain.id}
              domainName={domain.domain}
              initialRecords={records}
              readOnly={
                domain.dnsMode !== "cloudflare" || !domain.cloudflareZoneId
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
