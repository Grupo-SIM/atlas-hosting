import { describe, expect, test } from "bun:test";
import { getVdsMonthlyEuro, isVdsPlanId, VDS_PLANS } from "./vds-catalog";

describe("Cloud VDS 24-month catalogue", () => {
  test("contains the five plans shown in the Contabo reference", () => {
    expect(VDS_PLANS.map(plan => plan.id)).toEqual([
      "s",
      "m",
      "l",
      "xl",
      "xxl",
    ]);
  });

  test("recognizes only stable Contabo VDS plan ids", () => {
    expect(isVdsPlanId("s")).toBe(true);
    expect(isVdsPlanId("xxl")).toBe(true);
    expect(isVdsPlanId("10")).toBe(false);
    expect(isVdsPlanId("not-a-plan")).toBe(false);
  });

  test("resolves the Contabo 1, 12 and 24 month prices at Atlas double", () => {
    expect(getVdsMonthlyEuro("s", false, 1)).toBe(78);
    expect(getVdsMonthlyEuro("s", false, 12)).toBe(66.3);
    expect(getVdsMonthlyEuro("s", false, 24)).toBe(62.4);
  });

  test("doubles the supplied monthly price", () => {
    expect(getVdsMonthlyEuro("s", false)).toBe(62.4);
    expect(getVdsMonthlyEuro("xxl", false)).toBe(222.4);
  });

  test("preserves each card's Contabo resource comparison", () => {
    expect(VDS_PLANS[0]).toMatchObject({
      cores: "6 Virtual Cores AMD EPYC 7282 2.8 GHz",
      name: "Cloud VDS S",
      port: "250 Mbit/s Port",
      ram: "24 GB RAM",
      storage: "180 GB NVMe",
      traffic: "Unlimited Traffic*",
    });
  });
});
