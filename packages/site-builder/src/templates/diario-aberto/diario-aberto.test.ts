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

const template = getTemplate("diario-aberto");
if (!template) throw new Error("template diario-aberto não registrado");
const { site } = template;

/** O export de todas as rotas é caro: os testes compartilham uma execução só. */
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

async function html(s: Site, path: string, query: Record<string, string> = {}) {
  const { prelude } = await prerender(
    createElement(SiteRenderer, {
      mode: "view",
      path,
      query,
      site: s,
      skipFxRuntime: true,
    })
  );
  return new Response(prelude).text();
}

/** Marca, autora, domínio, arquivos e manchetes da demo que inspirou o layout: nada disso pode voltar. */
const ORIGINAL_TERMS = [
  "mydiary",
  "my diary",
  "shailja",
  "reddy",
  "melbourne",
  "dexignzone",
  "news360-html",
  "images/pattern/",
  "trending-post/",
  "masonry/pic",
  "lorem ipsum",
];
const ORIGINAL_TITLES = [
  "hobo bag",
  "allergy season",
  "las catalinas",
  "lori loughlin",
  "natural hair guru",
  "dolce vita",
];

const visibleText = (content: string) =>
  content
    .replace(/<(style|script)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .toLowerCase();

/** Trecho do HTML entre dois marcadores. */
const between = (content: string, from: string, to?: string) => {
  const i = content.indexOf(from);
  if (i < 0) return "";
  const rest = content.slice(i);
  const j = to ? rest.indexOf(to, from.length) : -1;
  return j < 0 ? rest : rest.slice(0, j);
};

describe("template diario-aberto", () => {
  test("aparece na tela de escolha com nome e tags", () => {
    const meta = listTemplates().find(t => t.id === "diario-aberto");
    expect(meta?.name).toBe("Diário Aberto — Blog Pessoal");
    expect(meta?.tags).toEqual(["Blog", "Estilo de vida"]);
    expect(meta?.pageCount).toBe(site.pages.length);
    expect(meta?.description).toContain("grade masonry");
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

  test("ids únicos, menu aponta para páginas e categorias existentes, slugs sem colisão", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.menu.map(m => m.label)).toEqual([
      "Início",
      "Categorias",
      "Sobre",
      "Contato",
    ]);
    const pages = site.pages.map(p => `/${p.slug}/`);
    for (const m of site.menu) {
      if (m.dynamic === "categories") continue;
      expect(["/", ...pages]).toContain(m.href);
    }
    expect(site.menu.filter(m => m.dynamic === "categories")).toHaveLength(1);
    const all = [
      ...site.pages.map(p => p.slug),
      ...site.posts.map(p => p.slug),
      "category",
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  test("páginas e posts: home, pesquisa, sobre, contato, legais e 404; ~30 posts nas 5 categorias", () => {
    const slugs = site.pages.map(p => p.slug);
    for (const s of [
      "",
      "pesquisa",
      "sobre",
      "contato",
      "privacidade",
      "termos",
      "404",
    ])
      expect(slugs).toContain(s);
    expect(site.categories.map(c => c.name)).toEqual([
      "Beleza",
      "Estilo de vida",
      "Moda",
      "Viagem",
      "Bem-estar",
    ]);
    for (const c of site.categories) {
      const n = site.posts.filter(p => p.categoryId === c.id).length;
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(7);
    }
    expect(site.posts.length).toBe(30);
    for (const p of site.posts) {
      expect(p.publishedAt?.startsWith("2026")).toBe(true);
      expect(p.blocks.length).toBeGreaterThanOrEqual(6);
      expect(p.coverImage).toBeTruthy();
    }
  });

  test(
    "exportSiteToStatic: home com mosaico de 4, 15 cartões visíveis + CARREGAR MAIS, faixa de fotos, rodapé e modal; sem 'undefined'",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain("sb-dd");
      // layout "home" na página inicial
      expect(home).toContain('class="dd-header dd-home"');
      // mosaico: 4 cartões sobre foto (1 grande + 3)
      const mosaic = between(home, 'data-dd="featured"', 'data-dd="masonry"');
      expect(mosaic.match(/<article class="dd-card dd-ov/g)).toHaveLength(4);
      expect(mosaic).toContain("<h2");
      // masonry: 15 visíveis, o resto escondido até o "carregar mais"
      const masonry = between(
        home,
        'data-dd="masonry"',
        'data-dd="photoStrip"'
      );
      const cards = masonry.match(/<article class="dd-card[^>]*>/g) ?? [];
      expect(cards.length).toBeGreaterThan(15);
      expect(cards.filter(c => !c.includes("data-sg-hide")).length).toBe(15);
      expect(masonry).toContain("CARREGAR MAIS");
      expect(masonry).toContain('data-step="15"');
      // cartões alternados: claro (1º), sobre foto (2º)
      expect(cards[0]).toContain("dd-light");
      expect(cards[1]).toContain("dd-ov-center");
      // primeira letra destacada e balão de compartilhar nos cartões claros
      expect(masonry.match(/class="dd-ctitle dd-fl"/g)?.length).toBeGreaterThan(
        3
      );
      for (const net of ["facebook", "linkedin", "twitter", "whatsapp"])
        expect(masonry).toContain(`data-dd-net="${net}"`);
      // faixa de fotos (7 fotos + cópia para o laço), rodapé, modal e voltar ao topo
      const strip = between(home, 'data-dd="photoStrip"', "<footer");
      expect(strip.match(/class="dd-pitem"/g)).toHaveLength(14);
      expect(home).toContain('data-dd="footer"');
      expect(home).toContain('id="dd-subscribe"');
      expect(home).toContain("popover");
      expect(home).toContain("Junte-se a nós hoje");
      expect(home).toContain("data-sb-top");
      for (const f of files.filter(x => x.path.endsWith(".html"))) {
        expect(f.content, f.path).not.toContain("Bloco desconhecido");
        expect(
          f.content.replace(/<script[\s\S]*?<\/script>/g, ""),
          f.path
        ).not.toContain("undefined");
      }
    },
    EXPORT_TIMEOUT
  );

  test(
    "mega-menu lista as 5 categorias e 4 posts por aba; busca e menu lateral existem",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      const mega = between(home, 'class="dd-mega"', "</header>");
      expect(mega).toContain(">Todas<");
      for (const c of site.categories) expect(mega).toContain(`>${c.name}<`);
      // 6 abas ("Todas" + 5 categorias) × 4 posts
      expect(mega.match(/class="dd-mpost"/g)).toHaveLength(24);
      expect(mega.match(/class="dd-tabpanel"/g)).toHaveLength(6);
      expect(home).toContain('id="dd-search"');
      expect(home).toContain('id="sb-burger"');
      expect(home).toContain('action="/pesquisa/"');
    },
    EXPORT_TIMEOUT
  );

  test(
    "post e categoria: cabeçalho compacto e barra lateral com os widgets (vlog só com vídeos); 404 existe",
    async () => {
      const post = site.posts[3];
      if (!post) throw new Error("sem posts");
      const page = await html(site, `/${post.slug}/`);
      expect(page).toContain('class="dd-header dd-compact"');
      expect(page).toContain("<blockquote");
      expect(page).toContain("<h2");
      expect(page).toContain("<ul>");
      expect(page).toContain("Tags:");
      expect(page).toContain("POST ANTERIOR");
      expect(page).toContain("PRÓXIMO POST");
      expect(page).toContain("Eu sou a");
      expect(page).toContain('class="dd-nets dd-share"');
      for (const w of ["Sobre mim", "Posts populares", "Categorias"])
        expect(page).toContain(w);
      expect(page).not.toContain("Último vlog");

      const cat = await html(site, "/category/moda/");
      expect(cat).toContain('class="dd-header dd-compact"');
      expect(cat).toContain("Categoria:");
      expect(cat).toContain("<h1>Moda</h1>");
      expect(cat).toContain('data-dd="sidebar"');
      expect(cat).toContain("dd-two");

      // com vídeos, o widget aparece
      const withVideo = structuredClone(site);
      for (const b of allBlocks(withVideo.categoryLayout))
        if (b.type === "ddSidebar")
          b.props.videos = [
            {
              thumb: "",
              title: "Vlog de exemplo",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
          ];
      const catVideo = await html(withVideo, "/category/moda/");
      expect(catVideo).toContain("Último vlog");
      expect(catVideo).toContain("data-sb-video");

      const files = await exportOnce();
      const nf = files.find(f => f.path === "404.html")?.content ?? "";
      expect(nf).toContain("dd-nf-code");
      expect(nf).toContain(">404<");
    },
    EXPORT_TIMEOUT
  );

  test("busca, sobre e contato", async () => {
    const busca = await html(site, "/pesquisa/", { q: "caminhada" });
    expect(busca).toContain("Resultados para:");
    expect(busca).toContain("caminhada");
    // só os resultados são filtrados (a barra lateral lista os posts mais recentes)
    const results = between(busca, 'data-dd="masonry"', 'data-dd="sidebar"');
    expect(results).toContain("Caminhada diária");
    expect(results).not.toContain("Maquiagem de quatro produtos");
    const sobre = await html(site, "/sobre/");
    expect(sobre).toContain("Sobre mim");
    expect(sobre).toContain("<blockquote");
    const contato = await html(site, "/contato/");
    expect(contato).toContain("data-dd-form");
    expect(contato).toContain("Contato");
    // sem URL de envio o formulário não manda nada (sem `action`)
    expect(contato).not.toContain('action="http');
  });

  test(
    "nenhum texto, arquivo ou manchete da demo original volta, nem as métricas fixas",
    async () => {
      const files = await exportOnce();
      const visible = files.map(f => visibleText(f.content)).join(" ");
      const json = JSON.stringify(site).toLowerCase();
      const raw = files.map(f => f.content.toLowerCase()).join(" ");
      for (const t of ORIGINAL_TERMS) {
        expect(visible, t).not.toContain(t);
        expect(json, t).not.toContain(t);
        expect(raw, t).not.toContain(t);
      }
      for (const t of ORIGINAL_TITLES) {
        expect(visible, t).not.toContain(t);
        expect(json, t).not.toContain(t);
      }
      // métricas inventadas da demo (curtidas/visualizações iguais em todos os cartões)
      expect(visible).not.toMatch(/(^|\D)(231|584|397)(\D|$)/);
      expect(BRAND.name).toBe("Diário Aberto");
    },
    EXPORT_TIMEOUT
  );
});
