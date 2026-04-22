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
import { pgVoucher, pgUser } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Plus, Ticket, CheckCircle } from "lucide-react";
import { toBrl } from "@/lib/utils";
import { Metadata } from "next";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import CreateVoucherForm from "./CreateVoucherForm";
import VoucherActions from "./VoucherActions";

export const metadata: Metadata = {
  title: "Gerenciar Vouchers - Admin",
};

async function createVoucher(formData: FormData) {
  "use server";

  const code = (formData.get("code") as string)?.replace(/\s/g, "").toUpperCase();
  const discountType = formData.get("discountType") as "fixed" | "percentage";
  const discountValue = parseFloat(formData.get("discountValue") as string);
  const userId = (formData.get("userId") as string) || null;
  const maxUses = parseInt(formData.get("maxUses") as string) || 1;
  const expiresAtStr = formData.get("expiresAt") as string;

  if (!code || !discountType || isNaN(discountValue) || discountValue <= 0) {
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
    userId: userId && userId !== "none" ? userId : null,
    maxUses,
    expiresAt: expiresAtStr ? (() => { const d = new Date(expiresAtStr); d.setHours(23, 59, 59, 999); return d; })() : null,
  });

  revalidatePath("/admin/vouchers");
  redirect("/admin/vouchers");
}

export default async function AdminVouchersPage() {
  const vouchers = await db.query.pgVoucher.findMany({
    with: {
      user: true,
    },
    orderBy: [desc(pgVoucher.createdAt)],
  });

  const users = await db.query.pgUser.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie vouchers de desconto
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vouchers
            </CardTitle>
            < Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vouchers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.filter((v) => v.active).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilizados</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vouchers.filter((v) => v.currentUses >= v.maxUses).length}
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
          <CreateVoucherForm users={users} createAction={createVoucher} />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Vinculado a</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-center">Ativar/Desativar</TableHead>
                <TableHead className="text-center">Excluir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((voucher) => {
                const isExpired =
                  voucher.expiresAt && new Date(voucher.expiresAt).toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10);
                const isUsedUp = voucher.currentUses >= voucher.maxUses;

                return (
                  <TableRow key={voucher.id}>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-bold text-emerald-500">
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
                          <span className="text-sm font-medium">
                            {voucher.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
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
                          variant="outline"
                          className="bg-gray-500/10 text-gray-500 border-none"
                        >
                          Desativado
                        </Badge>
                      ) : isExpired ? (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-500 border-none"
                        >
                          Expirado
                        </Badge>
                      ) : isUsedUp ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-500/10 text-yellow-500 border-none"
                        >
                          Esgotado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-500 border-none"
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
                      voucherId={voucher.id} 
                      active={voucher.active} 
                      code={voucher.code} 
                    />
                  </TableRow>
                );
              })}
              {vouchers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Nenhum voucher criado ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
