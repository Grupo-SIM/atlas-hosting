import { count, eq, sql, sum } from "drizzle-orm";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgUser,
  pgWithdrawalRequests,
} from "@/lib/db/schema";

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
    .having(sql`count(referred.id) > 0`);

  // Saldo líquido = comissões disponíveis menos o que já está preso em saques
  // pendentes. Mesma conta do `getAffiliateBalance` que o afiliado vê na conta dele.
  const [availableRows, pendingRows] = await Promise.all([
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
  ]);

  const availableByUser = new Map(
    availableRows.map(r => [r.userId, Number(r.total ?? 0)])
  );
  const pendingByUser = new Map(
    pendingRows.map(r => [r.userId, Number(r.total ?? 0)])
  );

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
                    <TableHead>Saldo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliates.map(affiliate => {
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
                        colSpan={5}
                      >
                        Nenhum afiliado encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
