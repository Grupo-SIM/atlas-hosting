export interface SupplierBalances {
  available: number;
  total: number;
  currency: string;
  autoRenewRequired: number;
}
export interface SupplierInstance {
  id: number;
  name: string;
  status: string;
  region: string;
  ipv4: string | null;
}
export type SupplierResult<T> = { state: "ready"; data: T } | { state: "error"; message: string } | { state: "unconfigured" };

export function isContaboConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return ["CONTABO_CLIENT_ID", "CONTABO_CLIENT_SECRET", "CONTABO_USERNAME", "CONTABO_PASSWORD"].every(key => !!env[key]?.trim());
}

/** Authorize before calling any supplier. Never convert unavailable balances to zero. */
export async function readSupplier<T>(
  isAdmin: boolean,
  configured: boolean,
  read: () => Promise<T>,
): Promise<SupplierResult<T>> {
  if (!isAdmin) throw new Error("Acesso administrativo obrigatório.");
  if (!configured) return { state: "unconfigured" };
  try {
    return { state: "ready", data: await read() };
  } catch {
    return { state: "error", message: "Consulta indisponível. Tente novamente; nenhum saldo foi presumido." };
  }
}

export function validateSupplierBalances(value: SupplierBalances): SupplierBalances {
  if (!value.currency || ![value.available, value.total, value.autoRenewRequired].every(Number.isFinite)) {
    throw new Error("Resposta de saldo inválida.");
  }
  return value;
}

export interface InstancePage {
  data: Array<{ instanceId: number; displayName?: string; status: string; region: string; ipConfig?: { v4?: { ip: string }[] } }>;
  _pagination: { totalPages: number };
}

export async function readContaboInventory(readPage: (page: number) => Promise<InstancePage>): Promise<SupplierInstance[]> {
  const instances: SupplierInstance[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await readPage(page);
    if (!Array.isArray(response.data) || !Number.isInteger(response._pagination?.totalPages) || response._pagination.totalPages < 0) throw new Error("Inventário inválido.");
    totalPages = response._pagination.totalPages;
    for (const instance of response.data) {
      instances.push({ id: instance.instanceId, name: instance.displayName || `VPS ${instance.instanceId}`, status: instance.status, region: instance.region, ipv4: instance.ipConfig?.v4?.[0]?.ip || null });
    }
    page++;
  } while (page <= totalPages);
  return instances;
}
