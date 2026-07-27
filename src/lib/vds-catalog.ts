export type VdsPlanId = "s" | "m" | "l" | "xl" | "xxl";
export type VdsDuration = 1 | 12 | 24;

export type VdsPlan = {
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
};

// Auto Backup pricing for this lineup hasn't been confirmed against a real Contabo
// screenshot yet — contaboOldMonthlyEuroWithBackup/contaboMonthlyEuroWithBackup are
// placeholders equal to the no-backup price (0 markup) until real data is supplied.
export const VDS_PLANS: readonly VdsPlan[] = [
  { id: "s", name: "Cloud VDS S", contaboOldMonthlyEuro: 39.00, contaboMonthlyEuro: 31.20, contaboOldMonthlyEuroWithBackup: 39.00, contaboMonthlyEuroWithBackup: 31.20, cores: "6 Virtual Cores AMD EPYC 7282 2.8 GHz", ram: "24 GB RAM", storage: "180 GB NVMe", port: "250 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "m", name: "Cloud VDS M", contaboOldMonthlyEuro: 49.00, contaboMonthlyEuro: 39.20, contaboOldMonthlyEuroWithBackup: 49.00, contaboMonthlyEuroWithBackup: 39.20, cores: "8 Virtual Cores AMD EPYC 7282 2.8 GHz", ram: "32 GB RAM", storage: "240 GB NVMe", port: "500 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "l", name: "Cloud VDS L", contaboOldMonthlyEuro: 69.00, contaboMonthlyEuro: 55.20, contaboOldMonthlyEuroWithBackup: 69.00, contaboMonthlyEuroWithBackup: 55.20, cores: "12 Virtual Cores AMD EPYC 7282 2.8 GHz", ram: "48 GB RAM", storage: "360 GB NVMe", port: "750 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "xl", name: "Cloud VDS XL", contaboOldMonthlyEuro: 94.00, contaboMonthlyEuro: 75.20, contaboOldMonthlyEuroWithBackup: 94.00, contaboMonthlyEuroWithBackup: 75.20, cores: "16 Virtual Cores AMD EPYC 7282 2.8 GHz", ram: "64 GB RAM", storage: "480 GB NVMe", port: "1 Gbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "xxl", name: "Cloud VDS XXL", contaboOldMonthlyEuro: 139.00, contaboMonthlyEuro: 111.20, contaboOldMonthlyEuroWithBackup: 139.00, contaboMonthlyEuroWithBackup: 111.20, cores: "24 Virtual Cores AMD EPYC 7282 2.8 GHz", ram: "96 GB RAM", storage: "720 GB NVMe", port: "1 Gbit/s Port", traffic: "Unlimited Traffic*" },
];

export function isVdsPlanId(planId: string): planId is VdsPlanId {
  return VDS_PLANS.some((plan) => plan.id === planId);
}

export function getVdsPlan(planId: string) {
  return VDS_PLANS.find((plan) => plan.id === planId);
}

export function getVdsMonthlyEuro(
  planId: string,
  backupEnabled: boolean,
  duration: VdsDuration = 24,
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

  return Math.round((contaboBaseMonthly + (backupEnabled ? contaboBackupMonthly : 0)) * 2 * 100) / 100;
}

export function getVdsOldMonthlyEuro(planId: string, backupEnabled: boolean) {
  const plan = getVdsPlan(planId);
  if (!plan) return undefined;

  return (backupEnabled ? plan.contaboOldMonthlyEuroWithBackup : plan.contaboOldMonthlyEuro) * 2;
}
