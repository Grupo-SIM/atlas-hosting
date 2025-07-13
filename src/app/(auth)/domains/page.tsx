import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ExternalLink,
  Globe,
  Lock,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Server,
  Shield,
  Calendar,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
// import { db } from "@/lib/db"; // Keep if plansTable is still used from DB
// import { plansTable, Plan } from "@/lib/db/schema"; // Keep if used
import { getUser } from "@/lib/auth";
import { format, isBefore, startOfTomorrow } from "date-fns"; // Added parseISO, format
import { ptBR } from "date-fns/locale"; // For pt-BR date formatting
import { redirect } from "next/navigation";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import type { DomainsGetInfoCleanedResponse } from "@/lib/server/apis/namecheap/types";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NoDomains from "@/components/domains/NoDomains";
import { cn } from "@/lib/utils";

// Define a type for the processed domain to be used in the table
interface ProcessedDomain {
  id: string; // Using domain name as ID
  name: string;
  registrationDate: string;
  expiryDate: string;
  status: "active" | "expired" | "unknown";
  autoRenew: boolean;
  isLocked: boolean;
  usesOurDNS: boolean;
  features: string[];
}

export default async function MyDomainsPage({
  searchParams,
}: { searchParams: Promise<{ q?: string }> }) {
  const q = await searchParams;
  const user = await getUser();

  let processedDomains: ProcessedDomain[] = [];
  let domainStats = {
    total: 0,
    active: 0,
    expired: 0,
    expiringThisMonth: 0,
  };

  try {
    const dbDomains = user.organization.domains.filter(
      (domain) => domain.active
    );

    const domains = await Promise.all(
      dbDomains.map(async (domain) => {
        const d = await namecheapApi.getInfo({
          DomainName: domain.domain,
        });

        return {
          id: d.DomainName,
          name: d.DomainName,
          registrationDate: d.CreatedDate
            ? format(d.CreatedDate, "dd/MM/yyyy", { locale: ptBR })
            : "N/A",
          expiryDate: d.ExpireDate
            ? format(d.ExpireDate, "dd/MM/yyyy", { locale: ptBR })
            : "Nunca",
          status: isBefore(d.ExpireDate, new Date()) ? "expired" : "active",
          autoRenew: d.AutoRenew,
          isLocked: d.IsLocked,
          usesOurDNS: d.DnsDetails.IsUsingOurDNS,
          features: [
            d.DnsDetails.IsUsingOurDNS && "DNS Management",
            d.Whoisguard.Enabled && "Domain Privacy",
            d.AutoRenew && "Auto-Renew",
            // "Email Forwarding" - This info might come from a different API call or be assumed
          ].filter(Boolean) as string[],
        } as ProcessedDomain;
      })
    );

    processedDomains = domains;

    // Calculate stats
    domainStats = {
      total: domains.length,
      active: domains.filter((d) => d.status === "active").length,
      expired: domains.filter((d) => d.status === "expired").length,
      expiringThisMonth: domains.filter((d) => {
        if (d.expiryDate === "Nunca") return false;
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
    };
  } catch (error) {
    console.error("Error fetching domain info:", error);
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Meus Domínios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus domínios registrados e configurações de DNS
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild={true}>
            <Link href="/domain?tab=register">
              <Plus className="mr-2 h-4 w-4" /> Registrar Novo
            </Link>
          </Button>
          <Button asChild={true}>
            <Link href="/domain?tab=transfer">
              <Globe className="mr-2 h-4 w-4" /> Transferir Domínio
            </Link>
          </Button>
        </div>
      </div>

      {/* Domain Statistics Cards */}
      {processedDomains.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{domainStats.total}</p>
                  <p className="text-sm text-muted-foreground">
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
                  <p className="text-2xl font-bold text-green-600">
                    {domainStats.active}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
                  <p className="text-2xl font-bold text-orange-600">
                    {domainStats.expiringThisMonth}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
                  <p className="text-2xl font-bold text-red-600">
                    {domainStats.expired}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
      {processedDomains.length > 0 && (
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

      {/* Domain Management Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Seus Domínios
          </CardTitle>
          <CardDescription>
            Lista de todos os seus domínios registrados com informações
            detalhadas
          </CardDescription>
        </CardHeader>
        <CardContent
          className={cn({ "max-w-2xl mx-auto": processedDomains.length === 0 })}
        >
          <div className="border rounded-lg overflow-hidden">
            {processedDomains.length === 0 ? (
              <NoDomains />
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">
                      Nome do Domínio
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-center font-semibold">
                      Data de Registro
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Data de Expiração
                    </TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold">
                      Renovação
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedDomains.map((domain) => (
                    <TableRow
                      key={domain.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-2 w-2 p-0 rounded-full mr-3",
                                domain.status === "active"
                                  ? "bg-green-500 border-green-500"
                                  : domain.status === "expired"
                                    ? "bg-red-500 border-red-500"
                                    : "bg-gray-500 border-gray-500"
                              )}
                            />
                            <div>
                              <p className="font-medium">{domain.name}</p>
                              <div className="flex gap-1 mt-1">
                                {domain.features.slice(0, 2).map((feature) => (
                                  <Badge
                                    key={feature}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                                {domain.features.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{domain.features.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {domain.registrationDate}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-medium">
                            {domain.expiryDate}
                          </span>
                          {domain.status === "expired" && (
                            <Badge variant="destructive" className="text-xs">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {domain.autoRenew ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-700 border-green-200"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Automática
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-orange-500/10 text-orange-700 border-orange-200"
                            >
                              Manual
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild={true}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild={true}>
                              <Link href={`/dns?domain=${domain.id}`}>
                                <Server className="h-4 w-4 mr-2" /> Gerenciar
                                DNS
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Lock className="h-4 w-4 mr-2" /> Configurar
                              Privacidade
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" /> Renovar
                              Domínio
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" /> Configurar Email
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild={true}>
                              <a
                                href={`http://${domain.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />{" "}
                                Visitar Site
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
