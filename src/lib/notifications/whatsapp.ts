/**
 * WhatsApp notification via Evolution API.
 *
 * Env vars:
 *   EVOLUTION_API_URL      — URL base da instância (ex: http://localhost:8080)
 *   EVOLUTION_API_KEY      — API key de autenticação
 *   EVOLUTION_INSTANCE     — Nome da instância conectada (ex: atlas)
 *   VPS_ADMIN_WHATSAPP     — Número do admin no formato 55DDxxxxxxxxx
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "atlas";
const VPS_ADMIN_PHONES = (process.env.VPS_ADMIN_WHATSAPP || "5583987690902")
  .split(",")
  .map(p => p.trim())
  .filter(Boolean);

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<boolean> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    console.log(
      "[WhatsApp] ⚠️ Evolution API não configurada. Mensagem NÃO enviada."
    );
    console.log(`[WhatsApp] Destinatário: ${phone}`);
    console.log(`[WhatsApp] Mensagem:\n${message}`);
    return false;
  }

  const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

  try {
    const res = await fetch(url, {
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
      headers: {
        apikey: EVOLUTION_API_KEY,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      console.log(
        `[WhatsApp] ✓ Mensagem enviada para ${phone}`,
        data?.key?.id || ""
      );
      return true;
    }
    const errBody = await res.text().catch(() => "");
    console.error(
      `[WhatsApp] ✗ Evolution API retornou ${res.status}: ${errBody}`
    );
    return false;
  } catch (err) {
    console.error("[WhatsApp] ✗ Erro ao chamar Evolution API:", err);
    return false;
  }
}

export async function notifyAdminWhatsApp(message: string): Promise<boolean> {
  const results = await Promise.all(
    VPS_ADMIN_PHONES.map(phone => sendWhatsAppMessage(phone, message))
  );
  return results.some(Boolean);
}
