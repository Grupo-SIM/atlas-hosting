import { describe, expect, test } from "bun:test";
import {
  CLOUD_VPS_PLANS,
  CLOUD_VPS_LOCATION_EUR,
  CLOUD_VPS_STORAGE_UPGRADE_EUR,
  getCloudVpsMonthlyEuro,
  getCloudVpsWindowsMonthlyEuro,
  getCloudVpsWindowsOldMonthlyEuro,
  isCloudVpsPlanId,
} from "./vps-catalog";

describe("Cloud VPS 24-month catalogue", () => {
  test("contains the six plans shown in the Contabo reference", () => {
    expect(CLOUD_VPS_PLANS.map((plan) => plan.id)).toEqual([
      "4",
      "6",
      "8",
      "12",
      "16",
      "18",
    ]);
  });

  test("recognizes only stable Contabo cloud plan ids", () => {
    expect(isCloudVpsPlanId("4")).toBe(true);
    expect(isCloudVpsPlanId("18")).toBe(true);
    expect(isCloudVpsPlanId("10")).toBe(false);
    expect(isCloudVpsPlanId("not-a-plan")).toBe(false);
  });

  test("resolves the Contabo 1, 12 and 24 month prices at Atlas double", () => {
    expect(getCloudVpsMonthlyEuro("4", false, 1)).toBe(11);
    expect(getCloudVpsMonthlyEuro("4", false, 12)).toBe(9.36);
    expect(getCloudVpsMonthlyEuro("4", false, 24)).toBe(8.8);
    expect(getCloudVpsMonthlyEuro("4", true, 1)).toBe(14.3);
    expect(getCloudVpsMonthlyEuro("4", true, 12)).toBe(12.66);
    expect(getCloudVpsMonthlyEuro("4", true, 24)).toBe(12.1);
  });
  test("doubles the supplied monthly price with and without auto backup", () => {
    expect(getCloudVpsMonthlyEuro("4", false)).toBe(8.8);
    expect(getCloudVpsMonthlyEuro("4", true)).toBe(12.1);
    expect(getCloudVpsMonthlyEuro("18", false)).toBe(78.4);
    expect(getCloudVpsMonthlyEuro("18", true)).toBe(98.4);
  });

  test("resolves the Windows Server bundle price at Atlas double (base + Windows license)", () => {
    expect(getCloudVpsWindowsOldMonthlyEuro("4")).toBe(27);
    expect(getCloudVpsWindowsMonthlyEuro("4", 24)).toBe(24.8);
    expect(getCloudVpsWindowsOldMonthlyEuro("6")).toBe(49);
    expect(getCloudVpsWindowsMonthlyEuro("6", 24)).toBe(46);
    expect(getCloudVpsWindowsOldMonthlyEuro("18")).toBe(252);
    expect(getCloudVpsWindowsMonthlyEuro("18", 24)).toBe(232.4);
  });

  test("has a storage-upgrade tier and full region coverage for every plan", () => {
    for (const plan of CLOUD_VPS_PLANS) {
      expect(CLOUD_VPS_STORAGE_UPGRADE_EUR[plan.id]).toBeDefined();
      const regions = CLOUD_VPS_LOCATION_EUR[plan.id];
      expect(Object.keys(regions).sort()).toEqual(
        ["au-sydney", "in", "jp", "sg", "uk", "us-central", "us-east", "us-west"].sort()
      );
    }
    expect(CLOUD_VPS_LOCATION_EUR["4"]["us-east"]).toBe(3.10);
    expect(CLOUD_VPS_STORAGE_UPGRADE_EUR["18"].eur).toBe(18.00);
  });

  test("preserves each card's Contabo resource comparison", () => {
    expect(CLOUD_VPS_PLANS[0]).toMatchObject({
      name: "Cloud VPS 4",
      vcpu: "4 vCPU Cores",
      ram: "8 GB RAM",
      storage: "100 GB SSD",
      snapshots: "1 Snapshot",
      port: "200 Mbit/s Port",
      traffic: "Unlimited Traffic*",
    });
  });
});
