"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pgBuilderPublication } from "@/lib/db/schema";
import {
  FORBIDDEN_MESSAGE,
  getBuilderUser,
  hasComplimentaryAtlasHosting,
} from "@/lib/site-builder/access";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import { getAdminMode, resolveSiteActor } from "@/lib/site-builder/delegation";
import { publishLogger } from "@/lib/site-builder/publishLog";
import {
  currentPublication,
  type PublishInput,
  runPublish,
} from "@/lib/site-builder/runPublish";
import { takeDown } from "@/lib/site-builder/takedown";

const NEEDS_APPROVAL =
  "Este site é de um cliente e as suas alterações dependem de validação. Publicar fica para depois de aprovadas (ou com o dono).";

type Result<T = object> = ({ ok: true } & T) | { error: string; ok: false };

export type { PublishInput };

/**
 * Publica direto, sem passar pelo caixa. Vale para subdomínio grátis, domínio
 * que já é da conta e VPS do próprio cliente. Hospedagem paga na VM do Atlas é
 * recusada aqui pelo `runPublish` enquanto não houver assinatura — esse caminho
 * passa por `startPublishCheckout`.
 */
export async function publishSite(
  input: PublishInput
): Promise<Result<{ domain: string }>> {
  const user = await getBuilderUser();
  if (!user) {
    publishLogger(input.target).warn(
      "publishSite recusado: sem acesso ao Criador de Sites",
      {
        siteId: input.siteId,
      }
    );
    return { error: FORBIDDEN_MESSAGE, ok: false };
  }

  // O dono publica como sempre; um admin liberado pelo master publica como o dono (e só sem exigir aprovação).
  const actor = await resolveSiteActor(user, input.siteId);
  if (actor?.delegated && (await getAdminMode(user.id)) !== "auto") {
    return { error: NEEDS_APPROVAL, ok: false };
  }
  const result = await runPublish(
    actor
      ? { id: actor.owner.id, organizationId: actor.owner.organizationId }
      : { id: user.id, organizationId: user.organization?.id },
    input,
    {
      skipHostingCheck:
        input.target === "atlas_vm" && hasComplimentaryAtlasHosting(),
    }
  );
  if (!result.ok) return result;

  revalidatePath(`/criador-de-sites/${input.siteId}/publicar`);
  revalidatePath("/criador-de-sites");
  return result;
}

/** Tira o site do ar (servidor, Caddy e DNS) e libera o endereço para outro uso. */
export async function unpublishSite(input: {
  password?: string;
  siteId: string;
}): Promise<Result> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const actor = await resolveSiteActor(user, input.siteId);
  if (!actor) return { error: "Site não encontrado.", ok: false };
  if (actor.delegated && (await getAdminMode(user.id)) !== "auto") {
    return { error: NEEDS_APPROVAL, ok: false };
  }
  const site = actor.site;

  const publication = await currentPublication(site.id);
  if (!publication) return { ok: true };

  const result = await takeDown(actor.owner.id, publication, input.password, {
    detachOnSshFailure: true,
  });
  if (!result.ok) return result;
  revalidatePath(`/criador-de-sites/${site.id}/publicar`);
  revalidatePath("/criador-de-sites");
  return { ok: true };
}

/** Publica de novo no mesmo endereço e servidor da última publicação — usado pelo "Publicar agora" do editor. */
export async function republishSite(input: {
  password?: string;
  siteId: string;
}): Promise<Result<{ domain: string }>> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const actor = await resolveSiteActor(user, input.siteId);
  if (!actor) return { error: "Site não encontrado.", ok: false };
  const site = actor.site;

  const publication = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.siteId, site.id),
  });
  if (!publication) {
    publishLogger("-").warn(
      "Republicar recusado: o site ainda não tem publicação",
      {
        siteId: site.id,
      }
    );
    return { error: "Defina onde publicar este site primeiro.", ok: false };
  }
  publishLogger(publication.target).info("Republicando no mesmo endereço", {
    domain: publication.domain,
    passwordProvided: Boolean(input.password),
    siteId: site.id,
    vpsNodeId: publication.vpsNodeId,
  });

  const { baseDomain } = getAtlasHostingConfig();
  const label =
    publication.kind === "subdomain" && baseDomain
      ? publication.domain.replace(`.${baseDomain}`, "")
      : undefined;

  return publishSite({
    domain: publication.domain,
    kind: publication.kind,
    label,
    password: input.password,
    siteId: site.id,
    target: publication.target,
    vpsNodeId: publication.vpsNodeId ?? undefined,
  });
}
