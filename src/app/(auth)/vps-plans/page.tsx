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
import { Cpu, Server, AppWindow, Database } from "lucide-react";
import type { Metadata } from "next";
import { PlanCarousel } from "./PlanCarousel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contratar VPS/VDS — Atlas Hosting" };

export type PlanCardData = {
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
};

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
    priceBrlBackup: getCloudVpsMonthlyEuro(p.id, true, 24)! * rate,
    href: `/vps-plans/configure/vps/${p.id}?duration=24`,
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
    href: `/vps-plans/configure/vds/${p.id}?duration=24`,
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
    href: `/vps-plans/configure/windows/${p.id}?duration=24`,
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
    href: `/vps-plans/configure/storage/${p.id}?duration=24`,
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

      <section className="space-y-4 rounded-3xl bg-card border border-border p-4 md:p-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <Server className="h-5 w-5 text-sky-400" /> Cloud VPS
        </h2>
        <PlanCarousel plans={cloudPlans} showBackupToggle />
      </section>

      <section className="space-y-4 rounded-3xl bg-card border border-border p-4 md:p-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <Cpu className="h-5 w-5 text-sky-400" /> Cloud VDS
        </h2>
        <PlanCarousel plans={vdsPlans} />
      </section>

      <section className="space-y-4 rounded-3xl bg-card border border-border p-4 md:p-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <AppWindow className="h-5 w-5 text-sky-400" /> VPS Windows
        </h2>
        <PlanCarousel plans={windowsPlans} />
      </section>

      <section className="space-y-4 rounded-3xl bg-card border border-border p-4 md:p-8">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <Database className="h-5 w-5 text-sky-400" /> Storage VPS
        </h2>
        <PlanCarousel plans={storagePlans} />
      </section>
    </div>
  );
}
