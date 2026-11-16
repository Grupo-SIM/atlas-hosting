"use server";

import { getTemplate, siteSchema } from "@repo/site-builder";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pgBuilderTemplateOverride } from "@/lib/db/schema";
import {
  FORBIDDEN_MESSAGE,
  getTemplateEditor,
} from "@/lib/site-builder/access";

type ActionResult = { ok: true } | { error: string; ok: false };

const refresh = (templateId: string) => {
  revalidatePath("/criador-de-sites/novo");
  revalidatePath(`/criador-de-sites/preview/${templateId}`);
};

/** Grava a versão do template editada à mão. Só o admin master; sites já criados não mudam. */
export async function saveTemplateOverride(
  templateId: string,
  content: unknown
): Promise<ActionResult> {
  const user = await getTemplateEditor();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  if (!getTemplate(templateId)) {
    return { error: "Template não encontrado.", ok: false };
  }
  const parsed = siteSchema.safeParse(content);
  if (!parsed.success) {
    return {
      error: "O conteúdo do template é inválido e não foi salvo.",
      ok: false,
    };
  }
  try {
    await db
      .insert(pgBuilderTemplateOverride)
      .values({ content: parsed.data, templateId, updatedBy: user.id })
      .onConflictDoUpdate({
        set: {
          content: parsed.data,
          updatedAt: new Date(),
          updatedBy: user.id,
        },
        target: pgBuilderTemplateOverride.templateId,
      });
  } catch (error) {
    console.error("[templates] falha ao salvar a versão editada:", error);
    return { error: "Não foi possível salvar o template.", ok: false };
  }
  refresh(templateId);
  return { ok: true };
}

/** Descarta a versão editada: o template volta a ser o do código. Só o admin master. */
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
