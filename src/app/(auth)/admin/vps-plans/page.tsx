import { getVpsPlanSubscriptionsAction, getPixAllowAllDurationsAction, getBoletoEnabledAction } from "./actions";
import { BackfillButton } from "./BackfillButton";
import { SubscriptionActionsCell } from "./SubscriptionActionsCell";
import { PaymentSettingsCard } from "./PaymentSettingsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toBrl } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import {
  Server,
  ShieldCheck,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  CreditCard,
  QrCode,
  Link2,
  Barcode,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Planos VPS — Admin" };

const PLAN_TYPE_LABEL: Record<string, string> = {
  vps: "VPS",
  vds: "VDS",
  "storage-vps": "Storage",
  "vps-windows": "Windows",
};

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

function periodLabel(months: number) {
  if (months === 1) return "1 mês";
  return `${months} meses`;
}

function daysUntil(date: Date) {
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
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

export default async function AdminVpsPlansPage() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const plans = await getVpsPlanSubscriptionsAction();
  const pixAllowAllDurations = await getPixAllowAllDurationsAction();
  const boletoEnabled = await getBoletoEnabledAction();

  const active   = plans.filter((p) => p.status === "active").length;
  const paused   = plans.filter((p) => p.status === "paused").length;
  const inactive = plans.filter((p) => p.status === "cancelled" || p.status === "failed").length;
  const expiring = plans.filter(
    (p) => p.status === "active" && p.nextChargeDate.getTime() <= Date.now() + FIFTEEN_DAYS_MS
  ).length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planos VPS</h2>
          <p className="text-muted-foreground">
            Gerencie assinaturas VPS dos clientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/vps-plans/payment-links" className="gap-2">
              <Link2 className="h-4 w-4" />
              Links de Pagamento
            </Link>
          </Button>
          <BackfillButton />
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold text-primary">
              Acesso Restrito: Admin
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pausadas</CardTitle>
            <PauseCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A vencer (15d)</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{expiring}</div>
          </CardContent>
        </Card>
      </div>

      <PaymentSettingsCard
        initialPixAllowAllDurations={pixAllowAllDurations}
        initialBoletoEnabled={boletoEnabled}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Assinaturas ({plans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
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
              {plans.map((plan) => {
                const isExpiring =
                  plan.status === "active" &&
                  plan.nextChargeDate.getTime() <= Date.now() + FIFTEEN_DAYS_MS;
                const remainingDays = daysUntil(plan.nextChargeDate);
                return (
                <TableRow key={plan.id} className={isExpiring ? "bg-amber-500/10 hover:bg-amber-500/15" : undefined}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{plan.userName ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">{plan.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {PLAN_TYPE_LABEL[plan.planType] ?? plan.planType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {periodLabel(plan.intervalMonths)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <PaymentBadge method={plan.paymentMethod} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex flex-col gap-1">
                      <span>{format(plan.nextChargeDate, "dd/MM/yyyy", { locale: ptBR })}</span>
                      {isExpiring && (
                        <Badge variant="outline" className="w-fit gap-1 text-amber-600 border-amber-500/40">
                          <Clock className="h-3 w-3" />
                          {remainingDays <= 0 ? "Vencida" : `Vence em ${remainingDays} ${remainingDays === 1 ? "dia" : "dias"}`}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {toBrl(plan.amountBrl)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={plan.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <SubscriptionActionsCell
                      id={plan.id}
                      status={plan.status}
                      paymentMethod={plan.paymentMethod}
                      nextChargeDate={plan.nextChargeDate}
                    />
                  </TableCell>
                </TableRow>
                );
              })}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Nenhuma assinatura registrada.
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
