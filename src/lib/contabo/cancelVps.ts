import { addMonths, format, setDate } from "date-fns";
import type { Contabo } from "./types";
import { getContaboApi } from "./utils";

const contaboApi = await getContaboApi();

export const cancelVps = async (vpsId: string | number, renewDate: number) => {
  const today = new Date();

  let cancelDate = setDate(today, renewDate);
  if (renewDate <= today.getDate()) {
    cancelDate = addMonths(cancelDate, 1);
  }

  await contaboApi
    .post(`/compute/instances/${vpsId}/cancel`, {
      json: {
        cancelDate: format(cancelDate, "yyyy-MM-dd"),
        reason: "Product not needed anymore",
      } satisfies Contabo.Body.CancelInstance,
    })
    .json<Contabo.Response.CancelInstance>();
};
