import type { FieldDef } from "../blocks/types.js";
import type { Post, Site } from "../model/index.js";
import { type FocusHint, matchItem } from "./Inspector.js";
import { resolveSiteItem } from "./site-items.js";

const norm = (v: unknown) =>
  String(v ?? "")
    .replace(/\s+/g, " ")
    .trim();

const isText = (f: FieldDef) => f.kind === "text" || f.kind === "textarea";

/**
 * Edição do texto direto no canvas: descobre qual campo do bloco guarda o texto que está na tela e devolve
 * o que gravar nele (`props` do bloco) com o texto novo.
 *
 * Só vale quando dá para ter certeza: o campo guarda exatamente aquele texto (sem **negrito**, link ou
 * quebra de linha, que o texto na tela esconde) e é um só. Texto repetido em vários campos, ou com
 * formatação, devolve `null` — quem chama manda o usuário para o painel da direita.
 */
export function inlineTextPatch(
  fields: FieldDef[],
  props: Record<string, unknown>,
  defaults: Record<string, unknown>,
  hint: FocusHint,
  oldText: string,
  newText: string
): Record<string, unknown> | null {
  const want = norm(oldText);
  if (!want) return null;
  const stored = (key: string) => props[key] ?? defaults[key];
  // Valor guardado igual ao da tela e numa linha só: o que a pessoa digita pode substituí-lo sem perder nada.
  const same = (v: unknown) =>
    typeof v === "string" && !v.includes("\n") && norm(v) === want;
  const hits: Record<string, unknown>[] = [];
  for (const m of matchItem(fields, props, defaults, hint)) {
    if (m.kind === "field") {
      if (isText(m.field) && same(stored(m.field.key)))
        hits.push({ [m.field.key]: newText });
      continue;
    }
    const items = stored(m.field.key);
    if (!Array.isArray(items)) continue;
    const item = items[m.index] as Record<string, unknown> | undefined;
    const sub = (m.field.itemFields ?? []).find(
      f => isText(f) && same(item?.[f.key])
    );
    if (!(item && sub)) continue;
    hits.push({
      [m.field.key]: items.map((it, i) =>
        i === m.index ? { ...(it as object), [sub.key]: newText } : it
      ),
    });
  }
  return hits.length === 1 ? (hits[0] ?? null) : null;
}

/** Onde gravar o texto editado no canvas: no bloco, no post, na categoria ou no menu do site. */
export type InlineTarget =
  | { kind: "block"; patch: Record<string, unknown> }
  | { kind: "category"; id: string; name: string }
  | { kind: "menu"; menu: Site["menu"] }
  | { id: string; kind: "post"; patch: Partial<Post>; what: string };

/**
 * Como `inlineTextPatch`, mas também acha textos que não ficam no bloco: título e resumo dos posts (cards,
 * manchetes, listas), nome de categoria e itens do menu. O bloco tem prioridade; só se ele não tiver nenhum
 * campo com aquele texto é que vale o conteúdo do site (a mesma ordem que o painel da direita usa).
 */
export function inlineTarget(input: {
  currentPost?: Post;
  defaults: Record<string, unknown>;
  fields: FieldDef[];
  hint: FocusHint;
  newText: string;
  oldText: string;
  props: Record<string, unknown>;
  site: Site;
}): InlineTarget | null {
  const { defaults, fields, hint, newText, oldText, props, site } = input;
  const patch = inlineTextPatch(
    fields,
    props,
    defaults,
    hint,
    oldText,
    newText
  );
  if (patch) return { kind: "block", patch };
  if (matchItem(fields, props, defaults, hint).length > 0) return null;
  const want = norm(oldText);
  if (!want) return null;
  const item = resolveSiteItem(site, hint, true, input.currentPost);
  if (item.post) {
    if (norm(item.post.title) === want)
      return {
        id: item.post.id,
        kind: "post",
        patch: { title: newText },
        what: "Título",
      };
    if (norm(item.post.excerpt) === want)
      return {
        id: item.post.id,
        kind: "post",
        patch: { excerpt: newText },
        what: "Resumo",
      };
  }
  if (item.category && norm(item.category.name) === want)
    return { id: item.category.id, kind: "category", name: newText };
  // Item do menu: só quando o nome é de um item só (nomes repetidos deixam a dúvida de qual é).
  const hits = site.menu.flatMap((m, i): { i: number; j?: number }[] => [
    ...(norm(m.label) === want ? [{ i }] : []),
    ...(m.children ?? []).flatMap((c, j) =>
      norm(c.label) === want ? [{ i, j }] : []
    ),
  ]);
  const hit = hits.length === 1 ? hits[0] : undefined;
  if (hit)
    return {
      kind: "menu",
      menu: site.menu.map((m, i) => {
        if (i !== hit.i) return m;
        if (hit.j === undefined) return { ...m, label: newText };
        return {
          ...m,
          children: (m.children ?? []).map((c, j) =>
            j === hit.j ? { ...c, label: newText } : c
          ),
        };
      }),
    };
  return null;
}
