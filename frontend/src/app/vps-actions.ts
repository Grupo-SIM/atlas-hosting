"use server";

import { randomBytes } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgUser,
  pgVpsMetrics,
  pgVpsServers,
  pgVpsSubscription,
} from "@/lib/db/schema";

/**
 * Registra uma nova VPS manualmente para um usuário.
 * Usado por você (Breno) para entregar o servidor ao cliente.
 */
export async function registerVpsAction(
  userIdOrEmail: string,
  name: string,
  ip: string,
  os?: string,
  vpsSubscriptionId?: string,
) {
  const admin = await getUser();
  if (!admin?.isAdmin)
    throw new Error(
      "Não autorizado. Apenas administradores podem registrar novas VPS.",
    );

  let targetUserId = userIdOrEmail;
  if (userIdOrEmail.includes("@")) {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, userIdOrEmail),
    });
    if (!user) throw new Error("Usuário não encontrado com este e-mail.");
    targetUserId = user.id;
  }

  if (vpsSubscriptionId) {
    const subscription = await db.query.pgVpsSubscription.findFirst({
      columns: { id: true },
      where: and(
        eq(pgVpsSubscription.id, vpsSubscriptionId),
        eq(pgVpsSubscription.userId, targetUserId),
      ),
    });

    if (!subscription)
      throw new Error(
        "Assinatura VPS não encontrada ou não pertence ao usuário selecionado.",
      );
  }

  const token = `atlas_${randomBytes(24).toString("hex")}`;

  await db.transaction(async (tx) => {
    const [vpsNode] = await tx
      .insert(pgVpsServers)
      .values({
        ip,
        name,
        os: os || "Linux",
        status: "pending",
        token,
        userId: targetUserId,
      })
      .returning({ id: pgVpsServers.id });

    if (vpsSubscriptionId) {
      await tx
        .update(pgVpsSubscription)
        .set({ updatedAt: new Date(), vpsNodeId: vpsNode.id })
        .where(eq(pgVpsSubscription.id, vpsSubscriptionId));
    }
  });

  revalidatePath("/admin/vps");
  revalidatePath("/admin/vps-plans");
  revalidatePath("/home");
  return { success: true, token };
}

/**
 * Busca os servidores do usuário logado.
 */
export async function getUserVpsServers() {
  const user = await getUser();
  if (!user) return [];

  return await db.query.pgVpsServers.findMany({
    orderBy: [desc(pgVpsServers.createdAt)],
    where: eq(pgVpsServers.userId, user.id),
  });
}

/**
 * Busca as métricas mais recentes de um servidor específico.
 */
export async function getVpsMetricsAction(vpsId: string, limit = 20) {
  return await db.query.pgVpsMetrics.findMany({
    limit,
    orderBy: [desc(pgVpsMetrics.timestamp)],
    where: eq(pgVpsMetrics.vpsId, vpsId),
  });
}

/**
 * Força a revalidação dos dados do painel VPS e sinaliza o bot.
 */
export async function refreshVpsDataAction(vpsId?: string) {
  console.log(
    `[VPS-Action] refreshVpsDataAction called, vpsId=${vpsId ?? "NONE"}`,
  );

  if (vpsId) {
    // Liga o sinalizador para o bot
    console.log(`[VPS-Action] Setting forceRefresh=true for vpsId=${vpsId}...`);
    await db
      .update(pgVpsServers)
      .set({ forceRefresh: true })
      .where(eq(pgVpsServers.id, vpsId));

    // Confirma que foi salvo
    const check = await db.query.pgVpsServers.findFirst({
      columns: { forceRefresh: true, id: true },
      where: eq(pgVpsServers.id, vpsId),
    });
    console.log(
      `[VPS-Action] DB confirm: forceRefresh=${check?.forceRefresh} for vpsId=${vpsId}`,
    );
  }

  revalidatePath("/manage/vps");
  console.log("[VPS-Action] revalidatePath done, returning success");
  return { success: true, timestamp: new Date().toISOString() };
}

/**
 * [ADMIN] Busca TODOS os servidores registrados no sistema.
 */
export async function getAllVpsServersAction() {
  const admin = await getUser();
  if (!admin?.isAdmin) throw new Error("Não autorizado.");

  return await db.query.pgVpsServers.findMany({
    orderBy: [desc(pgVpsServers.createdAt)],
    with: {
      user: true, // Note: ensure relations are defined in schema
    },
  });
}

/**
 * [ADMIN] Busca todos os usuários para o formulário de cadastro.
 */
export async function getAllUsersAction() {
  const admin = await getUser();
  if (!admin?.isAdmin) throw new Error("Não autorizado.");

  return await db.query.pgUser.findMany({
    columns: {
      email: true,
      id: true,
      name: true,
    },
    orderBy: [pgUser.name],
  });
}

export async function getVpsSubscriptionsForUserAction(userId: string) {
  const admin = await getUser();
  if (!admin?.isAdmin) throw new Error("Não autorizado.");

  return await db.query.pgVpsSubscription.findMany({
    columns: {
      id: true,
      planId: true,
      planType: true,
      createdAt: true,
      status: true,
      vpsNodeId: true,
    },
    orderBy: [desc(pgVpsSubscription.createdAt)],
    where: eq(pgVpsSubscription.userId, userId),
  });
}

/**
 * [ADMIN] Deleta uma VPS do sistema (Desvincular).
 */
export async function deleteVpsAction(vpsId: string) {
  const admin = await getUser();
  if (!admin?.isAdmin) throw new Error("Não autorizado.");

  await db.delete(pgVpsServers).where(eq(pgVpsServers.id, vpsId));

  revalidatePath("/admin/vps");
  revalidatePath("/manage/vps");

  return { success: true };
}
