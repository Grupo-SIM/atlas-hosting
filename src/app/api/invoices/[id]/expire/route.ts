import { and, eq, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const expired = await db
    .update(pgInvoice)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        eq(pgInvoice.id, id),
        eq(pgInvoice.status, "pending"),
        lte(pgInvoice.dueDate, new Date())
      )
    )
    .returning({ id: pgInvoice.id });

  return NextResponse.json({ expired: expired.length > 0, ok: true });
}
