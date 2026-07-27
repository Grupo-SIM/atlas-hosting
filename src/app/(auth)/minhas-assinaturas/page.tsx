import { RenewCell } from "./RenewCell";
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
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgVpsSubscription } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toBrl } from "@/lib/utils";
import { Metadata } from "next";
import { Server, Clock, CreditCard, QrCode, Barcode } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Minhas Assinaturas — Atlas Hosting" };

const PLAN_TYPE_LABEL: Record<string, string> = {
  vps: "VPS",
  vds: "VDS",
  "storage-vps": "Storage",
  "vps-windows": "Windows",
};

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function periodLabel(months: number) {
  return months === 1 ? "1 mês" : `${months} meses`;
}

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active:    { label: "Ativa",      variant: "default" },
    paused:    { label: "Pausada",    variant: "secondary" },
    cancelled: { label: "Cancelada",  variant: "outline" },
    failed:    { label: "Falhou",     variant: "destructive" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
}

function PaymentBadge({ method }: { method: "credit_card" | "pix" | "boleto" }) {
  if (method === "pix") {
    return (
      <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-500/30">
        <QrCode className="h-3 w-3" />
        PIX
      </Badge>
    );
  }
  if (method === "boleto") {
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/30">
        <Barcode className="h-3 w-3" />
        Boleto
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <CreditCard className="h-3 w-3" />
      Cartão
    </Badge>
  );
}

export default async function MyVpsSubscriptionsPage() {
  const user = await getUser();

  const subs = await db.query.pgVpsSubscription.findMany({
    where: eq(pgVpsSubscription.userId, user.id),
    orderBy: [desc(pgVpsSubscription.createdAt)],
  });

  const rows = subs.map((s) => ({
    id: s.id,
    planType: s.planType as keyof typeof PLAN_TYPE_LABEL,
    intervalMonths: s.intervalMonths,
    amountBrl: s.amountBrl,
    paymentMethod: (s.paymentMethod ?? ((s.config as any)?.cardToken ? "credit_card" : "pix")) as "credit_card" | "pix" | "boleto",
    status: s.status as "active" | "cancelled" | "failed" | "paused",
    nextChargeDate: s.nextChargeDate,
  }));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-4 md:pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Minhas Assinaturas</h2>
        <p className="text-muted-foreground">
          Gerencie suas assinaturas de VPS/VDS e renove com PIX quando estiverem perto de vencer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Assinaturas ({rows.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Próx. cobrança</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((sub) => {
                  const isExpiring =
                    (sub.status === "active" &&
                      sub.nextChargeDate.getTime() <= Date.now() + FIFTEEN_DAYS_MS) ||
                    sub.status === "paused";
                  const remainingDays = daysUntil(sub.nextChargeDate);
                  return (
                    <TableRow key={sub.id} className={isExpiring ? "bg-amber-500/10 hover:bg-amber-500/15" : undefined}>
                      <TableCell>
                        <Badge variant="secondary">
                          {PLAN_TYPE_LABEL[sub.planType] ?? sub.planType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{periodLabel(sub.intervalMonths)}</Badge>
                      </TableCell>
                      <TableCell>
                        <PaymentBadge method={sub.paymentMethod} />
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1">
                          <span>{format(sub.nextChargeDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                          {isExpiring && (
                            <Badge variant="outline" className="w-fit gap-1 text-amber-600 border-amber-500/40">
                              <Clock className="h-3 w-3" />
                              {sub.status === "paused" || remainingDays <= 0
                                ? "Vencida"
                                : `Vence em ${remainingDays} ${remainingDays === 1 ? "dia" : "dias"}`}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{toBrl(sub.amountBrl)}</TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <RenewCell
                          id={sub.id}
                          status={sub.status}
                          paymentMethod={sub.paymentMethod}
                          nextChargeDate={sub.nextChargeDate}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Você ainda não possui assinaturas de VPS/VDS.
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
