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
import { Badge } from "@/components/ui/badge";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgVoucher } from "@/lib/db/schema";
import { eq, and, or, isNull } from "drizzle-orm";
import { Ticket } from "lucide-react";
import { toBrl } from "@/lib/utils";
import type { Metadata } from "next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import VoucherCopyButton from "./components/VoucherCopyButton";

export const metadata: Metadata = {
  title: "Meus Vouchers - Atlas Hosting",
  description: "Visualize e copie seus vouchers de desconto",
};

export default async function UserVouchersPage() {
  const user = await getUser();

  // Buscar vouchers vinculados ao usuário que ainda estão ativos
  const vouchers = await db.query.pgVoucher.findMany({
    where: and(
      eq(pgVoucher.userId, user.id),
      eq(pgVoucher.active, true)
    ),
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Meus Vouchers
        </h1>
        <p className="text-muted-foreground mt-1">
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
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">
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
                {vouchers.map((voucher) => {
                  const isExpired =
                    voucher.expiresAt &&
                    new Date(voucher.expiresAt).toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10);
                  const isUsedUp = voucher.currentUses >= voucher.maxUses;
                  const canUse = !isExpired && !isUsedUp;

                  return (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-bold">
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
                            variant="outline"
                            className="bg-red-500/10 text-red-500"
                          >
                            Expirado
                          </Badge>
                        ) : isUsedUp ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-500/10 text-yellow-500"
                          >
                            Esgotado
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500"
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
                        {canUse && (
                          <VoucherCopyButton code={voucher.code} />
                        )}
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
