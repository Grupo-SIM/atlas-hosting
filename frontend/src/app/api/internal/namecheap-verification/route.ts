import { NextResponse } from "next/server";
import {
  approvePendingNamecheapVerifications,
  GmailRefreshTokenExpiredError,
  gmailVerificationEnabled,
} from "@/lib/server/domains/namecheap-gmail-verification";
import { sendNotificationEmail } from "@/lib/email/service";

function authorized(request: Request): boolean {
  const token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  return Boolean(process.env.CRON_SECRET && token === process.env.CRON_SECRET);
}

export async function GET(request: Request) {
  return POST(request);
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
    if (error instanceof GmailRefreshTokenExpiredError) {
      const alertRecipient = process.env.EMAIL;
      if (alertRecipient) {
        await sendNotificationEmail(
          alertRecipient,
          "Admin",
          "Atlas Hosting",
          "GMAIL_REFRESH_TOKEN inválido ou expirado",
          "A verificação automática de e-mails da Namecheap não conseguiu renovar o token do Gmail. Gere um novo <code>GMAIL_REFRESH_TOKEN</code> e atualize a configuração do ambiente.",
          "danger"
        );
      } else {
        console.error(
          "[NAMECHEAP][GMAIL] GMAIL_REFRESH_TOKEN inválido ou expirado, mas EMAIL não está configurado para receber alerta."
        );
      }
    }
    console.error("[NAMECHEAP][GMAIL] Falha ao aprovar verificações:", error);
    return NextResponse.json({ error: "Verification processing failed" }, { status: 500 });
  }
}
