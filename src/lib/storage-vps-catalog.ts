export type StorageVpsPlanId = "10" | "20" | "30" | "40" | "50";
export type StorageVpsDuration = 1 | 12 | 24;

export type StorageVpsPlan = {
  id: StorageVpsPlanId;
  name: string;
  contaboOldMonthlyEuro: number;
  contaboMonthlyEuro: number;
  vcpu: string;
  ram: string;
  storage: string;
  port: string;
  traffic: string;
};

// Storage VPS auto backup pricing hasn't been confirmed against a real Contabo
// screenshot — only base (no-backup) pricing is modeled here.
export const STORAGE_VPS_PLANS: readonly StorageVpsPlan[] = [
  { id: "10", name: "Storage VPS 10 (S)", contaboOldMonthlyEuro: 5.50, contaboMonthlyEuro: 4.40, vcpu: "2 vCPU Cores", ram: "4 GB RAM", storage: "300 GB SSD", port: "200 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "20", name: "Storage VPS 20 (M)", contaboOldMonthlyEuro: 7.50, contaboMonthlyEuro: 6.00, vcpu: "3 vCPU Cores", ram: "8 GB RAM", storage: "400 GB SSD", port: "300 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "30", name: "Storage VPS 30 (L)", contaboOldMonthlyEuro: 14.00, contaboMonthlyEuro: 11.20, vcpu: "6 vCPU Cores", ram: "18 GB RAM", storage: "1 TB SSD", port: "600 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "40", name: "Storage VPS 40 (XL)", contaboOldMonthlyEuro: 25.00, contaboMonthlyEuro: 20.00, vcpu: "8 vCPU Cores", ram: "30 GB RAM", storage: "1.2 TB SSD", port: "800 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "50", name: "Storage VPS 50 (XXL)", contaboOldMonthlyEuro: 37.00, contaboMonthlyEuro: 29.60, vcpu: "14 vCPU Cores", ram: "50 GB RAM", storage: "1.4 TB SSD", port: "1 Gbit/s Port", traffic: "Unlimited Traffic*" },
];

export function isStorageVpsPlanId(planId: string): planId is StorageVpsPlanId {
  return STORAGE_VPS_PLANS.some((plan) => plan.id === planId);
}

export function getStorageVpsPlan(planId: string) {
  return STORAGE_VPS_PLANS.find((plan) => plan.id === planId);
}

export function getStorageVpsMonthlyEuro(
  planId: string,
  duration: StorageVpsDuration = 24,
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
