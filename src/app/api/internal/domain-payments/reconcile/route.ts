import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { syncCheckoutPixPayment } from "@/app/actions";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { shouldReconcilePixDomainInvoice } from "@/lib/server/payments/pix-reconciliation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QUERY_LIMIT = 200;
const PROCESS_LIMIT = 50;

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

export async function POST(request: Request) {
  if (!ensureAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await db.query.pgInvoice.findMany({
    limit: QUERY_LIMIT,
    orderBy: asc(pgInvoice.updatedAt),
    where: and(
      eq(pgInvoice.type, "domain"),
      inArray(pgInvoice.status, ["pending", "expired"]),
      sql`${pgInvoice.metadata}->>'simpayPaymentId' is not null`,
      sql`${pgInvoice.metadata}->'pixCheckout' is not null`
    ),
  });
  const candidates = invoices
    .filter(invoice => shouldReconcilePixDomainInvoice(invoice))
    .slice(0, PROCESS_LIMIT);

  const results: Array<{
    invoiceId: string;
    status: "completed" | "pending" | "error";
    error?: string;
  }> = [];

  for (const invoice of candidates) {
    try {
      const result = await syncCheckoutPixPayment(invoice.id);
      results.push({
        invoiceId: invoice.id,
        status: result.status === "COMPLETED" ? "completed" : "pending",
      });
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
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[PIX-RECONCILIATION] Fatura ${invoice.id}:`, message);
      results.push({ error: message, invoiceId: invoice.id, status: "error" });
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
