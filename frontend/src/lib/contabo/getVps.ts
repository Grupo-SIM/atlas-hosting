import { getContaboApi } from "./utils";

interface ContaboInstanceResponse {
  data: Array<{
    displayName?: string;
    ipConfig?: { v4?: Array<{ ip?: string }> };
    ipv4?: string;
    privateIpConfig?: { v4?: Array<{ ip?: string }> };
  }>;
}

/** Retorna o primeiro IPv4 público quando a Contabo já o tiver atribuído. */
export async function getContaboInstanceIpv4(
  instanceId: string | number
): Promise<string | null> {
  const contaboApi = await getContaboApi();
  const response = await contaboApi
    .get(`compute/instances/${instanceId}`)
    .json<ContaboInstanceResponse>();
  const instance = response.data[0];
  return instance?.ipConfig?.v4?.[0]?.ip ?? instance?.ipv4 ?? null;
}

export async function getContaboInstanceName(instanceId: string | number): Promise<string | null> {
  const api = await getContaboApi();
  const response = await api.get(`compute/instances/${instanceId}`).json<ContaboInstanceResponse>();
  return response.data[0]?.displayName || null;
}
