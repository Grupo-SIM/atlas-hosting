import { createBlock } from "../blocks/registry.js";
import { cleanFx } from "../model/fx.js";
import type { Block, Fx, Site } from "../model/index.js";
import type { Route } from "../renderer/routes.js";

/**
 * Cada "raiz" é uma lista de blocos editável do site:
 * `header`, `footer`, `postLayout`, `categoryLayout`, `page:<id>` ou `post:<id>`.
 */
export type RootKey = string;

export const rootLabel = (site: Site, key: RootKey): string => {
  if (key === "header") return "Cabeçalho";
  if (key === "footer") return "Rodapé";
  if (key === "postLayout") return "Layout dos posts";
  if (key === "categoryLayout") return "Layout das categorias";
  if (key.startsWith("page:"))
    return site.pages.find(p => p.id === key.slice(5))?.title ?? "Página";
  if (key.startsWith("post:"))
    return `Post: ${site.posts.find(p => p.id === key.slice(5))?.title ?? ""}`;
  return key;
};

export function rootBlocks(site: Site, key: RootKey): Block[] | undefined {
  if (key === "header") return site.header;
  if (key === "footer") return site.footer;
  if (key === "postLayout") return site.postLayout;
  if (key === "categoryLayout") return site.categoryLayout;
  if (key.startsWith("page:"))
    return site.pages.find(p => p.id === key.slice(5))?.blocks;
  if (key.startsWith("post:"))
    return site.posts.find(p => p.id === key.slice(5))?.blocks;
  return undefined;
}

export function allRoots(site: Site): [RootKey, Block[]][] {
  return [
    ["header", site.header],
    ["footer", site.footer],
    ["postLayout", site.postLayout],
    ["categoryLayout", site.categoryLayout],
    ...site.pages.map(p => [`page:${p.id}`, p.blocks] as [string, Block[]]),
    ...site.posts.map(p => [`post:${p.id}`, p.blocks] as [string, Block[]]),
  ];
}

/** Raiz que o usuário edita ao abrir cada rota. */
export function rootForRoute(route: Route): RootKey {
  switch (route.kind) {
    case "page":
      return `page:${route.page.id}`;
    case "post":
      return `post:${route.post.id}`;
    case "category":
      return "categoryLayout";
    default:
      return "header";
  }
}

interface Located {
  index: number;
  list: Block[];
}

function locateIn(list: Block[], id: string): Located | undefined {
  for (let index = 0; index < list.length; index++) {
    const block = list[index];
    if (!block) continue;
    if (block.id === id) return { index, list };
    const inner = block.children ? locateIn(block.children, id) : undefined;
    if (inner) return inner;
  }
  return undefined;
}

function locate(site: Site, id: string): Located | undefined {
  for (const [, blocks] of allRoots(site)) {
    const found = locateIn(blocks, id);
    if (found) return found;
  }
  return undefined;
}

export function findBlock(site: Site, id: string): Block | undefined {
  const at = locate(site, id);
  return at?.list[at.index];
}

/** Raiz que contém o bloco — para o canvas saber qual lista destacar. */
export function rootOf(site: Site, id: string): RootKey | undefined {
  return allRoots(site).find(([, blocks]) => locateIn(blocks, id))?.[0];
}

function pathIn(
  list: Block[],
  id: string,
  trail: Block[]
): Block[] | undefined {
  for (const block of list) {
    if (block.id === id) return trail;
    const inner = block.children
      ? pathIn(block.children, id, [...trail, block])
      : undefined;
    if (inner) return inner;
  }
  return undefined;
}

/** Ancestrais do bloco (do mais externo ao pai) e a raiz que o contém. */
export function ancestorsOf(
  site: Site,
  id: string
): { ancestors: Block[]; root: RootKey } | undefined {
  for (const [key, blocks] of allRoots(site)) {
    const ancestors = pathIn(blocks, id, []);
    if (ancestors) return { ancestors, root: key };
  }
  return undefined;
}

const clone = (site: Site): Site => structuredClone(site);

export function updateBlockProps(
  site: Site,
  id: string,
  patch: Record<string, unknown>
): Site {
  const next = clone(site);
  const block = findBlock(next, id);
  if (block) block.props = { ...block.props, ...patch };
  return next;
}

/** `undefined`/vazio apaga a propriedade de estilo. */
export function updateBlockStyle(
  site: Site,
  id: string,
  patch: Record<string, string | number | undefined>
): Site {
  const next = clone(site);
  const block = findBlock(next, id);
  if (!block) return site;
  const style = { ...(block.style ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === "") delete style[key];
    else style[key] = value;
  }
  block.style = Object.keys(style).length ? style : undefined;
  return next;
}

export function updateElementStyle(
  site: Site,
  id: string,
  path: string,
  patch: Record<string, string | number | undefined>
): Site {
  const next = clone(site);
  const block = findBlock(next, id);
  if (!block) return site;
  const all = { ...(block.elStyles ?? {}) };
  const style = { ...(all[path] ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === "") delete style[key];
    else style[key] = value;
  }
  if (Object.keys(style).length) all[path] = style;
  else delete all[path];
  block.elStyles = Object.keys(all).length ? all : undefined;
  return next;
}

/** Mescla `patch` nos efeitos do item (`path` vazio = bloco); `undefined` apaga o campo. */
export function updateBlockFx(
  site: Site,
  id: string,
  path: string,
  patch: Partial<Record<keyof Fx, Fx[keyof Fx]>>
): Site {
  const next = clone(site);
  const block = findBlock(next, id);
  if (!block) return site;
  const all = { ...(block.fx ?? {}) };
  const fx: Record<string, unknown> = { ...(all[path] ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === false || value === 0) delete fx[key];
    else fx[key] = value;
  }
  const cleaned = cleanFx(fx as Fx);
  if (cleaned) all[path] = cleaned;
  else delete all[path];
  block.fx = Object.keys(all).length ? all : undefined;
  return next;
}

export function setBlockHidden(site: Site, id: string, hidden: boolean): Site {
  const next = clone(site);
  const block = findBlock(next, id);
  if (!block) return site;
  block.hidden = hidden || undefined;
  return next;
}

export function removeBlock(site: Site, id: string): Site {
  const next = clone(site);
  const at = locate(next, id);
  at?.list.splice(at.index, 1);
  return next;
}

export function moveBlock(site: Site, id: string, delta: -1 | 1): Site {
  const next = clone(site);
  const at = locate(next, id);
  if (!at) return site;
  const target = at.index + delta;
  if (target < 0 || target >= at.list.length) return site;
  const [moved] = at.list.splice(at.index, 1);
  if (moved) at.list.splice(target, 0, moved);
  return next;
}

function withNewIds(block: Block): Block {
  const copy = createBlock(block.type);
  return {
    ...copy,
    children: block.children?.map(withNewIds),
    elStyles: block.elStyles ? structuredClone(block.elStyles) : undefined,
    fx: block.fx ? structuredClone(block.fx) : undefined,
    hidden: block.hidden,
    props: structuredClone(block.props),
    style: block.style ? structuredClone(block.style) : undefined,
  };
}

export function duplicateBlock(
  site: Site,
  id: string
): { id?: string; site: Site } {
  const next = clone(site);
  const at = locate(next, id);
  const source = at?.list[at.index];
  if (!at || !source) return { site };
  const copy = withNewIds(source);
  at.list.splice(at.index + 1, 0, copy);
  return { id: copy.id, site: next };
}

/** Insere depois do bloco selecionado (se for da mesma raiz) ou no fim da raiz. */
export function insertBlock(
  site: Site,
  key: RootKey,
  type: string,
  afterId?: string
): { id: string; site: Site } {
  const next = clone(site);
  const list = rootBlocks(next, key);
  const block = createBlock(type);
  if (!list) return { id: block.id, site };
  const at = afterId ? locateIn(list, afterId) : undefined;
  if (at) at.list.splice(at.index + 1, 0, block);
  else list.push(block);
  return { id: block.id, site: next };
}
