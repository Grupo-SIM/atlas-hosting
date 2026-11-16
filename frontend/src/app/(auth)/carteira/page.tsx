import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { and, desc, eq, ne } from "drizzle-orm";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
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
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgAffiliateCommission,
  pgWalletEntry,
  pgWithdrawalRequests,
} from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import { getWalletBalance } from "@/lib/wallet/balance";
import { SyncWithdrawalButton, WithdrawButton } from "./components/WalletActions";

export const metadata: Metadata = {
  description: "Saldo, extrato e saques da sua carteira no Atlas",
  title: "Carteira - Atlas Hosting",
};

interface StatementRow {
  amount: number;
  date: Date;
  description: string;
  id: string;
  kind: "commission" | "sale" | "withdrawal";
  status?: string;
  withdrawalId?: string;
}

const WITHDRAWAL_STATUS: Record<string, string> = {
  approved: "Pago",
  pending: "Em análise",
  rejected: "Recusado",
};

export default async function WalletPage() {
  const user = await getUser();
  const minWithdrawal = Number(process.env.AFFILIATE_MIN_WITHDRAWAL) || 100;
  const fee = Number(process.env.AFFILIATE_WITHDRAWAL_FEE) || 2;

  const [balance, commissions, entries, withdrawals] = await Promise.all([
    getWalletBalance(user.id),
    db
      .select()
      .from(pgAffiliateCommission)
      .where(
        and(
          eq(pgAffiliateCommission.affiliateUserId, user.id),
          ne(pgAffiliateCommission.status, "cancelled")
        )
      )
      .orderBy(desc(pgAffiliateCommission.createdAt))
      .limit(100),
    db
      .select()
      .from(pgWalletEntry)
      .where(eq(pgWalletEntry.userId, user.id))
      .orderBy(desc(pgWalletEntry.createdAt))
      .limit(100),
    db
      .select()
      .from(pgWithdrawalRequests)
      .where(eq(pgWithdrawalRequests.userId, user.id))
      .orderBy(desc(pgWithdrawalRequests.createdAt))
      .limit(100),
  ]);

  const rows: StatementRow[] = [
    ...commissions.map(item => ({
      amount: item.commissionAmount,
      date: item.createdAt,
      description: "Comissão de afiliado",
      id: `c-${item.id}`,
      kind: "commission" as const,
    })),
    ...entries.map(item => ({
      amount: item.amountBrl,
      date: item.createdAt,
      description: item.description,
      id: `e-${item.id}`,
      kind: "sale" as const,
    })),
    ...withdrawals.map(item => ({
      amount: -item.amount,
      date: item.createdAt,
      description: item.rejectionReason
        ? `Saque PIX — ${item.rejectionReason}`
        : "Saque PIX",
      id: `w-${item.id}`,
      kind: "withdrawal" as const,
      status: item.status,
      withdrawalId: item.id,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Carteira</h1>
        <p className="mt-1 text-muted-foreground">
          Comissões de afiliado e vendas de exclusividade de templates caem
          aqui. O saque é feito por PIX.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Disponível para saque</CardDescription>
            <CardTitle className="text-3xl">{toBrl(balance.available)}</CardTitle>
          </CardHeader>
          <CardContent>
            <WithdrawButton
              availableBalance={balance.available}
              fee={fee}
              minWithdrawal={minWithdrawal}
            />
            <p className="mt-2 text-muted-foreground text-xs">
              Mínimo de {toBrl(minWithdrawal)} por saque.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vendas de exclusividade</CardDescription>
            <CardTitle className="text-2xl">{toBrl(balance.sales)}</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Total recebido em revendas de templates.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saques em análise</CardDescription>
            <CardTitle className="text-2xl">
              {toBrl(balance.pendingWithdrawals)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Comissões de afiliado: {toBrl(balance.commissions)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extrato</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground text-sm">
              Nenhuma movimentação ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(row.date, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>
                      {row.kind === "withdrawal" ? (
                        <span className="flex items-center gap-1">
                          <Badge
                            variant={
                              row.status === "rejected" ? "destructive" : "secondary"
                            }
                          >
                            {WITHDRAWAL_STATUS[row.status ?? ""] ?? row.status}
                          </Badge>
                          {row.status === "pending" && row.withdrawalId && (
                            <SyncWithdrawalButton withdrawalId={row.withdrawalId} />
                          )}
                        </span>
                      ) : (
                        <Badge variant="outline">Crédito</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        row.amount < 0
                          ? "text-right text-destructive"
                          : "text-right text-green-600"
                      }
                    >
                      {row.amount < 0 ? "−" : "+"}
                      {toBrl(Math.abs(row.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
