export type StorageVpsPlanId = "10" | "20" | "30" | "40" | "50";
export type StorageVpsDuration = 1 | 12 | 24;

export interface StorageVpsPlan {
  id: StorageVpsPlanId;
  name: string;
  contaboOldMonthlyEuro: number;
  contaboMonthlyEuro: number;
  vcpu: string;
  ram: string;
  storage: string;
  port: string;
  traffic: string;
}

// Storage VPS auto backup pricing hasn't been confirmed against a real Contabo
// screenshot — only base (no-backup) pricing is modeled here.
export const STORAGE_VPS_PLANS: readonly StorageVpsPlan[] = [
  {
    contaboMonthlyEuro: 4.4,
    contaboOldMonthlyEuro: 5.5,
    id: "10",
    name: "Storage VPS 10 (S)",
    port: "200 Mbit/s Port",
    ram: "4 GB RAM",
    storage: "300 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "2 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 6.0,
    contaboOldMonthlyEuro: 7.5,
    id: "20",
    name: "Storage VPS 20 (M)",
    port: "300 Mbit/s Port",
    ram: "8 GB RAM",
    storage: "400 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "3 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 11.2,
    contaboOldMonthlyEuro: 14.0,
    id: "30",
    name: "Storage VPS 30 (L)",
    port: "600 Mbit/s Port",
    ram: "18 GB RAM",
    storage: "1 TB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "6 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 20.0,
    contaboOldMonthlyEuro: 25.0,
    id: "40",
    name: "Storage VPS 40 (XL)",
    port: "800 Mbit/s Port",
    ram: "30 GB RAM",
    storage: "1.2 TB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "8 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 29.6,
    contaboOldMonthlyEuro: 37.0,
    id: "50",
    name: "Storage VPS 50 (XXL)",
    port: "1 Gbit/s Port",
    ram: "50 GB RAM",
    storage: "1.4 TB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "14 vCPU Cores",
  },
];

export function isStorageVpsPlanId(planId: string): planId is StorageVpsPlanId {
  return STORAGE_VPS_PLANS.some(plan => plan.id === planId);
}

export function getStorageVpsPlan(planId: string) {
  return STORAGE_VPS_PLANS.find(plan => plan.id === planId);
}

export function getStorageVpsMonthlyEuro(
  planId: string,
  duration: StorageVpsDuration = 24
) {
  const plan = getStorageVpsPlan(planId);
  if (!plan) return undefined;

  const contaboBaseMonthly =
    duration === 1
      ? plan.contaboOldMonthlyEuro
      : duration === 12
        ? Math.round(plan.contaboOldMonthlyEuro * 0.85 * 100) / 100
        : plan.contaboMonthlyEuro;

  return Math.round(contaboBaseMonthly * 2 * 100) / 100;
}

export function getStorageVpsOldMonthlyEuro(planId: string) {
  const plan = getStorageVpsPlan(planId);
  if (!plan) return undefined;

  return plan.contaboOldMonthlyEuro * 2;
}
