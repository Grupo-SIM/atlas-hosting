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

  try {
    const dbDomains = user.organization.domains;

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
        {processedDomains.length > 0 && (
          <div className="flex gap-3">
            <Button variant="outline" asChild={true}>
              <Link href="/domains/register">
                <Globe className="mr-2 h-4 w-4" /> Registrar Novo Domínio
              </Link>
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Domínios</CardTitle>
          <CardDescription>
            Lista de todos os seus domínios registrados e subdomínios
          </CardDescription>
        </CardHeader>
        <CardContent
          className={cn({ "max-w-2xl mx-auto": processedDomains.length === 0 })}
        >
          <div className="border rounded-md">
            {processedDomains.length === 0 ? (
              <NoDomains />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Domínio</TableHead>
                    <TableHead className="hidden md:table-cell text-center">
                      Data de Registro
                    </TableHead>
                    <TableHead className="text-center">
                      Data de Expiração
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Renovaçao
                    </TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedDomains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={
                              domain.status === "active"
                                ? "bg-green-500/10 text-green-500 border-green-200 dark:border-green-800 mr-2 h-2 w-2 p-0 rounded-full"
                                : domain.status === "expired"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-800 mr-2 h-2 w-2 p-0 rounded-full"
                                  : "bg-gray-500/10 text-gray-500 border-gray-200 dark:border-gray-800 mr-2 h-2 w-2 p-0 rounded-full"
                            }
                          />
                          {domain.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {domain.registrationDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          {domain.expiryDate}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {domain.autoRenew ? (
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-200 dark:border-green-800"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Automática
                            </Badge>
                          ) : (
                            <Badge variant="outline">Manual</Badge>
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild={true}>
                              <Link href={`/dns?domain=${domain.id}`}>
                                <Server className="h-4 w-4 mr-2" /> Gerenciar
                                DNS
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Lock className="h-4 w-4 mr-2" /> Privacidade
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" /> Renovar
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
