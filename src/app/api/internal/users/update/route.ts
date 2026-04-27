import { db } from "@/lib/db";
import { pgUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

function ensureInternalToken(req: Request): boolean {
  const token = req.headers.get("x-internal-token");
  const expected = process.env.API_MACHINE_INTERNAL_TOKEN || process.env.INTERNAL_SERVICE_TOKEN;
  return !!(expected && token === expected);
}

export async function POST(req: Request) {
  if (!ensureInternalToken(req)) {
    return NextResponse.json({ error: "Token interno inválido" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const email = (body?.email ?? "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ updated: false, reason: "email_required" }, { status: 400 });
  }

  const user = await db.query.pgUser.findFirst({ where: eq(pgUser.email, email) });
  if (!user) {
    return NextResponse.json({ updated: false, reason: "not_found" });
  }

  const data: Record<string, any> = {};
  if ((body.name ?? "").trim()) data.name = body.name.trim();
  if ((body.newEmail ?? "").trim()) data.email = body.newEmail.trim().toLowerCase();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ updated: false, reason: "no_changes" });
  }

  await db.update(pgUser).set(data).where(eq(pgUser.email, email));
  return NextResponse.json({ updated: true });
}
