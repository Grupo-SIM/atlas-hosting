import type { Contabo } from "./types";
import { getContaboApi } from "./utils";

/** Cria uma instância a partir de payload já validado por `buildContaboInstanceRequest`. */
export async function createVps(
  payload: Contabo.Body.CreateInstance
): Promise<Contabo.Response.CreateInstance> {
  const contaboApi = await getContaboApi();
  return contaboApi
    .post("compute/instances", { json: payload })
    .json<Contabo.Response.CreateInstance>();
}
