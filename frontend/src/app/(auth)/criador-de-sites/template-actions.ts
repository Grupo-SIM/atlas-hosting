"use server";

import { getTemplate, siteSchema } from "@repo/site-builder";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pgBuilderTemplateOverride } from "@/lib/db/schema";
import {
  FORBIDDEN_MESSAGE,
  getTemplateEditor,
} from "@/lib/site-builder/access";
import { checkSiteContent } from "@/lib/site-builder/site-content";

type ActionResult = { aviso?: string; ok: true } | { error: string; ok: false };

const refresh = (templateId: string) => {
  revalidatePath("/criador-de-sites/novo");
  revalidatePath(`/criador-de-sites/preview/${templateId}`);
};

/**
 * Salva o **rascunho** do modo Dev (o editor chama sozinho a cada alteração). Clientes não veem: só
 * `publishTemplateDraft` torna a versão fixa. Só quem pode editar templates.
 */
export async function saveTemplateDraft(
  templateId: string,
  content: unknown
): Promise<ActionResult> {
  const user = await getTemplateEditor();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  if (!getTemplate(templateId)) {
    return { error: "Template não encontrado.", ok: false };
  }
  const parsed = checkSiteContent(content);
  if (!parsed.ok) return { error: parsed.error, ok: false };
  try {
    const draft = {
      draftContent: parsed.site,
      draftUpdatedAt: new Date(),
      draftUpdatedBy: user.id,
    };
    await db
      .insert(pgBuilderTemplateOverride)
      .values({ templateId, ...draft })
      .onConflictDoUpdate({
        set: draft,
        target: pgBuilderTemplateOverride.templateId,
      });
  } catch (error) {
    console.error("[templates] falha ao salvar o rascunho:", error);
    return { error: "Não foi possível salvar o rascunho.", ok: false };
  }
  return { aviso: parsed.aviso, ok: true };
}

/**
 * "Publicar no template": o rascunho vira a versão fixa. A partir daqui galeria, prévia e "Usar este template" entregam
 * esta versão (sites já criados não mudam). O rascunho é limpo.
 */
export async function publishTemplateDraft(
  templateId: string
): Promise<ActionResult> {
  const user = await getTemplateEditor();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  try {
    const published = await db.transaction(async tx => {
      const [row] = await tx
        .select({ draft: pgBuilderTemplateOverride.draftContent })
        .from(pgBuilderTemplateOverride)
        .where(eq(pgBuilderTemplateOverride.templateId, templateId))
        .for("update");
      const parsed = siteSchema.safeParse(row?.draft);
      if (!parsed.success) return false;
      await tx
        .update(pgBuilderTemplateOverride)
        .set({
          content: parsed.data,
          draftContent: null,
          draftUpdatedAt: null,
          draftUpdatedBy: null,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .where(eq(pgBuilderTemplateOverride.templateId, templateId));
      return true;
    });
    if (!published) {
      return { error: "Não há alterações salvas para publicar.", ok: false };
    }
  } catch (error) {
    console.error("[templates] falha ao publicar o rascunho:", error);
    return { error: "Não foi possível publicar o template.", ok: false };
  }
  refresh(templateId);
  return { ok: true };
}

/** Joga fora o rascunho: o editor volta a mostrar a versão fixa (ou a do código, se nunca foi publicada). */
export async function discardTemplateDraft(
  templateId: string
): Promise<ActionResult> {
  const user = await getTemplateEditor();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  try {
    await db
      .update(pgBuilderTemplateOverride)
      .set({ draftContent: null, draftUpdatedAt: null, draftUpdatedBy: null })
      .where(eq(pgBuilderTemplateOverride.templateId, templateId));
    // Linha que só tinha rascunho (nunca publicada) não serve para nada: sai.
    await db
      .delete(pgBuilderTemplateOverride)
      .where(
        and(
          eq(pgBuilderTemplateOverride.templateId, templateId),
          isNull(pgBuilderTemplateOverride.content)
        )
      );
  } catch (error) {
    console.error("[templates] falha ao descartar o rascunho:", error);
    return { error: "Não foi possível descartar o rascunho.", ok: false };
  }
  refresh(templateId);
  return { ok: true };
}

/** "Descartar edições": apaga a versão fixa **e** o rascunho; o template volta a ser o do código. */
export async function resetTemplateOverride(
  templateId: string
): Promise<ActionResult> {
  const user = await getTemplateEditor();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  try {
    await db
      .delete(pgBuilderTemplateOverride)
      .where(eq(pgBuilderTemplateOverride.templateId, templateId));
  } catch (error) {
    console.error("[templates] falha ao descartar a versão editada:", error);
    return { error: "Não foi possível restaurar o template.", ok: false };
  }
  refresh(templateId);
  return { ok: true };
}
