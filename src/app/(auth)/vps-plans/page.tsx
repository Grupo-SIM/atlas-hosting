import { getUser } from "@/lib/auth";
import {
  CLOUD_VPS_PLANS,
  getCloudVpsMonthlyEuro,
  getCloudVpsOldMonthlyEuro,
  getCloudVpsWindowsMonthlyEuro,
  getCloudVpsWindowsOldMonthlyEuro,
} from "@/lib/vps-catalog";
import { VDS_PLANS, getVdsMonthlyEuro, getVdsOldMonthlyEuro } from "@/lib/vds-catalog";
import { STORAGE_VPS_PLANS, getStorageVpsMonthlyEuro, getStorageVpsOldMonthlyEuro } from "@/lib/storage-vps-catalog";
import currencyConversion from "@/lib/server/apis/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cpu, MemoryStick, HardDrive, Network, Server, AppWindow, Database, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contratar VPS/VDS — Atlas Hosting" };

type PlanCardData = {
  id: string;
  name: string;
  cores: string;
  ram: string;
  storage: string;
  port: string;
  priceBrl: number;
  oldPriceBrl: number;
  href: string;
  popular?: boolean;
};

function formatBrl(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function PlanCard({ plan }: { plan: PlanCardData }) {
  return (
    <Card className={plan.popular ? "border-primary shadow-md relative" : "relative"}>
      {plan.popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5">
          Mais vendido
        </span>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{plan.name}</CardTitle>
        <div>
          {plan.oldPriceBrl > plan.priceBrl && (
            <span className="block text-xs text-muted-foreground line-through">{formatBrl(plan.oldPriceBrl)}</span>
          )}
          <span className="text-2xl font-bold">{formatBrl(plan.priceBrl)}</span>
          <span className="text-xs text-muted-foreground">/mês</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2"><Cpu className="h-3.5 w-3.5 shrink-0" /> {plan.cores}</li>
          <li className="flex items-center gap-2"><MemoryStick className="h-3.5 w-3.5 shrink-0" /> {plan.ram}</li>
          <li className="flex items-center gap-2"><HardDrive className="h-3.5 w-3.5 shrink-0" /> {plan.storage}</li>
          <li className="flex items-center gap-2"><Network className="h-3.5 w-3.5 shrink-0" /> {plan.port}</li>
        </ul>
        <Button asChild className="w-full">
          <Link href={plan.href} className="gap-2">
            Configurar <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function VpsPlansPage() {
  await getUser(); // redireciona pro login se não estiver autenticado

  let rate = 5.86;
  try {
    const [fetchedRate] = await currencyConversion.convertMultiple({ from: "eur", to: "brl", amounts: [1] });
    rate = fetchedRate;
  } catch {
    // usa o fallback
  }

  const cloudPlans: PlanCardData[] = CLOUD_VPS_PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    cores: p.vcpu,
    ram: p.ram,
    storage: p.storage,
    port: p.port,
    priceBrl: getCloudVpsMonthlyEuro(p.id, false, 24)! * rate,
    oldPriceBrl: getCloudVpsOldMonthlyEuro(p.id, false)! * rate,
    href: `/vps/configure/${p.id}?duration=24`,
    popular: p.id === "6",
  }));

  const vdsPlans: PlanCardData[] = VDS_PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    cores: p.cores,
    ram: p.ram,
    storage: p.storage,
    port: p.port,
    priceBrl: getVdsMonthlyEuro(p.id, false, 24)! * rate,
    oldPriceBrl: getVdsOldMonthlyEuro(p.id, false)! * rate,
    href: `/vds/configure/${p.id}?duration=24`,
    popular: p.id === "m",
  }));

  const windowsPlans: PlanCardData[] = CLOUD_VPS_PLANS.map((p) => ({
    id: p.id,
    name: `${p.name} Windows`,
    cores: p.vcpu,
    ram: p.ram,
    storage: p.storage,
    port: p.port,
    priceBrl: getCloudVpsWindowsMonthlyEuro(p.id, 24)! * rate,
    oldPriceBrl: getCloudVpsWindowsOldMonthlyEuro(p.id)! * rate,
    href: `/vps-windows/configure/${p.id}?duration=24`,
    popular: p.id === "6",
  }));

  const storagePlans: PlanCardData[] = STORAGE_VPS_PLANS.map((p) => ({
    id: p.id,
    name: p.name,
    cores: p.vcpu,
    ram: p.ram,
    storage: p.storage,
    port: p.port,
    priceBrl: getStorageVpsMonthlyEuro(p.id, 24)! * rate,
    oldPriceBrl: getStorageVpsOldMonthlyEuro(p.id)! * rate,
    href: `/vps-armazenamento/configure/${p.id}?duration=24`,
    popular: p.id === "20",
  }));

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contratar Servidor</h1>
        <p className="text-muted-foreground">
          Escolha um plano e configure direto pela sua conta — como você já está logado, não precisa preencher os dados pessoais de novo no checkout.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Server className="h-5 w-5" /> Cloud VPS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {cloudPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Cpu className="h-5 w-5" /> Cloud VDS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {vdsPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <AppWindow className="h-5 w-5" /> VPS Windows
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {windowsPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Database className="h-5 w-5" /> Storage VPS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {storagePlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </div>
  );
}
