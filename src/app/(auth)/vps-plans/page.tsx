import { AppWindow, Cpu, Database, Server } from "lucide-react";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import currencyConversion from "@/lib/server/apis/currency";
import {
  getStorageVpsMonthlyEuro,
  getStorageVpsOldMonthlyEuro,
  STORAGE_VPS_PLANS,
} from "@/lib/storage-vps-catalog";
import {
  getVdsMonthlyEuro,
  getVdsOldMonthlyEuro,
  VDS_PLANS,
} from "@/lib/vds-catalog";
import {
  CLOUD_VPS_PLANS,
  getCloudVpsMonthlyEuro,
  getCloudVpsOldMonthlyEuro,
  getCloudVpsWindowsMonthlyEuro,
  getCloudVpsWindowsOldMonthlyEuro,
} from "@/lib/vps-catalog";
import { PlanCarousel } from "./PlanCarousel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Contratar VPS/VDS — Atlas Hosting",
};

export interface PlanCardData {
  id: string;
  name: string;
  cores: string;
  ram: string;
  storage: string;
  port: string;
  priceBrl: number;
  oldPriceBrl: number;
  /** Preço com backup automático — só preenchido pra Cloud VPS. */
  priceBrlBackup?: number;
  href: string;
  popular?: boolean;
}

export default async function VpsPlansPage() {
  await getUser(); // redireciona pro login se não estiver autenticado

  let rate = 5.86;
  try {
    const [fetchedRate] = await currencyConversion.convertMultiple({
      amounts: [1],
      from: "eur",
      to: "brl",
    });
    rate = fetchedRate;
  } catch {
    // usa o fallback
  }

  const cloudPlans: PlanCardData[] = CLOUD_VPS_PLANS.map(p => ({
    cores: p.vcpu,
    href: `/vps-plans/configure/vps/${p.id}?duration=24`,
    id: p.id,
    name: p.name,
    oldPriceBrl: getCloudVpsOldMonthlyEuro(p.id, false)! * rate,
    popular: p.id === "6",
    port: p.port,
    priceBrl: getCloudVpsMonthlyEuro(p.id, false, 24)! * rate,
    priceBrlBackup: getCloudVpsMonthlyEuro(p.id, true, 24)! * rate,
    ram: p.ram,
    storage: p.storage,
  }));

  const vdsPlans: PlanCardData[] = VDS_PLANS.map(p => ({
    cores: p.cores,
    href: `/vps-plans/configure/vds/${p.id}?duration=24`,
    id: p.id,
    name: p.name,
    oldPriceBrl: getVdsOldMonthlyEuro(p.id, false)! * rate,
    popular: p.id === "m",
    port: p.port,
    priceBrl: getVdsMonthlyEuro(p.id, false, 24)! * rate,
    ram: p.ram,
    storage: p.storage,
  }));

  const windowsPlans: PlanCardData[] = CLOUD_VPS_PLANS.map(p => ({
    cores: p.vcpu,
    href: `/vps-plans/configure/windows/${p.id}?duration=24`,
    id: p.id,
    name: `${p.name} Windows`,
    oldPriceBrl: getCloudVpsWindowsOldMonthlyEuro(p.id)! * rate,
    popular: p.id === "6",
    port: p.port,
    priceBrl: getCloudVpsWindowsMonthlyEuro(p.id, 24)! * rate,
    ram: p.ram,
    storage: p.storage,
  }));

  const storagePlans: PlanCardData[] = STORAGE_VPS_PLANS.map(p => ({
    cores: p.vcpu,
    href: `/vps-plans/configure/storage/${p.id}?duration=24`,
    id: p.id,
    name: p.name,
    oldPriceBrl: getStorageVpsOldMonthlyEuro(p.id)! * rate,
    popular: p.id === "20",
    port: p.port,
    priceBrl: getStorageVpsMonthlyEuro(p.id, 24)! * rate,
    ram: p.ram,
    storage: p.storage,
  }));

  return (
    <div className="space-y-10 p-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Contratar Servidor
        </h1>
        <p className="text-muted-foreground">
          Escolha um plano e configure direto pela sua conta — como você já está
          logado, não precisa preencher os dados pessoais de novo no checkout.
        </p>
      </div>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-4 md:p-8">
        <h2 className="flex items-center gap-2 font-semibold text-foreground text-xl">
          <Server className="h-5 w-5 text-sky-400" /> Cloud VPS
        </h2>
        <PlanCarousel plans={cloudPlans} showBackupToggle />
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-4 md:p-8">
        <h2 className="flex items-center gap-2 font-semibold text-foreground text-xl">
          <Cpu className="h-5 w-5 text-sky-400" /> Cloud VDS
        </h2>
        <PlanCarousel plans={vdsPlans} />
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-4 md:p-8">
        <h2 className="flex items-center gap-2 font-semibold text-foreground text-xl">
          <AppWindow className="h-5 w-5 text-sky-400" /> VPS Windows
        </h2>
        <PlanCarousel plans={windowsPlans} />
      </section>

      <section className="space-y-4 rounded-3xl border border-border bg-card p-4 md:p-8">
        <h2 className="flex items-center gap-2 font-semibold text-foreground text-xl">
          <Database className="h-5 w-5 text-sky-400" /> Storage VPS
        </h2>
        <PlanCarousel plans={storagePlans} />
      </section>
    </div>
  );
}
