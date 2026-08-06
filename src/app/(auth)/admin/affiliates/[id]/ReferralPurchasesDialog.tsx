"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ReferralPurchase {
  id: string;
  description: string;
  type: string;
  amount: number;
  status: string;
  createdAt: Date;
  /** Comissão que esta compra gerou para o afiliado, se gerou. */
  commissionAmount: number | null;
  /** Comissão cancelada (venda não entregue / pagamento não autorizado). */
  commissionCancelled: boolean;
}

/** Tags translúcidas em tom pastel: verde paga, amarelo pendente, vermelho perdida. */
const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  expired: {
    className: "rounded-md border-red-400/25 bg-red-400/10 text-red-300",
    label: "Expirada",
  },
  failed: {
    className: "rounded-md border-red-400/25 bg-red-400/10 text-red-300",
    label: "Falhou",
  },
  paid: {
    className:
      "rounded-md border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    label: "Paga",
  },
  pending: {
    className: "rounded-md border-amber-400/25 bg-amber-400/10 text-amber-300",
    label: "Pendente",
  },
  processing: {
    className: "rounded-md border-sky-400/25 bg-sky-400/10 text-sky-300",
    label: "Processando",
  },
};

const TYPE_LABEL: Record<string, string> = {
  domain: "Domínio",
  subscription: "Assinatura",
  vps: "Servidor",
};

function toBrl(value: number) {
  return value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });
}

export function ReferralPurchasesDialog({
  userName,
  userEmail,
  purchases,
}: {
  userName: string;
  userEmail: string;
  purchases: ReferralPurchase[];
}) {
  const paid = purchases.filter(p => p.status === "paid");
  const totalPaid = paid.reduce((sum, p) => sum + p.amount, 0);
  const totalCommission = purchases.reduce(
    (sum, p) => sum + (p.commissionCancelled ? 0 : (p.commissionAmount ?? 0)),
    0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <ExternalLink className="mr-2 h-4 w-4" />
          Detalhes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compras de {userName}</DialogTitle>
          <DialogDescription>
            {userEmail} — {paid.length}{" "}
            {paid.length === 1 ? "compra paga" : "compras pagas"} somando{" "}
            {toBrl(totalPaid)}
            {totalCommission > 0 &&
              `, ${toBrl(totalCommission)} em comissão para este afiliado`}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compra</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={5}
                  >
                    Este indicado ainda não gerou nenhuma cobrança.
                  </TableCell>
                </TableRow>
              )}
              {purchases.map(purchase => {
                const status = STATUS_LABEL[purchase.status] ?? {
                  className: "rounded-md",
                  label: purchase.status,
                };
                return (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {purchase.description}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {TYPE_LABEL[purchase.type] ?? purchase.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(purchase.createdAt, "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {toBrl(purchase.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {purchase.commissionAmount === null ||
                      purchase.commissionCancelled ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        toBrl(purchase.commissionAmount)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={status.className} variant="outline">
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
