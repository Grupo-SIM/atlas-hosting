import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { fxCss } from "../../model/fx.js";
import type { Block } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { cssUrl } from "../../renderer/central.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";
import { BRAND } from "./brand.js";

const template = getTemplate("central-marketing");
if (!template) throw new Error("template central-marketing não registrado");
const { site } = template;

const allBlocks = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...allBlocks(b.children ?? [])]);

describe("template central-marketing", () => {
  test("aparece na tela de escolha com tags e contagem de páginas", () => {
    const meta = listTemplates().find(t => t.id === "central-marketing");
    expect(meta?.tags).toContain("Marketing");
    expect(meta?.pageCount).toBe(site.pages.length);
  });

  test("passa no siteSchema", () => {
    const parsed = siteSchema.safeParse(site);
    if (!parsed.success) console.error(parsed.error.issues.slice(0, 5));
    expect(parsed.success).toBe(true);
  });

  test("tem o conteúdo do original: 44 posts, 16 categorias, páginas e layouts", () => {
    expect(site.posts).toHaveLength(44);
    expect(site.categories).toHaveLength(16);
    const slugs = site.pages.map(p => p.slug);
    for (const s of [
      "",
      "blogs",
      "categorias",
      "links",
      "pesquisa",
      "404",
      "termos-de-uso",
      "politica-de-privacidade",
    ])
      expect(slugs).toContain(s);
    expect(site.header.length).toBeGreaterThan(0);
    expect(site.footer.length).toBeGreaterThan(0);
    expect(site.postLayout.length).toBeGreaterThan(0);
    expect(site.categoryLayout.length).toBeGreaterThan(0);
    expect(site.theme.variant).toBe("central");
  });

  test("ids de bloco únicos e cada post aponta para uma categoria existente", () => {
    const ids = [
      ...site.pages.flatMap(p => allBlocks(p.blocks)),
      ...allBlocks(site.header),
      ...allBlocks(site.footer),
      ...allBlocks(site.postLayout),
      ...allBlocks(site.categoryLayout),
    ].map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cats = new Set(site.categories.map(c => c.id));
    for (const p of site.posts) expect(cats.has(p.categoryId ?? "")).toBe(true);
    expect(new Set(site.posts.map(p => p.slug)).size).toBe(site.posts.length);
  });

  test("não aponta para imagens do domínio original", () => {
    expect(JSON.stringify(site)).not.toContain("centraldomarketing.com");
  });

  test("o nome da marca vem de um lugar só (tema, cabeçalho e rodapé)", () => {
    expect(site.name).toBe(BRAND.name);
    const header = site.header[0]?.props.logoText;
    const footer = site.footer[0]?.props.logoText;
    expect(header).toBe(BRAND.name);
    expect(footer).toBe(BRAND.name);
  });

  test("exportSiteToStatic gera HTML para todas as rotas", async () => {
    const files = await exportSiteToStatic(site);
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
      expect(f.content).toContain("sb-ct");
      expect(f.content).not.toContain("Bloco desconhecido");
      expect(f.content).not.toContain("undefined");
      expect(f.content).not.toContain("[object Object]");
    }
    expect(paths.has("index.html")).toBe(true);
    expect(paths.has("404.html")).toBe(true);
    expect(paths.has("category/copy/index.html")).toBe(true);
  }, 120_000);

  test("home publicada traz o carrossel de logos em CSS puro (sem autoplay no editor)", async () => {
    const files = await exportSiteToStatic(site);
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain("sb-ct-marquee-track");
    expect(home).toContain('class="sb-ct-marquee"');
    expect(home).not.toContain('class="sb-ct-marquee is-static"');
    expect(home).toContain("sb-ct-hero");
    expect(home).toContain("Red+Hat+Text");
    expect(home).toContain("family=Content:wght@400;700");
  });

  test("no modo edição o carrossel fica parado", async () => {
    const { prelude } = await prerender(
      createElement(SiteRenderer, { mode: "edit", path: "/", site })
    );
    const html = await new Response(prelude).text();
    expect(html).toContain('class="sb-ct-marquee is-static"');
  });
});

describe("estender fx: stagger", () => {
  test("gera atraso crescente por filho só com each + entrada", () => {
    const css = fxCss("b1", {
      "1.1": { delay: 50, each: true, enter: "fadeIn", stagger: 100 },
    });
    expect(css).toContain("opacity .8s ease 50ms");
    expect(css).toContain(">:nth-child(2){transition:opacity .8s ease 150ms");
    expect(css).toContain(">:nth-child(3){transition:opacity .8s ease 250ms");
    expect(
      fxCss("b1", { "1.1": { enter: "fadeIn", stagger: 100 } })
    ).not.toContain("nth-child(2)");
  });
});

describe("cssUrl", () => {
  test("aceita URLs normais e recusa o que poderia fechar a declaração", () => {
    expect(cssUrl("https://x.com/a.jpg")).toBe('url("https://x.com/a.jpg")');
    expect(cssUrl('https://x.com/a.jpg");color:red')).toBe("none");
    expect(cssUrl("javascript:alert(1)")).toBe("none");
    expect(cssUrl("")).toBe("none");
  });
});
