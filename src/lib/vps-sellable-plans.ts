import { CLOUD_VPS_PLANS } from "./vps-catalog";
import { VDS_PLANS } from "./vds-catalog";

export type SellableProductType = "vps" | "vds" | "storage-vps";

export type SellablePlan = {
  productType: SellableProductType;
  planId: string;
  name: string;
};

// Storage VPS has no catalog lib file yet (pricing lives in the configurator page,
// custom links don't need it since the admin types the price by hand) — just the
// id/name list needed for the picker.
const STORAGE_VPS_PLAN_NAMES: { id: string; name: string }[] = [
  { id: "10", name: "Storage VPS 10 (S)" },
  { id: "20", name: "Storage VPS 20 (M)" },
  { id: "30", name: "Storage VPS 30 (L)" },
  { id: "40", name: "Storage VPS 40 (XL)" },
  { id: "50", name: "Storage VPS 50 (XXL)" },
];

export const SELLABLE_VPS_PLANS: SellablePlan[] = [
  ...CLOUD_VPS_PLANS.map((plan) => ({ productType: "vps" as const, planId: plan.id, name: plan.name })),
  ...VDS_PLANS.map((plan) => ({ productType: "vds" as const, planId: plan.id, name: plan.name })),
  ...STORAGE_VPS_PLAN_NAMES.map((plan) => ({ productType: "storage-vps" as const, planId: plan.id, name: plan.name })),
];

export function findSellablePlan(productType: string, planId: string): SellablePlan | undefined {
  return SELLABLE_VPS_PLANS.find((p) => p.productType === productType && p.planId === planId);
}
