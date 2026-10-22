import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toBrl } from "./format-money";
import type { AffiliateSale } from "./types";

const STATUS_LABEL: Record<AffiliateSale["status"], string> = {
  available: "Disponível",
  cancelled: "Cancelada",
  withdrawn: "Sacada",
};

export function AffiliateSalesTable({ sales }: { sales: AffiliateSale[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas do Afiliado</CardTitle>
        <CardDescription>
          Histórico de vendas que geraram comissão, incluindo compradores sem
          cadastro pelo link de indicação. Comissões canceladas não entram nos
          totais.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprador</TableHead>
                <TableHead>Compra</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor da Venda</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead className="text-right">Status da Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map(sale => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{sale.buyerUser.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {sale.buyerUser.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {sale.invoice.description || sale.invoice.reference}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {sale.invoice.reference}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(sale.createdAt, "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {toBrl(sale.grossAmount)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {toBrl(sale.commissionAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      className={
                        sale.status === "cancelled"
                          ? "border-red-400/25 bg-red-400/10 text-red-300"
                          : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                      }
                      variant="outline"
                    >
                      {STATUS_LABEL[sale.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell
                    className="py-10 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    Nenhuma venda comissionada encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
