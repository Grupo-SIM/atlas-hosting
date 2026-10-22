export function getEmergencyRecipients(env: Record<string, string | undefined> = process.env): string[] {
  const configured = env.EMERGENCY_ALERT_EMAILS?.trim() || env.DOMAIN_EMAIL || "";
  return [...new Set(configured.split(",").map(email => email.trim().toLowerCase()).filter(Boolean))];
}

/** Individual envelopes keep recipient addresses private; one failure never skips others. */
export async function deliverEmergencyAlert(
  send: (recipient: string) => Promise<unknown>,
  recipients = getEmergencyRecipients(),
): Promise<boolean> {
  let delivered = false;
  for (const recipient of recipients) {
    try {
      await send(recipient);
      delivered = true;
    } catch (error) {
      console.error("[EMERGENCY] Falha ao enviar aviso individual:", error instanceof Error ? error.message : "falha de envio");
    }
  }
  return delivered;
}
