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

// Storage upgrade tier per plan — Atlas-doubled monthly price (confirmed against real
// Contabo data). Single source of truth for both the configurator UI and server-side
// invoice pricing.
export const CLOUD_VPS_STORAGE_UPGRADE_EUR: Record<CloudVpsPlanId, { label: string; eur: number }> = {
  "4": { label: "200 GB SSD", eur: 3.00 },
  "6": { label: "400 GB SSD", eur: 6.00 },
  "8": { label: "600 GB SSD", eur: 9.00 },
  "12": { label: "800 GB SSD", eur: 12.00 },
  "16": { label: "1 TB SSD", eur: 15.00 },
  "18": { label: "1.2 TB SSD", eur: 18.00 },
};

// Datacenter/region surcharge per plan (location id -> Atlas-doubled monthly price).
// "eu" is always free and omitted. Confirmed against real Contabo data per tier.
// Single source of truth for both the configurator UI and server-side invoice pricing.
export const CLOUD_VPS_LOCATION_EUR: Record<CloudVpsPlanId, Record<string, number>> = {
  "4": { "uk": 2.10, "us-central": 2.10, "us-east": 3.10, "us-west": 2.60, "sg": 5.00, "jp": 5.10, "in": 4.80, "au-sydney": 4.30 },
  "6": { "uk": 3.20, "us-central": 3.20, "us-east": 4.80, "us-west": 4.00, "sg": 7.90, "jp": 8.00, "in": 7.40, "au-sydney": 6.60 },
  "8": { "uk": 6.50, "us-central": 6.50, "us-east": 9.50, "us-west": 8.00, "sg": 15.70, "jp": 16.00, "in": 14.80, "au-sydney": 13.20 },
  "12": { "uk": 11.60, "us-central": 11.60, "us-east": 17.10, "us-west": 14.30, "sg": 28.10, "jp": 28.60, "in": 26.40, "au-sydney": 23.70 },
  "16": { "uk": 17.10, "us-central": 17.10, "us-east": 25.20, "us-west": 21.20, "sg": 41.50, "jp": 42.30, "in": 39.10, "au-sydney": 35.00 },
  "18": { "uk": 22.60, "us-central": 22.60, "us-east": 33.40, "us-west": 28.00, "sg": 55.00, "jp": 56.10, "in": 51.70, "au-sydney": 46.40 },
};
