import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db
    .update(pgInvoice)
    .set({ status: "expired", updatedAt: new Date() })
    .where(and(eq(pgInvoice.id, id), eq(pgInvoice.status, "pending")));

  return NextResponse.json({ ok: true });
}
