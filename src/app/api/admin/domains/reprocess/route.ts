import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  reprocessDomainInvoice,
  reprocessUnfulfilledDomainInvoices,
} from "@/lib/server/domains/reprocessDomainInvoice";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Senha do endpoint. Prefira definir DOMAIN_REPROCESS_SECRET no .env;
 * o literal é apenas fallback para funcionar de imediato.
 */
const SECRET = process.env.DOMAIN_REPROCESS_SECRET ?? "p-Fva7T0f){4";

/** Comparação em tempo constante para evitar timing attacks. */
function isAuthorized(provided: string | null | undefined): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(SECRET);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function extractSecret(
  request: Request,
  body: Record<string, unknown>
): string | null {
  const header =
    request.headers.get("x-reprocess-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;
  if (header) return header;
  const fromBody = body?.secret;
  return typeof fromBody === "string" ? fromBody : null;
}

/**
 * POST /api/admin/domains/reprocess
 *
 * Auth: header `x-reprocess-secret: <senha>` (ou `Authorization: Bearer <senha>`,
 * ou `{ "secret": "<senha>" }` no corpo).
 *
 * Corpo:
 *   { "invoiceId": "<uuid>" }  → reprocessa uma fatura de domínio específica
 *   { "all": true }            → varre e reprocessa todas as faturas pagas sem domínio vinculado
 */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  if (!isAuthorized(extractSecret(request, body))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    if (body?.all === true) {
      const summary = await reprocessUnfulfilledDomainInvoices();
      return NextResponse.json({ mode: "all", ok: true, ...summary });
    }

    const invoiceId = body?.invoiceId;
    if (typeof invoiceId !== "string" || !invoiceId) {
      return NextResponse.json(
        {
          error: "invoiceId_required",
          hint: 'envie { "invoiceId": "..." } ou { "all": true }',
        },
        { status: 400 }
      );
    }

    const result = await reprocessDomainInvoice(invoiceId);
    return NextResponse.json(result, { status: result.ok ? 200 : 422 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[REPROCESS] erro:", message);
    return NextResponse.json(
      { error: "internal_error", message },
      { status: 500 }
    );
  }
}
