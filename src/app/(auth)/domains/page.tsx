import { format, isBefore } from "date-fns"; // Added parseISO, format
import { ptBR } from "date-fns/locale"; // For pt-BR date formatting
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
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
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { cn } from "@/lib/utils";
import { DomainActionsMenu } from "./components/DomainActionsMenu";

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
}

function isDomainOutsideNamecheap(error: unknown): boolean {
  return error instanceof Error && error.message.includes("Err 2030166");
}

function externalDomainFallback(domain: {
  createdAt: Date;
  domain: string;
}): ProcessedDomain {
  return {
    autoRenew: false,
    expiryDate: null,
    features: ["DNS via Atlas"],
    id: domain.domain,
    isExternal: true,
    isLocked: false,
    name: domain.domain,
    registrationDate: format(domain.createdAt, "dd/MM/yyyy", { locale: ptBR }),
    status: "active",
    usesOurDNS: true,
  };
}
export default async function MyDomainsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = await searchParams;
  const user = await getUser();

  let processedDomains: ProcessedDomain[] = [];
  let domainStats = {
    active: 0,
    expired: 0,
    expiringThisMonth: 0,
    total: 0,
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
                domain.dnsMode === "cloudflare"
                  ? "DNS Atlas / Cloudflare"
                  : domain.dnsMode === "legacy_plesk"
                    ? "Migração DNS disponível"
                    : "DNS externo",
              ],
              id: domain.id,
              isLocked: false,
              name: domain.domain,
              registrationDate: format(domain.createdAt, "dd/MM/yyyy", {
                locale: ptBR,
              }),
              status: "active",
              usesOurDNS: domain.dnsMode === "cloudflare",
            } as ProcessedDomain;
          }
          const d = await namecheapApi.getInfo({
            DomainName: domain.domain,
          });

          return {
            autoRenew: d.AutoRenew,
            expiryDate: d.ExpireDate
              ? format(d.ExpireDate, "dd/MM/yyyy", { locale: ptBR })
              : "Nunca",
            features: [
              d.DnsDetails?.IsUsingOurDNS && "DNS Management",
              d.Whoisguard?.Enabled && "Domain Privacy",
              d.AutoRenew && "Auto-Renew",
            ].filter(Boolean) as string[],
            id: domain.id,
            isExternal: false,
            isLocked: d.IsLocked,
            name: d.DomainName,
            registrationDate: d.CreatedDate
              ? format(d.CreatedDate, "dd/MM/yyyy", { locale: ptBR })
              : "N/A",
            status: isBefore(d.ExpireDate, new Date()) ? "expired" : "active",
            usesOurDNS: d.DnsDetails?.IsUsingOurDNS ?? false,
          } as ProcessedDomain;
        } catch (error) {
          if (isDomainOutsideNamecheap(error)) {
            return externalDomainFallback(domain);
          }
          console.error(
            `Failed to fetch Namecheap info for ${domain.domain}:`,
            error
          );
          return {
            autoRenew: false,
            expiryDate: "Indisponível",
            features: ["Falha na Sincronização"],
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

    const domains = domainsRaw.filter(Boolean);

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
      total: domains.length,
    };
  } catch (error) {
    console.error("Error fetching domain info:", error);
  }

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
        {processedDomains.length > 0 && (
          <div className="flex gap-3">
            <Button asChild={true} variant="outline">
              <Link href="/domain?tab=transfer">
                <Globe className="mr-2 h-4 w-4" /> Trazer Domínio
              </Link>
            </Button>
            <Button
              asChild={true}
              className="border-0 bg-white font-bold text-slate-950 shadow-lg hover:bg-white/90"
            >
              <Link href="/domain?tab=register">
                <Plus className="mr-2 h-4 w-4" /> Registrar Novo
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Domain Statistics Cards */}
      {processedDomains.length > 0 && (
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
      )}

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
            "mx-auto max-w-2xl": processedDomains.length === 0,
          })}
        >
          <div className="overflow-x-auto rounded-lg border">
            {processedDomains.length === 0 ? (
              <NoDomains />
            ) : (
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
                  {processedDomains.map(domain => (
                    <TableRow
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
                              <div className="mt-1 flex gap-1">
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
                            {domain.isExternal ? null : domain.expiryDate}
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
                          {domain.autoRenew ? (
                            <Badge
                              className="border-[#01FC8D]/30 bg-[#01FC8D]/10 text-[#00b363] dark:text-[#01FC8D]"
                              variant="outline"
                            >
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Automática
                            </Badge>
                          ) : (
                            <Badge
                              className="border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                              variant="outline"
                            >
                              Manual
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-12 text-right">
                        <DomainActionsMenu
                          domainId={domain.id}
                          domainName={domain.name}
                          key={`actions-${domain.id}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
