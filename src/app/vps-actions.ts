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
  if (!admin) throw new Error("Não autorizado");

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
