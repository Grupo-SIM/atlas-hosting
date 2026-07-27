import { CLOUD_VPS_PLANS } from "./vps-catalog";
import { VDS_PLANS } from "./vds-catalog";
import { STORAGE_VPS_PLANS } from "./storage-vps-catalog";

export type SellableProductType = "vps" | "vds" | "storage-vps" | "vps-windows";

export type SellablePlan = {
  productType: SellableProductType;
  planId: string;
  name: string;
};

export const SELLABLE_VPS_PLANS: SellablePlan[] = [
  ...CLOUD_VPS_PLANS.map((plan) => ({ productType: "vps" as const, planId: plan.id, name: plan.name })),
  ...CLOUD_VPS_PLANS.map((plan) => ({ productType: "vps-windows" as const, planId: plan.id, name: `${plan.name} Windows` })),
  ...VDS_PLANS.map((plan) => ({ productType: "vds" as const, planId: plan.id, name: plan.name })),
  ...STORAGE_VPS_PLANS.map((plan) => ({ productType: "storage-vps" as const, planId: plan.id, name: plan.name })),
];

export function findSellablePlan(productType: string, planId: string): SellablePlan | undefined {
  return SELLABLE_VPS_PLANS.find((p) => p.productType === productType && p.planId === planId);
}
