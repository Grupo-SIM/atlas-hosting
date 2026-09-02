import { NextResponse } from "next/server";
import {
  approvePendingNamecheapVerifications,
  gmailVerificationEnabled,
} from "@/lib/server/domains/namecheap-gmail-verification";

function authorized(request: Request): boolean {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  return Boolean(process.env.CRON_SECRET && token === process.env.CRON_SECRET);
}

export async function POST(request: Request) {
  if (!authorized(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!gmailVerificationEnabled())
    return NextResponse.json({ approved: 0, enabled: false, skipped: 0 });

  try {
    const result = await approvePendingNamecheapVerifications();
    return NextResponse.json({ ...result, enabled: true });
  } catch (error) {
    console.error("[NAMECHEAP][GMAIL] Falha ao aprovar verificações:", error);
    return NextResponse.json({ error: "Verification processing failed" }, { status: 500 });
  }
}
