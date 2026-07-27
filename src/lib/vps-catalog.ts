export type CloudVpsPlanId = "4" | "6" | "8" | "12" | "16" | "18";
export type CloudVpsDuration = 1 | 12 | 24;

export type CloudVpsPlan = {
  id: CloudVpsPlanId;
  name: string;
  contaboOldMonthlyEuro: number;
  contaboMonthlyEuro: number;
  contaboOldMonthlyEuroWithBackup: number;
  contaboMonthlyEuroWithBackup: number;
  vcpu: string;
  ram: string;
  storage: string;
  snapshots: string;
  port: string;
  traffic: string;
};

export const CLOUD_VPS_PLANS: readonly CloudVpsPlan[] = [
  { id: "4", name: "Cloud VPS 4", contaboOldMonthlyEuro: 5.5, contaboMonthlyEuro: 4.4, contaboOldMonthlyEuroWithBackup: 7.15, contaboMonthlyEuroWithBackup: 6.05, vcpu: "4 vCPU Cores", ram: "8 GB RAM", storage: "100 GB SSD", snapshots: "1 Snapshot", port: "200 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "6", name: "Cloud VPS 6", contaboOldMonthlyEuro: 7.5, contaboMonthlyEuro: 6, contaboOldMonthlyEuroWithBackup: 10.85, contaboMonthlyEuroWithBackup: 9.35, vcpu: "6 vCPU Cores", ram: "12 GB RAM", storage: "200 GB SSD", snapshots: "2 Snapshots", port: "300 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "8", name: "Cloud VPS 8", contaboOldMonthlyEuro: 14, contaboMonthlyEuro: 11.2, contaboOldMonthlyEuroWithBackup: 19, contaboMonthlyEuroWithBackup: 16.2, vcpu: "8 vCPU Cores", ram: "24 GB RAM", storage: "300 GB SSD", snapshots: "3 Snapshots", port: "600 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "12", name: "Cloud VPS 12", contaboOldMonthlyEuro: 25, contaboMonthlyEuro: 20, contaboOldMonthlyEuroWithBackup: 31.7, contaboMonthlyEuroWithBackup: 26.7, vcpu: "12 vCPU Cores", ram: "48 GB RAM", storage: "400 GB SSD", snapshots: "3 Snapshots", port: "800 Mbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "16", name: "Cloud VPS 16", contaboOldMonthlyEuro: 37, contaboMonthlyEuro: 29.6, contaboOldMonthlyEuroWithBackup: 45.35, contaboMonthlyEuroWithBackup: 37.95, vcpu: "16 vCPU Cores", ram: "64 GB RAM", storage: "500 GB SSD", snapshots: "3 Snapshots", port: "1 Gbit/s Port", traffic: "Unlimited Traffic*" },
  { id: "18", name: "Cloud VPS 18", contaboOldMonthlyEuro: 49, contaboMonthlyEuro: 39.2, contaboOldMonthlyEuroWithBackup: 59, contaboMonthlyEuroWithBackup: 49.2, vcpu: "18 vCPU Cores", ram: "96 GB RAM", storage: "600 GB SSD", snapshots: "3 Snapshots", port: "1 Gbit/s Port", traffic: "Unlimited Traffic*" },
];

export function isCloudVpsPlanId(planId: string): planId is CloudVpsPlanId {
  return CLOUD_VPS_PLANS.some((plan) => plan.id === planId);
}

export function getCloudVpsPlan(planId: string) {
  return CLOUD_VPS_PLANS.find((plan) => plan.id === planId);
}

export function getCloudVpsMonthlyEuro(
  planId: string,
  backupEnabled: boolean,
  duration: CloudVpsDuration = 24,
) {
  const plan = getCloudVpsPlan(planId);
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

export function getCloudVpsOldMonthlyEuro(planId: string, backupEnabled: boolean) {
  const plan = getCloudVpsPlan(planId);
  if (!plan) return undefined;

  return (backupEnabled ? plan.contaboOldMonthlyEuroWithBackup : plan.contaboOldMonthlyEuro) * 2;
}

// Contabo's Windows Server license price (raw, not yet doubled). Contabo charges the
// same price for every Windows Server version (2025/2022/2019/2016) on a given plan.
export const WINDOWS_SERVER_EUR: Record<CloudVpsPlanId, number> = {
  "4": 8.00,
  "6": 17.00,
  "8": 28.00,
  "12": 53.00,
  "16": 63.00,
  "18": 77.00,
};

// Atlas-doubled monthly price for a Cloud VPS pre-configured with Windows Server.
export function getCloudVpsWindowsMonthlyEuro(
  planId: string,
  duration: CloudVpsDuration = 24,
) {
  const baseMonthly = getCloudVpsMonthlyEuro(planId, false, duration);
  const windowsEur = WINDOWS_SERVER_EUR[planId as CloudVpsPlanId];
  if (baseMonthly === undefined || windowsEur === undefined) return undefined;

  return Math.round((baseMonthly + windowsEur * 2) * 100) / 100;
}

export function getCloudVpsWindowsOldMonthlyEuro(planId: string) {
  const oldMonthly = getCloudVpsOldMonthlyEuro(planId, false);
  const windowsEur = WINDOWS_SERVER_EUR[planId as CloudVpsPlanId];
  if (oldMonthly === undefined || windowsEur === undefined) return undefined;

  return Math.round((oldMonthly + windowsEur * 2) * 100) / 100;
}
