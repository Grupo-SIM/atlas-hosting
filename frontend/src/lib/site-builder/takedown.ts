import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type BuilderPublication, pgBuilderPublication } from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import { getManagedCloudflareZone } from "@/lib/server/domains/cloudflare-dns";
import { getAtlasHostingConfig } from "./config";
import { removeSite } from "./deploySite";
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
  options: { keepRecord?: boolean } = {}
): Promise<{ ok: true } | { error: string; ok: false }> {
  try {
    const target = await resolveTarget(userId, {
      password,
      target: publication.target,
      vpsNodeId: publication.vpsNodeId ?? undefined,
    });
    if ("error" in target) return { error: target.error, ok: false };

    await removeSite({ domain: publication.domain, target: target.deploy });
    await removeDns(publication);
  } catch (error) {
    return {
      error: `Não foi possível tirar do ar: ${sanitize(error, password)}`,
      ok: false,
    };
  }

  if (options.keepRecord) return { ok: true };
  await db
    .delete(pgBuilderPublication)
    .where(eq(pgBuilderPublication.id, publication.id));
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
