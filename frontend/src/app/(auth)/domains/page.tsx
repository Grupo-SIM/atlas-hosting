import { format } from "date-fns";
import { ptBR } from "date-fns/locale"; // For pt-BR date formatting
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import NoDomains from "@/components/domains/NoDomains";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { db } from "@/lib/db"; // Keep if plansTable is still used from DB
// import { plansTable, Plan } from "@/lib/db/schema"; // Keep if used
import { getUser } from "@/lib/auth";
import { shouldRefreshDomainConnection } from "@/lib/domains/connection-state";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { getRegistrarDates } from "@/lib/server/domains/registrar-dates";
import {
  createDomainVerificationRecord,
  type DomainVerificationRecord,
} from "@/lib/server/domains/verification";
import { cn } from "@/lib/utils";
import { DeleteDomainButton, DomainList, DomainTableRow } from "./components";
import { DomainActionsMenu } from "./components/DomainActionsMenu";
import { DomainConnectionRecovery } from "./components/DomainConnectionRecovery";
import { DomainSyncRetryButton } from "./components/DomainSyncRetryButton";
import { DomainTransfersPanel } from "./components/DomainTransfersPanel";
import { PendingDomainInstructionsDialog } from "./components/PendingDomainInstructionsDialog";
import { getDomainTransfersForUser } from "./transfer-actions";

// Define a type for the processed domain to be used in the table
interface ProcessedDomain {
  id: string;
  name: string;
  registrationDate: string;
  expiryDate: string | null;
  status: "active" | "expired" | "unknown";
  autoRenew: boolean;
  isLocked: boolean;
  usesOurDNS: boolean;
  features: string[];
  isExternal: boolean;
  hasManagedZone?: boolean;
}

function getExternalDomainDnsFeature(domain: {
  cloudflareZoneStatus: string | null;
  connectionStatus: string;
  dnsMode: string;
}) {
  if (domain.dnsMode === "legacy_plesk") return "Migração DNS disponível";
  if (domain.dnsMode !== "cloudflare") return "DNS externo";

  if (
    domain.connectionStatus === "connected" &&
    domain.cloudflareZoneStatus === "active"
  ) {
    return "DNS gerenciado pelo Atlas";
  }

  if (domain.connectionStatus === "awaiting_nameservers") {
    return "Aguardando troca de nameservers";
  }
  if (domain.connectionStatus === "awaiting_activation") {
    return "Aguardando ativação do DNS";
  }

  return "DNS em configuração no Atlas";
}

function isDomainOutsideNamecheap(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Err 2030166");
}

function isTransientNamecheapError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /timeout|ECONNRESET|ECONNABORTED|socket hang up|network error|Status: (429|5\d\d)/i.test(
    error.message
  );
}

async function getNamecheapDomainInfo(domainName: string) {
  try {
    return await namecheapApi.getInfo({ DomainName: domainName });
  } catch (error) {
    if (!isTransientNamecheapError(error)) throw error;
    await new Promise(resolve => setTimeout(resolve, 500));
    return namecheapApi.getInfo({ DomainName: domainName });
  }
}

async function recoverNamecheapDomain(domain: {
  id: string;
  domain: string;
}): Promise<ProcessedDomain | null> {
  const response = await namecheapApi.getList({
    Page: 1,
    PageSize: 10,
    SearchTerm: domain.domain,
  });
  const item = response.Domains.find(
    candidate => candidate.Name.toLowerCase() === domain.domain.toLowerCase()
  );
  if (!item) return null;

  const created = new Date(item.Created);
  const expires = new Date(item.Expires);
  return {
    autoRenew: item.AutoRenew,
    expiryDate: Number.isNaN(expires.getTime())
      ? "Indisponível"
      : format(expires, "dd/MM/yyyy", { locale: ptBR }),
    features: ["Dados do registro recuperados"],
    id: domain.id,
    isExternal: false,
    isLocked: item.IsLocked,
    name: item.Name,
    registrationDate: Number.isNaN(created.getTime())
      ? "Indisponível"
      : format(created, "dd/MM/yyyy", { locale: ptBR }),
    status: item.IsExpired ? "expired" : "active",
    usesOurDNS: item.IsOurDNS,
  };
}

function externalDomainFallback(domain: {
  createdAt: Date;
  domain: string;
  id: string;
  cloudflareZoneStatus: string | null;
  connectionStatus: string;
  dnsMode: string;
}): ProcessedDomain {
  return {
    autoRenew: false,
    expiryDate: null,
    features: [getExternalDomainDnsFeature(domain)],
    id: domain.id,
    isExternal: true,
    isLocked: false,
    name: domain.domain,
    registrationDate: format(domain.createdAt, "dd/MM/yyyy", { locale: ptBR }),
    status: "active",
    usesOurDNS:
      domain.connectionStatus === "connected" &&
      domain.cloudflareZoneStatus === "active",
  };
}
export default async function MyDomainsPage() {
  const user = await getUser();
  const domainTransfers = await getDomainTransfersForUser(user.id);
  const pendingDomains = user.organization.domains.filter(
    domain => !domain.active
  );
  const verificationSecret =
    process.env.DOMAIN_VERIFICATION_SECRET || process.env.AUTH_SECRET;
  const verificationRecords: Record<string, DomainVerificationRecord> =
    verificationSecret
      ? Object.fromEntries(
          pendingDomains.map(domain => [
            domain.id,
            createDomainVerificationRecord(
              domain.domain,
              user.organization.id,
              verificationSecret
            ),
          ])
        )
      : {};
  const hasDomains = user.organization.domains.length > 0;
  const domainsAwaitingCloudflare = new Set(
    user.organization.domains
      .filter(shouldRefreshDomainConnection)
      .map(domain => domain.id)
  );

  let processedDomains: ProcessedDomain[] = [];
  let domainStats = {
    active: 0,
    expired: 0,
    expiringThisMonth: 0,
    total: pendingDomains.length,
  };

  try {
    const dbDomains = user.organization.domains.filter(domain => domain.active);

    const domainsRaw = await Promise.all(
      dbDomains.map(async domain => {
        try {
          if (domain.registrarProvider !== "namecheap") {
            return {
              autoRenew: false,
              expiryDate: "Externo",
              features: [
                getExternalDomainDnsFeature(domain),
              ],
              id: domain.id,
              isExternal: true,
              isLocked: false,
              name: domain.domain,
              registrationDate: format(domain.createdAt, "dd/MM/yyyy", {
                locale: ptBR,
              }),
              status: "active",
              usesOurDNS:
                domain.connectionStatus === "connected" &&
                domain.cloudflareZoneStatus === "active",
            } as ProcessedDomain;
          }
          const d = await getNamecheapDomainInfo(domain.domain);
          const inventory = await namecheapApi.getList({ Page: 1, PageSize: 100, SearchTerm: domain.domain });
          const registration = inventory.Domains.find(item => item.Name.toLowerCase() === domain.domain.toLowerCase());
          if (!registration) throw new Error("Registro não encontrado no inventário de domínios.");

          return {
            ...getRegistrarDates(d.CreatedDate, d.ExpireDate),
            autoRenew: registration.AutoRenew,
            features: [
              d.DnsDetails?.IsUsingOurDNS && "DNS Management",
              d.Whoisguard?.Enabled && "Domain Privacy",
              registration.AutoRenew && "Auto-Renew",
            ].filter(Boolean) as string[],
            id: domain.id,
            isExternal: false,
            isLocked: d.IsLocked,
            name: d.DomainName,
            usesOurDNS: d.DnsDetails?.IsUsingOurDNS ?? false,
          } as ProcessedDomain;
        } catch (error) {
          if (isDomainOutsideNamecheap(error)) {
            return externalDomainFallback(domain);
          }
          try {
            const recovered = await recoverNamecheapDomain(domain);
            if (recovered) return recovered;
          } catch (recoveryError) {
            console.error(
              `Failed to recover Namecheap info for ${domain.domain}:`,
              recoveryError
            );
          }
          console.error(
            `Failed to fetch Namecheap info for ${domain.domain}:`,
            error
          );
          return {
            autoRenew: false,
            expiryDate: "Indisponível",
            features: ["Consulta ao registrador indisponível"],
            id: domain.id,
            isLocked: false,
            name: domain.domain,
            registrationDate: "Indisponível",
            status: "unknown",
            usesOurDNS: false,
          } as ProcessedDomain;
        }
      })
    );

    const domains = domainsRaw.map((processed, index) => {
      const domain = dbDomains[index];
      if (domain.dnsMode !== "cloudflare") return { ...processed, hasManagedZone: !!domain.cloudflareZoneId };
      const dnsFeature = getExternalDomainDnsFeature(domain);

      return {
        ...processed,
        hasManagedZone: !!domain.cloudflareZoneId,
        features: [
          dnsFeature,
          ...processed.features.filter(
            feature => feature !== "DNS Management" && feature !== dnsFeature
          ),
        ],
        usesOurDNS:
          domain.connectionStatus === "connected" &&
          domain.cloudflareZoneStatus === "active",
      };
    });

    processedDomains = domains;

    // Calculate stats
    domainStats = {
      active: domains.filter(d => d.status === "active").length,
      expired: domains.filter(d => d.status === "expired").length,
      expiringThisMonth: domains.filter(d => {
        if (!d.expiryDate || d.expiryDate === "Nunca") return false;
        try {
          const [day, month, year] = d.expiryDate.split("/");
          const expiryDate = new Date(
            Number.parseInt(year, 10),
            Number.parseInt(month, 10) - 1,
            Number.parseInt(day, 10)
          );
          const nextMonth = new Date();
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          return expiryDate <= nextMonth && expiryDate > new Date();
        } catch {
          return false;
        }
      }).length,
      total: domains.length + pendingDomains.length,
    };
  } catch (error) {
    console.error("Error fetching domain info:", error);
  }

  const sortedDomains = [
    ...pendingDomains.map(domain => ({ kind: "pending" as const, domain })),
    ...processedDomains.map(domain => ({ kind: "processed" as const, domain })),
  ].sort((a, b) =>
    (a.kind === "pending" ? a.domain.domain : a.domain.name).localeCompare(
      b.kind === "pending" ? b.domain.domain : b.domain.name,
      "pt-BR",
      { sensitivity: "base" }
    )
  );

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            Meus Domínios
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie seus domínios registrados e configurações de DNS
          </p>
        </div>
        {/* Sem domínio nenhum, a chamada pra ação fica só no estado vazio. */}
        {hasDomains ? (
          <div className="flex gap-3">
            <Button asChild={true} variant="outline">
              <Link href="/domain?tab=transfer&returnTo=%2Fdomains">
                <Globe className="mr-2 h-4 w-4" /> Trazer Domínio
              </Link>
            </Button>
            <Button
              asChild={true}
              className="border-0 bg-white font-bold text-slate-950 shadow-lg hover:bg-white/90"
            >
              <Link href="/domain?tab=register&returnTo=%2Fdomains">
                <Plus className="mr-2 h-4 w-4" /> Registrar Novo
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <DomainTransfersPanel transfers={domainTransfers} userId={user.id} />

      {/* Domain Statistics Cards */}
      {hasDomains ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl">{domainStats.total}</p>
                  <p className="text-muted-foreground text-sm">
                    Total de Domínios
                  </p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl text-green-600">
                    {domainStats.active}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Domínios Ativos
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl text-orange-600">
                    {domainStats.expiringThisMonth}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Expiram em 30 dias
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl text-red-600">
                    {domainStats.expired}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Domínios Expirados
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Quick Actions Card */}
      {/* {processedDomains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Gerencie seus domínios de forma eficiente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                asChild
              >
                <Link href="/dns">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">Gerenciar DNS</p>
                      <p className="text-sm text-muted-foreground">
                        Configure registros DNS
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                asChild
              >
                <Link href="/domains/privacy">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium">Privacidade</p>
                      <p className="text-sm text-muted-foreground">
                        Proteja suas informações
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                asChild
              >
                <Link href="/email">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-purple-500" />
                    <div className="text-left">
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        Configure emails
                      </p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Management Table — sem card/cabeçalho: a tabela já se explica */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent
          className={cn("px-0", {
            "mx-auto max-w-2xl": !hasDomains,
          })}
        >
          <div className="overflow-x-auto rounded-lg border">
            {!hasDomains ? (
              <NoDomains />
            ) : (
              <DomainList domainIds={user.organization.domains.map(domain => domain.id)}>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">
                      Nome do Domínio
                    </TableHead>
                    <TableHead className="hidden text-center font-semibold md:table-cell">
                      Data de Registro
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Data de Expiração
                    </TableHead>
                    <TableHead className="hidden font-semibold lg:table-cell">
                      Renovação
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDomains.map(item => {
                    if (item.kind === "pending") {
                      const domain = item.domain;
                      const verification = verificationRecords[domain.id];

                      return (
                      <DomainTableRow
                        domainId={domain.id}
                        className="transition-colors hover:bg-muted/50"
                        key={domain.id}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Badge
                              className="h-2 w-2 rounded-full border-yellow-500 bg-yellow-500 p-0"
                              variant="outline"
                            />
                            <div>
                              <p className="font-medium">{domain.domain}</p>
                              <Badge
                                className="mt-1 border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                                variant="outline"
                              >
                                <Clock className="mr-1 h-3 w-3" />
                                Aguardando verificação
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-center md:table-cell">
                          <span className="font-medium">
                            {format(domain.createdAt, "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          —
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          —
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                          {verification ? (
                            <PendingDomainInstructionsDialog
                              domain={domain.domain}
                              host={verification.host}
                              value={verification.value}
                            />
                          ) : (
                            <Button disabled={true} size="sm" variant="outline">
                              Instruções indisponíveis
                            </Button>
                          )}
                          {user.id === user.organization.ownerId && !user.impersonatedBy && (
                            <DeleteDomainButton domainId={domain.id} domainName={domain.domain} isExternal={domain.registrarProvider !== "namecheap"} hasManagedZone={!!domain.cloudflareZoneId} />
                          )}
                          </div>
                        </TableCell>
                      </DomainTableRow>
                      );
                    }

                    const domain = item.domain;
                    return (
                    <DomainTableRow
                      domainId={domain.id}
                      className="transition-colors hover:bg-muted/50"
                      key={domain.id}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <Badge
                              className={cn(
                                "mr-3 h-2 w-2 rounded-full p-0",
                                domain.status === "active"
                                  ? "border-green-500 bg-green-500"
                                  : domain.status === "expired"
                                    ? "border-red-500 bg-red-500"
                                    : "border-gray-500 bg-gray-500"
                              )}
                              variant="outline"
                            />
                            <div>
                              <p className="font-medium">{domain.name}</p>
                              {domainsAwaitingCloudflare.has(domain.id) && (
                                <DomainConnectionRecovery domainId={domain.id} />
                              )}
                              <div className="mt-1 flex flex-wrap items-center gap-1">
                                {domain.features.slice(0, 2).map(feature => (
                                  <Badge
                                    className="text-xs"
                                    key={feature}
                                    variant="secondary"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                                {domain.features.length > 2 && (
                                  <Badge className="text-xs" variant="outline">
                                    +{domain.features.length - 2}
                                  </Badge>
                                )}
                                {domain.status === "unknown" && (
                                  <DomainSyncRetryButton />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-center md:table-cell">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {domain.registrationDate}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">
                            {domain.isExternal ? "—" : domain.expiryDate}
                          </span>
                          {domain.status === "expired" && (
                            <Badge className="text-xs" variant="destructive">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {domain.isExternal ? (
                            <Badge variant="outline">No registrador</Badge>
                          ) : domain.status === "unknown" ? (
                            <span className="text-muted-foreground text-sm">—</span>
                          ) : domain.autoRenew ? (
                            <Badge
                              className="border-[#01FC8D]/30 bg-[#01FC8D]/10 text-[#00b363] dark:text-[#01FC8D]"
                              variant="outline"
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Renovação automática
                            </Badge>
                          ) : (
                            <Badge
                              className="border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                              variant="outline"
                            >
                              Renovação manual
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-12 text-right">
                        <div className="flex items-center justify-end gap-2">
                        <DomainActionsMenu
                          canTransfer={
                            user.id === user.organization.ownerId &&
                            !user.impersonatedBy
                          }
                          domainId={domain.id}
                          domainName={domain.name}
                          canRenew={!domain.isExternal && domain.status !== "unknown"}
                          key={`actions-${domain.id}`}
                        />
                        {user.id === user.organization.ownerId && !user.impersonatedBy && (
                          <DeleteDomainButton domainId={domain.id} domainName={domain.name} isExternal={domain.isExternal} hasManagedZone={domain.hasManagedZone} />
                        )}
                        </div>
                      </TableCell>
                    </DomainTableRow>
                  );
                  })}
                </TableBody>
              </Table>
              </DomainList>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
