import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

function ensureInternalToken(req: Request): boolean {
  const token = req.headers.get("x-internal-token");
  const expected = process.env.API_MACHINE_INTERNAL_TOKEN || process.env.INTERNAL_SERVICE_TOKEN;
  return !!(expected && token === expected);
}

/**
 * Reativa o usuário — espelho de `../deactivate`, que marca `deletedAt`.
 * Chamado pela api-machine quando o master reativa a conta no SIM INT PAY.
 */
export async function POST(req: Request) {
  if (!ensureInternalToken(req)) {
    return NextResponse.json({ error: "Token interno inválido" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = (body?.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ activated: false, reason: "email_required" }, { status: 400 });
  }

  const user = await db.query.pgUser.findFirst({ where: eq(pgUser.email, email) });
  if (!user) {
    return NextResponse.json({ activated: false, reason: "not_found" });
  }

  await db.update(pgUser).set({ deletedAt: null }).where(eq(pgUser.email, email));

  return NextResponse.json({ activated: true });
}
