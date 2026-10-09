import { addMonths, format, setDate } from "date-fns";
import type { Contabo } from "./types";
import { getContaboApi } from "./utils";

export const cancelVps = async (vpsId: string | number, renewDate: number) => {
  // Resolvido aqui, não no topo do módulo: um `await` de nível superior faria a
  // autenticação na Contabo acontecer no import, e o `next build` (que não tem
  // as credenciais) quebraria ao coletar os dados da rota que importa isto.
  // `getContaboApi` já memoiza a promise, então continua sendo um cliente só.
  const today = new Date();

  let cancelDate = setDate(today, renewDate);
  if (renewDate <= today.getDate()) {
    cancelDate = addMonths(cancelDate, 1);
  }

  return cancelVpsOnDate(vpsId, cancelDate);
};

export const cancelVpsOnDate = async (vpsId: string | number, cancelDate: Date) => {
  const contaboApi = await getContaboApi();
  await contaboApi
    .post(`compute/instances/${vpsId}/cancel`, {
      json: {
        cancelDate: format(cancelDate, "yyyy-MM-dd"),
        reason: "Other",
      } satisfies Contabo.Body.CancelInstance,
    })
    .json<Contabo.Response.CancelInstance>();
};
