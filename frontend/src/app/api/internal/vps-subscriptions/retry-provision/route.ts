import { NextResponse } from "next/server";
import { provisionPaidVps } from "@/lib/contabo";

function ensureAuthorized(req: Request): boolean {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const host = req.headers.get("host") || "";
  const isLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    forwarded === "";
  if (isLocal) return true;

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace("Bearer ", "").trim();
  const cronSecret = process.env.CRON_SECRET;
  const internalToken =
    process.env.API_MACHINE_INTERNAL_TOKEN ||
    process.env.INTERNAL_SERVICE_TOKEN;
  if (cronSecret && token === cronSecret) return true;
  if (internalToken && token === internalToken) return true;
  return false;
}

export async function POST(req: Request) {
  if (!ensureAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoiceId } = (await req.json().catch(() => ({}))) as {
    invoiceId?: string;
  };
  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
  }

  await provisionPaidVps(invoiceId);

  return NextResponse.json({ invoiceId, status: "triggered" });
}
