import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pgBuilderHostingSubscription,
  pgBuilderPublication,
  pgBuilderSite,
  pgOrganizationDomains,
} from "@/lib/db/schema";
import { cloudflareApi } from "@/lib/server/apis/cloudflare";
import { normalizeDomainName } from "@/lib/server/domains/authorization";
import { configureWebHostingDns } from "@/lib/server/domains/cloudflare-dns";
import { assertValidDomain } from "./caddy";
import { getAtlasHostingConfig } from "./config";
import { deploySite, IPV4_RE } from "./deploySite";
import { describeError, publishLogger } from "./publishLog";
import { takeDown } from "./takedown";
import { resolveTarget, sanitize } from "./target";

export type PublishResult =
  | { domain: string; ok: true }
  | { error: string; ok: false };

export const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,40}[a-z0-9])?$/;

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

export async function ownedSite(siteId: string, userId: string) {
  const [site] = await db
    .select()
    .from(pgBuilderSite)
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, userId)))
    .limit(1);
  return site;
}

export async function currentPublication(siteId: string) {
  return db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.siteId, siteId),
  });
}

/**
 * Publica o site de fato: valida endereço e servidor, gera o HTML estático,
 * envia para o servidor (pasta + bloco no Caddy), aponta o DNS e grava
 * `builder_publications`.
 *
 * Fica fora das server actions porque dois caminhos usam o mesmo corpo: o
 * publicar direto (VPS do cliente, sem cobrança) e a entrega depois do
 * pagamento (`fulfillSitePublishInvoice`). Autenticação é de quem chama.
 */
export async function runPublish(
  user: { id: string; organizationId?: string | null },
  input: PublishInput,
  options: {
    /**
     * Pula a conferência da assinatura de hospedagem. Só o fulfillment usa,
     * porque ele acabou de criar a assinatura na mesma transação de entrega.
     */
    skipHostingCheck?: boolean;
  } = {}
): Promise<PublishResult> {
  const log = publishLogger(input.target);
  const startedAt = Date.now();
  // A senha SSH nunca é logada: só se ela veio ou não.
  const logCtx = {
    domain: input.domain ?? input.label,
    kind: input.kind,
    passwordProvided: Boolean(input.password),
    siteId: input.siteId,
    userId: user.id,
    vpsNodeId: input.vpsNodeId,
  };
  log.info("Publicação iniciada", logCtx);

  const site = await ownedSite(input.siteId, user.id);
  if (!site) {
    log.warn("Recusado: site não encontrado ou de outro usuário", logCtx);
    return { error: "Site não encontrado.", ok: false };
  }

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
        log.warn("Recusado: subdomínios grátis não configurados", {
          baseDomain: config.baseDomain,
          subdomainEnabled: config.subdomainEnabled,
          zoneDomain: config.zoneDomain,
        });
        return {
          error: "Subdomínios grátis ainda não estão disponíveis.",
          ok: false,
        };
      }
      if (!LABEL_RE.test(label)) {
        log.warn("Recusado: nome do subdomínio inválido", { label });
        return {
          error:
            "Use só letras minúsculas, números e hífen (até 42 caracteres).",
          ok: false,
        };
      }
      domain = assertValidDomain(`${label}.${config.baseDomain}`);
      const zone = await cloudflareApi.findZone(config.zoneDomain);
      if (!zone) {
        log.error("Zona DNS do Atlas não encontrada no Cloudflare", {
          zoneDomain: config.zoneDomain,
        });
        return { error: "Zona DNS do Atlas não encontrada.", ok: false };
      }
      zoneId = zone.id;
    } else {
      domain = assertValidDomain(normalizeDomainName(input.domain ?? ""));
      const owned = user.organizationId
        ? await db.query.pgOrganizationDomains.findFirst({
            where: and(
              eq(pgOrganizationDomains.organizationId, user.organizationId),
              eq(pgOrganizationDomains.domain, domain),
              eq(pgOrganizationDomains.active, true),
              eq(pgOrganizationDomains.dnsMode, "cloudflare")
            ),
          })
        : undefined;
      if (!owned) {
        log.warn(
          "Recusado: domínio não está na conta com DNS gerenciado pelo Atlas",
          { domain, organizationId: user.organizationId }
        );
        return {
          error:
            "Esse domínio não está na sua conta com DNS gerenciado pelo Atlas.",
          ok: false,
        };
      }
      log.info("Domínio validado na conta", {
        cloudflareZoneId: owned.cloudflareZoneId,
        domain,
      });
    }
  } catch (error) {
    log.error("Falha ao validar o domínio", {
      domain: input.domain ?? input.label,
      erro: describeError(error),
    });
    return { error: sanitize(error), ok: false };
  }

  // 2) O domínio não pode pertencer a outro site.
  const taken = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.domain, domain),
  });
  if (taken && taken.siteId !== site.id) {
    log.warn("Recusado: domínio já usado por outro site", {
      domain,
      siteDonoDoDominio: taken.siteId,
    });
    return { error: "Esse endereço já está em uso por outro site.", ok: false };
  }

  // 3) Hospedagem na VM do Atlas é paga: exige assinatura em dia deste site.
  if (
    input.target === "atlas_vm" &&
    config.hostingMonthlyBrl !== null &&
    !options.skipHostingCheck
  ) {
    const hosting = await db.query.pgBuilderHostingSubscription.findFirst({
      where: eq(pgBuilderHostingSubscription.siteId, site.id),
    });
    if (!hosting || hosting.status === "cancelled") {
      log.warn("Recusado: sem assinatura de hospedagem ativa", {
        domain,
        hostingStatus: hosting?.status ?? "sem assinatura",
      });
      return {
        error:
          "A hospedagem na VM do Atlas é paga: finalize o pedido para publicar aqui.",
        ok: false,
      };
    }
    if (hosting.status === "suspended") {
      log.warn("Recusado: hospedagem suspensa por falta de pagamento", {
        domain,
      });
      return {
        error:
          "A hospedagem deste site está suspensa por falta de pagamento. Pague a fatura em aberto para publicar de novo.",
        ok: false,
      };
    }
  }

  const previous = await currentPublication(site.id);

  // 4) Servidor de destino.
  const target = await resolveTarget(user.id, input);
  if ("error" in target) {
    log.warn("Recusado: servidor de destino indisponível", {
      domain,
      motivo: target.error,
      vpsNodeId: input.vpsNodeId,
    });
    return { error: target.error, ok: false };
  }
  log.info("Servidor de destino resolvido", {
    autenticacao: target.deploy.local
      ? "local"
      : target.deploy.password
        ? "senha"
        : target.deploy.keyPath
          ? "chave do Atlas"
          : "nenhuma",
    domain,
    ip: target.ip,
    vpsNodeId: target.vpsNodeId,
  });

  const includeWww = input.kind === "domain";

  try {
    // 5) Gera o HTML estático e envia. Só o conteúdo salvo é publicado.
    const { exportSiteToStatic } = await import("@repo/site-builder/static");
    const files = await exportSiteToStatic(site.content);
    log.info("HTML estático gerado", { arquivos: files.length, domain });
    const deployStartedAt = Date.now();
    await deploySite({
      domain,
      files,
      includeWww,
      logTag: input.target,
      target: target.deploy,
    });
    log.info("Site enviado ao servidor", {
      domain,
      ip: target.ip,
      ms: Date.now() - deployStartedAt,
    });

    // 6) Aponta o DNS depois do site já estar servindo.
    if (input.kind === "subdomain" && zoneId) {
      await cloudflareApi.upsertDnsRecord(zoneId, {
        content: target.ip,
        name: domain,
        proxied: false,
        ttl: 1,
        // IP → registro A; hostname (ex.: o CNAME vps.simintermediacoes.com) → CNAME.
        type: IPV4_RE.test(target.ip) ? "A" : "CNAME",
      });
      log.info("DNS do subdomínio apontado", { domain, ip: target.ip });
    } else {
      await configureWebHostingDns(domain, target.ip);
      log.info("DNS do domínio apontado (raiz e www)", {
        domain,
        ip: target.ip,
      });
    }
  } catch (error) {
    const message = sanitize(error, input.password);
    log.error("Falha ao publicar", {
      domain,
      erro: describeError(error, [input.password]),
      ip: target.ip,
      ms: Date.now() - startedAt,
      vpsNodeId: target.vpsNodeId,
    });
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

  log.info("Gravando a publicação no banco", { domain, siteId: site.id });
  await savePublication(site.id, {
    domain,
    ip: target.ip,
    kind: input.kind,
    lastError: null,
    status: "published",
    target: input.target,
    vpsNodeId: target.vpsNodeId,
  });

  // Mudou de endereço ou de servidor: o endereço antigo sairia do banco, mas continuaria no ar. Libera o antigo.
  if (
    previous &&
    (previous.domain !== domain || previous.vpsNodeId !== target.vpsNodeId)
  ) {
    // A linha do banco é a mesma (um registro por site) e já foi atualizada: só limpa o servidor e o DNS antigos.
    log.info("Endereço ou servidor mudou: limpando a publicação antiga", {
      dominioAntigo: previous.domain,
      dominioNovo: domain,
      servidorAntigo: previous.vpsNodeId,
      servidorNovo: target.vpsNodeId,
    });
    const cleanup = await takeDown(user.id, previous, input.password, {
      keepRecord: true,
    });
    if (!cleanup.ok) {
      log.error("Não foi possível limpar a publicação antiga", {
        dominioAntigo: previous.domain,
        erro: cleanup.error,
      });
    }
  }

  log.info("Publicação concluída", {
    domain,
    ms: Date.now() - startedAt,
    siteId: site.id,
  });
  return { domain, ok: true };
}

export async function savePublication(
  siteId: string,
  data: {
    domain: string;
    ip: string;
    kind: "domain" | "subdomain";
    lastError: string | null;
    status: "failed" | "published" | "suspended";
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
    suspendedAt: data.status === "suspended" ? now : null,
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
