import type { Contabo } from "./types";
import { getContaboApi } from "./utils";

/** Cria uma instância a partir de payload já validado por `buildContaboInstanceRequest`. */
export async function createVps(
  payload: Contabo.Body.CreateInstance
): Promise<Contabo.Response.CreateInstance> {
  const contaboApi = await getContaboApi();
  try {
    return await contaboApi
      .post("compute/instances", { json: payload })
      .json<Contabo.Response.CreateInstance>();
  } catch (error: any) {
    console.error("[CONTABO] createVps payload:", JSON.stringify(payload));
    const body = await error?.response?.text?.().catch((e: unknown) => {
      console.error("[CONTABO] failed to read error response body:", e);
      return undefined;
    });
    console.error("[CONTABO] createVps error body:", body);
    if (body) throw new Error(`${error.message} — ${body}`);
    throw error;
  }
}
