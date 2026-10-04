import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { desc, eq, inArray } from "drizzle-orm";
import { UserCircle } from "lucide-react";
import { notFound } from "next/navigation";
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
import { db } from "@/lib/db";
import { pgAffiliateCommission, pgInvoice, pgUser } from "@/lib/db/schema";
import { AffiliateSalesTable } from "./components";
import { toBrl } from "./components/format-money";
import {
  type ReferralPurchase,
  ReferralPurchasesDialog,
} from "./ReferralPurchasesDialog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AffiliateDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const affiliate = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, id),
  });

  if (!affiliate) {
    notFound();
  }

  const referrals = await db.query.pgUser.findMany({
    orderBy: [desc(pgUser.createdAt)],
    where: eq(pgUser.referrerId, affiliate.id),
  });

  // O que cada indicado comprou, com a comissão que a compra rendeu a este
  // afiliado (nem toda compra rende: renovação e atribuição expirada não contam).
  const referralIds = referrals.map(r => r.id);
  const [invoices, commissions] = await Promise.all([
    referralIds.length
      ? db.query.pgInvoice.findMany({
          orderBy: [desc(pgInvoice.createdAt)],
          where: inArray(pgInvoice.userId, referralIds),
        })
      : [],
    db.query.pgAffiliateCommission.findMany({
      orderBy: [desc(pgAffiliateCommission.createdAt)],
      where: eq(pgAffiliateCommission.affiliateUserId, affiliate.id),
      with: {
        buyerUser: { columns: { email: true, name: true } },
        invoice: { columns: { description: true, reference: true } },
      },
    }),
  ]);

  const commissionByInvoice = new Map(
    commissions.map(c => [
      c.invoiceId,
      { amount: c.commissionAmount, cancelled: c.status === "cancelled" },
    ])
  );

  const purchasesByUser = new Map<string, ReferralPurchase[]>();
  for (const invoice of invoices) {
    const list = purchasesByUser.get(invoice.userId) ?? [];
    const commission = commissionByInvoice.get(invoice.id);
    list.push({
      amount: invoice.amount,
      commissionAmount: commission?.amount ?? null,
      commissionCancelled: !!commission?.cancelled,
      createdAt: invoice.createdAt,
      description: invoice.description || invoice.reference,
      id: invoice.id,
      status: invoice.status,
      type: invoice.type,
    });
    purchasesByUser.set(invoice.userId, list);
  }

  const activeCommissions = commissions.filter(c => c.status !== "cancelled");
  const salesTotal = activeCommissions.reduce((sum, c) => sum + c.grossAmount, 0);
  const commissionTotal = activeCommissions.reduce(
    (sum, c) => sum + c.commissionAmount,
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Detalhes: {affiliate.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Indicações realizadas por {affiliate.email}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total de Indicações", value: String(referrals.length) },
          { label: "Total de Vendas", value: String(activeCommissions.length) },
          { label: "Vendas comissionadas", value: toBrl(salesTotal) },
          { label: "Comissões acumuladas", value: toBrl(commissionTotal) },
        ].map(stat => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm uppercase">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AffiliateSalesTable sales={commissions} />

      <Card>
        <CardHeader>
          <CardTitle>Usuários Indicados</CardTitle>
          <CardDescription>
            Lista de contas criadas através deste afiliado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data de Registro</TableHead>
                  <TableHead>Compras</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(user => {
                  const purchases = purchasesByUser.get(user.id) ?? [];
                  const paidCount = purchases.filter(
                    p => p.status === "paid"
                  ).length;

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-4 w-4 text-muted-foreground" />
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), "PPP", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {paidCount > 0 ? (
                          <span>
                            {paidCount} {paidCount === 1 ? "paga" : "pagas"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Nenhuma</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ReferralPurchasesDialog
                          purchases={purchases}
                          userEmail={user.email}
                          userName={user.name}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {referrals.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-10 text-center text-muted-foreground"
                      colSpan={5}
                    >
                      Nenhuma indicação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
