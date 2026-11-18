import { describe, expect, test } from "bun:test";
import type { Site } from "../model/index.js";
import { addPostToPage, type PostForm, postFormError } from "./site-ops.js";

const block = (id: string) => ({ id, props: {}, type: "text" });
const site = {
  categories: [],
  categoryLayout: [],
  footer: [],
  header: [],
  menu: [],
  name: "Teste",
  pages: [
    {
      blocks: [block("a1"), block("a2")],
      id: "home",
      slug: "",
      title: "Início",
    },
    { blocks: [block("b1")], id: "sobre", slug: "sobre", title: "Sobre" },
  ],
  postLayout: [],
  posts: [],
  theme: {},
} as unknown as Site;

const form = (over: Partial<PostForm> = {}): PostForm => ({
  description: "Uma descrição.",
  format: "text",
  media: "",
  pageId: "sobre",
  title: "Meu post",
  ...over,
});

const added = (over: Partial<PostForm> = {}) => {
  const res = addPostToPage(site, form(over));
  const page = res.site.pages.find(p => p.id === (over.pageId ?? "sobre"));
  return { block: page?.blocks.at(-1), page, res };
};

describe("addPostToPage", () => {
  test("entra no fim da página escolhida, sem mexer nas outras nem no site original", () => {
    const { block: b, page, res } = added();
    expect(page?.blocks.map(x => x.id)).toEqual(["b1", res.id]);
    expect(b?.type).toBe("postItem");
    expect(res.site.pages[0]?.blocks).toHaveLength(2);
    expect(site.pages[1]?.blocks).toHaveLength(1);
  });

  test("título + descrição", () => {
    expect(added().block?.props).toEqual({
      description: "Uma descrição.",
      media: "",
      title: "Meu post",
    });
  });

  test("descrição + imagem e descrição + vídeo guardam a mídia", () => {
    expect(
      added({ format: "text-image", media: "/foto.jpg" }).block?.props
    ).toMatchObject({ description: "Uma descrição.", media: "/foto.jpg" });
    const url = "https://www.youtube.com/watch?v=abc123";
    expect(
      added({ format: "text-video", media: url }).block?.props
    ).toMatchObject({ description: "Uma descrição.", media: url });
  });

  test("somente imagem / somente vídeo: só a mídia, sem descrição, e o título é opcional", () => {
    for (const format of ["image", "video"] as const) {
      expect(
        added({ description: "ignorada", format, media: "/m.mp4", title: "" })
          .block?.props
      ).toEqual({ description: "", media: "/m.mp4", title: "" });
    }
  });

  test("página que não existe não muda o site", () => {
    expect(addPostToPage(site, form({ pageId: "nada" })).site).toBe(site);
  });
});

describe("postFormError", () => {
  test("título é opcional; descrição e mídia dependem do formato; a página é obrigatória", () => {
    expect(postFormError(form({ title: "" }), site)).toBeNull();
    expect(postFormError(form({ description: "" }), site)).toMatch(/descrição/);
    expect(postFormError(form({ format: "text-image" }), site)).toMatch(
      /imagem/
    );
    expect(postFormError(form({ format: "video" }), site)).toMatch(/vídeo/);
    expect(
      postFormError(form({ format: "video", media: "/v.mp4", title: "" }), site)
    ).toBeNull();
    expect(postFormError(form({ pageId: "" }), site)).toMatch(/página/);
  });
});
