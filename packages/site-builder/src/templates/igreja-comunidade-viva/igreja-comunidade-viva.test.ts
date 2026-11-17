import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block, Site } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("igreja-comunidade-viva");
if (!template)
  throw new Error("template igreja-comunidade-viva não registrado");
const { site } = template;

let exported: ReturnType<typeof exportSiteToStatic> | undefined;
const exportOnce = () => (exported ??= exportSiteToStatic(site));
const EXPORT_TIMEOUT = 120_000;

const allBlocks = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...allBlocks(b.children ?? [])]);

const everyBlock = (s: Site) => [
  ...s.pages.flatMap(p => allBlocks(p.blocks)),
  ...allBlocks(s.header),
  ...allBlocks(s.footer),
];

async function html(s: Site, path = "/") {
  const { prelude } = await prerender(
    createElement(SiteRenderer, {
      mode: "view",
      path,
      query: {},
      site: s,
      skipFxRuntime: true,
    })
  );
  return new Response(prelude).text();
}

const noScripts = (c: string) =>
  c
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");

/** O que identifica o site de referência e não pode voltar. */
const FORBIDDEN = [
  "Renovada",
  "renovada",
  "RENOVADA",
  "renovada12",
  "Dayse",
  "Afif",
  "Arão",
  "Vida Para As Nações",
  "Vida para as Nações",
  "Temores Secretos",
  "Deus tem o melhor",
  "jbmidia",
  "JB Mídia",
  "JB Midia",
  "Rio Branco",
  "Jáguari",
  "Isaura Parente",
  "Nova Estação",
  "3227-2226",
  "KyQDCL1WjUBFOrYb556hLA",
  "4ua5Mv1PwwqUjw7Fj3Y764",
  "UOHh3nZcQJE",
  "bg-principal-igreja-renovada",
  "circulo-play",
  "bg-transp-renovada12",
  "igreja_home2",
];

const file = (files: { content: string; path: string }[], path: string) =>
  files.find(f => f.path === path)?.content ?? "";

describe("template igreja-comunidade-viva", () => {
  test("aparece na tela de escolha com nome e tags", () => {
    const meta = listTemplates().find(t => t.id === "igreja-comunidade-viva");
    expect(meta?.name).toBe("Comunidade Viva — Igreja");
    expect(meta?.tags).toEqual(["Institucional", "Igreja"]);
    expect(meta?.pageCount).toBe(site.pages.length);
  });

  test("passa no siteSchema e toda prop é válida para o schema do bloco", () => {
    const parsed = siteSchema.safeParse(site);
    if (!parsed.success) console.error(parsed.error.issues.slice(0, 5));
    expect(parsed.success).toBe(true);
    for (const b of everyBlock(site)) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      const p = def?.schema.safeParse(b.props);
      if (!p?.success) console.error(b.type, p?.error.issues);
      expect(p?.success, b.type).toBe(true);
    }
  });

  test("ids únicos; páginas esperadas; links do menu apontam para páginas que existem", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug).sort()).toEqual(
      [
        "",
        "404",
        "agenda",
        "celulas",
        "localizacao",
        "privacidade",
        "sobre",
        "termos",
      ].sort()
    );
    const slugs = site.pages.map(p => p.slug);
    for (const m of site.menu) {
      expect(m.href.startsWith("/")).toBe(true);
      expect(slugs).toContain(m.href.replace(/^\/|\/$/g, ""));
    }
    expect(site.menu.map(m => m.label)).toEqual([
      "Início",
      "Nossa história",
      "Agenda",
      "Células",
      "Localização",
    ]);
  });

  test(
    "export estático: topo, hero, explore, banner, rodapé e as páginas internas",
    async () => {
      const files = await exportOnce();
      const home = file(files, "index.html");
      const body = noScripts(home);
      expect(home).toContain("sb-cv");
      expect(body.match(/<h1[ >]/g)).toHaveLength(1);

      // topo: hambúrguer, atalhos, submenu de redes e gaveta com os 5 itens
      expect(home).toContain('id="sb-burger"');
      const short =
        home.match(/<nav aria-label="Atalhos"[\s\S]*?<\/nav>/)?.[0] ?? "";
      expect(short).toContain(">Agenda<");
      expect(short).toContain(">Células<");
      expect(short.match(/<li>/g)).toHaveLength(6);
      const drawer =
        home.match(/<aside aria-label="Menu"[\s\S]*?<\/aside>/)?.[0] ?? "";
      expect(drawer).toContain(">Nossa história<");
      expect(drawer).toContain(">Localização<");

      // hero: foto, vídeo em popup e podcast
      const hero =
        home.match(/<section class="cv-hero">[\s\S]*?<\/section>/)?.[0] ?? "";
      expect(hero).toContain('class="cv-photo"');
      expect(hero).toMatch(
        /<a [^>]*class="cv-vid"[^>]*data-sb-video="https:\/\/www\.youtube-nocookie\.com\//
      );
      expect(hero).toContain('class="cv-listen"');

      // "Explore": 6 cartões com link
      const cards = home.match(/<a class="cv-card" href="[^"]+"/g) ?? [];
      expect(cards).toHaveLength(6);

      // banner e rodapé
      expect(home).toContain('class="cv-banner"');
      const foot =
        home.match(/<footer class="cv-foot">[\s\S]*?<\/footer>/)?.[0] ?? "";
      expect(foot).toContain('href="mailto:contato@exemplo.com"');
      expect(foot).toContain("maps/search");

      // história
      const sobre = file(files, "sobre/index.html");
      expect(noScripts(sobre).match(/<h1[ >]/g)).toHaveLength(1);
      expect(sobre).toContain("cv-story");

      // agenda: 7 abas com ARIA e 7 painéis
      const agenda = file(files, "agenda/index.html");
      expect(agenda.match(/role="tab"/g)).toHaveLength(7);
      expect(agenda.match(/role="tabpanel"/g)).toHaveLength(7);
      expect(agenda).toContain('role="tablist"');
      expect(agenda).toContain("Culto de celebração – 8h (Sede)");

      // células: 12 bairros, cada um com detalhe (popover) e WhatsApp
      const cells = file(files, "celulas/index.html");
      expect(cells.match(/class="cv-hood"/g)).toHaveLength(12);
      expect(cells.match(/class="cv-pop"/g)).toHaveLength(12);
      expect(
        cells.match(/href="https:\/\/wa\.me\/5500000000000\?text=/g)
      ).toHaveLength(12);
      const wa = cells.match(/href="(https:\/\/wa\.me\/[^"]+)"/)?.[1] ?? "";
      expect(decodeURIComponent(wa)).toContain(
        "Quero participar da célula do bairro Centro."
      );

      // localização: mapa com title + um JSON-LD Church por sede
      const loc = file(files, "localizacao/index.html");
      expect(loc).toMatch(/<iframe[^>]*class="cv-map"[^>]*title="[^"]+"/);
      expect(loc).toContain('loading="lazy"');
      const ld =
        loc.match(/<script type="application\/ld\+json">[^<]*<\/script>/g) ??
        [];
      expect(ld).toHaveLength(4);
      for (const s of ld) expect(s).toContain('"@type":"Church"');

      for (const f of files.filter(x => x.path.endsWith(".html"))) {
        expect(f.content, f.path).not.toContain("Bloco desconhecido");
        expect(noScripts(f.content), f.path).not.toContain("undefined");
        expect(f.content, f.path).not.toContain('href=""');
        expect(f.content, f.path).not.toContain('href="#"');
        expect(f.content, f.path).not.toContain('href="mailto:"');
      }
    },
    EXPORT_TIMEOUT
  );

  test("selos de app e podcast só aparecem com URL; as notas ficam desligadas", async () => {
    const base = noScripts(await html(site));
    expect(base).not.toContain("cv-store");
    expect(base).not.toContain("cv-app");
    expect(base).not.toContain("Gostaram");
    expect(base).not.toContain("Pontuação");
    expect(base).not.toContain("9.2");
    expect(base).not.toContain("8.7");

    const s = structuredClone(site);
    s.theme.appStoreUrl = "https://apps.apple.com/app/exemplo";
    s.theme.playStoreUrl =
      "https://play.google.com/store/apps/details?id=exemplo";
    const withApp = noScripts(await html(s));
    expect(withApp).toContain("cv-store");
    expect(withApp.match(/class="cv-store"/g)).toHaveLength(4); // hero + rodapé
    s.theme.showApp = "no";
    expect(noScripts(await html(s))).not.toContain("cv-store");

    const noPod = structuredClone(site);
    noPod.theme.podcastUrl = "";
    const out = noScripts(await html(noPod));
    expect(out).not.toContain("cv-listen");
    expect(out).not.toContain("cv-ring");

    const rates = structuredClone(site);
    const hero = rates.pages[0]?.blocks.find(b => b.type === "cvHero");
    if (hero) hero.props.ratings = "yes";
    expect(noScripts(await html(rates))).toContain("Gostaram");
  });

  test("sem vídeo no tema o botão e o texto do celular somem; contatos viram links só com valor", async () => {
    const s = structuredClone(site);
    s.theme.welcomeVideo = "";
    s.theme.contactEmail = "";
    const out = noScripts(await html(s));
    expect(out).not.toContain("data-sb-video");
    expect(out).not.toContain("mailto:");
    expect(out).not.toContain("tel:"); // telefone vazio no modelo
    const withPhone = structuredClone(site);
    withPhone.theme.phone = "(00) 0000-0000";
    expect(noScripts(await html(withPhone))).toContain('href="tel:0000000000"');
  });

  test("o 'Explore mais conteúdo' some nas páginas legais e na 404, mas fica nas demais", async () => {
    const files = await exportOnce();
    for (const p of ["sobre", "agenda", "celulas", "localizacao"])
      expect(file(files, `${p}/index.html`), p).toContain('class="cv-explore"');
    for (const p of ["privacidade", "termos", "404"]) {
      const c = file(files, `${p}/index.html`);
      expect(c, p).not.toContain('class="cv-explore"');
      expect(c, p).toContain('class="cv-banner"');
      expect(c, p).toContain('class="cv-foot"');
      expect(c, p).toContain('class="cv-nav');
    }
    expect(file(files, "404/index.html")).toContain("Voltar ao início");
  });

  test("regressão de largura: nenhum elemento do CSS passa de 100% (a referência tinha rolagem lateral)", async () => {
    const css =
      (await html(site)).match(/<style>([\s\S]*?)<\/style>/g)?.join("") ?? "";
    expect(css).not.toMatch(/width:\s*(10[1-9]|1[1-9]\d)%/);
  });

  test("anticópia: nada da referência no export inteiro", async () => {
    const files = await exportOnce();
    for (const f of files) {
      for (const term of FORBIDDEN)
        expect(f.content, `${f.path}: ${term}`).not.toContain(term);
    }
  });
});
