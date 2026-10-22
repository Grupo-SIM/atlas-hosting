export type VdsPlanId = "s" | "m" | "l" | "xl" | "xxl";
export type VdsDuration = 1 | 12 | 24;

export interface VdsPlan {
  id: VdsPlanId;
  name: string;
  contaboOldMonthlyEuro: number;
  contaboMonthlyEuro: number;
  contaboOldMonthlyEuroWithBackup: number;
  contaboMonthlyEuroWithBackup: number;
  cores: string;
  ram: string;
  storage: string;
  port: string;
  traffic: string;
}

// Auto Backup pricing for this lineup hasn't been confirmed against a real Contabo
// screenshot yet — contaboOldMonthlyEuroWithBackup/contaboMonthlyEuroWithBackup are
// placeholders equal to the no-backup price (0 markup) until real data is supplied.
export const VDS_PLANS: readonly VdsPlan[] = [
  {
    contaboMonthlyEuro: 31.2,
    contaboMonthlyEuroWithBackup: 31.2,
    contaboOldMonthlyEuro: 39.0,
    contaboOldMonthlyEuroWithBackup: 39.0,
    cores: "6 Virtual Cores AMD EPYC 7282 2.8 GHz",
    id: "s",
    name: "Cloud VDS S",
    port: "250 Mbit/s Port",
    ram: "24 GB RAM",
    storage: "180 GB NVMe",
    traffic: "Unlimited Traffic*",
  },
  {
    contaboMonthlyEuro: 39.2,
    contaboMonthlyEuroWithBackup: 39.2,
    contaboOldMonthlyEuro: 49.0,
    contaboOldMonthlyEuroWithBackup: 49.0,
    cores: "8 Virtual Cores AMD EPYC 7282 2.8 GHz",
    id: "m",
    name: "Cloud VDS M",
    port: "500 Mbit/s Port",
    ram: "32 GB RAM",
    storage: "240 GB NVMe",
    traffic: "Unlimited Traffic*",
  },
  {
    contaboMonthlyEuro: 55.2,
    contaboMonthlyEuroWithBackup: 55.2,
    contaboOldMonthlyEuro: 69.0,
    contaboOldMonthlyEuroWithBackup: 69.0,
    cores: "12 Virtual Cores AMD EPYC 7282 2.8 GHz",
    id: "l",
    name: "Cloud VDS L",
    port: "750 Mbit/s Port",
    ram: "48 GB RAM",
    storage: "360 GB NVMe",
    traffic: "Unlimited Traffic*",
  },
  {
    contaboMonthlyEuro: 75.2,
    contaboMonthlyEuroWithBackup: 75.2,
    contaboOldMonthlyEuro: 94.0,
    contaboOldMonthlyEuroWithBackup: 94.0,
    cores: "16 Virtual Cores AMD EPYC 7282 2.8 GHz",
    id: "xl",
    name: "Cloud VDS XL",
    port: "1 Gbit/s Port",
    ram: "64 GB RAM",
    storage: "480 GB NVMe",
    traffic: "Unlimited Traffic*",
  },
  {
    contaboMonthlyEuro: 111.2,
    contaboMonthlyEuroWithBackup: 111.2,
    contaboOldMonthlyEuro: 139.0,
    contaboOldMonthlyEuroWithBackup: 139.0,
    cores: "24 Virtual Cores AMD EPYC 7282 2.8 GHz",
    id: "xxl",
    name: "Cloud VDS XXL",
    port: "1 Gbit/s Port",
    ram: "96 GB RAM",
    storage: "720 GB NVMe",
    traffic: "Unlimited Traffic*",
  },
];

export function isVdsPlanId(planId: string): planId is VdsPlanId {
  return VDS_PLANS.some(plan => plan.id === planId);
}

export function getVdsPlan(planId: string) {
  return VDS_PLANS.find(plan => plan.id === planId);
}

export function getVdsMonthlyEuro(
  planId: string,
  backupEnabled: boolean,
  duration: VdsDuration = 24
) {
  const plan = getVdsPlan(planId);
  if (!plan) return undefined;

  const contaboBaseMonthly =
    duration === 1
      ? plan.contaboOldMonthlyEuro
      : duration === 12
        ? Math.round(plan.contaboOldMonthlyEuro * 0.85 * 100) / 100
        : plan.contaboMonthlyEuro;
  const contaboBackupMonthly =
    plan.contaboOldMonthlyEuroWithBackup - plan.contaboOldMonthlyEuro;

  return (
    Math.round(
      (contaboBaseMonthly + (backupEnabled ? contaboBackupMonthly : 0)) *
        2 *
        100
    ) / 100
  );
}

export function getVdsOldMonthlyEuro(planId: string, backupEnabled: boolean) {
  const plan = getVdsPlan(planId);
  if (!plan) return undefined;

  return (
    (backupEnabled
      ? plan.contaboOldMonthlyEuroWithBackup
      : plan.contaboOldMonthlyEuro) * 2
  );
}
