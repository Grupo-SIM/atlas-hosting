"use server";

import { getTemplate, siteSchema } from "@repo/site-builder";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import { FORBIDDEN_MESSAGE, getBuilderUser } from "@/lib/site-builder/access";
import { takeDown } from "@/lib/site-builder/takedown";
import { getStorjUrl, uploadSiteBuilderImage } from "@/lib/storj";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type ActionResult = { ok: true } | { error: string; ok: false };

/** Cria o site do usuário a partir de um template. A tela de configuração publica e abre o editor depois. */
export async function createSite(input: {
  name: string;
  templateId: string;
}): Promise<{ ok: true; siteId: string } | { error: string; ok: false }> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };

  const template = getTemplate(input.templateId);
  if (!template) return { error: "Template não encontrado.", ok: false };

  const name = input.name.trim();
  if (name.length === 0 || name.length > 120) {
    return { error: "Informe um nome de até 120 caracteres.", ok: false };
  }

  const [site] = await db
    .insert(pgBuilderSite)
    .values({
      content: { ...template.site, name },
      name,
      templateId: template.id,
      userId: user.id,
    })
    .returning({ id: pgBuilderSite.id });

  revalidatePath("/criador-de-sites");
  return { ok: true, siteId: site.id };
}

export async function deleteSite(formData: FormData): Promise<ActionResult> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const siteId = String(formData.get("siteId") ?? "");

  // Excluir o site não pode deixá-lo no ar sem dono: tira do servidor e do DNS antes.
  const [owned] = await db
    .select({ id: pgBuilderSite.id })
    .from(pgBuilderSite)
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, user.id)))
    .limit(1);
  const publication = owned
    ? await db.query.pgBuilderPublication.findFirst({
        where: eq(pgBuilderPublication.siteId, owned.id),
      })
    : undefined;
  if (publication) {
    const result = await takeDown(user.id, publication);
    if (!result.ok) return result;
  }

  await db
    .delete(pgBuilderSite)
    .where(
      and(
        eq(pgBuilderSite.id, String(formData.get("siteId") ?? "")),
        eq(pgBuilderSite.userId, user.id)
      )
    );
  revalidatePath("/criador-de-sites");
  return { ok: true };
}

/** Grava o site editado. O editor roda no navegador, então o conteúdo é revalidado aqui. */
export async function saveSite(
  siteId: string,
  content: unknown
): Promise<ActionResult> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };

  const parsed = siteSchema.safeParse(content);
  if (!parsed.success) {
    return {
      error: "O conteúdo do site é inválido e não foi salvo.",
      ok: false,
    };
  }

  const updated = await db
    .update(pgBuilderSite)
    .set({
      content: parsed.data,
      name: parsed.data.name,
      updatedAt: new Date(),
    })
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, user.id)))
    .returning({ id: pgBuilderSite.id });

  if (updated.length === 0) {
    return { error: "Site não encontrado.", ok: false };
  }
  return { ok: true };
}

/** Envia uma imagem do editor e devolve a URL pública. */
export async function uploadSiteImage(
  formData: FormData
): Promise<{ ok: true; url: string } | { error: string; ok: false }> {
  if (!(await getBuilderUser())) {
    return { error: FORBIDDEN_MESSAGE, ok: false };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return { error: "Envie um arquivo de imagem.", ok: false };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "A imagem deve ter no máximo 8 MB.", ok: false };
  }

  try {
    const key = await uploadSiteBuilderImage(await file.arrayBuffer());
    const url = getStorjUrl(key);
    if (!url) return { error: "Não foi possível enviar a imagem.", ok: false };
    return { ok: true, url };
  } catch (error) {
    console.error("Erro no upload de imagem do Criador de Sites:", error);
    return { error: "Não foi possível enviar a imagem.", ok: false };
  }
}
