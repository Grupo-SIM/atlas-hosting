import { describe, expect, test } from "bun:test";
import { filterByTags, relatedTags, tagCounts } from "./template-filter";

const templates = [
  { id: "a", tags: ["Blog", "Tecnologia"] },
  { id: "b", tags: ["Blog", "Viagens"] },
  { id: "c", tags: ["Notícias", "Blog"] },
  { id: "d", tags: ["Landing", "Viagens"] },
  { id: "e", tags: ["Blog", "Viagens", "Marketing"] },
];

describe("filtro em dois passos", () => {
  test("conta quantos templates tem cada categoria", () => {
    const c = Object.fromEntries(
      tagCounts(templates).map(x => [x.tag, x.count])
    );
    expect(c).toMatchObject({ Blog: 4, Landing: 1, Viagens: 3 });
  });

  test("dentro de Blog aparecem os tipos que os blogs têm, do mais comum ao menos", () => {
    const inside = relatedTags(templates, "Blog");
    expect(inside[0]).toEqual({ count: 2, tag: "Viagens" });
    expect(inside.map(x => x.tag).sort()).toEqual(
      ["Marketing", "Notícias", "Tecnologia", "Viagens"].sort()
    );
    expect(inside.some(x => x.tag === "Blog")).toBe(false);
  });

  test("filtra por categoria e, depois, pelo tipo dentro dela", () => {
    expect(filterByTags(templates, null, null)).toHaveLength(5);
    expect(filterByTags(templates, "Blog", null).map(t => t.id)).toEqual([
      "a",
      "b",
      "c",
      "e",
    ]);
    expect(filterByTags(templates, "Blog", "Viagens").map(t => t.id)).toEqual([
      "b",
      "e",
    ]);
  });
});
