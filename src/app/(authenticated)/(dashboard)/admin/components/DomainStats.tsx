import { db } from "@/lib/db";
import { userTable, invoiceTable, User, Invoice } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import nameSilo from "@/lib/server/apis/namesilo";
import { isBefore, startOfTomorrow, toDate } from "date-fns";

export async function DomainStats() {
  // Get all invoices with user information, ordered by most recent
  const invoices = await db.query.invoiceTable.findMany({
    with: {
      user: true
    },
    orderBy: desc(invoiceTable.updatedAt),
    limit: 100
  });

  // Get unique users with Namesilo IDs
  const invoicesWithNamesiloId = invoices.filter(({ user }) => user.namesiloId !== null && user.namesiloId !== undefined) as (Invoice & { user: User & { namesiloId: number } })[]

  // Fetch domains for each user's portfolio
  const domainPromises = invoicesWithNamesiloId.map(async ({ user }) => {
    const domains = await nameSilo.listDomains({ portfolioId: user.namesiloId });
    return { domains: Array.isArray(domains.domains) ? domains.domains: [domains.domains.domain!], user};
  });

  const allDomains = (await Promise.all(domainPromises)).flat();

  console.log({allDomains})

  const domainStats = (await Promise.all(
    allDomains.map(async ({ domains, user }) => {
      return domains.map(domain => ({
        domain: domain.domain,
        status: isBefore(domain.expires || startOfTomorrow(), new Date()) ? "expired" : "active",
        expiryDate: domain.expires ? toDate(domain.expires).toLocaleDateString() : "Nunca",
        autoRenew: !!domain.renew,
        user: user ? {
          name: user.name,
          email: user.email,
        } : null,
      }));
    })
  )).flat();

  const totalDomains = domainStats.length;
  const activeDomains = domainStats.filter(d => d.status === "active").length;
  const autoRenewDomains = domainStats.filter(d => d.autoRenew).length;
  const domainsWithUsers = domainStats.filter(d => d.user).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas de Domínios</CardTitle>
        <CardDescription>
          Visão geral dos domínios registrados e seus usuários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Domínios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalDomains}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Domínios Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeDomains}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Auto-Renovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {autoRenewDomains}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Usuários Vinculados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {domainsWithUsers}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domainStats.map((domain) => (
                  <TableRow key={domain.domain}>
                    <TableCell className="font-medium">{domain.domain}</TableCell>
                    <TableCell>
                      <Badge
                        variant={domain.status === "active" ? "default" : "destructive"}
                      >
                        {domain.status === "active" ? "Ativo" : "Expirado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{domain.expiryDate}</div>
                        {domain.autoRenew && (
                          <Badge variant="outline" className="mt-1">
                            Auto-Renovação
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {domain.user ? (
                        <div>
                          <div className="font-medium">{domain.user.name}</div>
                          <div className="text-sm text-muted-foreground">{domain.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Não vinculado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 