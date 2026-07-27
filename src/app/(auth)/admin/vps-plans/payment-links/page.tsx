import { getVpsPaymentLinksAction, searchCustomersAction, createVpsPaymentLinkAction } from "./actions";
import { PaymentLinkForm } from "./PaymentLinkForm";
import { CancelLinkButton } from "./CancelLinkButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { SELLABLE_VPS_PLANS } from "@/lib/vps-sellable-plans";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Metadata } from "next";
import { Link2, QrCode, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Links de Pagamento — Admin" };

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Aguardando pagamento", variant: "secondary" },
  used: { label: "Pago", variant: "default" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

export default async function VpsPaymentLinksPage() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const [links, customers] = await Promise.all([
    getVpsPaymentLinksAction(),
    searchCustomersAction(),
  ]);

  const baseUrl = getServerPublicBaseUrl();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-4 md:pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Links de Pagamento</h2>
        <p className="text-muted-foreground">
          Crie cobranças com período e valor customizados (ex: a cada 2 ou 3 meses) e gere um link pra o cliente pagar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Link</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentLinkForm plans={SELLABLE_VPS_PLANS} customers={customers} createAction={createVpsPaymentLinkAction} />
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
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum link criado ainda.
                    </TableCell>
                  </TableRow>
                )}
                {links.map((l) => {
                  const status = STATUS_LABEL[l.status] ?? { label: l.status, variant: "outline" as const };
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.planName}</TableCell>
                      <TableCell>{l.intervalMonths} {l.intervalMonths === 1 ? "mês" : "meses"}</TableCell>
                      <TableCell>R$ {l.amountBrl.toFixed(2).replace(".", ",")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="gap-1">
                            <CreditCard className="h-3 w-3" /> Cartão
                          </Badge>
                          {l.allowPix && (
                            <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-500/30">
                              <QrCode className="h-3 w-3" /> PIX
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {l.linkedUserName ? (
                          <div className="flex flex-col">
                            <span>{l.linkedUserName}</span>
                            <span className="text-xs text-muted-foreground">{l.linkedUserEmail}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Genérico</span>
                        )}
                      </TableCell>
                      <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                      <TableCell>{format(l.createdAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {l.status === "pending" && (
                            <>
                              <CopyLinkButton url={`${baseUrl}/pay/${l.id}`} />
                              <CancelLinkButton id={l.id} />
                            </>
                          )}
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
