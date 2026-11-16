import {
  getTemplate,
  type Site,
  type SiteTemplate,
  siteSchema,
} from "@repo/site-builder";
import { db } from "@/lib/db";
import { pgBuilderTemplateOverride } from "@/lib/db/schema";

/**
 * Versões dos templates editadas à mão pelo admin master (`builder_template_overrides`), por id.
 * Nunca derruba a tela: se a tabela ainda não existe (migration não aplicada) ou o conteúdo guardado
 * é inválido, o template do código vale — a galeria e a criação de sites continuam funcionando.
 */
export async function getTemplateOverrides(): Promise<Record<string, Site>> {
  let rows: { content: unknown; templateId: string }[];
  try {
    rows = await db
      .select({
        content: pgBuilderTemplateOverride.content,
        templateId: pgBuilderTemplateOverride.templateId,
      })
      .from(pgBuilderTemplateOverride);
  } catch (error) {
    console.error(
      "[templates] não foi possível ler as versões editadas:",
      error
    );
    return {};
  }
  const out: Record<string, Site> = {};
  for (const row of rows) {
    const parsed = siteSchema.safeParse(row.content);
    if (parsed.success) out[row.templateId] = parsed.data;
    else
      console.error(`[templates] versão editada inválida: ${row.templateId}`);
  }
  return out;
}

/** O template como os usuários o veem: a versão editada pelo master, se houver, senão a do código. */
export async function getEffectiveTemplate(
  id: string
): Promise<SiteTemplate | undefined> {
  const base = getTemplate(id);
  if (!base) return undefined;
  const override = (await getTemplateOverrides())[id];
  return override ? { ...base, site: override } : base;
}
