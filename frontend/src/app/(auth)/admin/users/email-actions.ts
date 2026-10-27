"use server";

import { eq } from "drizzle-orm";
import { getRealUser, getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgLog, pgUser } from "@/lib/db/schema";
import { sendNotificationEmail } from "@/lib/email/service";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";
import { escapeEmailHtml } from "@/lib/server/subscriptions/renewal-policy";

export async function sendUserEmailAction(
  userId: string,
  subject: string,
  message: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await getRealUser();
  const effectiveUser = await getUser();
  if (!admin.isAdmin || effectiveUser.id !== admin.id)
    return {
      error: "Envio restrito ao administrador, fora do acesso como cliente.",
      ok: false,
    };
  const title = subject.trim();
  const body = message.trim();
  if (
    !title ||
    title.length > 160 ||
    /[\r\n]/.test(title) ||
    !body ||
    body.length > 10000
  ) {
    return {
      error:
        "Informe assunto de até 160 caracteres e mensagem de até 10.000 caracteres.",
      ok: false,
    };
  }
  const target = await db.query.pgUser.findFirst({
    where: eq(pgUser.id, userId),
  });
  if (!target || target.deletedAt)
    return { error: "Usuário não encontrado.", ok: false };
  try {
    await sendNotificationEmail(
      target.email,
      target.name,
      "Atlas",
      title,
      escapeEmailHtml(body).replace(/\r?\n/g, "<br>"),
      "info",
      `${getServerPublicBaseUrl()}/settings?tab=payment`,
      "Gerenciar cartões e assinaturas",
      undefined,
      true
    );
  } catch (error) {
    console.error("[ADMIN-EMAIL] Falha no envio:", error);
    return {
      error:
        "Não foi possível enviar o email. Verifique configuração de envio e tente novamente.",
      ok: false,
    };
  }
  try {
    await db
      .insert(pgLog)
      .values({
        description: `Administrador ${admin.id} enviou email para ${target.email}. Assunto: ${title}`,
        severity: "info",
        title: "Email administrativo enviado",
        type: "account",
        userId: target.id,
      });
  } catch (error) {
    console.error(
      "[ADMIN-EMAIL] Email enviado, mas registro de auditoria falhou:",
      error
    );
  }
  return { ok: true };
}
