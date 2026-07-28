import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { and, eq } from "drizzle-orm";
import { Ticket } from "lucide-react";
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
import { pgVoucher } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import VoucherCopyButton from "./components/VoucherCopyButton";

export const metadata: Metadata = {
  description: "Visualize e copie seus vouchers de desconto",
  title: "Meus Vouchers - Atlas Hosting",
};

export default async function UserVouchersPage() {
  const user = await getUser();

  // Buscar vouchers vinculados ao usuário que ainda estão ativos
  const vouchers = await db.query.pgVoucher.findMany({
    where: and(eq(pgVoucher.userId, user.id), eq(pgVoucher.active, true)),
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          Meus Vouchers
        </h1>
        <p className="mt-1 text-muted-foreground">
          Utilize seus vouchers de desconto nas suas próximas compras
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Vouchers Disponíveis
          </CardTitle>
          <CardDescription>
            Copie o código e aplique no checkout para obter o desconto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <Ticket className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="font-semibold text-xl">
                Nenhum voucher disponível
              </h3>
              <p className="text-muted-foreground">
                Quando você receber um voucher, ele aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map(voucher => {
                    const isExpired =
                      voucher.expiresAt &&
                      new Date(voucher.expiresAt).toISOString().slice(0, 10) <
                        new Date().toISOString().slice(0, 10);
                    const isUsedUp = voucher.currentUses >= voucher.maxUses;
                    const canUse = !isExpired && !isUsedUp;

                    return (
                      <TableRow key={voucher.id}>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 font-bold font-mono text-sm">
                            {voucher.code}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          {voucher.discountType === "fixed"
                            ? toBrl(voucher.discountValue)
                            : `${voucher.discountValue}%`}
                        </TableCell>
                        <TableCell>
                          {voucher.currentUses}/{voucher.maxUses}
                        </TableCell>
                        <TableCell>
                          {isExpired ? (
                            <Badge
                              className="bg-red-500/10 text-red-500"
                              variant="outline"
                            >
                              Expirado
                            </Badge>
                          ) : isUsedUp ? (
                            <Badge
                              className="bg-yellow-500/10 text-yellow-500"
                              variant="outline"
                            >
                              Esgotado
                            </Badge>
                          ) : (
                            <Badge
                              className="bg-green-500/10 text-green-500"
                              variant="outline"
                            >
                              Disponível
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {voucher.expiresAt
                            ? format(
                                new Date(voucher.expiresAt),
                                "dd/MM/yyyy",
                                { locale: ptBR }
                              )
                            : "Sem expiração"}
                        </TableCell>
                        <TableCell className="text-right">
                          {canUse && <VoucherCopyButton code={voucher.code} />}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
