const FINAL_DECLINES = new Set([
  "FAILED", "DECLINED", "REJECTED", "NOT_AUTHORIZED", "REJECTED_ANTIFRAUD",
  "CANCELLED", "CANCELED", "EXPIRED", "CHARGE-NOT_AUTHORIZED", "CHARGE-REJECTED_ANTIFRAUD",
]);

/** A timeout, unknown or pending result can still charge; retain the invoice claim. */
export function isFinalCardDecline(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("gatewayStatus" in error)) return false;
  return typeof error.gatewayStatus === "string" && FINAL_DECLINES.has(error.gatewayStatus.trim().toUpperCase());
}
