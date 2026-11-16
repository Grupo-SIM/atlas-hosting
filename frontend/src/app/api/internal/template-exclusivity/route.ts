import { NextResponse } from "next/server";
import { runExclusivityJobs } from "@/lib/template-exclusivity/jobs";

function ensureAuthorized(req: Request): boolean {
  const token = (req.headers.get("authorization") || "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  return (
    !!token &&
    [
      process.env.CRON_SECRET,
      process.env.API_MACHINE_INTERNAL_TOKEN,
      process.env.INTERNAL_SERVICE_TOKEN,
    ]
      .filter(Boolean)
      .includes(token)
  );
}

export async function GET(req: Request) {
  return POST(req);
}

/**
 * Exclusividade de templates: libera reservas vencidas, expira propostas,
 * renova/cobra anuidades e tira do ar os sites com prazo vencido. Roda pelo
 * agendador interno e aceita chamada manual com o `Bearer` das rotas internas.
 */
export async function POST(req: Request) {
  if (!ensureAuthorized(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const report = await runExclusivityJobs();
  return NextResponse.json({ ok: true, report });
}
