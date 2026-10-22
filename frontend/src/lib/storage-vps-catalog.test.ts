import { describe, expect, test } from "bun:test";
import {
  getStorageVpsMonthlyEuro,
  getStorageVpsOldMonthlyEuro,
  isStorageVpsPlanId,
  STORAGE_VPS_PLANS,
} from "./storage-vps-catalog";

describe("Storage VPS 24-month catalogue", () => {
  test("contains the five plans shown in the Contabo reference", () => {
    expect(STORAGE_VPS_PLANS.map(plan => plan.id)).toEqual([
      "10",
      "20",
      "30",
      "40",
      "50",
    ]);
  });

  test("recognizes only stable Storage VPS plan ids", () => {
    expect(isStorageVpsPlanId("10")).toBe(true);
    expect(isStorageVpsPlanId("50")).toBe(true);
    expect(isStorageVpsPlanId("4")).toBe(false);
    expect(isStorageVpsPlanId("not-a-plan")).toBe(false);
  });

  test("resolves the Contabo 1, 12 and 24 month prices at Atlas double", () => {
    expect(getStorageVpsOldMonthlyEuro("10")).toBe(11.0);
    expect(getStorageVpsMonthlyEuro("10", 1)).toBe(11.0);
    expect(getStorageVpsMonthlyEuro("10", 12)).toBe(9.36);
    expect(getStorageVpsMonthlyEuro("10", 24)).toBe(8.8);

    expect(getStorageVpsOldMonthlyEuro("30")).toBe(28.0);
    expect(getStorageVpsMonthlyEuro("30", 12)).toBe(23.8);
    expect(getStorageVpsMonthlyEuro("30", 24)).toBe(22.4);

    expect(getStorageVpsOldMonthlyEuro("50")).toBe(74.0);
    expect(getStorageVpsMonthlyEuro("50", 12)).toBe(62.9);
    expect(getStorageVpsMonthlyEuro("50", 24)).toBe(59.2);
  });

  test("preserves each card's Contabo resource comparison", () => {
    expect(STORAGE_VPS_PLANS[0]).toMatchObject({
      name: "Storage VPS 10 (S)",
      port: "200 Mbit/s Port",
      ram: "4 GB RAM",
      storage: "300 GB SSD",
      traffic: "Unlimited Traffic*",
      vcpu: "2 vCPU Cores",
    });
  });
});
