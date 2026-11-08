import { describe, expect, test } from "bun:test";
import type { Block, Post, Site } from "../model/index.js";
import {
  applyReplica,
  blockPath,
  describeReplica,
  diffBlock,
  replicaTargets,
} from "./replicate.js";

const block = (id: string, extra: Partial<Block> = {}): Block => ({
  id,
  props: { text: `texto ${id}` },
  type: "text",
  ...extra,
});

const post = (id: string, blocks: Block[]): Post => ({
  blocks,
  categoryId: null,
  coverImage: null,
  excerpt: "",
  id,
  publishedAt: "2026-01-01",
  slug: id,
  status: "published",
  title: id,
});

const site = (posts: Post[]): Site => ({
  categories: [],
  categoryLayout: [],
  footer: [],
  header: [],
  menu: [],
  name: "s",
  pages: [],
  postLayout: [],
  posts,
  theme: {},
});

describe("replicar alteração de post", () => {
  test("conteúdo (texto) não conta como alteração replicável", () => {
    const before = block("a");
    const after = { ...before, props: { text: "outro" } };
    expect(diffBlock(before, after)).toBeUndefined();
  });

  test("estilo, estilo de item e efeitos são replicados no bloco equivalente", () => {
    const before = block("a");
    const after: Block = {
      ...before,
      elStyles: { "1": { color: "red" } },
      fx: { "": { enter: "fadeUp" } as never },
      props: { text: "outro" },
      style: { height: 300 },
    };
    const r = diffBlock(before, after);
    expect(r).toBeDefined();
    if (!r) return;
    expect(describeReplica("text", r)).toContain("estilo do bloco");

    const s = site([
      post("p1", [block("h1", { type: "heading" }), after]),
      post("p2", [block("h2", { type: "heading" }), block("b")]),
      post("p3", [block("c")]),
      post("p4", [block("h4", { type: "heading" })]),
    ]);
    const path = blockPath(s.posts[0]?.blocks ?? [], "a") ?? [];
    expect(path).toEqual([1]);
    expect(replicaTargets(s, "p1", "text", path)).toBe(2);

    const next = applyReplica(s, "p1", "text", path, r);
    const b = next.posts[1]?.blocks[1];
    expect(b?.style).toEqual({ height: 300 });
    expect(b?.elStyles).toEqual({ "1": { color: "red" } });
    expect(b?.props.text).toBe("texto b");
    // p3 não tem o bloco na mesma posição, mas tem um único "text".
    expect(next.posts[2]?.blocks[0]?.style).toEqual({ height: 300 });
    // p4 não tem bloco equivalente.
    expect(next.posts[3]?.blocks[0]?.style).toBeUndefined();
  });

  test("estilo removido no original é removido nos outros", () => {
    const before = block("a", { style: { height: 300, padding: 10 } });
    const after = block("a", { style: { padding: 10 } });
    const r = diffBlock(before, after);
    if (!r) throw new Error("sem diff");
    const s = site([
      post("p1", [after]),
      post("p2", [block("b", { style: { height: 300, padding: 4 } })]),
    ]);
    const next = applyReplica(s, "p1", "text", [0], r);
    expect(next.posts[1]?.blocks[0]?.style).toEqual({ padding: 4 });
  });
});
