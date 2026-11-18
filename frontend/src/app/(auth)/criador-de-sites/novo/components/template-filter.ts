/** Filtro da galeria em dois passos: a categoria (ex.: Blog) e, dentro dela, o tipo (ex.: Tecnologia). */

export interface Tagged {
  tags: string[];
}

export interface TagCount {
  count: number;
  tag: string;
}

/** Cada categoria e quantos templates a têm, na ordem em que aparecem nos templates. */
export function tagCounts(templates: Tagged[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const t of templates) {
    for (const tag of new Set(t.tags))
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].map(([tag, count]) => ({ count, tag }));
}

/**
 * O que existe dentro de uma categoria: as outras categorias que os templates dela também têm
 * (Blog → Tecnologia, Viagens, Marketing…), com a quantidade, das mais comuns para as menos.
 */
export function relatedTags(templates: Tagged[], tag: string): TagCount[] {
  return tagCounts(templates.filter(t => t.tags.includes(tag)))
    .filter(c => c.tag !== tag)
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "pt-BR"));
}

/** Templates da categoria escolhida e, se houver, do tipo escolhido dentro dela. */
export function filterByTags<T extends Tagged>(
  templates: T[],
  tag: string | null,
  sub: string | null
): T[] {
  return templates.filter(
    t => (!tag || t.tags.includes(tag)) && (!sub || t.tags.includes(sub))
  );
}
