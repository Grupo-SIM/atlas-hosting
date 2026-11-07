import { getBlockDefinition } from "../blocks/registry.js";
import type { Block, Site } from "../model/index.js";
import { allRoots, rootLabel } from "./tree.js";

/** `value` aponta para a página/post `slug`? Aceita `/slug`, `/slug/`, com `?consulta` ou `#âncora`. */
export function pointsTo(value: unknown, slug: string): boolean {
  if (typeof value !== "string" || !slug) return false;
  const path = value.trim().split(/[?#]/)[0] ?? "";
  return path.replace(/\/+$/, "") === `/${slug}`;
}

/** Percorre strings de props (objetos e listas aninhados) trocando as que `map` devolver. */
function mapStrings(
  value: unknown,
  map: (s: string) => string | undefined
): unknown {
  if (typeof value === "string") return map(value) ?? value;
  if (Array.isArray(value)) return value.map(v => mapStrings(v, map));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, mapStrings(v, map)])
    );
  }
  return value;
}

function anyString(value: unknown, test: (s: string) => boolean): boolean {
  if (typeof value === "string") return test(value);
  if (Array.isArray(value)) return value.some(v => anyString(v, test));
  if (value && typeof value === "object") {
    return Object.values(value).some(v => anyString(v, test));
  }
  return false;
}

/** Onde o site usa a página/post `slug` como link (menu e campos de link dos blocos), em texto legível. */
export function findLinkRefs(site: Site, slug: string): string[] {
  const found: string[] = [];
  const add = (where: string) => {
    if (!found.includes(where)) found.push(where);
  };
  for (const item of site.menu) {
    if (pointsTo(item.href, slug)) add(`Menu · ${item.label}`);
    for (const child of item.children ?? []) {
      if (pointsTo(child.href, slug))
        add(`Menu · ${item.label} › ${child.label}`);
    }
  }
  const walk = (blocks: Block[], where: string) => {
    for (const block of blocks) {
      if (anyString(block.props, s => pointsTo(s, slug))) {
        add(
          `${where} · ${getBlockDefinition(block.type)?.label ?? block.type}`
        );
      }
      if (block.children) walk(block.children, where);
    }
  };
  for (const [key, blocks] of allRoots(site))
    walk(blocks, rootLabel(site, key));
  return found;
}

/**
 * Troca, em todo o site, os links para `slug` por `href`. Com `href` vazio ("sem link"): os campos de
 * link dos blocos ficam vazios e os itens do menu que apontavam para a página são removidos.
 */
export function relinkSite(site: Site, slug: string, href: string): Site {
  const next = structuredClone(site);
  const swap = (s: string) => (pointsTo(s, slug) ? href : undefined);

  next.menu = next.menu
    .map(item => ({
      ...item,
      children: item.children
        ?.map(c => (pointsTo(c.href, slug) ? { ...c, href } : c))
        .filter(c => c.href !== ""),
      href: pointsTo(item.href, slug) ? href : item.href,
    }))
    .filter(item => item.href !== "" || item.dynamic);

  const visit = (blocks: Block[]) => {
    for (const block of blocks) {
      block.props = mapStrings(block.props, swap) as Block["props"];
      if (block.children) visit(block.children);
    }
  };
  for (const [, blocks] of allRoots(next)) visit(blocks);
  return next;
}
