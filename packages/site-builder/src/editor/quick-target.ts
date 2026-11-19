import type { FieldDef } from "../blocks/types.js";
import { parseMediaSource } from "../blocks/youtube.js";
import type { Post, Site } from "../model/index.js";
import { type FocusHint, matchItem } from "./Inspector.js";
import { resolveSiteItem } from "./site-items.js";
import { updateBlockProps } from "./tree.js";

const norm = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();

/** Onde está guardada a imagem ou o vídeo do elemento clicado no canvas. */
export type MediaTarget =
  | { field: FieldDef; key: string; kind: "block"; value: string }
  | {
      field: FieldDef;
      index: number;
      key: string;
      kind: "item";
      sub: string;
      value: string;
    }
  | { id: string; kind: "post"; value: string };

/** Como a mídia foi posta: imagem, link (YouTube, Instagram…) ou arquivo de vídeo importado. */
export type MediaMode = "image" | "imported" | "link";

export function mediaMode(value: string): MediaMode {
  const m = parseMediaSource(value);
  return m?.kind === "embed"
    ? "link"
    : m?.kind === "file"
      ? "imported"
      : "image";
}

const isMediaField = (f: FieldDef) => f.kind === "image" || f.kind === "media";

/** O valor do campo é a mídia clicada? Vídeo de link chega ao canvas só como ID/endereço do player. */
const sameMedia = (stored: unknown, want: string) => {
  const v = norm(stored);
  // Espaço ainda vazio (o bloco apontou o campo): é a mídia clicada se o campo está vazio.
  if (!want) return !v;
  return Boolean(v) && (v === want || (want.length >= 6 && v.includes(want)));
};

/**
 * Acha o campo que guarda a imagem ou o vídeo do elemento clicado: do bloco, de um item de lista do bloco ou a
 * capa de um post. Só devolve quando é um só; com dúvida (a mesma mídia em dois campos) devolve `null` e a edição
 * fica para o painel da direita.
 */
export function mediaTarget(input: {
  currentPost?: Post;
  defaults: Record<string, unknown>;
  fields: FieldDef[];
  hint: FocusHint;
  props: Record<string, unknown>;
  site: Site;
}): MediaTarget | null {
  const { currentPost, defaults, fields, hint, props, site } = input;
  const want = norm(hint.value);
  // Sem mídia ainda, só dá para achar o campo quando o bloco diz qual é (`data-sb-field`).
  if (!(want || hint.field)) return null;
  const stored = (key: string) => props[key] ?? defaults[key];
  const hits: MediaTarget[] = [];
  for (const m of matchItem(fields, props, defaults, hint)) {
    if (m.kind === "field") {
      const v = stored(m.field.key);
      if (isMediaField(m.field) && sameMedia(v, want))
        hits.push({
          field: m.field,
          key: m.field.key,
          kind: "block",
          value: String(v),
        });
      continue;
    }
    const items = stored(m.field.key);
    const item = Array.isArray(items)
      ? (items[m.index] as Record<string, unknown> | undefined)
      : undefined;
    const sub = (m.field.itemFields ?? []).find(
      f => isMediaField(f) && sameMedia(item?.[f.key], want)
    );
    if (item && sub)
      hits.push({
        field: sub,
        index: m.index,
        key: m.field.key,
        kind: "item",
        sub: sub.key,
        value: String(item[sub.key]),
      });
  }
  if (hits.length === 1) return hits[0] ?? null;
  if (hits.length > 1) return null;
  // Sem campo no bloco: a capa de um post (cards, manchetes) vem do post.
  const post = resolveSiteItem(site, hint, true, currentPost).post;
  if (post?.coverImage && sameMedia(post.coverImage, want))
    return { id: post.id, kind: "post", value: post.coverImage };
  return null;
}

/** Grava `value` no campo da mídia e devolve o site novo (vazio remove a mídia). */
export function applyMedia(
  site: Site,
  blockId: string,
  target: MediaTarget,
  value: string,
  block: { props: Record<string, unknown>; defaults: Record<string, unknown> }
): Site {
  if (target.kind === "post") {
    const next = structuredClone(site);
    const post = next.posts.find(p => p.id === target.id);
    if (post) post.coverImage = value || null;
    return next;
  }
  if (target.kind === "block")
    return updateBlockProps(site, blockId, { [target.key]: value });
  const items = block.props[target.key] ?? block.defaults[target.key];
  if (!Array.isArray(items)) return site;
  return updateBlockProps(site, blockId, {
    [target.key]: items.map((it, i) =>
      i === target.index ? { ...(it as object), [target.sub]: value } : it
    ),
  });
}
