import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgVpsServers } from "@/lib/db/schema";
import { getAtlasHostingConfig } from "./config";
import type { DeployTarget } from "./deploySite";
import { assertEligibleVpsNode } from "./eligibility";
import { publishLogger } from "./publishLog";

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
  },
  options: {
    /**
     * Pula a checagem de assinatura da VPS. Serve para **sair** do servidor
     * (tirar do ar, suspender): um site hospedado numa VPS cuja assinatura
     * acabou ainda precisa poder ser removido.
     */
    allowIneligible?: boolean;
  } = {}
): Promise<
  | { error: string }
  | { deploy: DeployTarget; ip: string; vpsNodeId: string | null }
> {
  const config = getAtlasHostingConfig();
  const log = publishLogger(input.target);

  if (input.target === "atlas_vm") {
    if (!(config.atlasVmEnabled && config.vmIp)) {
      log.error("VM do Atlas não está configurada", {
        atlasVmEnabled: config.atlasVmEnabled,
        temVmIp: Boolean(config.vmIp),
      });
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

  log.info("Resolvendo a VPS do usuário", {
    allowIneligible: Boolean(options.allowIneligible),
    passwordProvided: Boolean(input.password),
    userId,
    vpsNodeId: input.vpsNodeId,
  });

  let node: { id: string; ip: string } | undefined;
  if (options.allowIneligible) {
    [node] = await db
      .select()
      .from(pgVpsServers)
      .where(
        and(
          eq(pgVpsServers.id, input.vpsNodeId ?? ""),
          eq(pgVpsServers.userId, userId)
        )
      )
      .limit(1);
  } else {
    // Publicar exige VPS contratada no Atlas e em dia.
    const eligible = await assertEligibleVpsNode(userId, input.vpsNodeId);
    if ("error" in eligible) return { error: eligible.error };
    node = eligible;
  }
  if (!node) {
    log.warn("VPS não encontrada na conta do usuário", {
      userId,
      vpsNodeId: input.vpsNodeId,
    });
    return { error: "Servidor não encontrado na sua conta." };
  }

  if (!(input.password || config.keyPath)) {
    // Sem senha e sem chave do Atlas o SSH vai falhar na autenticação.
    log.warn("VPS sem senha informada e sem chave do Atlas configurada", {
      ip: node.ip,
      vpsNodeId: node.id,
    });
  }

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
