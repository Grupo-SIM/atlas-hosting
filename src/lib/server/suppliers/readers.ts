import "server-only";
import { getRealUser } from "@/lib/auth";
import { getContaboApi } from "@/lib/contabo/utils/contaboApi";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { isContaboConfigured, readSupplier, validateSupplierBalances, readContaboInventory, type InstancePage } from "./overview";

export async function readNamecheapOverview() {
  const admin = await getRealUser();
  return readSupplier(admin.isAdmin === true, true, async () => {
    const balance = await namecheapApi.getBalances();
    return validateSupplierBalances({ available: balance.AvailableBalance, total: balance.AccountBalance, currency: balance.Currency, autoRenewRequired: balance.FundsRequiredForAutoRenew });
  });
}

export async function readContaboOverview() {
  const admin = await getRealUser();
  return readSupplier(admin.isAdmin === true, isContaboConfigured(), async () => {
    const api = await getContaboApi();
    return readContaboInventory(page => api.get("compute/instances", { searchParams: { page, size: 100 } }).json<InstancePage>());
  });
}
