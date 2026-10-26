import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgVpsServers } from "@/lib/db/schema";
import { getAtlasHostingConfig } from "./config";
import type { DeployTarget } from "./deploySite";

/** Mensagens de SSH podem ecoar dados sensíveis: nunca devolva a senha ao navegador. */
export function sanitize(error: unknown, secret?: string) {
  let message = error instanceof Error ? error.message : String(error);
  if (secret) message = message.replaceAll(secret, "***");
  return message.slice(0, 400);
}

export async function resolveTarget(
  userId: string,
  input: {
    password?: string;
    target: "atlas_vm" | "user_vps";
    vpsNodeId?: string;
  }
): Promise<
  | { error: string }
  | { deploy: DeployTarget; ip: string; vpsNodeId: string | null }
> {
  const config = getAtlasHostingConfig();

  if (input.target === "atlas_vm") {
    if (!(config.atlasVmEnabled && config.vmIp)) {
      return {
        error: "A hospedagem na VM do Atlas ainda não está disponível.",
      };
    }
    return {
      deploy: {
        caddyRoot: config.caddyRoot,
        ip: config.vmIp,
        keyPath: config.keyPath,
        local: config.localDeploy,
        webRoot: config.webRoot,
      },
      ip: config.vmIp,
      vpsNodeId: null,
    };
  }

  const [node] = await db
    .select()
    .from(pgVpsServers)
    .where(
      and(
        eq(pgVpsServers.id, input.vpsNodeId ?? ""),
        eq(pgVpsServers.userId, userId)
      )
    )
    .limit(1);
  if (!node) return { error: "Servidor não encontrado na sua conta." };

  return {
    deploy: {
      ip: node.ip,
      // Sem senha, tenta a chave do Atlas (VPS provisionadas por nós).
      keyPath: input.password ? undefined : config.keyPath,
      password: input.password || undefined,
    },
    ip: node.ip,
    vpsNodeId: node.id,
  };
}
