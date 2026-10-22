import type { Contabo } from "./types";
import { getContaboApi } from "./utils";

async function findExistingSecretByName(name: string): Promise<number | undefined> {
  const contaboApi = await getContaboApi();
  const response = await contaboApi
    .get("secrets", { searchParams: { name } })
    .json<Contabo.Response.ListSecrets>();
  return response.data[0]?.secretId;
}

/** Cria um segredo Contabo e devolve o id que a criação da VM aceita.
 * Reaproveita o segredo existente se um retry encontrar um nome já usado
 * (409) em vez de falhar — o retry anterior pode já tê-lo criado. */
export async function createContaboPasswordSecret(
  name: string,
  password: string
): Promise<number> {
  const contaboApi = await getContaboApi();
  try {
    const response = await contaboApi
      .post("secrets", {
        json: {
          name,
          type: "password",
          value: password,
        } satisfies Contabo.Body.CreateSecret,
      })
      .json<Contabo.Response.CreateSecret>();
    const secretId = response.data[0]?.secretId;
    if (!secretId) throw new Error("Contabo não retornou o segredo da senha.");
    return secretId;
  } catch (error: any) {
    if (error?.response?.status === 409) {
      const existingId = await findExistingSecretByName(name);
      if (existingId) return existingId;
    }
    throw error;
  }
}
