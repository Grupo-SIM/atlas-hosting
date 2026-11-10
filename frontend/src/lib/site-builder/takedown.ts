import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type BuilderPublication, pgBuilderPublication } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import { getManagedCloudflareZone } from "@/lib/server/domains/cloudflare-dns";
import { getAtlasHostingConfig } from "./config";
import { removeSite } from "./deploySite";
import { describeError, explainDeployError, publishLogger } from "./publishLog";
import { canDetachWithoutSsh } from "./takedown-policy";
import { resolveTarget, sanitize } from "./target";

/**
 * Tira uma publicação do ar e libera o endereço:
 *  1) apaga a pasta e o bloco do Caddy no servidor;
 *  2) remove os registros DNS que o Atlas criou (só os que apontam para o servidor da publicação);
 *  3) apaga a publicação do banco, o que deixa o nome livre de novo (`keepRecord` pula este passo).
 * Se algum passo falha, a publicação continua registrada e dá para tentar outra vez (os passos são repetíveis).
 */
export async function takeDown(
  userId: string,
  publication: BuilderPublication,
  password?: string,
  options: { detachOnSshFailure?: boolean; keepRecord?: boolean } = {}
): Promise<{ detached?: boolean; ok: true } | { error: string; ok: false }> {
  const log = publishLogger(publication.target);
  const ctx = {
    detachOnSshFailure: Boolean(options.detachOnSshFailure),
    domain: publication.domain,
    keepRecord: Boolean(options.keepRecord),
    passwordProvided: Boolean(password),
    serverIp: publication.serverIp,
    siteId: publication.siteId,
    vpsNodeId: publication.vpsNodeId,
  };
  log.info("Tirando do ar", ctx);
  try {
    const target = await resolveTarget(
      userId,
      {
        password,
        target: publication.target,
        vpsNodeId: publication.vpsNodeId ?? undefined,
      },
      // Tirar do ar vale mesmo quando a assinatura da VPS já acabou.
      { allowIneligible: true }
    );
    if ("error" in target) {
      log.warn("Não foi possível resolver o servidor para tirar do ar", {
        ...ctx,
        motivo: target.error,
      });
      return { error: target.error, ok: false };
    }

    await removeSite({ domain: publication.domain, target: target.deploy });
    log.info("Site removido do servidor", { domain: publication.domain });
    await removeDns(publication);
    log.info("Registros DNS do Atlas removidos", {
      domain: publication.domain,
    });
  } catch (error) {
    log.error("Falha ao tirar do ar", {
      ...ctx,
      dica: explainDeployError(error),
      erro: describeError(error, [password]),
    });
    if (!(options.detachOnSshFailure && canDetachWithoutSsh(error))) {
      return {
        error: `Não foi possível tirar do ar: ${sanitize(error, password)}`,
        ok: false,
      };
    }
    log.warn(
      "SSH recusado: desvinculando o domínio sem limpar a VPS (os arquivos continuam lá)",
      ctx
    );
    try {
      await removeDns(publication);
    } catch (dnsError) {
      log.error("Falha ao remover o DNS ao desvincular", {
        ...ctx,
        erro: describeError(dnsError, [password]),
      });
      return {
        error: `Não foi possível tirar do ar: ${sanitize(dnsError, password)}`,
        ok: false,
      };
    }
    if (options.keepRecord) return { detached: true, ok: true };
    await db
      .delete(pgBuilderPublication)
      .where(eq(pgBuilderPublication.id, publication.id));
    log.info("Publicação desvinculada (sem limpar a VPS)", ctx);
    return { detached: true, ok: true };
  }

  if (options.keepRecord) return { ok: true };
  await db
    .delete(pgBuilderPublication)
    .where(eq(pgBuilderPublication.id, publication.id));
  log.info("Publicação removida do banco", ctx);
  return { ok: true };
}

async function removeDns(publication: BuilderPublication) {
  const domain = publication.domain;
  const names =
    publication.kind === "domain" ? [domain, `www.${domain}`] : [domain];

  let zoneId: string | undefined;
  if (publication.kind === "subdomain") {
    const { zoneDomain } = getAtlasHostingConfig();
    if (!zoneDomain) return;
    zoneId = (await cloudflareApi.findZone(zoneDomain))?.id;
  } else {
    zoneId = (await getManagedCloudflareZone(domain)).zoneId;
  }
  if (!zoneId) return;

  const wanted = publication.serverIp.toLowerCase();
  const records = await cloudflareApi.listDnsRecords(zoneId);
  for (const record of records) {
    const sameName = names.includes(record.name.toLowerCase());
    const sameType = record.type === "A" || record.type === "CNAME";
    // Só mexe no que o Atlas criou: o registro precisa apontar para o servidor da publicação.
    if (sameName && sameType && record.content.toLowerCase() === wanted) {
      await cloudflareApi.deleteDnsRecord(zoneId, record.id);
    }
  }
}
