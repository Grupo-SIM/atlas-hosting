import { count, eq, sql, sum } from "drizzle-orm";
import { ExternalLink, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { pgInvoice, pgUser } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Gerenciar Afiliados - Admin",
};

export default async function AdminAffiliatesPage() {
  const systemConfig = await db.query.pgSystemConfig.findFirst();
  const commissionRate = systemConfig?.referrerCommission ?? 10;

  // Buscar usuários que indicaram alguém ou tem código de afiliado
  const affiliates = await db
    .select({
      affiliateCode: pgUser.affiliateCode,
      email: pgUser.email,
      id: pgUser.id,
      name: pgUser.name,
      referralCount: count(sql`CASE WHEN referred.id IS NOT NULL THEN 1 END`),
      totalSales: sum(pgInvoice.amount),
    })
    .from(pgUser)
    .leftJoin(
      sql`${pgUser} as referred`,
      eq(sql`referred.referrer_id`, pgUser.id)
    )
    .leftJoin(pgInvoice, eq(pgInvoice.userId, sql`referred.id`))
    .groupBy(pgUser.id, pgUser.name, pgUser.email, pgUser.affiliateCode)
    .having(sql`count(referred.id) > 0`);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Afiliados</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie todos os afiliados e suas indicações
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total de Afiliados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{affiliates.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Afiliados</CardTitle>
          <CardDescription>
            Visualize o desempenho de cada afiliado do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Afiliado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Indicações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates.map(affiliate => {
                  const salesValue = Number(affiliate.totalSales ?? 0);
                  const commissionValue = salesValue * (commissionRate / 100);

                  return (
                    <TableRow key={affiliate.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{affiliate.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {affiliate.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                          {affiliate.affiliateCode || "---"}
                        </code>
                      </TableCell>
                      <TableCell>{affiliate.referralCount}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/admin/affiliates/${affiliate.id}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Detalhes
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {affiliates.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-10 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      Nenhum afiliado encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
