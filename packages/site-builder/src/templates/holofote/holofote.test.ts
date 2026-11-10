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

const template = getTemplate("holofote");
if (!template) throw new Error("template holofote não registrado");
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

/** Manchetes reais que estavam na home do site original em 2026-11-10: nenhuma pode voltar no template. */
const ORIGINAL_TITLES = [
  "Lá Na Minha Terra: Nova novela da Globo vira alvo de críticas por cenas que retratam o Nordeste",
  'Professora de Lucas Guedez explica ausência no "Dança dos Famosos" e revela decisão tomada nos bastidores',
  "Mel Maia revela motivo delicado que a fez interromper transição capilar",
  "SBT toma atitude para tentar colocar ponto final na polêmica entre Virginia e Silvia Abravanel",
  "Amanda Seyfried revela reação da filha ao assistir a “Meninas Malvadas” pela primeira vez",
  "Belutti fala pela 1ª vez após acidente de carro em SP e atualiza estado de saúde",
  "Gracyanne Barbosa revela real motivo de término com Belo",
  "Gracyanne Barbosa manda a real ao ser questionada se já usou anabolizantes",
  "Bonnie Wright, atriz de “Harry Potter”, revela condição de saúde do filho recém-nascido",
  "Fonte revela bastidores da reaproximação entre Taylor Swift e Karlie Kloss",
  "Sheila Mello faz procedimentos estéticos no bumbum e no abdômen",
  "Daniel Radcliffe surpreende ao revelar se pretende assistir à nova série de “Harry Potter”",
  "Gracyanne Barbosa revela cachê do “Dança dos Famosos”",
  "Prêmio Multishow 2026: Anitta lidera indicações",
  "Quem Ama Cuida: Saiba quando será exibida 1ª cena de sexo entre Mau Mau e Felipe",
  "Marca de Kim Kardashian anuncia decisão após polêmica envolvendo o calendário do Advento",
];
const ORIGINAL_TERMS = [
  "hugo gloss",
  "hugogloss",
  "gloss",
  "baphos",
  "uol",
  "moustache",
  "jms comunicação",
  "media.hugogloss",
];
/** Pessoas, emissoras e programas reais: nenhum nome pode aparecer nos posts do template. */
const REAL_NAMES = [
  "anitta",
  "gracyanne",
  "taylor swift",
  "kim kardashian",
  "neymar",
  "ivete sangalo",
  "xuxa",
  "silvio santos",
  "faustão",
  "virginia fonseca",
  "globo",
  "multishow",
  "record",
  "sbt",
  "netflix",
  "big brother",
  "dança dos famosos",
];

const visibleText = (content: string) =>
  content
    .replace(/<(style|script)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .toLowerCase();

describe("template holofote", () => {
  test("aparece na tela de escolha com nome e tags", () => {
    const meta = listTemplates().find(t => t.id === "holofote");
    expect(meta?.name).toBe("Holofote — Portal de Famosos");
    expect(meta?.tags).toEqual(["Notícias", "Entretenimento"]);
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

  test("ids únicos, menu aponta para categorias existentes e slugs sem colisão", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cats = site.categories.map(c => `/category/${c.slug}/`);
    for (const m of site.menu) expect(cats).toContain(m.href);
    expect(site.menu.map(m => m.label)).toEqual([
      "Música",
      "Filmes",
      "TV",
      "Famosos",
      "Premiações",
      "Buzz",
      "Entrevistas",
    ]);
    const all = [
      ...site.pages.map(p => p.slug),
      ...site.posts.map(p => p.slug),
      "category",
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  test("páginas: home, pesquisa, tag, sobre, contato, legais e 404; ~40 posts nas categorias do menu", () => {
    const slugs = site.pages.map(p => p.slug);
    for (const s of [
      "",
      "pesquisa",
      "tag",
      "sobre",
      "contato",
      "privacidade",
      "termos",
      "404",
    ])
      expect(slugs).toContain(s);
    for (const m of site.menu) {
      const cat = site.categories.find(c => `/category/${c.slug}/` === m.href);
      expect(
        site.posts.filter(p => p.categoryId === cat?.id).length
      ).toBeGreaterThanOrEqual(5);
    }
    expect(site.posts.length).toBeGreaterThanOrEqual(40);
  });

  test(
    "exportSiteToStatic: home com destaques 1+4, grade com anúncios, 'Veja mais', rodapé e modal; sem 'undefined'",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain("sb-hf");
      expect(home.match(/class="hf-fcard/g)).toHaveLength(5);
      expect(home).toContain("hf-fbig");
      expect(home).toContain("hf-grid");
      expect(home.match(/class="hf-adcell"/g)?.length).toBeGreaterThanOrEqual(
        2
      );
      expect(home).toContain("Veja mais");
      expect(home).toContain("hf-adstrip");
      expect(home.match(/class="hf-foot-col/g)).toHaveLength(4);
      expect(home).toContain('class="hf-modal"');
      expect(home).toContain("data-hf-share");
      expect(home).toContain("data-hf-ago");
      // 12 cartões visíveis, o resto escondido até o "Veja mais"
      expect(home.match(/class="hf-card" hidden/g)?.length).toBeGreaterThan(0);
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
    "categoria: cabeçalho escuro, nome ao lado do logo e lista com rolagem; 404 existe",
    async () => {
      const cat = await html(site, "/category/musica/");
      expect(cat).toContain('class="hf-header hf-dark"');
      expect(cat).toContain('class="hf-catname"');
      expect(cat).toContain("hf-twocol-b");
      expect(cat).toContain("hf-feat veil");
      const home = await html(site, "/");
      expect(home).not.toContain('class="hf-header hf-dark"');
      const files = await exportOnce();
      expect(files.some(f => f.path === "404.html")).toBe(true);
      const nf = files.find(f => f.path === "404.html")?.content ?? "";
      expect(nf).toContain("hf-nf-code");
      expect(nf).toContain(">404<");
      expect(nf).toContain("Ops...");
    },
    EXPORT_TIMEOUT
  );

  test(
    "post: etiqueta, resumo, anúncio 'Continua depois da Publicidade', LEIA TAMBÉM, tags, navegação e barra lateral",
    async () => {
      const post = site.posts[3];
      if (!post) throw new Error("sem posts");
      const page = await html(site, `/${post.slug}/`);
      expect(page).toContain("hf-pcat");
      expect(page).toContain("Ler resumo");
      expect(page).toContain("Continua depois da Publicidade");
      expect(page).toContain("LEIA TAMBÉM:");
      expect(page).toContain("hf-tags");
      expect(page).toContain("NOTÍCIA ANTERIOR");
      expect(page).toContain("PRÓXIMA NOTÍCIA");
      expect(page).toContain('data-hf="sidebar"');
      expect(page).toContain("hf-ad-sticky");
      expect(page).toContain("Compartilhe:");
      expect(page).toContain(BRAND.followText);
    },
    EXPORT_TIMEOUT
  );

  test("tag e busca: 'Resultados para' + lista filtrada; menu marca a página atual", async () => {
    const tag = await html(site, "/tag/", { q: "Música" });
    expect(tag).toContain("Resultados para Tag:");
    expect(tag).toContain("Música");
    expect(tag).toContain("hf-li");
    expect(tag).toContain("Newsletter Holofote");
    const busca = await html(site, "/pesquisa/", { q: "turnê" });
    expect(busca).toContain("Resultados para:");
    expect(busca).toContain("Lia Moraes");
    expect(busca).not.toContain("Pipa e o Dragão");
    const cat = await html(site, "/category/tv/");
    expect(cat).toContain('aria-current="page"');
    expect(cat).toContain("/pesquisa/");
  });

  test(
    "nenhum texto do site original volta (manchetes, marca, domínio, imagens) nem nome de celebridade real",
    async () => {
      const files = await exportOnce();
      const visible = files.map(f => visibleText(f.content)).join(" ");
      const json = JSON.stringify(site).toLowerCase();
      for (const t of ORIGINAL_TITLES) {
        expect(json).not.toContain(t.toLowerCase());
        expect(visible).not.toContain(t.toLowerCase());
      }
      for (const t of ORIGINAL_TERMS) {
        expect(visible, t).not.toContain(t);
        expect(json, t).not.toContain(t);
      }
      const posts = JSON.stringify(site.posts).toLowerCase();
      for (const n of REAL_NAMES)
        expect(posts, n).not.toMatch(
          new RegExp(`(^|[^\\p{L}])${n}([^\\p{L}]|$)`, "u")
        );
      expect(BRAND.name).not.toMatch(/gloss/i);
    },
    EXPORT_TIMEOUT
  );
});
