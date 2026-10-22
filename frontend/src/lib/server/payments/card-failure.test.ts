import { expect, test } from "bun:test";
import { isFinalCardDecline } from "./card-failure";

test("only confirmed declines permit invoice retry or voucher changes", () => {
  for (const gatewayStatus of ["NOT_AUTHORIZED", "rejected_antifraud", "FAILED", "DECLINED"]) expect(isFinalCardDecline({ gatewayStatus })).toBe(true);
  for (const error of [new Error("timeout"), { gatewayStatus: "PENDING" }, { gatewayStatus: "UNKNOWN" }, { gatewayStatus: "CHARGEBACK" }, null]) expect(isFinalCardDecline(error)).toBe(false);
});
