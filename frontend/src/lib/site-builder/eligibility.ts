import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgVpsServers, pgVpsSubscription } from "@/lib/db/schema";
import { getAtlasHostingConfig } from "./config";

export interface EligibleVpsNode {
  id: string;
  ip: string;
  name: string;
}

export interface PublishTargets {
  atlasVm: {
    /** Só liga quando existe VM configurada **e** mensalidade definida. */
    enabled: boolean;
    host: string | null;
    monthlyBrl: number | null;
  };
  /** VPS que o cliente comprou no Atlas e está com a assinatura em dia. */
  vpsNodes: EligibleVpsNode[];
}

/**
 * Publicar na VPS do cliente só vale para **VM comprada conosco**: o nó precisa
 * ser dele e ter assinatura `active` em `vps_subscriptions`. Assinatura
 * `paused`/`failed`/`cancelled` não entra — `paused` é inadimplência com
 * cancelamento já agendado no provedor.
 *
 * VM cadastrada à mão pelo admin (`registerVpsAction`) não tem assinatura
 * vinculada; essa também vale, senão o admin não conseguiria publicar nela.
 *
 * `vps_nodes.status` **não** serve como prova de pagamento: é texto livre que
 * nasce `pending` e o provisionamento nunca atualiza.
 */
export async function listEligibleVpsNodes(
  userId: string
): Promise<EligibleVpsNode[]> {
  const rows = await db
    .selectDistinct({
      id: pgVpsServers.id,
      ip: pgVpsServers.ip,
      name: pgVpsServers.name,
    })
    .from(pgVpsServers)
    .leftJoin(
      pgVpsSubscription,
      eq(pgVpsSubscription.vpsNodeId, pgVpsServers.id)
    )
    .where(
      and(
        eq(pgVpsServers.userId, userId),
        or(eq(pgVpsSubscription.status, "active"), isNull(pgVpsSubscription.id))
      )
    );
  return rows;
}

/** Diz quem pode ser o servidor do site e quanto custa a VM do Atlas. */
export async function listPublishTargets(
  userId: string
): Promise<PublishTargets> {
  const config = getAtlasHostingConfig();
  const vpsNodes = await listEligibleVpsNodes(userId);
  return {
    atlasVm: {
      enabled: Boolean(config.atlasVmEnabled && config.hostingMonthlyBrl),
      host: config.vmIp,
      monthlyBrl: config.hostingMonthlyBrl,
    },
    vpsNodes,
  };
}

/** Confere que o nó informado é elegível antes de qualquer deploy ou cobrança. */
export async function assertEligibleVpsNode(
  userId: string,
  vpsNodeId: string | undefined
): Promise<EligibleVpsNode | { error: string }> {
  if (!vpsNodeId) return { error: "Escolha em qual servidor publicar." };
  const nodes = await listEligibleVpsNodes(userId);
  const node = nodes.find(item => item.id === vpsNodeId);
  if (node) return node;
  return {
    error:
      "Esse servidor não está disponível: ele precisa ser uma VPS contratada no Atlas com a assinatura em dia.",
  };
}
