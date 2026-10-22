import {
  CheckCircle,
  Clock,
  Link2,
  PauseCircle,
  Server,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import {
  getBoletoEnabledAction,
  getPixAllowAllDurationsAction,
  getVpsPlanSubscriptionsAction,
} from "./actions";
import { PaymentSettingsCard } from "./PaymentSettingsCard";
// import { BackfillButton } from "./BackfillButton";
import { VpsPlansTable } from "./VpsPlansTable";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Planos VPS — Admin" };

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export default async function AdminVpsPlansPage() {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const plans = await getVpsPlanSubscriptionsAction();
  const pixAllowAllDurations = await getPixAllowAllDurationsAction();
  const boletoEnabled = await getBoletoEnabledAction();

  const active = plans.filter(p => p.status === "active").length;
  const paused = plans.filter(p => p.status === "paused").length;
  const inactive = plans.filter(
    p => p.status === "cancelled" || p.status === "failed"
  ).length;
  const expiring = plans.filter(
    p =>
      p.status === "active" &&
      p.nextChargeDate.getTime() <= Date.now() + FIFTEEN_DAYS_MS
  ).length;

  return (
    <div className="flex-1 space-y-6 p-4 pt-4 md:p-8 md:pt-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-bold text-3xl tracking-tight">Planos VPS</h2>
          <p className="text-muted-foreground">
            Gerencie assinaturas VPS dos clientes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link className="gap-2" href="/admin/vps-plans/payment-links">
              <Link2 className="h-4 w-4" />
              Links de Pagamento
            </Link>
          </Button>
          {/* <BackfillButton /> */}
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-bold text-primary text-sm">
              Acesso Restrito: Admin
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{plans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Pausadas</CardTitle>
            <PauseCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-yellow-600">{paused}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Inativas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">{inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              A vencer (15d)
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-amber-600">{expiring}</div>
          </CardContent>
        </Card>
      </div>

      <PaymentSettingsCard
        initialBoletoEnabled={boletoEnabled}
        initialPixAllowAllDurations={pixAllowAllDurations}
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
