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

const template = getTemplate("seguidores-em-alta");
if (!template) throw new Error("template seguidores-em-alta não registrado");
const { site } = template;

/** O export das rotas é caro: os testes compartilham uma execução só. */
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

const file = async (path: string) =>
  (await exportOnce()).find(f => f.path === path)?.content ?? "";

describe("template seguidores-em-alta", () => {
  test("aparece na tela de escolha com tags e contagem de páginas", () => {
    const meta = listTemplates().find(t => t.id === "seguidores-em-alta");
    expect(meta?.tags).toEqual(["Blog", "Marketing", "Redes sociais"]);
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

  test("conteúdo do original: 10 posts, 8 categorias, páginas e layouts", () => {
    expect(site.posts).toHaveLength(10);
    expect(site.categories).toHaveLength(8);
    const slugs = site.pages.map(p => p.slug);
    for (const s of [
      "",
      "todos-os-posts",
      "categorias",
      "blogs",
      "pesquisa",
      "404",
      "links",
      "termos-de-uso",
      "politica-de-privacidade",
    ])
      expect(slugs).toContain(s);
    expect(site.menu.map(m => m.label)).toEqual([
      "Conteúdo",
      "Categorias",
      "Blogs",
      "Marketing Raiz",
      "Central do Marketing",
      "Renovada",
      "007SpyHacker",
      "Zyrion Brazil",
      "Marketplace",
    ]);
    expect(site.theme.variant).toBe("seguidores");
    expect(site.header[0]?.type).toBe("sgHeader");
    expect(site.footer[0]?.type).toBe("sgFooter");
    expect(site.postLayout[0]?.type).toBe("sgPost");
    // cada post tem corpo completo (títulos, texto e imagens)
    for (const p of site.posts) expect(p.blocks.length).toBeGreaterThan(10);
  });

  test("ids de bloco únicos; posts em categorias existentes; slugs únicos; menu válido", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cats = new Set(site.categories.map(c => c.id));
    for (const p of site.posts) expect(cats.has(p.categoryId ?? "")).toBe(true);
    const all = [
      ...site.pages.map(p => p.slug),
      ...site.posts.map(p => p.slug),
      "category",
    ];
    expect(new Set(all).size).toBe(all.length);
    const pages = new Set(site.pages.map(p => `/${p.slug}/`));
    for (const m of site.menu)
      expect(pages.has(m.href) || /^https:\/\//.test(m.href)).toBe(true);
  });

  test("marca e contatos vêm de brand.ts", () => {
    expect(site.name).toBe(BRAND.name);
    const legal = JSON.stringify(
      site.pages.find(p => p.slug === "politica-de-privacidade")
    );
    expect(legal).toContain(BRAND.contact.email);
    expect(legal).toContain(BRAND.legalName);
    expect(JSON.stringify(site.footer)).toContain(BRAND.contact.phone);
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
        expect(f.content).toContain("sb-sg");
        expect(f.content).not.toContain("Bloco desconhecido");
        expect(f.content).not.toContain("undefined");
        expect(f.content).not.toContain("[object Object]");
      }
      for (const p of [
        "index.html",
        "todos-os-posts/index.html",
        "categorias/index.html",
        "blogs/index.html",
        "pesquisa/index.html",
        "links/index.html",
        "category/redes-sociais/index.html",
        "404.html",
      ])
        expect(paths.has(p)).toBe(true);
    },
    EXPORT_TIMEOUT
  );

  test(
    "home publicada: 2 Lotties, 4 contadores, 5 produtos, 4 depoimentos, 5 blogs, títulos com marca-texto",
    async () => {
      const home = await file("index.html");
      expect((home.match(/data-sb-lottie="/g) ?? []).length).toBe(2);
      for (const n of [420, 1119, 100, 365])
        expect(home).toContain(`data-sb-count="${n}"`);
      expect(home).toContain('data-sep=","');
      expect(home).toContain("+420%");
      expect(home).toContain("1,119+");
      expect((home.match(/class="sg-pcard( first)?"/g) ?? []).length).toBe(5);
      for (const slug of [
        "ebook-gatilhos-mentais",
        "o-outro-lado-da-internet",
        "areaflix-area-de-membros",
        "viralpack",
        "ebook-habilidades-de-comunicacao",
      ])
        expect(home).toContain(`marketplace.centraldomarketing.com/${slug}/`);
      expect((home.match(/<figure class="sg-t"/g) ?? []).length).toBe(4);
      expect((home.match(/class="sg-blog"/g) ?? []).length).toBe(5);
      expect(home).toContain('<span class="sg-hl">Novidades</span>');
      expect(home).toContain('<span class="sg-hl">pesquisados</span>');
      expect(home).toContain('<span class="sg-hl">todos os dias</span>');
      expect(home).not.toContain('data-sg-hide=""');
      // carrossel: autoplay de 5 s
      expect(home).toContain('data-sec="5"');
      // links externos abrem em nova aba
      expect(home).toMatch(
        /href="https:\/\/marketingraiz.com\/" rel="noopener noreferrer" target="_blank"/
      );
    },
    EXPORT_TIMEOUT
  );

  test(
    "home: 6 novidades, 4 mais pesquisados, 3 melhores posts (do jeito do original)",
    async () => {
      const home = await file("index.html");
      const grids = home.split('class="sg-grid c').slice(1);
      expect(grids).toHaveLength(3);
      const count = (g: string) =>
        (g.split("</section>")[0].match(/class="sb-post-card/g) ?? []).length;
      expect(count(grids[0])).toBe(6);
      expect(count(grids[1])).toBe(4);
      expect(count(grids[2])).toBe(3);
      expect(grids[0]).toContain("comprar-seguidores-como-funciona");
      expect(grids[1]).toContain("ganhar-seguidores-no-instagram");
      expect(grids[2]).toContain("como-fazer-uma-bio-no-instagram");
    },
    EXPORT_TIMEOUT
  );

  test(
    "cabeçalho e efeitos: logo com fadeIn, entradas de 1,25 s e roteiros de caminho válidos",
    async () => {
      const home = await file("index.html");
      expect(home).toContain('class="sg-head"');
      expect(home).toContain("opacity 1250ms ease 400ms");
      expect(home).toContain("sb-sg");
      // o hero tem título, texto e botão como filhos 1, 2 e 3 da coluna de texto
      expect(home).toMatch(
        /class="sg-hero-copy"><h1>.*?<\/h1><p class="sg-hero-text">.*?<\/p><div class="sg-hero-btn">/
      );
    },
    EXPORT_TIMEOUT
  );

  test(
    "/links/ é uma página solta; 404 existe; categoria e pesquisa trazem busca e carregar mais",
    async () => {
      const links = await file("links/index.html");
      expect(links).not.toContain('class="sg-head"');
      expect(links).not.toContain('class="sg-foot"');
      expect(links).toContain("Conteúdo Gratuito");
      expect(links).toContain("Marketplace");
      const nf = await file("404.html");
      expect(nf).toContain("A página não pode ser encontrada.");
      const cat = await file("category/redes-sociais/index.html");
      expect(cat).toContain("sg-search");
      expect(cat).toContain("Categoria:");
      expect(cat).toContain("sg-more");
      const posts = cat.match(/class="sb-post-card/g) ?? [];
      expect(posts).toHaveLength(
        site.posts.filter(p => p.categoryId === "cat-redes-sociais").length
      );
      // acima de 6 posts a lista esconde o excedente só com JS
      const all = await file("todos-os-posts/index.html");
      expect(all).toContain('data-step="9"');
      expect(all).toContain('data-sg-hide=""');
    },
    EXPORT_TIMEOUT
  );

  test(
    "post: imagem, categoria, título, data, corpo e a barra lateral",
    async () => {
      const post = site.posts[3];
      if (!post) throw new Error("sem post");
      const page = await file(`${post.slug}/index.html`);
      expect(page).toContain('class="sg-post-cover"');
      expect(page).toContain(`<h1 class="sg-post-title">`);
      expect(page).toContain('class="sg-side"');
      expect(page).toContain('class="sg-side-cats"');
      expect(page).toContain("sg-post-content");
    },
    EXPORT_TIMEOUT
  );

  test("menu marca a página atual", async () => {
    const page = await html(site, "/categorias/");
    expect(page).toMatch(/aria-current="page" href="\/categorias\/"/);
    expect(page).not.toMatch(/aria-current="page" href="\/blogs\/"/);
  });

  test("no editor a Lottie é um quadro e nada fica escondido", async () => {
    const page = await html(site, "/", "edit");
    expect(page).not.toContain("data-sb-lottie");
    expect(page).toContain("sb-lottie-ph");
    expect(page).not.toContain('data-sg-hide=""');
  });

  test("Lottie só aceita http(s) ou caminho do site", async () => {
    const s = structuredClone(site);
    const hero = s.pages[0]?.blocks.find(b => b.type === "sgHero");
    if (!hero) throw new Error("sem hero");
    hero.props.lottie1 = "javascript:alert(1)";
    const page = await html(s, "/");
    expect(page).not.toContain("javascript:");
    expect((page.match(/data-sb-lottie="/g) ?? []).length).toBe(1);
  });

  test("link de produto não aceita javascript:", async () => {
    const s = structuredClone(site);
    const prod = s.pages[0]?.blocks.find(b => b.type === "sgProducts");
    if (!prod) throw new Error("sem produtos");
    const items = prod.props.items as { url: string }[];
    if (items[0]) items[0].url = "javascript:alert(1)";
    expect(await html(s, "/")).not.toContain("javascript:");
  });

  test("sites sem a variante não recebem o CSS do Seguidores em Alta", async () => {
    const blog = getTemplate("blog-viagens");
    if (!blog) throw new Error("blog-viagens sumiu");
    const page = await html(blog.site, "/");
    expect(page).not.toContain("sb-sg");
  });
});
