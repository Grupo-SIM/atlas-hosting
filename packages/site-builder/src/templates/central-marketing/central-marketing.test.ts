import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { logoStepKeyframes } from "../../blocks/central.js";
import { popupVideoEmbed, vimeoEmbed } from "../../blocks/youtube.js";
import { fxCss } from "../../model/fx.js";
import type { Block } from "../../model/index.js";
import { blockSchema } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { cssUrl } from "../../renderer/central.js";
import { NAV_RUNTIME } from "../../renderer/nav-runtime.js";
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
    // um logo por vez, como o original (para e desliza)
    expect(home).toContain("--ct-anim:sb-ct-step10");
    expect(home).toContain(logoStepKeyframes(10));
  });

  test("botão de play do hero abre o vídeo em popup (e cai no link sem JS)", async () => {
    const files = await exportSiteToStatic(site);
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain('class="sb-ct-play"');
    expect(home).toContain(
      'data-sb-video="https://www.youtube-nocookie.com/embed/2z39bEyVSoI"'
    );
    expect(home).toContain(
      'href="https://www.youtube.com/watch?v=2z39bEyVSoI"'
    );
    expect(home).toContain("a[data-sb-video]");
    // o script vai como string: um escape errado quebra tudo sem erro de tipo
    expect(() => new Function(NAV_RUNTIME)).not.toThrow();
  });

  test("no modo edição o carrossel fica parado", async () => {
    const { prelude } = await prerender(
      createElement(SiteRenderer, { mode: "edit", path: "/", site })
    );
    const html = await new Response(prelude).text();
    expect(html).toContain('class="sb-ct-marquee is-static"');
    expect(html).not.toContain("@keyframes sb-ct-step");
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

describe("âncora de bloco", () => {
  test("o Saber Mais da home rola até a seção de categorias (#sabermais)", async () => {
    const files = await exportSiteToStatic(site);
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain('href="#sabermais"');
    expect(home).toMatch(/<div class="sb-block"[^>]*id="sabermais"/);
    expect(home.match(/id="sabermais"/g)).toHaveLength(1);
  });

  test("selo em camadas: textura de fundo chega ao CSS (cssUrl não recusa) e texto acima do destaque", async () => {
    const files = await exportSiteToStatic(site);
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain("--ct-img:url(&quot;data:image/svg+xml,");
    expect(home).toContain(
      '<span class="kick">Crescimento</span><strong>rápido</strong>'
    );
    expect(home).toContain('class="foot"');
  });

  test("só aceita nomes simples (vira id no HTML)", () => {
    const b = { id: "x", props: {}, type: "heading" };
    expect(
      blockSchema.safeParse({ ...b, anchor: "saber-mais_2" }).success
    ).toBe(true);
    for (const bad of ["1abc", 'a"b', "a b", "<x>", ""])
      expect(blockSchema.safeParse({ ...b, anchor: bad }).success).toBe(false);
  });
});

describe("logoStepKeyframes", () => {
  test("para 1/3 do tempo em cada logo e termina na metade da trilha (lista duplicada)", () => {
    const kf = logoStepKeyframes(4);
    expect(kf.startsWith("@keyframes sb-ct-step4{")).toBe(true);
    expect(kf).toContain("0%,8.333%{transform:translateX(-0%)");
    expect(kf).toContain("25%,33.333%{transform:translateX(-12.5%)");
    expect(kf).toContain("100%{transform:translateX(-50%)}");
  });
});

describe("popupVideoEmbed", () => {
  test("YouTube e Vimeo viram player; outros links ficam como link", () => {
    expect(popupVideoEmbed("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
    );
    expect(popupVideoEmbed("https://vimeo.com/1086587681")).toBe(
      "https://player.vimeo.com/video/1086587681"
    );
    expect(vimeoEmbed("https://vimeo.com/123456789/abcdef1234")).toBe(
      "https://player.vimeo.com/video/123456789?h=abcdef1234"
    );
    expect(
      vimeoEmbed("https://player.vimeo.com/video/1086587681?h=9f8e7d6c&x=1")
    ).toBe("https://player.vimeo.com/video/1086587681?h=9f8e7d6c");
    expect(popupVideoEmbed("https://evil.com/vimeo.com/123456789")).toBeNull();
    expect(popupVideoEmbed("javascript:alert(1)")).toBeNull();
    expect(popupVideoEmbed("")).toBeNull();
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
