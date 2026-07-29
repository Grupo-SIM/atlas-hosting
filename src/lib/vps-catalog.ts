export type CloudVpsPlanId = "4" | "6" | "8" | "12" | "16" | "18";
export type CloudVpsDuration = 1 | 12 | 24;

export interface CloudVpsPlan {
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
}

export const CLOUD_VPS_PLANS: readonly CloudVpsPlan[] = [
  {
    contaboMonthlyEuro: 4.4,
    contaboMonthlyEuroWithBackup: 6.05,
    contaboOldMonthlyEuro: 5.5,
    contaboOldMonthlyEuroWithBackup: 7.15,
    id: "4",
    name: "Cloud VPS 4",
    port: "200 Mbit/s Port",
    ram: "8 GB RAM",
    snapshots: "1 Snapshot",
    storage: "100 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "4 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 6,
    contaboMonthlyEuroWithBackup: 9.35,
    contaboOldMonthlyEuro: 7.5,
    contaboOldMonthlyEuroWithBackup: 10.85,
    id: "6",
    name: "Cloud VPS 6",
    port: "300 Mbit/s Port",
    ram: "12 GB RAM",
    snapshots: "2 Snapshots",
    storage: "200 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "6 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 11.2,
    contaboMonthlyEuroWithBackup: 16.2,
    contaboOldMonthlyEuro: 14,
    contaboOldMonthlyEuroWithBackup: 19,
    id: "8",
    name: "Cloud VPS 8",
    port: "600 Mbit/s Port",
    ram: "24 GB RAM",
    snapshots: "3 Snapshots",
    storage: "300 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "8 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 20,
    contaboMonthlyEuroWithBackup: 26.7,
    contaboOldMonthlyEuro: 25,
    contaboOldMonthlyEuroWithBackup: 31.7,
    id: "12",
    name: "Cloud VPS 12",
    port: "800 Mbit/s Port",
    ram: "48 GB RAM",
    snapshots: "3 Snapshots",
    storage: "400 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "12 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 29.6,
    contaboMonthlyEuroWithBackup: 37.95,
    contaboOldMonthlyEuro: 37,
    contaboOldMonthlyEuroWithBackup: 45.35,
    id: "16",
    name: "Cloud VPS 16",
    port: "1 Gbit/s Port",
    ram: "64 GB RAM",
    snapshots: "3 Snapshots",
    storage: "500 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "16 vCPU Cores",
  },
  {
    contaboMonthlyEuro: 39.2,
    contaboMonthlyEuroWithBackup: 49.2,
    contaboOldMonthlyEuro: 49,
    contaboOldMonthlyEuroWithBackup: 59,
    id: "18",
    name: "Cloud VPS 18",
    port: "1 Gbit/s Port",
    ram: "96 GB RAM",
    snapshots: "3 Snapshots",
    storage: "600 GB SSD",
    traffic: "Unlimited Traffic*",
    vcpu: "18 vCPU Cores",
  },
];

export function isCloudVpsPlanId(planId: string): planId is CloudVpsPlanId {
  return CLOUD_VPS_PLANS.some(plan => plan.id === planId);
}

export function getCloudVpsPlan(planId: string) {
  return CLOUD_VPS_PLANS.find(plan => plan.id === planId);
}

export function getCloudVpsMonthlyEuro(
  planId: string,
  backupEnabled: boolean,
  duration: CloudVpsDuration = 24
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

  return (
    Math.round(
      (contaboBaseMonthly + (backupEnabled ? contaboBackupMonthly : 0)) *
        2 *
        100
    ) / 100
  );
}

export function getCloudVpsOldMonthlyEuro(
  planId: string,
  backupEnabled: boolean
) {
  const plan = getCloudVpsPlan(planId);
  if (!plan) return undefined;

  return (
    (backupEnabled
      ? plan.contaboOldMonthlyEuroWithBackup
      : plan.contaboOldMonthlyEuro) * 2
  );
}

// Contabo's Windows Server license price (raw, not yet doubled). Contabo charges the
// same price for every Windows Server version (2025/2022/2019/2016) on a given plan.
export const WINDOWS_SERVER_EUR: Record<CloudVpsPlanId, number> = {
  "4": 8.0,
  "6": 17.0,
  "8": 28.0,
  "12": 53.0,
  "16": 63.0,
  "18": 77.0,
};

// Atlas-doubled monthly price for a Cloud VPS pre-configured with Windows Server.
export function getCloudVpsWindowsMonthlyEuro(
  planId: string,
  duration: CloudVpsDuration = 24
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
export const CLOUD_VPS_STORAGE_UPGRADE_EUR: Record<
  CloudVpsPlanId,
  { label: string; eur: number }
> = {
  "4": { eur: 3.0, label: "200 GB SSD" },
  "6": { eur: 6.0, label: "400 GB SSD" },
  "8": { eur: 9.0, label: "600 GB SSD" },
  "12": { eur: 12.0, label: "800 GB SSD" },
  "16": { eur: 15.0, label: "1 TB SSD" },
  "18": { eur: 18.0, label: "1.2 TB SSD" },
};

// Datacenter/region surcharge per plan (location id -> Atlas-doubled monthly price).
// "eu" is always free and omitted. Confirmed against real Contabo data per tier.
// Single source of truth for both the configurator UI and server-side invoice pricing.
export const CLOUD_VPS_LOCATION_EUR: Record<
  CloudVpsPlanId,
  Record<string, number>
> = {
  "4": {
    "au-sydney": 4.3,
    in: 4.8,
    jp: 5.1,
    sg: 5.0,
    uk: 2.1,
    "us-central": 2.1,
    "us-east": 3.1,
    "us-west": 2.6,
  },
  "6": {
    "au-sydney": 6.6,
    in: 7.4,
    jp: 8.0,
    sg: 7.9,
    uk: 3.2,
    "us-central": 3.2,
    "us-east": 4.8,
    "us-west": 4.0,
  },
  "8": {
    "au-sydney": 13.2,
    in: 14.8,
    jp: 16.0,
    sg: 15.7,
    uk: 6.5,
    "us-central": 6.5,
    "us-east": 9.5,
    "us-west": 8.0,
  },
  "12": {
    "au-sydney": 23.7,
    in: 26.4,
    jp: 28.6,
    sg: 28.1,
    uk: 11.6,
    "us-central": 11.6,
    "us-east": 17.1,
    "us-west": 14.3,
  },
  "16": {
    "au-sydney": 35.0,
    in: 39.1,
    jp: 42.3,
    sg: 41.5,
    uk: 17.1,
    "us-central": 17.1,
    "us-east": 25.2,
    "us-west": 21.2,
  },
  "18": {
    "au-sydney": 46.4,
    in: 51.7,
    jp: 56.1,
    sg: 55.0,
    uk: 22.6,
    "us-central": 22.6,
    "us-east": 33.4,
    "us-west": 28.0,
  },
};
