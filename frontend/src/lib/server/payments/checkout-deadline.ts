import { and, eq, isNull, or, sql } from "drizzle-orm";
import { pgInvoice } from "@/lib/db/schema/tables/invoice";

/** Vencimento de renovação VPS não invalida a dívida nem o checkout do ciclo. */
export function checkoutDeadlineCondition() {
  return or(
    sql`${pgInvoice.dueDate} > now()`,
    and(
      eq(pgInvoice.type, "vps"),
      isNull(pgInvoice.voucherId),
      sql`${pgInvoice.metadata}->>'isRenewal' = 'true'`,
      sql`nullif(${pgInvoice.metadata}->>'subscriptionId', '') is not null`,
      sql`nullif(${pgInvoice.metadata}->>'renewalCycle', '') is not null`
    )
  );
}
