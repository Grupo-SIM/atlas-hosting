import { describe, expect, test } from "bun:test";
import type { Site } from "../model/index.js";
import { resolveSiteItem } from "./site-items.js";

const post = (id: string, categoryId: string | null = null) => ({
  blocks: [],
  categoryId,
  coverImage: null,
  excerpt: "",
  id,
  publishedAt: null,
  slug: id,
  status: "published" as const,
  title: id,
});
const site = {
  categories: [{ id: "c1", name: "Mundo", slug: "mundo" }],
  posts: [post("a", "c1"), post("b")],
} as unknown as Site;

describe("resolveSiteItem", () => {
  test("link do próprio item aponta o post ou a categoria", () => {
    expect(resolveSiteItem(site, { href: "/a/" }).post?.id).toBe("a");
    expect(
      resolveSiteItem(site, { href: "/category/mundo/" }).category?.id
    ).toBe("c1");
  });

  test("sobe até o contêiner do item e junta a categoria dele", () => {
    const r = resolveSiteItem(site, {
      levels: [["/category/mundo/", "/a/"]],
    });
    expect(r.post?.id).toBe("a");
    expect(r.category?.id).toBe("c1");
  });

  test("contêiner com vários posts é a lista, não o item", () => {
    expect(resolveSiteItem(site, { levels: [["/a/", "/b/"]] })).toEqual({});
  });

  test("link de fora do site não resolve nada", () => {
    expect(resolveSiteItem(site, { href: "https://x.com/a/" })).toEqual({});
  });

  test("sem link: título cortado com … , capa (sem ?query) e data do post aberto", () => {
    const s = {
      categories: [],
      posts: [
        {
          ...post("a"),
          coverImage: "https://x/a.jpg",
          title: "Governo anuncia pacote de incentivos para pequenos negócios",
        },
        post("b"),
      ],
    } as unknown as Site;
    expect(
      resolveSiteItem(
        s,
        { value: "Governo anuncia pacote de incentivos…" },
        true
      ).post?.id
    ).toBe("a");
    expect(
      resolveSiteItem(s, { value: "https://x/a.jpg?w=1200&q=80" }, true).post
        ?.id
    ).toBe("a");
    expect(
      resolveSiteItem(s, { value: "novembro 9, 2026" }, true, s.posts[1]).post
        ?.id
    ).toBe("b");
    expect(resolveSiteItem(s, { value: "novembro 9, 2026" }, true)).toEqual({});
    // capa repetida em vários posts: vale a do post aberto
    const dup = {
      categories: [],
      posts: [
        { ...post("a"), coverImage: "https://x/same.jpg" },
        { ...post("b"), coverImage: "https://x/same.jpg" },
      ],
    } as unknown as Site;
    expect(
      resolveSiteItem(dup, { value: "https://x/same.jpg?w=9" }, true)
    ).toEqual({});
    expect(
      resolveSiteItem(
        dup,
        { value: "https://x/same.jpg?w=9" },
        true,
        dup.posts[1]
      ).post?.id
    ).toBe("b");
  });
});
