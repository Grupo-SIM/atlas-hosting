import { getVpsPlanSubscriptionsAction, VpsPlanRow } from "./actions";
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
import {
  ShieldCheck,
  Server,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toBrl } from "@/lib/utils";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planos VPS - Admin",
};

function getSubscriptionStatus(expiry: Date): "active" | "expiring" | "expired" {
  const daysLeft = Math.ceil(
    (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "expiring";
  return "active";
}

function StatusBadge({ expiry }: { expiry: Date }) {
  const status = getSubscriptionStatus(expiry);
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-600 border-none gap-1"
      >
        <CheckCircle className="h-3 w-3" /> Ativa
      </Badge>
    );
  }
  if (status === "expiring") {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-500/10 text-yellow-600 border-none gap-1"
      >
        <AlertTriangle className="h-3 w-3" /> Vencendo
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-red-500/10 text-red-600 border-none gap-1"
    >
      <XCircle className="h-3 w-3" /> Vencida
    </Badge>
  );
}

function periodLabel(duration: string): string {
  if (duration === "6") return "6 meses";
  if (duration === "12") return "12 meses";
  return "Mensal";
}

export default async function AdminVpsPlansPage() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) redirect("/home");

  const plans = await getVpsPlanSubscriptionsAction();

  const active = plans.filter(
    (p) => getSubscriptionStatus(p.subscriptionExpiry) === "active"
  ).length;
  const expiring = plans.filter(
    (p) => getSubscriptionStatus(p.subscriptionExpiry) === "expiring"
  ).length;
  const expired = plans.filter(
    (p) => getSubscriptionStatus(p.subscriptionExpiry) === "expired"
  ).length;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Planos VPS</h2>
          <p className="text-muted-foreground">
            Assinaturas de VPS pagas e seus vencimentos.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-primary">
            Acesso Restrito: Admin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">
              Vencendo em 30 dias
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expired}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Assinaturas ({plans.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{plan.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {plan.userEmail}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {plan.description ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {periodLabel(plan.duration)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(plan.subscriptionStart, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {format(plan.subscriptionExpiry, "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {toBrl(plan.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge expiry={plan.subscriptionExpiry} />
                  </TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Nenhuma assinatura VPS paga encontrada.
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
