import { count, eq, ne, sql, sum } from "drizzle-orm";
import { ExternalLink, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HeaderTip } from "@/components/HeaderTip";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgUser,
  pgWithdrawalRequests,
} from "@/lib/db/schema";

import { AffiliateReportButton } from "./components";

export const metadata: Metadata = {
  title: "Gerenciar Afiliados - Admin",
};

function toBrl(value: number) {
  return value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
}

export default async function AdminAffiliatesPage() {
  // Buscar usuários que indicaram alguém ou tem código de afiliado.
  // Sem join com faturas: ele multiplicava o afiliado por cada fatura do indicado
  // e inflava a contagem (3 indicados com 8 faturas viravam "10 indicações").
  const affiliates = await db
    .select({
      affiliateCode: pgUser.affiliateCode,
      email: pgUser.email,
      id: pgUser.id,
      name: pgUser.name,
      referralCount: count(sql`referred.id`),
    })
    .from(pgUser)
    .leftJoin(
      sql`${pgUser} as referred`,
      eq(sql`referred.referrer_id`, pgUser.id)
    )
    .groupBy(pgUser.id, pgUser.name, pgUser.email, pgUser.affiliateCode)
    .having(sql`count(referred.id) > 0 or exists (
      select 1 from ${pgAffiliateCommission}
      where ${pgAffiliateCommission.affiliateUserId} = ${pgUser.id}
    )`)
    .orderBy(pgUser.name, pgUser.id);

  // Saldo líquido = comissões disponíveis menos o que já está preso em saques
  // pendentes. Mesma conta do `getAffiliateBalance` que o afiliado vê na conta dele.
  const [availableRows, pendingRows, commissionRows] = await Promise.all([
    db
      .select({
        total: sum(pgAffiliateCommission.commissionAmount),
        userId: pgAffiliateCommission.affiliateUserId,
      })
      .from(pgAffiliateCommission)
      .where(eq(pgAffiliateCommission.status, "available"))
      .groupBy(pgAffiliateCommission.affiliateUserId),
    db
      .select({
        total: sum(pgWithdrawalRequests.amount),
        userId: pgWithdrawalRequests.userId,
      })
      .from(pgWithdrawalRequests)
      .where(eq(pgWithdrawalRequests.status, "pending"))
      .groupBy(pgWithdrawalRequests.userId),
    db
      .select({
        commissionTotal: sum(pgAffiliateCommission.commissionAmount),
        salesCount: count(),
        salesTotal: sum(pgAffiliateCommission.grossAmount),
        userId: pgAffiliateCommission.affiliateUserId,
      })
      .from(pgAffiliateCommission)
      .where(ne(pgAffiliateCommission.status, "cancelled"))
      .groupBy(pgAffiliateCommission.affiliateUserId),
  ]);

  const availableByUser = new Map(
    availableRows.map(r => [r.userId, Number(r.total ?? 0)])
  );
  const pendingByUser = new Map(
    pendingRows.map(r => [r.userId, Number(r.total ?? 0)])
  );

  const commissionsByUser = new Map(commissionRows.map(row => [row.userId, row]));
  const report = affiliates.map(affiliate => {
    const commission = commissionsByUser.get(affiliate.id);
    const pending = pendingByUser.get(affiliate.id) ?? 0;
    return {
      ...affiliate,
      balance: Math.max(0, (availableByUser.get(affiliate.id) ?? 0) - pending),
      commissionTotal: Number(commission?.commissionTotal ?? 0),
      pending,
      salesCount: commission?.salesCount ?? 0,
      salesTotal: Number(commission?.salesTotal ?? 0),
    };
  });
  const totals = report.reduce(
    (total, row) => ({
      balance: total.balance + row.balance,
      commissionTotal: total.commissionTotal + row.commissionTotal,
      pending: total.pending + row.pending,
      referrals: total.referrals + row.referralCount,
      salesCount: total.salesCount + row.salesCount,
      salesTotal: total.salesTotal + row.salesTotal,
    }),
    { balance: 0, commissionTotal: 0, pending: 0, referrals: 0, salesCount: 0, salesTotal: 0 }
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Afiliados</h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie todos os afiliados e suas indicações
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
        {[
          { label: "Total de indicações", value: String(totals.referrals) },
          { label: "Vendas comissionadas", value: toBrl(totals.salesTotal) },
          { label: "Comissões acumuladas", value: toBrl(totals.commissionTotal) },
          { label: "Saldo disponível", value: toBrl(totals.balance) },
          { label: "Saques pendentes", value: toBrl(totals.pending) },
        ].map(stat => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-sm">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Relatório de Afiliados</CardTitle>
            <AffiliateReportButton rows={report} />
          </div>
          <CardDescription>
            Histórico completo de indicações e vendas que geraram comissão. Comissões canceladas não entram nos totais; saldo disponível desconta saques pendentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <TooltipProvider delayDuration={150}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Afiliado</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>
                      <HeaderTip
                        label="Indicações"
                        tip="Contas criadas com o link deste afiliado."
                      />
                    </TableHead>
                    <TableHead>Vendas comissionadas</TableHead>
                    <TableHead>Comissões acumuladas</TableHead>
                    <TableHead>Saldo disponível</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.map(affiliate => {
                    const available = availableByUser.get(affiliate.id) ?? 0;
                    const pending = pendingByUser.get(affiliate.id) ?? 0;
                    const balance = Math.max(0, available - pending);

                    return (
                      <TableRow key={affiliate.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {affiliate.name}
                            </span>
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
                        <TableCell>
                          <div>{toBrl(affiliate.salesTotal)}</div>
                          <div className="text-muted-foreground text-xs">
                            {affiliate.salesCount} {affiliate.salesCount === 1 ? "venda" : "vendas"}
                          </div>
                        </TableCell>
                        <TableCell>{toBrl(affiliate.commissionTotal)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span
                              className={
                                balance > 0
                                  ? "font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {toBrl(balance)}
                            </span>
                            {pending > 0 && (
                              <span className="text-muted-foreground text-xs">
                                {toBrl(pending)} em saque pendente
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
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
                        colSpan={7}
                      >
                        Nenhum afiliado encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
