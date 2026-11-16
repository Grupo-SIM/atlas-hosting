import { and, inArray, sql } from "drizzle-orm";
import type { db as Database } from "@/lib/db";
import {
  type Invoice,
  pgInvoice,
  type TemplateExclusivityInvoiceData,
  type TemplateExclusivityInvoiceOptions,
} from "@/lib/db/schema";

export const LOG_PREFIX = "[EXCLUSIVIDADE]";

type Tx = Parameters<Parameters<typeof Database.transaction>[0]>[0];
export type DbOrTx = typeof Database | Tx;

export function exclusivityData(
  invoice: Pick<Invoice, "metadata">
): (TemplateExclusivityInvoiceData & { cardToken?: string }) | undefined {
  const meta = invoice.metadata as Partial<TemplateExclusivityInvoiceOptions> & {
    templateExclusivity?: TemplateExclusivityInvoiceData & { cardToken?: string };
  };
  return meta?.templateExclusivity?.exclusivityId
    ? meta.templateExclusivity
    : undefined;
}

/** `true` quando a fatura é de exclusividade de template. */
export function isExclusivityInvoice(invoice: Pick<Invoice, "metadata">): boolean {
  return Boolean(exclusivityData(invoice));
}

/** Metadados de uma fatura de exclusividade (no formato que o checkout espera). */
export function exclusivityMetadata(
  data: TemplateExclusivityInvoiceData
): Invoice["metadata"] {
  return {
    templateExclusivity: data,
    whoisguard: "true",
    years: "1",
  } as unknown as Invoice["metadata"];
}

/**
 * Expira faturas que ainda não começaram a ser pagas. Faturas em `processing`
 * (pagamento em andamento) ou já pagas ficam como estão.
 */
export async function expirePendingInvoices(
  executor: DbOrTx,
  invoiceIds: (string | null | undefined)[]
): Promise<void> {
  const ids = invoiceIds.filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  await executor
    .update(pgInvoice)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        inArray(pgInvoice.id, ids),
        inArray(pgInvoice.status, ["pending", "failed"])
      )
    );
}

export function isUniqueViolation(error: unknown): boolean {
  // biome-ignore lint/suspicious/noExplicitAny: erro do driver pg
  const code = (error as any)?.code ?? (error as any)?.cause?.code;
  return code === "23505";
}

/** Faturas de exclusividade de uma exclusividade e ciclo (renovação). */
export function renewalInvoiceFilter(exclusivityId: string, cycle: string) {
  return and(
    sql`${pgInvoice.metadata}->'templateExclusivity'->>'exclusivityId' = ${exclusivityId}`,
    sql`${pgInvoice.metadata}->'templateExclusivity'->>'kind' = 'renewal'`,
    sql`${pgInvoice.metadata}->'templateExclusivity'->>'renewalCycle' = ${cycle}`,
    inArray(pgInvoice.status, ["pending", "processing", "paid", "failed"])
  );
}
