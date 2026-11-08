import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block, Site } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";
import { BRAND } from "./brand.js";

const template = getTemplate("marketplace");
if (!template) throw new Error("template marketplace não registrado");
const { site } = template;

/** O export das ~33 rotas é caro: os testes compartilham uma execução só. */
let exported: ReturnType<typeof exportSiteToStatic> | undefined;
const exportOnce = () => (exported ??= exportSiteToStatic(site));
const EXPORT_TIMEOUT = 120_000;

const allBlocks = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...allBlocks(b.children ?? [])]);

const everyBlock = (s: Site) => [
  ...s.pages.flatMap(p => allBlocks(p.blocks)),
  ...s.posts.flatMap(p => allBlocks(p.blocks)),
  ...allBlocks(s.header),
  ...allBlocks(s.footer),
  ...allBlocks(s.postLayout),
  ...allBlocks(s.categoryLayout),
];

async function html(s: Site, path: string, mode: "edit" | "view" = "view") {
  const { prelude } = await prerender(
    createElement(SiteRenderer, { mode, path, site: s, skipFxRuntime: true })
  );
  return new Response(prelude).text();
}

describe("template marketplace", () => {
  test("aparece na tela de escolha com tags e contagem de páginas", () => {
    const meta = listTemplates().find(t => t.id === "marketplace");
    expect(meta?.tags).toEqual(["Loja", "Marketing", "Landing"]);
    expect(meta?.pageCount).toBe(site.pages.length);
  });

  test("passa no siteSchema", () => {
    const parsed = siteSchema.safeParse(site);
    if (!parsed.success) console.error(parsed.error.issues.slice(0, 5));
    expect(parsed.success).toBe(true);
  });

  test("toda prop de bloco é válida para o schema do bloco (nada cai nos defaults)", () => {
    for (const b of everyBlock(site)) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      const parsed = def?.schema.safeParse(b.props);
      if (!parsed?.success) console.error(b.type, parsed?.error.issues);
      expect(parsed?.success).toBe(true);
    }
  });

  test("conteúdo do original: 16 produtos, 8 categorias, páginas e layouts", () => {
    expect(site.posts).toHaveLength(16);
    expect(site.categories).toHaveLength(8);
    const slugs = site.pages.map(p => p.slug);
    for (const s of [
      "",
      "produtos",
      "categorias",
      "blogs",
      "pesquisa",
      "404",
      "termos-de-uso",
      "politica-de-privacidade",
    ])
      expect(slugs).toContain(s);
    expect(site.menu.map(m => m.label)).toEqual([
      "Produtos",
      "Categorias",
      "Blogs",
    ]);
    expect(site.theme.variant).toBe("marketplace");
    // cada produto incorpora o próprio site (https)
    for (const p of site.posts) {
      expect(p.blocks[0]?.type).toBe("siteEmbed");
      expect(String(p.blocks[0]?.props.url)).toMatch(/^https:\/\//);
    }
  });

  test("ids de bloco únicos; posts em categorias existentes; slugs únicos", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cats = new Set(site.categories.map(c => c.id));
    for (const p of site.posts) expect(cats.has(p.categoryId ?? "")).toBe(true);
    expect(new Set(site.posts.map(p => p.slug)).size).toBe(site.posts.length);
  });

  test("nenhuma imagem aponta para o WordPress original (só placeholders)", () => {
    expect(JSON.stringify(site)).not.toContain("wp-content/uploads");
  });

  test("marca e contatos vêm de brand.ts", () => {
    expect(site.name).toBe(BRAND.name);
    expect(site.footer[0]?.props.copyright).toBe(BRAND.copyright);
    const legal = JSON.stringify(
      site.pages.find(p => p.slug === "politica-de-privacidade")
    );
    expect(legal).toContain(BRAND.email);
    expect(legal).toContain(BRAND.legalName);
  });

  test(
    "exportSiteToStatic gera HTML sem erro em todas as rotas",
    async () => {
      const files = await exportOnce();
      const expected =
        site.pages.filter(p => p.status === "published").length +
        site.posts.filter(p => p.status === "published").length +
        site.categories.length +
        1; // 404.html
      expect(files).toHaveLength(expected);
      const paths = new Set(files.map(f => f.path));
      expect(paths.size).toBe(files.length);
      for (const f of files) {
        expect(f.content.startsWith("<!doctype html>")).toBe(true);
        expect(f.content).toContain("sb-mk");
        expect(f.content).not.toContain("Bloco desconhecido");
        expect(f.content).not.toContain("undefined");
        expect(f.content).not.toContain("[object Object]");
      }
      for (const p of [
        "index.html",
        "produtos/index.html",
        "categorias/index.html",
        "blogs/index.html",
        "pesquisa/index.html",
        "seo-pack/index.html",
        "category/sistemas/index.html",
        "404.html",
      ])
        expect(paths.has(p)).toBe(true);
    },
    EXPORT_TIMEOUT
  );

  test(
    "home publicada: letreiro duplicado em CSS puro, contagem das categorias, play em popup",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain('class="sb-tmq-track"');
      expect(home).toContain('aria-hidden="true" class="sb-tmq-group"');
      expect(home).toContain("(7)"); // Sistemas
      expect(home).toContain(
        'data-sb-video="https://player.vimeo.com/video/1088198038"'
      );
      expect(home).toContain("sb-mk-rank-list");
      // links de parceiros abrem em nova aba
      expect(home).toMatch(
        /href="https:\/\/marketingraiz.com\/" rel="noopener noreferrer" target="_blank"/
      );
    },
    EXPORT_TIMEOUT
  );

  test(
    "categoria: banner com o nome e grade só com os produtos dela",
    async () => {
      const files = await exportOnce();
      const page =
        files.find(f => f.path === "category/sistemas/index.html")?.content ??
        "";
      expect(page).toContain("<h1>Sistemas</h1>");
      const cards = page.match(/sb-post-card product/g) ?? [];
      expect(cards).toHaveLength(
        site.posts.filter(p => p.categoryId === "cat-sistemas").length
      );
    },
    EXPORT_TIMEOUT
  );

  test("menu marca a página atual", async () => {
    const page = await html(site, "/produtos/");
    expect(page).toMatch(/aria-current="page" href="\/produtos\/"/);
    expect(page).not.toMatch(/aria-current="page" href="\/blogs\/"/);
  });

  test("no editor o letreiro fica parado e sem a cópia", async () => {
    const page = await html(site, "/", "edit");
    expect(page).toContain("sb-tmq-track is-still");
    expect(page).not.toContain('aria-hidden="true" class="sb-tmq-group"');
  });

  test("siteEmbed só incorpora http(s)", async () => {
    const s = structuredClone(site);
    const post = s.posts[0];
    if (!post?.blocks[0]) throw new Error("sem post");
    post.blocks[0].props.url = "javascript:alert(1)";
    const page = await html(s, `/${post.slug}/`);
    expect(page).not.toContain("<iframe");
    expect(page).not.toContain("javascript:");
  });

  test("sites sem a variante não recebem o CSS do Marketplace", async () => {
    const blog = getTemplate("blog-viagens");
    if (!blog) throw new Error("blog-viagens sumiu");
    const page = await html(blog.site, "/");
    expect(page).not.toContain("sb-mk");
  });
});
