"use server";

import { db } from "@/lib/db";
import { pgVpsMetrics, pgVpsServers, pgUser } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";

/**
 * Registra uma nova VPS manualmente para um usuário.
 * Usado por você (Breno) para entregar o servidor ao cliente.
 */
export async function registerVpsAction(
  userIdOrEmail: string, 
  name: string, 
  ip: string,
  os?: string
) {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) throw new Error("Não autorizado. Apenas administradores podem registrar novas VPS.");

  // Se o identificador for um e-mail, buscamos o usuário real no banco
  let targetUserId = userIdOrEmail;
  if (userIdOrEmail.includes("@")) {
    const user = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, userIdOrEmail),
    });
    if (!user) throw new Error("Usuário não encontrado com este e-mail.");
    targetUserId = user.id;
  }

  const token = `atlas_${randomBytes(24).toString("hex")}`;
  
  await db.insert(pgVpsServers).values({
    userId: targetUserId,
    name,
    ip,
    os: os || "Linux",
    token,
    status: "pending",
  });

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
    where: eq(pgVpsServers.userId, user.id),
    orderBy: [desc(pgVpsServers.createdAt)],
  });
}

/**
 * Busca as métricas mais recentes de um servidor específico.
 */
export async function getVpsMetricsAction(vpsId: string, limit = 20) {
  return await db.query.pgVpsMetrics.findMany({
    where: eq(pgVpsMetrics.vpsId, vpsId),
    limit,
    orderBy: [desc(pgVpsMetrics.timestamp)],
  });
}

/**
 * Força a revalidação dos dados do painel VPS e sinaliza o bot.
 */
export async function refreshVpsDataAction(vpsId?: string) {
  if (vpsId) {
    // Liga o sinalizador para o bot
    await db.update(pgVpsServers)
      .set({ forceRefresh: true })
      .where(eq(pgVpsServers.id, vpsId));
  }

  revalidatePath("/manage/vps");
  return { success: true, timestamp: new Date().toISOString() };
}

/**
 * [ADMIN] Busca TODOS os servidores registrados no sistema.
 */
export async function getAllVpsServersAction() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) throw new Error("Não autorizado.");

  return await db.query.pgVpsServers.findMany({
    with: {
      user: true // Note: ensure relations are defined in schema
    },
    orderBy: [desc(pgVpsServers.createdAt)],
  });
}

/**
 * [ADMIN] Busca todos os usuários para o formulário de cadastro.
 */
export async function getAllUsersAction() {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) throw new Error("Não autorizado.");

  return await db.query.pgUser.findMany({
    columns: {
      id: true,
      email: true,
      name: true
    },
    orderBy: [pgUser.name]
  });
}

/**
 * [ADMIN] Deleta uma VPS do sistema (Desvincular).
 */
export async function deleteVpsAction(vpsId: string) {
  const admin = await getUser();
  if (!admin || !admin.isAdmin) throw new Error("Não autorizado.");

  await db.delete(pgVpsServers).where(eq(pgVpsServers.id, vpsId));
  
  revalidatePath("/admin/vps");
  revalidatePath("/manage/vps");
  
  return { success: true };
}
