"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  pgBuilderHostingSubscription,
  pgBuilderPublication,
  pgBuilderPublishJob,
  pgInvoice,
  pgOrganizationDomains,
  type SiteHostingInvoiceData,
} from "@/lib/db/schema";
import { normalizeDomainName } from "@/lib/server/domains/authorization";
import {
  type DomainQuote,
  quoteDomainList,
} from "@/lib/server/domains/pricing";
import {
  FORBIDDEN_MESSAGE,
  getBuilderUser,
  hasComplimentaryAtlasHosting,
} from "@/lib/site-builder/access";
import { assertValidDomain } from "@/lib/site-builder/caddy";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import {
  assertEligibleVpsNode,
  listPublishTargets,
  type PublishTargets,
} from "@/lib/site-builder/eligibility";
import { LABEL_RE, ownedSite, runPublish } from "@/lib/site-builder/runPublish";
import { publishDomainCandidates } from "./publish-domain-candidates";

type Result<T = object> = ({ ok: true } & T) | { error: string; ok: false };

export interface PublishCheckoutInput {
  /** Domínio da conta (`kind: "domain"`) ou domínio a comprar (`kind: "buy"`). */
  domain?: string;
  kind: "buy" | "domain" | "subdomain";
  /** Parte antes do domínio base do Atlas (`kind: "subdomain"`). */
  label?: string;
  /** Senha SSH para publicar agora numa VPS do cliente (não é gravada). */
  password?: string;
  siteId: string;
  target: "atlas_vm" | "user_vps";
  vpsNodeId?: string;
  /** Anos de registro do domínio comprado (padrão 1). */
  years?: string;
}

/** Opções de servidor e preço da hospedagem, para montar a tela de publicar. */
export async function getPublishOptions(): Promise<
  Result<{ targets: PublishTargets }>
> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  return { ok: true, targets: await listPublishTargets(user.id) };
}

/**
 * Busca de domínio dentro do fluxo de publicar: devolve o domínio digitado e
 * sugestões de TLD com o **mesmo preço** que a fatura vai cobrar.
 */
export async function searchDomainsForPublish(
  query: string
): Promise<Result<{ results: DomainQuote[] }>> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };

  const clean = query
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "");
  const name = (clean.includes(".") ? clean.split(".")[0] : clean).replace(
    /[^a-z0-9-]/g,
    ""
  );
  if (name.length < 2) {
    return { error: "Digite pelo menos 2 letras.", ok: false };
  }

  const wanted = clean.includes(".") ? [clean] : [];
  const domains = publishDomainCandidates(clean);

  try {
    const results = await quoteDomainList({ domains });
    // O domínio digitado primeiro; depois disponíveis, depois o resto.
    results.sort((a, b) => {
      if (wanted[0] === a.domain) return -1;
      if (wanted[0] === b.domain) return 1;
      return Number(b.available) - Number(a.available);
    });
    return { ok: true, results };
  } catch (error) {
    console.error("[PUBLICAR] Falha na busca de domínio:", error);
    return {
      error: "Não foi possível consultar os domínios agora. Tente de novo.",
      ok: false,
    };
  }
}

/**
 * Monta o pedido de publicação. Quando não há nada a cobrar (subdomínio grátis
 * ou domínio que já é da conta, na VPS do próprio cliente) publica na hora.
 * Caso contrário cria **uma** fatura com o domínio e/ou o primeiro mês da
 * hospedagem, mais a reserva em `builder_publish_jobs`, e manda o cliente ao
 * checkout — o site só sobe depois do pagamento confirmado.
 */
export async function startPublishCheckout(
  input: PublishCheckoutInput
): Promise<
  Result<{
    /** Para onde mandar o cliente quando há algo a pagar. */
    checkoutUrl?: string;
    domain: string;
    invoiceId?: string;
    /** `true` quando o site já subiu, sem cobrança. */
    published?: boolean;
  }>
> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  if (!user.organization) {
    return { error: "Sua conta não tem organização.", ok: false };
  }

  const site = await ownedSite(input.siteId, user.id);
  if (!site) return { error: "Site não encontrado.", ok: false };

  const config = getAtlasHostingConfig();
  const targets = await listPublishTargets(user.id);

  // 1) Endereço escolhido.
  let domain: string;
  let domainQuote: DomainQuote | undefined;
  try {
    if (input.kind === "subdomain") {
      const label = (input.label ?? "").trim().toLowerCase();
      if (!(config.subdomainEnabled && config.baseDomain)) {
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
    } else {
      domain = assertValidDomain(normalizeDomainName(input.domain ?? ""));
    }
  } catch {
    return { error: "Endereço inválido.", ok: false };
  }

  if (input.kind === "domain") {
    const owned = await db.query.pgOrganizationDomains.findFirst({
      where: and(
        eq(pgOrganizationDomains.organizationId, user.organization.id),
        eq(pgOrganizationDomains.domain, domain),
        eq(pgOrganizationDomains.active, true),
        eq(pgOrganizationDomains.dnsMode, "cloudflare")
      ),
    });
    if (!owned) {
      return {
        error:
          "Esse domínio não está na sua conta com DNS gerenciado pelo Atlas.",
        ok: false,
      };
    }
  }

  if (input.kind === "buy") {
    const [quote] = await quoteDomainList({
      domains: [domain],
      years: input.years,
    });
    if (!quote?.available) {
      return {
        error: "Esse domínio não está mais disponível para registro.",
        ok: false,
      };
    }
    domainQuote = quote;
  }

  // 2) Endereço não pode estar com outro site.
  const taken = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.domain, domain),
  });
  if (taken && taken.siteId !== site.id) {
    return { error: "Esse endereço já está em uso por outro site.", ok: false };
  }

  // 3) Servidor: VM do Atlas (paga) ou VPS do cliente (precisa ser nossa e em dia).
  let hostingAmountBrl: number | undefined;
  const complimentaryAtlasHosting = hasComplimentaryAtlasHosting(user);
  if (input.target === "atlas_vm") {
    if (!targets.atlasVm.enabled || !targets.atlasVm.monthlyBrl) {
      return {
        error: "A hospedagem na VM do Atlas não está disponível agora.",
        ok: false,
      };
    }
    const existing = await db.query.pgBuilderHostingSubscription.findFirst({
      where: eq(pgBuilderHostingSubscription.siteId, site.id),
    });
    // Já paga: republicar não cobra de novo.
    hostingAmountBrl =
      complimentaryAtlasHosting || (existing && existing.status !== "cancelled")
        ? undefined
        : targets.atlasVm.monthlyBrl;
  } else {
    const eligible = await assertEligibleVpsNode(user.id, input.vpsNodeId);
    if ("error" in eligible) return { error: eligible.error, ok: false };
  }

  const publishKind = input.kind === "subdomain" ? "subdomain" : "domain";
  const total = (domainQuote?.priceBrl ?? 0) + (hostingAmountBrl ?? 0);

  // 4) Nada a cobrar: publica agora, como sempre foi.
  if (total <= 0) {
    const result = await runPublish(
      { id: user.id, organizationId: user.organization.id },
      {
        domain,
        kind: publishKind,
        label: input.label,
        password: input.password,
        siteId: site.id,
        target: input.target,
        vpsNodeId: input.vpsNodeId,
      },
      {
        skipHostingCheck:
          input.target === "atlas_vm" && complimentaryAtlasHosting,
      }
    );
    if (!result.ok) return result;
    revalidatePath(`/criador-de-sites/${site.id}/publicar`);
    revalidatePath("/criador-de-sites");
    return { domain: result.domain, ok: true, published: true };
  }

  // 5) Uma fatura com o que foi escolhido + reserva da entrega.
  const siteHosting: SiteHostingInvoiceData = {
    domain,
    domainAmountBrl: domainQuote?.priceBrl,
    hostingAmountBrl,
    kind: publishKind,
    label: input.kind === "subdomain" ? input.label : undefined,
    siteId: site.id,
    target: input.target,
    vpsNodeId: input.target === "user_vps" ? input.vpsNodeId : undefined,
  };

  const descriptionParts = [
    domainQuote ? `Registro de ${domain}` : null,
    hostingAmountBrl ? `Hospedagem do site ${site.name} (1 mês)` : null,
  ].filter(Boolean);

  try {
    const invoiceId = await db.transaction(async tx => {
      const [invoice] = await tx
        .insert(pgInvoice)
        .values({
          amount: Number(total.toFixed(2)),
          description: descriptionParts.join(" + "),
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: {
            siteHosting,
            whoisguard: "true",
            years: String(domainQuote?.years ?? 1),
            ...(domainQuote
              ? {
                  namecheapCostBrl: domainQuote.namecheapCostBrl,
                  namecheapCostUsd: domainQuote.namecheapCostUsd,
                }
              : {}),
          },
          orgId: user.organization.id,
          // Fatura de domínio é identificada pelo `reference`: é dele que
          // `domainNamesFromInvoice` tira o que registrar na Namecheap.
          reference: domainQuote ? domain : `SITE-${site.id}`,
          status: "pending",
          type: domainQuote ? "domain" : "subscription",
          userId: user.id,
        })
        .returning();
      if (!invoice) throw new Error("Falha ao criar a fatura.");

      await tx
        .insert(pgBuilderPublishJob)
        .values({
          invoiceId: invoice.id,
          payload: {
            domain,
            hostingAmountBrl,
            kind: publishKind,
            label: siteHosting.label,
            target: input.target,
            vpsNodeId: siteHosting.vpsNodeId,
          },
          siteId: site.id,
          status: "pending",
        })
        .onConflictDoNothing();

      return invoice.id;
    });

    return {
      checkoutUrl: `/checkout/${invoiceId}`,
      domain,
      invoiceId,
      ok: true,
    };
  } catch (error) {
    console.error("[PUBLICAR] Falha ao criar o pedido:", error);
    return {
      error: "Não foi possível criar o pedido. Tente de novo.",
      ok: false,
    };
  }
}

/** Como está a entrega da última publicação paga deste site (para o polling da tela). */
export async function getPublishJobStatus(siteId: string): Promise<
  Result<{
    job: {
      error: string | null;
      invoiceId: string;
      status: "pending" | "running" | "done" | "failed";
    } | null;
    publishedDomain: string | null;
  }>
> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const site = await ownedSite(siteId, user.id);
  if (!site) return { error: "Site não encontrado.", ok: false };

  const [job, publication] = await Promise.all([
    db.query.pgBuilderPublishJob.findFirst({
      orderBy: (table, { desc }) => desc(table.createdAt),
      where: eq(pgBuilderPublishJob.siteId, site.id),
    }),
    db.query.pgBuilderPublication.findFirst({
      where: eq(pgBuilderPublication.siteId, site.id),
    }),
  ]);

  return {
    job: job
      ? { error: job.error, invoiceId: job.invoiceId, status: job.status }
      : null,
    ok: true,
    publishedDomain:
      publication?.status === "published" ? publication.domain : null,
  };
}
