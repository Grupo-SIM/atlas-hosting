"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  pgBuilderPublication,
  pgBuilderSite,
  pgOrganizationDomains,
  pgVpsServers,
} from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import { normalizeDomainName } from "@/lib/server/domains/authorization";
import { configureWebHostingDns } from "@/lib/server/domains/cloudflare-dns";
import { FORBIDDEN_MESSAGE, getBuilderUser } from "@/lib/site-builder/access";
import { assertValidDomain } from "@/lib/site-builder/caddy";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import { type DeployTarget, deploySite } from "@/lib/site-builder/deploySite";

type Result<T = object> = ({ ok: true } & T) | { error: string; ok: false };

const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,40}[a-z0-9])?$/;

/** Mensagens de SSH podem ecoar dados sensíveis: nunca devolva a senha ao navegador. */
function sanitize(error: unknown, secret?: string) {
  let message = error instanceof Error ? error.message : String(error);
  if (secret) message = message.replaceAll(secret, "***");
  return message.slice(0, 400);
}

async function ownedSite(siteId: string, userId: string) {
  const [site] = await db
    .select()
    .from(pgBuilderSite)
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, userId)))
    .limit(1);
  return site;
}

async function resolveTarget(
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
      deploy: { ip: config.vmIp, keyPath: config.keyPath },
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

export interface PublishInput {
  /** Domínio já na conta (kind = "domain"). */
  domain?: string;
  kind: "domain" | "subdomain";
  /** Parte antes do domínio base do Atlas (kind = "subdomain"). */
  label?: string;
  /** Senha SSH da VPS do usuário — usada só nesta chamada, nunca gravada. */
  password?: string;
  siteId: string;
  target: "atlas_vm" | "user_vps";
  vpsNodeId?: string;
}

export async function publishSite(
  input: PublishInput
): Promise<Result<{ domain: string }>> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const site = await ownedSite(input.siteId, user.id);
  if (!site) return { error: "Site não encontrado.", ok: false };

  const config = getAtlasHostingConfig();

  // 1) Domínio: subdomínio grátis do Atlas ou domínio da organização com DNS no Atlas.
  let domain: string;
  let zoneId: string | undefined;
  try {
    if (input.kind === "subdomain") {
      const label = (input.label ?? "").trim().toLowerCase();
      if (
        !(config.subdomainEnabled && config.baseDomain && config.zoneDomain)
      ) {
        return {
          error: "Subdomínios grátis ainda não estão disponíveis.",
          ok: false,
        };
      }
      if (!LABEL_RE.test(label)) {
        return {
          error:
            "Use só letras minúsculas, números e hífen (até 42 caracteres).",
          ok: false,
        };
      }
      domain = assertValidDomain(`${label}.${config.baseDomain}`);
      const zone = await cloudflareApi.findZone(config.zoneDomain);
      if (!zone)
        return { error: "Zona DNS do Atlas não encontrada.", ok: false };
      zoneId = zone.id;
    } else {
      domain = assertValidDomain(normalizeDomainName(input.domain ?? ""));
      const owned = user.organization
        ? await db.query.pgOrganizationDomains.findFirst({
            where: and(
              eq(pgOrganizationDomains.organizationId, user.organization.id),
              eq(pgOrganizationDomains.domain, domain),
              eq(pgOrganizationDomains.active, true),
              eq(pgOrganizationDomains.dnsMode, "cloudflare")
            ),
          })
        : undefined;
      if (!owned) {
        return {
          error:
            "Esse domínio não está na sua conta com DNS gerenciado pelo Atlas.",
          ok: false,
        };
      }
    }
  } catch (error) {
    return { error: sanitize(error), ok: false };
  }

  // 2) O domínio não pode pertencer a outro site.
  const taken = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.domain, domain),
  });
  if (taken && taken.siteId !== site.id) {
    return { error: "Esse endereço já está em uso por outro site.", ok: false };
  }

  // 3) Servidor de destino.
  const target = await resolveTarget(user.id, input);
  if ("error" in target) return { error: target.error, ok: false };

  const includeWww = input.kind === "domain";

  try {
    // 4) Gera o HTML estático e envia. Só o conteúdo salvo é publicado.
    const { exportSiteToStatic } = await import("@repo/site-builder/static");
    await deploySite({
      domain,
      files: await exportSiteToStatic(site.content),
      includeWww,
      target: target.deploy,
    });

    // 5) Aponta o DNS depois do site já estar servindo.
    if (input.kind === "subdomain" && zoneId) {
      await cloudflareApi.upsertDnsRecord(zoneId, {
        content: target.ip,
        name: domain,
        proxied: false,
        ttl: 1,
        type: "A",
      });
    } else {
      await configureWebHostingDns(domain, target.ip);
    }
  } catch (error) {
    const message = sanitize(error, input.password);
    await savePublication(site.id, {
      domain,
      ip: target.ip,
      kind: input.kind,
      lastError: message,
      status: "failed",
      target: input.target,
      vpsNodeId: target.vpsNodeId,
    });
    return { error: `Falha ao publicar: ${message}`, ok: false };
  }

  await savePublication(site.id, {
    domain,
    ip: target.ip,
    kind: input.kind,
    lastError: null,
    status: "published",
    target: input.target,
    vpsNodeId: target.vpsNodeId,
  });
  revalidatePath(`/criador-de-sites/${site.id}/publicar`);
  return { domain, ok: true };
}

async function savePublication(
  siteId: string,
  data: {
    domain: string;
    ip: string;
    kind: "domain" | "subdomain";
    lastError: string | null;
    status: "failed" | "published";
    target: "atlas_vm" | "user_vps";
    vpsNodeId: string | null;
  }
) {
  const now = new Date();
  const values = {
    domain: data.domain,
    kind: data.kind,
    lastError: data.lastError,
    publishedAt: data.status === "published" ? now : null,
    serverIp: data.ip,
    status: data.status,
    target: data.target,
    updatedAt: now,
    vpsNodeId: data.vpsNodeId,
  };
  await db
    .insert(pgBuilderPublication)
    .values({ ...values, siteId })
    .onConflictDoUpdate({
      set: values,
      target: pgBuilderPublication.siteId,
    });
}
