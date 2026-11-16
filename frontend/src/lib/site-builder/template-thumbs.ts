import { peekTemplate, thumbnailHash } from "@repo/site-builder";
import manifest from "./template-thumbs.json";

interface ManifestEntry {
  h: number;
  hash: string;
  w: number;
}

const entries = manifest as Record<string, ManifestEntry>;
/** Hash atual de cada template (o código não muda durante o processo, então calcula uma vez). */
const current = new Map<string, string>();

export interface TemplateThumb {
  h: number;
  src: string;
  w: number;
}

/**
 * Miniatura pré-gerada (WebP) de um template, ou `null` se não há ou se está velha: o hash guardado em
 * `template-thumbs.json` é do que a miniatura mostrava quando a imagem foi gerada (`scripts/template-thumbs.mjs`).
 * Template mudou e a imagem não foi refeita → `null` e a galeria usa a miniatura ao vivo, que nunca fica errada.
 * O `?v=hash` deixa a imagem em cache para sempre sem servir versão antiga.
 */
export function templateThumb(id: string): TemplateThumb | null {
  const entry = entries[id];
  const site = peekTemplate(id)?.site;
  if (!(entry && site)) return null;
  let hash = current.get(id);
  if (!hash) {
    hash = thumbnailHash(site);
    current.set(id, hash);
  }
  if (hash !== entry.hash) return null;
  return {
    h: entry.h,
    src: `/template-thumbs/${id}.webp?v=${entry.hash}`,
    w: entry.w,
  };
}
