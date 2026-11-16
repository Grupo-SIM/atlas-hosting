import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgInvoice, pgTemplateExclusivity } from "@/lib/db/schema";
import { enforceEvictions } from "./evictions";
import { expireStaleProposals } from "./proposals";
import { fulfillExclusivityInvoice } from "./purchase";
import { processRenewals } from "./renewal";
import { expirePendingInvoices, LOG_PREFIX } from "./shared";

/** Reservas de checkout vencidas: libera o template (ou entrega, se pagou). */
export async function releaseExpiredReservations(now = new Date()): Promise<void> {
  const expired = await db
    .select()
    .from(pgTemplateExclusivity)
    .where(
      and(
        eq(pgTemplateExclusivity.status, "reserved"),
        lte(pgTemplateExclusivity.reservedUntil, now)
      )
    );
  for (const row of expired) {
    const invoice = row.initialInvoiceId
      ? await db.query.pgInvoice.findFirst({
          where: eq(pgInvoice.id, row.initialInvoiceId),
        })
      : undefined;
    if (invoice?.status === "paid") {
      await fulfillExclusivityInvoice(invoice.id);
      continue;
    }
    if (invoice?.status === "processing") continue; // pagamento em andamento
    await db
      .update(pgTemplateExclusivity)
      .set({ status: "released", updatedAt: now })
      .where(
        and(
          eq(pgTemplateExclusivity.id, row.id),
          eq(pgTemplateExclusivity.status, "reserved")
        )
      );
    await expirePendingInvoices(db, [row.initialInvoiceId]);
  }
}

/** Uma rodada completa, chamada pelo agendador interno a cada 15 minutos. */
export async function runExclusivityJobs(now = new Date()) {
  const steps: [string, () => Promise<unknown>][] = [
    ["reservas", () => releaseExpiredReservations(now)],
    ["propostas", () => expireStaleProposals(now)],
    ["renovações", () => processRenewals(now)],
    ["sites", () => enforceEvictions(now)],
  ];
  const report: Record<string, string> = {};
  for (const [name, step] of steps) {
    try {
      await step();
      report[name] = "ok";
    } catch (error) {
      console.error(`${LOG_PREFIX} Falha na etapa ${name}:`, error);
      report[name] = error instanceof Error ? error.message : String(error);
    }
  }
  return report;
}
