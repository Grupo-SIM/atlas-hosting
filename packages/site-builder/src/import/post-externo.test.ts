import { describe, expect, test } from "bun:test";
import { siteSchema } from "../model/schema.js";
import { resolveRoute } from "../renderer/routes.js";
import { getTemplate } from "../templates/index.js";
import {
  inserirPostExterno,
  markdownParaHtml,
  pdcPostId,
  pecasDoMarkdown,
} from "./post-externo.js";

const MD = `Primeiro parágrafo com **negrito**.

## Subtítulo

Segundo parágrafo.
- item um
- item dois

> Frase — Autor

![Foto da fachada](https://exemplo.com/a.jpg)`;

const siteDe = (id: string) => {
  const t = getTemplate(id);
  if (!t) throw new Error(`template ${id} não existe`);
  return t.site;
};

describe("pecasDoMarkdown", () => {
  test("separa título, parágrafo, lista, citação e imagem", () => {
    expect(pecasDoMarkdown(MD).map(p => p.kind)).toEqual([
      "p",
      "h",
      "p",
      "p",
      "p",
      "img",
    ]);
    expect(pecasDoMarkdown(MD)[3]).toEqual({
      kind: "p",
      text: "- item um\n- item dois",
    });
  });
});

describe("inserirPostExterno", () => {
  test("cria post publicado, válido e acessível pela URL", () => {
    const site = siteDe("blog-viagens");
    const { post, site: novo } = inserirPostExterno(site, {
      categoria: "Notícias do PDC",
      corpoMd: MD,
      origemId: "123",
      resumo: "Resumo",
      titulo: "Meu post novo",
    });
    expect(post.id).toBe(pdcPostId("123"));
    expect(post.status).toBe("published");
    expect(post.slug).toBe("meu-post-novo");
    expect(post.blocks.map(b => b.type)).toEqual([
      "text",
      "heading",
      "text",
      "text",
      "text",
      "image",
    ]);
    expect(novo.categories.some(c => c.name === "Notícias do PDC")).toBe(true);
    expect(siteSchema.safeParse(novo).success).toBe(true);
    expect(resolveRoute(novo, "/meu-post-novo/").kind).toBe("post");
    expect(site.posts.some(p => p.id === post.id)).toBe(false);
  });

  test("reenviar o mesmo id atualiza sem duplicar e mantém o slug", () => {
    const site = siteDe("blog-viagens");
    const a = inserirPostExterno(site, {
      corpoMd: "Texto",
      origemId: "7",
      titulo: "Título A",
    });
    const b = inserirPostExterno(a.site, {
      corpoMd: "Texto novo",
      origemId: "7",
      titulo: "Título B",
    });
    expect(b.atualizado).toBe(true);
    expect(b.site.posts.filter(p => p.id === pdcPostId("7"))).toHaveLength(1);
    expect(b.post.slug).toBe(a.post.slug);
    expect(b.post.title).toBe("Título B");
  });

  test("slug já usado ganha sufixo", () => {
    const site = siteDe("blog-viagens");
    const existente = site.posts[0];
    if (!existente) throw new Error("template sem posts");
    const { post } = inserirPostExterno(site, {
      corpoMd: "x",
      origemId: "9",
      slug: existente.slug,
      titulo: "Outro",
    });
    expect(post.slug).toBe(`${existente.slug}-2`);
  });

  test("categoria existente é reaproveitada pelo nome", () => {
    const site = siteDe("blog-viagens");
    const cat = site.categories[0];
    if (!cat) throw new Error("template sem categorias");
    const { post, site: novo } = inserirPostExterno(site, {
      categoria: cat.name.toUpperCase(),
      corpoMd: "x",
      origemId: "10",
      titulo: "Com categoria",
    });
    expect(post.categoryId).toBe(cat.id);
    expect(novo.categories).toHaveLength(site.categories.length);
  });

  test("no Diário o subtítulo vira texto com ##", () => {
    const { post } = inserirPostExterno(siteDe("diario-aberto"), {
      corpoMd: MD,
      origemId: "11",
      titulo: "No diário",
    });
    expect(post.blocks[1]?.type).toBe("text");
    expect(post.blocks[1]?.props.text).toBe("## Subtítulo");
  });
});

describe("markdownParaHtml", () => {
  test("gera HTML simples e escapa o texto", () => {
    const html = markdownParaHtml(
      "## Título <b>\n\nTexto **forte** e [link](https://a.com).\n\n- um\n- dois"
    );
    expect(html).toContain("<h2>Título &lt;b&gt;</h2>");
    expect(html).toContain("<strong>forte</strong>");
    expect(html).toContain('<a href="https://a.com">link</a>');
    expect(html).toContain("<ul><li>um</li><li>dois</li></ul>");
  });
});
