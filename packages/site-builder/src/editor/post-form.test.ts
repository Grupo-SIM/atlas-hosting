import { describe, expect, test } from "bun:test";
import type { Site } from "../model/index.js";
import {
  createPostFromForm,
  type PostForm,
  postFormError,
} from "./site-ops.js";

const site = {
  categories: [{ id: "c1", name: "Notícias", slug: "noticias" }],
  menu: [],
  name: "Teste",
  pages: [],
  posts: [],
  theme: {},
} as unknown as Site;

const form = (over: Partial<PostForm> = {}): PostForm => ({
  categoryId: "c1",
  description: "Uma descrição.",
  format: "text",
  media: "",
  publish: true,
  title: "Meu post",
  ...over,
});

describe("createPostFromForm", () => {
  test("só descrição: texto no corpo e no resumo, sem capa", () => {
    const { post, site: next } = createPostFromForm(site, form());
    expect(post.title).toBe("Meu post");
    expect(post.categoryId).toBe("c1");
    expect(post.excerpt).toBe("Uma descrição.");
    expect(post.coverImage).toBeNull();
    expect(post.blocks.map(b => b.props.text)).toEqual(["Uma descrição."]);
    expect(post.status).toBe("published");
    expect(next.posts).toHaveLength(1);
    expect(site.posts).toHaveLength(0);
  });

  test("descrição + imagem: a imagem vira a capa", () => {
    const { post } = createPostFromForm(
      site,
      form({ format: "text-image", media: "/foto.jpg" })
    );
    expect(post.coverImage).toBe("/foto.jpg");
    expect(post.blocks).toHaveLength(1);
  });

  test("descrição + vídeo: o link do vídeo vira a capa", () => {
    const url = "https://www.youtube.com/watch?v=abc123";
    const { post } = createPostFromForm(
      site,
      form({ format: "text-video", media: url })
    );
    expect(post.coverImage).toBe(url);
    expect(post.excerpt).toBe("Uma descrição.");
  });

  test("só imagem / só vídeo: sem texto e sem resumo", () => {
    for (const format of ["image", "video"] as const) {
      const { post } = createPostFromForm(
        site,
        form({ description: "ignorada", format, media: "/m.mp4" })
      );
      expect(post.blocks).toEqual([]);
      expect(post.excerpt).toBe("");
      expect(post.coverImage).toBe("/m.mp4");
    }
  });

  test("categoria nova é criada junto e vale mais que a escolhida", () => {
    const { post, site: next } = createPostFromForm(
      site,
      form({ newCategory: "Esportes" })
    );
    const cat = next.categories.find(c => c.name === "Esportes");
    expect(cat).toBeDefined();
    expect(post.categoryId).toBe(cat?.id);
    expect(next.categories).toHaveLength(2);
  });

  test("rascunho quando não é para publicar; resumo longo é cortado em palavra inteira", () => {
    const long = "palavra ".repeat(60);
    const { post } = createPostFromForm(
      site,
      form({ description: long, publish: false })
    );
    expect(post.status).toBe("draft");
    expect(post.excerpt.length).toBeLessThanOrEqual(201);
    expect(post.excerpt.endsWith("…")).toBe(true);
    expect(post.excerpt.endsWith("palavra…")).toBe(true);
  });
});

describe("postFormError", () => {
  test("título sempre; descrição e mídia conforme o formato", () => {
    expect(postFormError(form({ title: " " }))).toMatch(/título/);
    expect(postFormError(form({ description: "" }))).toMatch(/descrição/);
    expect(postFormError(form({ format: "text-image" }))).toMatch(/imagem/);
    expect(postFormError(form({ format: "video" }))).toMatch(/vídeo/);
    expect(
      postFormError(form({ description: "", format: "video", media: "/v.mp4" }))
    ).toBeNull();
    expect(postFormError(form())).toBeNull();
  });
});
