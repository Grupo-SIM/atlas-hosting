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

const template = getTemplate("marketing-raiz");
if (!template) throw new Error("template marketing-raiz não registrado");
const { site } = template;

let exported: ReturnType<typeof exportSiteToStatic> | undefined;
const exportOnce = () => (exported ??= exportSiteToStatic(site));
const EXPORT_TIMEOUT = 180_000;

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

const FUNNEL = [
  "plano",
  "entrar-na-sala",
  "sala",
  "historia",
  "liberacao-de-disponibilidade",
  "solicitacao-pre-aprovada",
  "quiz-desafio-fraternidade",
  "ultimo-passo",
];

describe("template marketing-raiz", () => {
  test("aparece na tela de escolha com tags e contagem de páginas", () => {
    const meta = listTemplates().find(t => t.id === "marketing-raiz");
    expect(meta?.tags).toEqual(["Blog", "Marketing", "Funil"]);
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

  test("conteúdo do original: 42 posts, 4 categorias, páginas, menu e funil", () => {
    expect(site.posts).toHaveLength(42);
    expect(site.categories.map(c => c.slug).sort()).toEqual([
      "estudos",
      "funil-de-vendas",
      "marketing",
      "vendas",
    ]);
    const slugs = site.pages.map(p => p.slug);
    for (const s of [
      "",
      "categorias",
      "blogs",
      "pesquisa",
      "links",
      "404",
      "termos-de-uso",
      "politica-de-privacidade",
      ...FUNNEL,
    ])
      expect(slugs).toContain(s);
    expect(site.menu.map(m => m.label)).toEqual([
      "Categorias",
      "Blogs",
      "Central do Marketing",
      "007SpyHacker",
      "Seguidores em alta",
      "Renovada",
      "Zyrion Brazil",
      "Marketplace",
    ]);
    expect(site.theme.variant).toBe("raiz");
    for (const p of site.pages.filter(pg => FUNNEL.includes(pg.slug)))
      expect(p.bare).toBe(true);
  });

  test("ids de bloco únicos; posts em categorias existentes; slugs sem colisão", () => {
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
  });

  test("marca e contatos vêm de brand.ts", () => {
    expect(site.name).toBe(BRAND.name);
    expect(site.footer[0]?.props.copyright).toBe(BRAND.copyright);
    const legal = JSON.stringify(
      site.pages.find(p => p.slug === "politica-de-privacidade")
    );
    expect(legal).toContain(BRAND.email);
  });

  test("nada do funil original: sem os textos de apostas/escassez nem as imagens da série", () => {
    const funnel = JSON.stringify(
      site.pages.filter(p => FUNNEL.includes(p.slug))
    ).toLowerCase();
    for (const t of [
      "betai",
      "pré-aprovada",
      "pre-aprovada.",
      "não é uma estratégia de marketing",
      "michael",
      "lincoln",
    ])
      expect(funnel).not.toContain(t);
    const everything = JSON.stringify(site).toLowerCase();
    expect(everything).not.toContain("prison-break");
    expect(everything).not.toContain("lincoln-burrows");
    expect(everything).not.toContain("betai");
  });

  test(
    "exportSiteToStatic gera HTML sem erro em todas as rotas",
    async () => {
      const files = await exportOnce();
      const expected =
        site.pages.length + site.posts.length + site.categories.length + 1;
      expect(files).toHaveLength(expected);
      expect(new Set(files.map(f => f.path)).size).toBe(files.length);
      for (const f of files) {
        expect(f.content.startsWith("<!doctype html>")).toBe(true);
        expect(f.content).toContain("sb-mr");
        expect(f.content).not.toContain("Bloco desconhecido");
        expect(f.content).not.toContain("undefined");
        expect(f.content).not.toContain("[object Object]");
      }
    },
    EXPORT_TIMEOUT
  );

  test(
    "home: botão flutuante, hero com 2 posts, carrossel com miniaturas e LPs, 4 depoimentos e grade paginada",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain("sb-float-pill");
      expect(home).toContain(BRAND.float.url);
      expect((home.match(/class="mr-hc"/g) ?? []).length).toBe(2);
      expect((home.match(/class="mr-thumb-btn/g) ?? []).length).toBe(5);
      expect(home).toContain(
        "https://lp.centraldomarketing.com/gatilhos-mentais/"
      );
      expect(home).toContain("https://757presets.centraldomarketing.com/");
      expect((home.match(/class="sg-t"/g) ?? []).length).toBe(4);
      expect(home).toContain('data-mr-pages="10"');
      // 42 posts em 5 páginas
      expect((home.match(/data-mr-go=/g) ?? []).length).toBe(5);
      expect(
        (home.match(/data-mr-page=/g) ?? []).length
      ).toBeGreaterThanOrEqual(42);
      expect(home).toContain("mr-st");
    },
    EXPORT_TIMEOUT
  );

  test(
    "funil: sem cabeçalho/rodapé, botão atrasado (90s e 30s), quiz com a barra e botão flutuante",
    async () => {
      const files = await exportOnce();
      const get = (p: string) =>
        files.find(f => f.path === `${p}/index.html`)?.content ?? "";
      for (const slug of FUNNEL) {
        const page = get(slug);
        expect(page, slug).not.toContain('<header class="mr-head"');
        expect(page, slug).not.toContain('<footer class="mr-foot"');
        expect(page, slug).toContain("sb-float-pill");
      }
      expect(get("plano")).toContain('data-mr-delay="90"');
      expect(get("sala")).toContain('data-mr-delay="30"');
      expect(get("plano")).toContain("youtube-nocookie.com/embed/");
      expect(get("entrar-na-sala")).toContain("mr-bar-fill");
      expect(get("entrar-na-sala")).toContain('data-step="3.7"');
      expect(get("entrar-na-sala")).toContain('data-interval="250"');
      expect(get("historia")).toContain("data-mr-flow");
      expect(get("solicitacao-pre-aprovada")).toContain('type="email"');
    },
    EXPORT_TIMEOUT
  );

  test("no editor o botão atrasado e as telas aparecem (sem a classe sb-js)", async () => {
    const page = await html(site, "/plano/", "edit");
    expect(page).toContain("mr-vsl-btn");
    expect(page).not.toMatch(/class="sb [^"]*sb-js/);
  });

  test("menu marca a página atual", async () => {
    const page = await html(site, "/categorias/");
    expect(page).toMatch(/aria-current="page" href="\/categorias\/"/);
  });
});
