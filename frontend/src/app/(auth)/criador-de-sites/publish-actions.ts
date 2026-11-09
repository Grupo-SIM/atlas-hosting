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
import {
  currentPublication,
  ownedSite,
  type PublishInput,
  runPublish,
} from "@/lib/site-builder/runPublish";
import { takeDown } from "@/lib/site-builder/takedown";

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
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };

  const result = await runPublish(
    { id: user.id, organizationId: user.organization?.id },
    input,
    {
      skipHostingCheck:
        input.target === "atlas_vm" && hasComplimentaryAtlasHosting(user),
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
  const site = await ownedSite(input.siteId, user.id);
  if (!site) return { error: "Site não encontrado.", ok: false };

  const publication = await currentPublication(site.id);
  if (!publication) return { ok: true };

  const result = await takeDown(user.id, publication, input.password);
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
  const site = await ownedSite(input.siteId, user.id);
  if (!site) return { error: "Site não encontrado.", ok: false };

  const publication = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.siteId, site.id),
  });
  if (!publication) {
    return { error: "Defina onde publicar este site primeiro.", ok: false };
  }

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
