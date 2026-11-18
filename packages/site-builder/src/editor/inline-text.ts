import type { FieldDef } from "../blocks/types.js";
import { type FocusHint, matchItem } from "./Inspector.js";

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
