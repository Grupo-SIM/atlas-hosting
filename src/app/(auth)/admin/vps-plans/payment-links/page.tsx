import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Barcode, CreditCard, Link2, QrCode } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUser } from "@/lib/auth";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { SELLABLE_VPS_PLANS } from "@/lib/vps-sellable-plans";
import {
  createVpsPaymentLinkAction,
  getVpsPaymentLinksAction,
  searchCustomersAction,
} from "./actions";
import { CancelLinkButton } from "./CancelLinkButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { DeleteLinkButton } from "./DeleteLinkButton";
import { PaymentLinkForm } from "./PaymentLinkForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Links de Pagamento — Admin" };

const STATUS_LABEL: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  cancelled: { label: "Cancelado", variant: "outline" },
  paid: { label: "Pago", variant: "default" },
  pending: { label: "Aguardando pagamento", variant: "secondary" },
};

export default async function VpsPaymentLinksPage() {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const [links, customers] = await Promise.all([
    getVpsPaymentLinksAction(),
    searchCustomersAction(),
  ]);

  const baseUrl = getServerPublicBaseUrl();

  return (
    <div className="flex-1 space-y-6 p-4 pt-4 md:p-8 md:pt-6">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">
          Links de Pagamento
        </h2>
        <p className="text-muted-foreground">
          Crie cobranças com período e valor customizados (ex: a cada 2 ou 3
          meses) e gere um link pra o cliente pagar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Link</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentLinkForm
            createAction={createVpsPaymentLinkAction}
            customers={customers}
            plans={SELLABLE_VPS_PLANS}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Links criados ({links.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.length === 0 && (
                  <TableRow>
                    <TableCell
                      className="py-8 text-center text-muted-foreground"
                      colSpan={8}
                    >
                      Nenhum link criado ainda.
                    </TableCell>
                  </TableRow>
                )}
                {links.map(l => {
                  const status = STATUS_LABEL[l.status] ?? {
                    label: l.status,
                    variant: "outline" as const,
                  };
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">
                        {l.planName}
                      </TableCell>
                      <TableCell>
                        {l.intervalMonths}{" "}
                        {l.intervalMonths === 1 ? "mês" : "meses"}
                      </TableCell>
                      <TableCell>
                        R$ {l.amountBrl.toFixed(2).replace(".", ",")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge className="gap-1" variant="outline">
                            <CreditCard className="h-3 w-3" /> Cartão
                          </Badge>
                          {l.allowPix && (
                            <Badge
                              className="gap-1 border-emerald-500/30 text-emerald-600"
                              variant="outline"
                            >
                              <QrCode className="h-3 w-3" /> PIX
                            </Badge>
                          )}
                          {l.allowBoleto && (
                            <Badge
                              className="gap-1 border-amber-500/30 text-amber-600"
                              variant="outline"
                            >
                              <Barcode className="h-3 w-3" /> Boleto
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {l.linkedUserName ? (
                          <div className="flex flex-col">
                            <span>{l.linkedUserName}</span>
                            <span className="text-muted-foreground text-xs">
                              {l.linkedUserEmail}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Genérico
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(l.createdAt, "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {l.status === "pending" && (
                            <>
                              <CopyLinkButton url={`${baseUrl}/pay/${l.id}`} />
                              <CancelLinkButton id={l.id} />
                            </>
                          )}
                          <DeleteLinkButton
                            id={l.id}
                            isPaid={l.status === "paid"}
                            planName={l.planName}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
