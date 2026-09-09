import type { Contabo } from "./types";
import { getContaboApi } from "./utils";

/** Cria um segredo Contabo e devolve o id que a criação da VM aceita. */
export async function createContaboPasswordSecret(
  name: string,
  password: string
): Promise<number> {
  const contaboApi = await getContaboApi();
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
}
