"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRealUser, getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgInvoice,
  pgLog,
  pgUserCard,
  pgVpsSubscription,
} from "@/lib/db/schema";

export async function associateSubscriptionCard(
  subscriptionId: string,
  cardId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUser();
  const principal = await getRealUser();
  if (
    principal.id !== user.id ||
    user.organization?.ownerId !== user.id ||
    !user.organization?.wallet
  )
    return {
      error:
        "Ação exclusiva do titular da organização, fora do acesso como cliente.",
      ok: false,
    };
  try {
    await db.transaction(async tx => {
      await tx.execute(
        sql`select id from vps_subscriptions where id = ${subscriptionId} for update`
      );
      const sub = await tx.query.pgVpsSubscription.findFirst({
        where: and(
          eq(pgVpsSubscription.id, subscriptionId),
          eq(pgVpsSubscription.userId, user.id),
          eq(pgVpsSubscription.orgId, user.organization.id)
        ),
      });
      const card = await tx.query.pgUserCard.findFirst({
        where: and(
          eq(pgUserCard.id, cardId),
          eq(pgUserCard.walletId, user.organization.wallet.id)
        ),
      });
      if (
        !sub ||
        sub.status !== "active" ||
        sub.paymentMethod !== "credit_card"
      )
        throw new Error(
          "Assinatura não disponível para alteração do cartão. Procure o suporte se estiver pausada ou cancelada."
        );
      if (
        !card?.cardToken ||
        new Date(
          Number(card.expiryYear),
          Number(card.expiryMonth),
          1
        ).getTime() <= Date.now()
      )
        throw new Error("Selecione um cartão válido da sua carteira.");
      const config = { ...(sub.config as Record<string, unknown>) };
      const processing = await tx.query.pgInvoice.findFirst({
        where: sql`${pgInvoice.metadata}->>'subscriptionId' = ${sub.id} and ${pgInvoice.status} = 'processing'`,
      });
      if (
        config.renewalCardUncertain ||
        config.renewalCancellation ||
        config.renewalCancellationPending ||
        processing
      )
        throw new Error(
          "Há cobrança ou cancelamento em conciliação. Procure o suporte antes de alterar o cartão."
        );
      if (config.cardToken === card.cardToken) return;
      config.cardToken = card.cardToken;
      delete config.renewalLastAttemptDay;
      await tx
        .update(pgVpsSubscription)
        .set({ config, updatedAt: new Date() })
        .where(eq(pgVpsSubscription.id, sub.id));
      await tx
        .insert(pgLog)
        .values({
          description: `Titular selecionou cartão ${card.brand} final ${card.last4} para renovação automática da assinatura ${sub.id}.`,
          severity: "info",
          title: "Cartão associado à assinatura",
          type: "account",
          userId: user.id,
        });
    });
    revalidatePath("/settings");
    return { ok: true };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Falha ao associar cartão.",
      ok: false,
    };
  }
}
