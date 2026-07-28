import { getVpsPlanSubscriptionsAction, getPixAllowAllDurationsAction, getBoletoEnabledAction } from "./actions";
// import { BackfillButton } from "./BackfillButton";
import { VpsPlansTable } from "./VpsPlansTable";
import { PaymentSettingsCard } from "./PaymentSettingsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Metadata } from "next";
import Link from "next/link";
import {
  Server,
  ShieldCheck,
  CheckCircle,
  PauseCircle,
  XCircle,
  Clock,
  Link2,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Planos VPS — Admin" };

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

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
          {/* <BackfillButton /> */}
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
          <VpsPlansTable plans={plans} />
        </CardContent>
      </Card>
    </div>
  );
}
