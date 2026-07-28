import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { desc, eq } from "drizzle-orm";
import { CheckCircle, Plus, Ticket } from "lucide-react";
import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
import { db } from "@/lib/db";
import { pgVoucher } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import CreateVoucherForm from "./CreateVoucherForm";
import VoucherActions from "./VoucherActions";

export const metadata: Metadata = {
  title: "Gerenciar Vouchers - Admin",
};

async function createVoucher(formData: FormData) {
  "use server";

  const code = (formData.get("code") as string)
    ?.replace(/\s/g, "")
    .toUpperCase();
  const discountType = formData.get("discountType") as "fixed" | "percentage";
  const discountValue = Number.parseFloat(
    formData.get("discountValue") as string
  );
  const userId = (formData.get("userId") as string) || null;
  const maxUses = Number.parseInt(formData.get("maxUses") as string, 10) || 1;
  const expiresAtStr = formData.get("expiresAt") as string;

  if (
    !code ||
    !discountType ||
    Number.isNaN(discountValue) ||
    discountValue <= 0
  ) {
    return;
  }

  // Verificar se já existe
  const existing = await db.query.pgVoucher.findFirst({
    where: eq(pgVoucher.code, code),
  });

  if (existing) {
    return;
  }

  await db.insert(pgVoucher).values({
    code,
    discountType,
    discountValue,
    expiresAt: expiresAtStr
      ? (() => {
          const d = new Date(expiresAtStr);
          d.setHours(23, 59, 59, 999);
          return d;
        })()
      : null,
    maxUses,
    userId: userId && userId !== "none" ? userId : null,
  });

  revalidatePath("/admin/vouchers");
  redirect("/admin/vouchers");
}

export default async function AdminVouchersPage() {
  const vouchers = await db.query.pgVoucher.findMany({
    orderBy: [desc(pgVoucher.createdAt)],
    with: {
      user: true,
    },
  });

  const users = await db.query.pgUser.findMany({
    columns: {
      email: true,
      id: true,
      name: true,
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Vouchers</h1>
          <p className="mt-1 text-muted-foreground">
            Crie e gerencie vouchers de desconto
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total de Vouchers
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{vouchers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {vouchers.filter(v => v.active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Utilizados</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {vouchers.filter(v => v.currentUses >= v.maxUses).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de criação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Voucher
          </CardTitle>
          <CardDescription>
            Crie um voucher de desconto fixo ou percentual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateVoucherForm createAction={createVoucher} users={users} />
        </CardContent>
      </Card>

      {/* Lista de vouchers */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Vouchers</CardTitle>
          <CardDescription>
            Todos os vouchers criados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Vinculado a</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-center">
                    Ativar/Desativar
                  </TableHead>
                  <TableHead className="text-center">Excluir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map(voucher => {
                  const isExpired =
                    voucher.expiresAt &&
                    new Date(voucher.expiresAt).toISOString().slice(0, 10) <
                      new Date().toISOString().slice(0, 10);
                  const isUsedUp = voucher.currentUses >= voucher.maxUses;

                  return (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-1 font-bold font-mono text-emerald-500 text-sm">
                          {voucher.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {voucher.discountType === "fixed"
                          ? toBrl(voucher.discountValue)
                          : `${voucher.discountValue}%`}
                      </TableCell>
                      <TableCell>
                        {voucher.user ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              {voucher.user.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {voucher.user.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Todos
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {voucher.currentUses}/{voucher.maxUses}
                      </TableCell>
                      <TableCell>
                        {!voucher.active ? (
                          <Badge
                            className="border-none bg-gray-500/10 text-gray-500"
                            variant="outline"
                          >
                            Desativado
                          </Badge>
                        ) : isExpired ? (
                          <Badge
                            className="border-none bg-red-500/10 text-red-500"
                            variant="outline"
                          >
                            Expirado
                          </Badge>
                        ) : isUsedUp ? (
                          <Badge
                            className="border-none bg-yellow-500/10 text-yellow-500"
                            variant="outline"
                          >
                            Esgotado
                          </Badge>
                        ) : (
                          <Badge
                            className="border-none bg-green-500/10 text-green-500"
                            variant="outline"
                          >
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(voucher.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <VoucherActions
                        active={voucher.active}
                        code={voucher.code}
                        voucherId={voucher.id}
                      />
                    </TableRow>
                  );
                })}
                {vouchers.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-10 text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Nenhum voucher criado ainda
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
