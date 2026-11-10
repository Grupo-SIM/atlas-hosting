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

const template = getTemplate("zyrion");
if (!template) throw new Error("template zyrion não registrado");
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

async function html(s: Site, path: string, mode: "edit" | "view" = "view") {
  const { prelude } = await prerender(
    createElement(SiteRenderer, { mode, path, site: s, skipFxRuntime: true })
  );
  return new Response(prelude).text();
}

/** Títulos reais do site original: nenhum deles pode voltar no template. */
const ORIGINAL_TITLES = [
  "IPCA-15 desacelera para 0,32% em outubro, mas alimentos voltam a pressionar",
  "Felipe Massa doa R$ 80 mil à campanha de Flávio Bolsonaro, diz Metrópoles",
  "Trump volta a falar em enviar navios a Cuba após conflito com o Irã",
  "Enem passa a avaliar a qualidade do ensino médio a partir de 2026",
  "TSE dá 24 horas para Meta e X explicarem distribuição de conteúdo político",
  "Falhas críticas no PHP permitem ataques a servidores e exigem atualização urgente",
  "Anvisa alerta que suplemento divulgado no TikTok não tem autorização no Brasil",
  "Justiça encerra recuperação judicial da Americanas após crise bilionária",
  "Vazamento expõe acesso a 58 mil câmeras do Smart Sampa em São Paulo",
  "Brasil chega a seis milhões de domínios .br na internet",
  "Netflix aumenta preços no Brasil e plano Premium chega a R$ 71,90",
  "Hubble revela galáxia vista de lado a 37 milhões de anos-luz da Terra",
  "WhatsApp libera ligações com convidados que não têm conta no aplicativo",
  "Rafael Câmara é anunciado pela Haas para 2027 e será o 34º brasileiro na Fórmula 1",
  "Red Bull conquista primeira vitória com motor próprio na Fórmula 1 e surpreende rivais",
  "Kimi Antonelli pode ser campeão da Fórmula 1 no GP dos Estados Unidos; entenda a conta",
];
const ORIGINAL_TERMS = [
  "zyrion",
  "metrópoles",
  "agência brasil",
  "zyrionbrazil",
];

describe("template zyrion", () => {
  test("aparece na tela de escolha com tags e contagem de páginas", () => {
    const meta = listTemplates().find(t => t.id === "zyrion");
    expect(meta?.name).toBe("Portal Zyrion");
    expect(meta?.tags).toEqual(["Notícias", "Portal", "Blog"]);
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

  test("ids únicos, menu aponta para páginas existentes e slugs sem colisão", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slugs = site.pages.map(p => p.slug);
    for (const m of site.menu)
      expect(slugs).toContain(m.href.replaceAll("/", ""));
    const all = [...slugs, ...site.posts.map(p => p.slug), "category"];
    expect(new Set(all).size).toBe(all.length);
  });

  test("6 páginas de seção, comunidade, links (bare), pesquisa, 404 e 5 páginas legais", () => {
    const slugs = site.pages.map(p => p.slug);
    for (const s of [
      "mundo",
      "brasil",
      "tecnologia",
      "entretenimento",
      "educacao",
      "esportes",
      "comunidade",
      "links",
      "pesquisa",
      "404",
      "politica-de-privacidade",
      "termos-e-condicoes",
      "politica-de-anuncios",
      "politica-editorial",
      "corrigir-erros",
    ])
      expect(slugs).toContain(s);
    expect(site.pages.find(p => p.slug === "links")?.bare).toBe(true);
  });

  test("≥ 8 posts por categoria do menu e cerca de 50 no total", () => {
    for (const slug of [
      "mundo",
      "brasil",
      "tecnologia",
      "entretenimento",
      "educacao",
      "esportes",
    ]) {
      const cat = site.categories.find(c => c.slug === slug);
      expect(
        site.posts.filter(p => p.categoryId === cat?.id).length
      ).toBeGreaterThanOrEqual(8);
    }
    expect(site.posts.length).toBeGreaterThanOrEqual(50);
  });

  test(
    "exportSiteToStatic: home com slider, letreiro, tiles, anúncios; sem 'undefined'",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain("sb-zy");
      expect(home.match(/class="zy-slide"/g)).toHaveLength(6);
      expect(home).toContain("data-zy-slider");
      const ticker =
        home.split('class="zy-tick-track"')[1]?.split("</div>")[0] ?? "";
      expect(ticker.match(/<a /g)).toHaveLength(10);
      expect(home.match(/class="zy-tile"/g)).toHaveLength(6);
      expect(home).toContain("zy-ov-grid");
      expect(home.match(/sb-ad-box/g)?.length).toBeGreaterThanOrEqual(3);
      expect(home).toContain("data-sb-today");
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
    "/links/ não tem cabeçalho nem rodapé; 404 existe",
    async () => {
      const files = await exportOnce();
      const links =
        files.find(f => f.path === "links/index.html")?.content ?? "";
      expect(links).toContain("zy-bio");
      expect(links).not.toContain('data-zy="header"');
      expect(links).not.toContain('data-zy="footer"');
      expect(files.some(f => f.path === "404.html")).toBe(true);
    },
    EXPORT_TIMEOUT
  );

  test(
    "post renderiza sidebar e 'Mais novidades'; arquivo tem 'carregar mais'",
    async () => {
      const post = site.posts[0];
      if (!post) throw new Error("sem posts");
      const page = await html(site, `/${post.slug}/`);
      expect(page).toContain('data-zy="newsletter"');
      expect(page).toContain('data-zy="moreNews"');
      expect(page).toContain('data-zy="postHead"');
      const cat = await html(site, "/category/mundo/");
      expect(cat).toContain("zy-more");
      expect(cat).toContain("zy-arch-head");
    },
    EXPORT_TIMEOUT
  );

  test("o cabeçalho marca a página atual e a busca vai para /pesquisa/", async () => {
    const page = await html(site, "/mundo/");
    expect(page).toContain('aria-current="page"');
    expect(page).toContain("/pesquisa/");
  });

  test(
    "nenhum texto do site original volta (títulos de notícias, nome, domínio)",
    async () => {
      const files = await exportOnce();
      const visible = files
        .map(f =>
          f.content
            .replace(/<(style|script)[\s\S]*?<\/\1>/g, " ")
            .replace(/<[^>]+>/g, " ")
            .toLowerCase()
        )
        .join(" ");
      const json = JSON.stringify(site).toLowerCase();
      for (const t of ORIGINAL_TITLES) {
        expect(json).not.toContain(t.toLowerCase());
        expect(visible).not.toContain(t.toLowerCase());
      }
      // O nome do original nunca aparece no conteúdo visível do site.
      for (const t of ORIGINAL_TERMS) expect(visible).not.toContain(t);
      expect(BRAND.name).not.toMatch(/zyrion/i);
    },
    EXPORT_TIMEOUT
  );
});
