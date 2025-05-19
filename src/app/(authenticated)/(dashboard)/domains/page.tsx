import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, ExternalLink, MoreHorizontal, RefreshCw, Lock, Server, Mail } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import nameSilo from "@/lib/server/apis/namesilo";
import { isBefore, startOfTomorrow, toDate } from "date-fns";
import { ListDomainDomain, NamesiloDomain } from "@/lib/server/apis/namesilo/types";
import { plansTable, Plan } from "@/lib/db/schema";

export default async function MyDomainsPage() {
  const { id, namesiloId } = (await getUser())!;
  
  // Fetch plans for admin section
  const plans: Plan[] = await db.select().from(plansTable);

  let allDomainsData: ListDomainDomain[][];
  let domains: {
    id: string;
    name: string;
    registrationDate: string;
    expiryDate: string;
    status: string;
    autoRenew: boolean;
    features: string[];
  }[];
  
  if (namesiloId) {
    let allDomains = await nameSilo.listDomains({ page: 1, pageSize: 100, portfolioId: namesiloId });

    if (Array.isArray(allDomains.domains)) {
      let total = +allDomains.pager!.total;
      let pages = Math.ceil(total / 100);
      let allPages = Array.from({ length: pages }, (_, i) => i + 1);
      allDomainsData = await Promise.all(
        allPages.map(async (page) => {
          let result = await nameSilo.listDomains({ page, pageSize: 100 });
          return result.domains as ListDomainDomain[];
        })
      );
    } else {
      allDomainsData = [[allDomains.domains.domain]];
    }

    console.log(allDomainsData)

    domains = allDomainsData.flat().map((domain) => {
      return {
        id: domain.domain,
        name: domain.domain,
        registrationDate: domain.created ? toDate(domain.created).toLocaleDateString("pt-BR") : "N/A",
        expiryDate: domain.expires ? toDate(domain.expires).toLocaleDateString("pt-BR"): "Nunca",
        status: isBefore(domain.expires || startOfTomorrow(), new Date()) ? "expired" : "active",
        autoRenew: !!domain.expires,
        features: [
          "DNS Management",
          "Email Forwarding",
          "Domain Privacy",
          "Auto-Renew",
        ],
      };
    });
  } else {
    domains = [];
  }

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meus Domínios</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus domínios registrados e configurações de DNS
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/domains/register">
              <Globe className="mr-2 h-4 w-4" /> Registrar Novo Domínio
            </Link>
          </Button>
          <Button variant="outline">
            <Server className="mr-2 h-4 w-4" />
            Atualização em Massa de DNS
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domínios Registrados</CardTitle>
          <CardDescription>
            Visualize e gerencie seu portfólio de domínios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            {domains.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Globe className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum domínio registrado</h3>
                <p className="text-muted-foreground mb-4">Você ainda não registrou nenhum domínio. Registre seu primeiro domínio para começar!</p>
                <Button asChild>
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
                    <TableHead className="hidden md:table-cell text-center">Data de Registro</TableHead>
                    <TableHead className="text-center">Data de Expiração</TableHead>
                    <TableHead className="hidden lg:table-cell">Recursos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={
                              domain.status === "active"
                                ? "bg-green-500/10 text-green-500 border-green-200 dark:border-green-800 mr-2 h-2 w-2 p-0 rounded-full"
                                : "bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-800 mr-2 h-2 w-2 p-0 rounded-full"
                            }
                          />
                          {domain.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">{domain.registrationDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <p>{domain.expiryDate}</p>
                          {domain.autoRenew && (
                            <Badge variant="outline" className="mt-1">
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Renovação Automática
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {domain.features.map((feature, index) => {
                            const getIcon = (feature: string) => {
                              switch (feature) {
                                case "DNS Management":
                                  return Server;
                                case "Email Forwarding":
                                  return Mail;
                                case "Domain Privacy":
                                  return Lock;
                                default:
                                  return Globe;
                              }
                            };
                            const Icon = getIcon(feature);
                            // Translate feature names
                            const featureLabel = feature === "DNS Management" ? "Gerenciamento de DNS" :
                              feature === "Email Forwarding" ? "Redirecionamento de E-mail" :
                              feature === "Domain Privacy" ? "Privacidade de Domínio" :
                              feature === "Auto-Renew" ? "Renovação Automática" : feature;
                            return (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Icon className="h-3 w-3 mr-1" />
                                {featureLabel}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Server className="h-4 w-4 mr-2" />
                              Gerenciar DNS
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Lock className="h-4 w-4 mr-2" />
                              Privacidade de Domínio
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Configurações de E-mail
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Renovar Domínio
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visitar Site
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