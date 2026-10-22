import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { syncCheckoutPixPayment } from "@/app/actions";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { shouldReconcilePixDomainInvoice } from "@/lib/server/payments/pix-reconciliation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QUERY_LIMIT = 200;
const PROCESS_LIMIT = 50;
const PROCESS_CONCURRENCY = 5;
const SETTLEMENT_CLAIM_TIMEOUT_MS = 15 * 60 * 1000;

function ensureAuthorized(request: Request): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  const accepted = [
    process.env.CRON_SECRET,
    process.env.API_MACHINE_INTERNAL_TOKEN,
    process.env.INTERNAL_SERVICE_TOKEN,
  ].filter(Boolean);
  return token.length > 0 && accepted.includes(token);
}

export async function GET(request: Request) {
  return POST(request);
}

async function reconcileInvoice(invoice: typeof pgInvoice.$inferSelect) {
  try {
    const result = await syncCheckoutPixPayment(invoice.id);
    if (result.status !== "COMPLETED") {
      await db
        .update(pgInvoice)
        .set({ updatedAt: new Date() })
        .where(
          and(
            eq(pgInvoice.id, invoice.id),
            inArray(pgInvoice.status, ["pending", "expired"])
          )
        );
    }
    return {
      invoiceId: invoice.id,
      status: result.status === "COMPLETED" ? "completed" : "pending",
    } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[PIX-RECONCILIATION] Fatura ${invoice.id}:`, message);
    await db
      .update(pgInvoice)
      .set({ updatedAt: new Date() })
      .where(
        and(
          eq(pgInvoice.id, invoice.id),
          inArray(pgInvoice.status, ["pending", "expired"])
        )
      );
    return { error: message, invoiceId: invoice.id, status: "error" } as const;
  }
}

/** Recupera uma reserva interrompida por restart/falha durante a entrega. */
async function releaseStaleSettlementClaims(): Promise<void> {
  const staleAt = new Date(Date.now() - SETTLEMENT_CLAIM_TIMEOUT_MS);
  await db
    .update(pgInvoice)
    .set({ status: "pending", updatedAt: new Date() })
    .where(
      and(
        inArray(pgInvoice.type, ["domain", "vps"]),
        sql`(${pgInvoice.type} != 'vps' OR (${pgInvoice.metadata}->>'isRenewal' = 'true' AND ${pgInvoice.metadata}->>'subscriptionId' is not null))`,
        eq(pgInvoice.status, "processing"),
        lte(pgInvoice.updatedAt, staleAt),
        sql`${pgInvoice.metadata}->>'pixSettlementStartedAt' is not null`
      )
    );
}

export async function POST(request: Request) {
  if (!ensureAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await releaseStaleSettlementClaims();

  const invoices = await db.query.pgInvoice.findMany({
    limit: QUERY_LIMIT,
    orderBy: asc(pgInvoice.updatedAt),
    where: and(
      inArray(pgInvoice.type, ["domain", "vps"]),
      sql`(${pgInvoice.type} != 'vps' OR (${pgInvoice.metadata}->>'isRenewal' = 'true' AND ${pgInvoice.metadata}->>'subscriptionId' is not null))`,
      inArray(pgInvoice.status, ["pending", "expired"]),
      sql`${pgInvoice.metadata}->>'simpayPaymentId' is not null`,
      sql`${pgInvoice.metadata}->'pixCheckout' is not null`
    ),
  });
  const candidates = invoices
    .filter(invoice => shouldReconcilePixDomainInvoice(invoice))
    .slice(0, PROCESS_LIMIT);

  const results: Awaited<ReturnType<typeof reconcileInvoice>>[] = [];
  for (let offset = 0; offset < candidates.length; offset += PROCESS_CONCURRENCY) {
    const batch = candidates.slice(offset, offset + PROCESS_CONCURRENCY);
    results.push(...(await Promise.all(batch.map(reconcileInvoice))));
  }

  return NextResponse.json({
    candidates: candidates.length,
    completed: results.filter(result => result.status === "completed").length,
    errors: results.filter(result => result.status === "error").length,
    pending: results.filter(result => result.status === "pending").length,
    results,
    scanned: invoices.length,
  });
}
