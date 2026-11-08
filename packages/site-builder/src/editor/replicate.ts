import { getBlockDefinition } from "../blocks/registry.js";
import type { Block, Fx, Site } from "../model/index.js";

/**
 * "Replicar para os outros posts": o que mudou num bloco de um post e que faz sentido valer para os
 * mesmos blocos dos outros posts — aparência e opções, nunca o conteúdo (texto, imagem, link, listas).
 */
export interface Replica {
  /** Estilos por elemento: caminho → chave → valor (`undefined` = removido). */
  el: Record<string, Record<string, string | number | undefined>>;
  /** Efeitos por item (chave `""` = bloco); `undefined` = removido. */
  fx: Record<string, Fx | undefined>;
  hidden?: boolean;
  /** Opções do bloco (campos select, número e cor). */
  props: Record<string, unknown>;
  style: Record<string, string | number | undefined>;
}

/** Campos que são escolha de aparência/comportamento, não conteúdo próprio de cada post. */
const OPTION_KINDS = new Set(["color", "number", "select"]);

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function diffRecord<T>(
  before: Record<string, T> | undefined,
  after: Record<string, T> | undefined
): Record<string, T | undefined> {
  const out: Record<string, T | undefined> = {};
  const keys = new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);
  for (const key of keys) {
    if (!same(before?.[key], after?.[key])) out[key] = after?.[key];
  }
  return out;
}

/** O que mudou de `before` para `after` (o mesmo bloco) que pode ser replicado; `undefined` = nada. */
export function diffBlock(before: Block, after: Block): Replica | undefined {
  const fields = getBlockDefinition(after.type)?.fields ?? [];
  const props: Record<string, unknown> = {};
  for (const f of fields) {
    if (
      OPTION_KINDS.has(f.kind) &&
      !same(before.props[f.key], after.props[f.key])
    )
      props[f.key] = after.props[f.key];
  }
  const el: Replica["el"] = {};
  const paths = new Set([
    ...Object.keys(before.elStyles ?? {}),
    ...Object.keys(after.elStyles ?? {}),
  ]);
  for (const path of paths) {
    const d = diffRecord(before.elStyles?.[path], after.elStyles?.[path]);
    if (Object.keys(d).length) el[path] = d;
  }
  const replica: Replica = {
    el,
    fx: diffRecord(before.fx, after.fx),
    props,
    style: diffRecord(before.style, after.style),
  };
  if (Boolean(before.hidden) !== Boolean(after.hidden))
    replica.hidden = Boolean(after.hidden);
  return isEmpty(replica) ? undefined : replica;
}

const isEmpty = (r: Replica) =>
  !Object.keys(r.el).length &&
  !Object.keys(r.fx).length &&
  !Object.keys(r.props).length &&
  !Object.keys(r.style).length &&
  r.hidden === undefined;

/** Descrição curta do que vai ser replicado, para o modal. */
export function describeReplica(type: string, r: Replica): string {
  const fields = getBlockDefinition(type)?.fields ?? [];
  const parts: string[] = [];
  if (Object.keys(r.style).length) parts.push("estilo do bloco");
  if (Object.keys(r.el).length) parts.push("estilo dos itens");
  if (Object.keys(r.fx).length) parts.push("efeitos");
  if (r.hidden !== undefined) parts.push(r.hidden ? "ocultar" : "mostrar");
  for (const key of Object.keys(r.props)) {
    parts.push(`“${fields.find(f => f.key === key)?.label ?? key}”`);
  }
  return parts.join(", ");
}

/** Caminho de índices do bloco dentro da lista (e dos filhos). */
export function blockPath(list: Block[], id: string): number[] | undefined {
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    if (!b) continue;
    if (b.id === id) return [i];
    const inner = b.children ? blockPath(b.children, id) : undefined;
    if (inner) return [i, ...inner];
  }
  return undefined;
}

function atPath(list: Block[], path: number[]): Block | undefined {
  let cur: Block | undefined;
  let level: Block[] | undefined = list;
  for (const i of path) {
    cur = level?.[i];
    level = cur?.children;
  }
  return cur;
}

function ofType(list: Block[], type: string): Block[] {
  return list.flatMap(b => [
    ...(b.type === type ? [b] : []),
    ...ofType(b.children ?? [], type),
  ]);
}

/** O bloco "equivalente" num post: mesmo tipo na mesma posição; senão, o único daquele tipo. */
function counterpart(
  blocks: Block[],
  type: string,
  path: number[]
): Block | undefined {
  const byPath = atPath(blocks, path);
  if (byPath?.type === type) return byPath;
  const all = ofType(blocks, type);
  return all.length === 1 ? all[0] : undefined;
}

/** Posts (fora o de origem) que têm um bloco equivalente para receber a alteração. */
export function replicaTargets(
  site: Site,
  sourcePostId: string,
  type: string,
  path: number[]
): number {
  return site.posts.filter(
    p => p.id !== sourcePostId && counterpart(p.blocks, type, path)
  ).length;
}

function patch<T>(
  target: Record<string, T> | undefined,
  changes: Record<string, T | undefined>
): Record<string, T> | undefined {
  const out = { ...(target ?? {}) };
  for (const [k, v] of Object.entries(changes)) {
    if (v === undefined) delete out[k];
    else out[k] = structuredClone(v);
  }
  return Object.keys(out).length ? out : undefined;
}

/** Aplica a alteração no bloco equivalente de cada outro post. */
export function applyReplica(
  site: Site,
  sourcePostId: string,
  type: string,
  path: number[],
  r: Replica
): Site {
  const next = structuredClone(site);
  for (const post of next.posts) {
    if (post.id === sourcePostId) continue;
    const b = counterpart(post.blocks, type, path);
    if (!b) continue;
    b.props = { ...b.props, ...structuredClone(r.props) };
    b.style = patch(b.style, r.style);
    b.fx = patch(b.fx, r.fx);
    if (r.hidden !== undefined) b.hidden = r.hidden || undefined;
    let el = b.elStyles;
    for (const [p, changes] of Object.entries(r.el)) {
      const merged = patch(el?.[p], changes);
      el = { ...(el ?? {}) };
      if (merged) el[p] = merged;
      else delete el[p];
    }
    b.elStyles = el && Object.keys(el).length ? el : undefined;
  }
  return next;
}
