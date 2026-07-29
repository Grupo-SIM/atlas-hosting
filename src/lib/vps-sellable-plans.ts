import { STORAGE_VPS_PLANS } from "./storage-vps-catalog";
import { VDS_PLANS } from "./vds-catalog";
import { CLOUD_VPS_PLANS } from "./vps-catalog";

export type SellableProductType = "vps" | "vds" | "storage-vps" | "vps-windows";

export interface SellablePlan {
  productType: SellableProductType;
  planId: string;
  name: string;
}

export const SELLABLE_VPS_PLANS: SellablePlan[] = [
  ...CLOUD_VPS_PLANS.map(plan => ({
    name: plan.name,
    planId: plan.id,
    productType: "vps" as const,
  })),
  ...CLOUD_VPS_PLANS.map(plan => ({
    name: `${plan.name} Windows`,
    planId: plan.id,
    productType: "vps-windows" as const,
  })),
  ...VDS_PLANS.map(plan => ({
    name: plan.name,
    planId: plan.id,
    productType: "vds" as const,
  })),
  ...STORAGE_VPS_PLANS.map(plan => ({
    name: plan.name,
    planId: plan.id,
    productType: "storage-vps" as const,
  })),
];

export function findSellablePlan(
  productType: string,
  planId: string
): SellablePlan | undefined {
  return SELLABLE_VPS_PLANS.find(
    p => p.productType === productType && p.planId === planId
  );
}
