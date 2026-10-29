import type { SiteTemplate, TemplateMeta } from "../model/index.js";
import { spyhacker } from "./spyhacker/index.js";

const templates: SiteTemplate[] = [spyhacker];

export const listTemplates = (): TemplateMeta[] =>
  templates.map(({ description, id, name, preview, site, tags }) => ({
    description,
    id,
    name,
    pageCount: site.pages.length,
    preview,
    tags,
  }));

/** Cópia profunda — o site do usuário nunca compartilha referência com o seed. */
export function getTemplate(id: string): SiteTemplate | undefined {
  const found = templates.find(t => t.id === id);
  return found ? structuredClone(found) : undefined;
}
