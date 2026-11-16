import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgNotification, pgUser } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";

export interface NotifyInput {
  title: string;
  /** Texto curto mostrado no sino (também vira o corpo do e-mail). */
  body: string;
  /** Caminho interno (`/criador-de-sites/...`) para onde o clique leva. */
  href?: string;
  kind: string;
  /** Também manda por e-mail. */
  email?: {
    actionText?: string;
    severity?: "success" | "info" | "warning" | "danger";
  };
}

/**
 * Cria a notificação do sino e, se pedido, manda o mesmo aviso por e-mail.
 * Falha no e-mail nunca derruba quem chamou: o aviso in-app já ficou gravado.
 */
export async function notifyUser(
  userId: string,
  input: NotifyInput
): Promise<void> {
  await db.insert(pgNotification).values({
    body: input.body,
    href: input.href ?? null,
    kind: input.kind,
    title: input.title,
    userId,
  });

  if (!input.email) return;
  try {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.id, userId),
      with: { organization: true },
    });
    if (!user?.email) return;
    const actionUrl = input.href
      ? new URL(input.href, getServerPublicBaseUrl()).toString()
      : undefined;
    await sendNotificationEmail(
      user.email,
      user.name?.split(" ")[0] ?? "",
      user.organization?.name ?? "",
      input.title,
      escapeHtml(input.body),
      input.email.severity ?? "info",
      actionUrl,
      input.email.actionText ?? (actionUrl ? "Abrir no Atlas" : undefined)
    );
  } catch (error) {
    console.error(
      `[NOTIFY] Falha ao enviar e-mail de "${input.kind}" para ${userId}:`,
      error
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br />");
}
