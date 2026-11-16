import "server-only";
import { getRealUser } from "@/lib/auth";
import { getContaboApi } from "@/lib/contabo/utils/contaboApi";
import { hasAreaAccess } from "@/lib/permissions/access";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import {
  type InstancePage,
  isContaboConfigured,
  readContaboInventory,
  readSupplier,
  validateSupplierBalances,
} from "./overview";

export async function readNamecheapOverview() {
  const admin = await getRealUser();
  return readSupplier(
    await hasAreaAccess(admin, "admin_suppliers", "view"),
    true,
    async () => {
      const balance = await namecheapApi.getBalances();
      return validateSupplierBalances({
        autoRenewRequired: balance.FundsRequiredForAutoRenew,
        available: balance.AvailableBalance,
        currency: balance.Currency,
        total: balance.AccountBalance,
      });
    }
  );
}

export async function readContaboOverview() {
  const admin = await getRealUser();
  return readSupplier(
    await hasAreaAccess(admin, "admin_suppliers", "view"),
    isContaboConfigured(),
    async () => {
      const api = await getContaboApi();
      return readContaboInventory(page =>
        api
          .get("compute/instances", { searchParams: { page, size: 100 } })
          .json<InstancePage>()
      );
    }
  );
}
