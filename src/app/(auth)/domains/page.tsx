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
    const domainsListResponse = await namecheapApi.getList({}); // Uses your wrapper

    if (domainsListResponse?.Domains) {
      processedDomains = await Promise.all(
        domainsListResponse.Domains.map(async (listedDomain) => {
          // Fetch detailed info for each domain
          // The getInfo method in the wrapper might need to be robust if some domains fail to fetch info
          let domainInfo: DomainsGetInfoCleanedResponse;
          try {
            domainInfo = await namecheapApi.getInfo({
              DomainName: listedDomain.Name,
            });
          } catch (_infoError) {
            // Fallback or skip this domain if info is critical
            return {
              // Provide a fallback structure
              id: listedDomain.Name,
              name: listedDomain.Name,
              registrationDate: listedDomain.Created
                ? format(listedDomain.Created, "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                : "N/A",
              expiryDate: listedDomain.Expires
                ? format(listedDomain.Expires, "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                : "Nunca",
              status: "unknown" as const,
              autoRenew: listedDomain.AutoRenew, // From getList
              isLocked: false, // Default if getInfo fails
              usesOurDNS: false, // Default
              features: [listedDomain.AutoRenew && "Auto-Renew"].filter(
                Boolean
              ) as string[],
            };
          }

          const expiryDateObj =
            domainInfo.ExpireDate !== "N/A"
              ? domainInfo.ExpireDate
              : startOfTomorrow();
          const status: "active" | "expired" = isBefore(
            expiryDateObj,
            new Date()
          )
            ? "expired"
            : "active";

          const features = [
            domainInfo.DnsDetails.IsUsingOurDNS && "DNS Management", // Check if using Namecheap DNS
            domainInfo.Whoisguard.Enabled && "Domain Privacy",
            listedDomain.AutoRenew && "Auto-Renew", // Prefer AutoRenew from getList as it's more direct
            // "Email Forwarding" - This info might come from a different API call or be assumed
          ].filter(Boolean) as string[];

          return {
            id: domainInfo.DomainName,
            name: domainInfo.DomainName,
            registrationDate:
              domainInfo.CreatedDate !== "N/A"
                ? format(domainInfo.CreatedDate, "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                : "N/A",
            expiryDate:
              domainInfo.ExpireDate !== "N/A"
                ? format(domainInfo.ExpireDate, "dd/MM/yyyy", {
                    locale: ptBR,
                  })
                : "Nunca",
            status: status,
            autoRenew: listedDomain.AutoRenew, // Use AutoRenew from getList
            isLocked: domainInfo.IsLocked,
            usesOurDNS: domainInfo.DnsDetails.IsUsingOurDNS,
            features: features,
          };
        })
      );
    }
  } catch (_error) {
    // Optionally, set an error state to display to the user
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
            <Link href="/domains/register">
              <Globe className="mr-2 h-4 w-4" /> Registrar Novo Domínio
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Domínios</CardTitle>
          <CardDescription>
            Lista de todos os seus domínios registrados e subdomínios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {processedDomains.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Globe className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum domínio registrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não registrou nenhum domínio.
                </p>
                <Button asChild={true}>
                  <Link href="/domains/register">
                    <Globe className="mr-2 h-4 w-4" /> Registrar Novo Domínio
                  </Link>
                </Button>
              </div>
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
