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

const template = getTemplate("pousada-vereda-viva");
if (!template) throw new Error("template pousada-vereda-viva não registrado");
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
  "Taiuá",
  "Taiua",
  "taiuaambiental",
  "motordereservas",
  "Calango",
  "Guga",
  "Márcia",
  "556299818977",
  "5562999818977",
  "TaiuachapadadosVeadeiros",
  "Vila de São Jorge",
  "Pato Mergulhão",
  "Jatobá",
  "Mangaba",
  "_next/static/media",
  "3868.300491572392",
];

describe("template pousada-vereda-viva", () => {
  test("aparece na tela de escolha com nome e tags", () => {
    const meta = listTemplates().find(t => t.id === "pousada-vereda-viva");
    expect(meta?.name).toBe("Vereda Viva — Pousada e Camping");
    expect(meta?.tags).toEqual(["Landing", "Viagens"]);
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

  test("ids únicos; páginas /, legais e 404; âncoras do menu existem na home", () => {
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug).sort()).toEqual(
      ["", "404", "privacidade", "termos"].sort()
    );
    const home = site.pages.find(p => p.slug === "");
    const anchors = (home?.blocks ?? []).map(b => b.anchor);
    for (const m of site.menu) {
      expect(m.href.startsWith("#")).toBe(true);
      expect(anchors).toContain(m.href.slice(1));
    }
    expect(site.menu.map(m => m.label)).toEqual([
      "Nossa Pousada",
      "Acomodações",
      "Experiências",
      "Nos Visite",
    ]);
  });

  test(
    "export estático: menu, hero, linha do tempo, quartos, experiências, missão, mapa e rodapé",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      const body = noScripts(home);
      expect(home).toContain("sb-vv");
      // menu: 4 itens + "Reservar" com href de verdade
      const menu = home.match(/<ul class="vv-menu">[\s\S]*?<\/ul>/)?.[0] ?? "";
      expect(menu.match(/<li>/g)).toHaveLength(5);
      expect(menu).toMatch(
        /class="vv-menu-cta" href="https:\/\/wa\.me\/[^"]+"/
      );
      // hero: 5 fotos e <h1> com texto
      const hero =
        home.match(/<section class="vv-hero">[\s\S]*?<\/section>/)?.[0] ?? "";
      expect(hero.match(/class="si-slide/g)).toHaveLength(5);
      expect(hero).toMatch(/<h1 class="vv-hero-h1">[^<]*<span class="vv-sr">/);
      expect(hero).toContain("momentos especiais");
      // linha do tempo: 4 itens
      expect(home.match(/class="vv-tl-item /g)).toHaveLength(4);
      // 8 quartos, cada um com Reservar e "Ver mais+" ligado a um modal com 3+ fotos
      expect(home.match(/<article class="vv-room"/g)).toHaveLength(8);
      for (let i = 0; i < 8; i++) {
        expect(home).toContain(`popoverTarget="vv-g-q-${i}"`);
        const modal =
          home.match(
            new RegExp(`<div[^>]*id="vv-g-q-${i}"[\\s\\S]*?vv-g-info`)
          )?.[0] ?? "";
        expect(
          modal.match(/class="vv-g-slide/g)?.length
        ).toBeGreaterThanOrEqual(3);
      }
      expect(body.match(/>Reservar</g)?.length).toBeGreaterThanOrEqual(8);
      // experiências: 6 (5 com foto + 1 sólida); modal sem "Reservar"
      expect(home.match(/<article class="vv-xc /g)).toHaveLength(6);
      expect(body.match(/vv-xc-solid/g)).toHaveLength(1);
      const expModal =
        home.match(
          /<div[^>]*id="vv-g-e-0"[\s\S]*?<\/div><\/div><\/div>/
        )?.[0] ?? "";
      expect(expModal).not.toContain("vv-btn");
      // missão, visão e valores
      expect(home.match(/class="vv-vcard /g)).toHaveLength(3);
      // mapa
      expect(home).toMatch(/<iframe[^>]*class="vv-map"[^>]*title="[^"]+"/);
      expect(home).toContain('loading="lazy"');
      // rodapé
      expect(home).toContain("vv-foot");
      for (const f of files.filter(x => x.path.endsWith(".html"))) {
        expect(f.content, f.path).not.toContain("Bloco desconhecido");
        expect(noScripts(f.content), f.path).not.toContain("undefined");
        // nada de links mortos
        expect(f.content, f.path).not.toContain('href=""');
        expect(f.content, f.path).not.toContain('href="#"');
        expect(f.content, f.path).not.toContain('href="mailto:"');
      }
    },
    EXPORT_TIMEOUT
  );

  test("o mesmo WhatsApp no botão flutuante, no 'Fale Conosco' e no rodapé; contatos do rodapé", async () => {
    const files = await exportOnce();
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    const links = [...home.matchAll(/href="(https:\/\/wa\.me\/(\d+)[^"]*)"/g)];
    expect(links.length).toBeGreaterThanOrEqual(4);
    for (const m of links) expect(m[2]).toBe(BRAND.whatsapp);
    expect(home).toMatch(/class="vv-float" href="https:\/\/wa\.me\//);
    expect(home).toContain(`mailto:${BRAND.email}`);
    expect(home).not.toContain("tel:"); // telefone vazio no modelo: o ícone some
  });

  test("modo escuro: o CSS tem a media query só com a opção ligada", async () => {
    const on = await html(site);
    expect(on).toContain("prefers-color-scheme:dark");
    const off = structuredClone(site);
    off.theme.darkMode = "no";
    expect(await html(off)).not.toContain("prefers-color-scheme");
  });

  test("URL de reserva do tema e a de cada quarto mandam no 'Reservar'", async () => {
    const s = structuredClone(site);
    s.theme.bookUrl = "https://reservas.exemplo.com/";
    const rooms = s.pages[0]?.blocks.find(b => b.type === "vvRooms");
    const items = rooms?.props.items as { bookUrl: string }[];
    if (items[0]) items[0].bookUrl = "https://outro.exemplo.com/q1";
    const out = await html(s);
    expect(out).toContain('href="https://outro.exemplo.com/q1"');
    expect(out).toContain('href="https://reservas.exemplo.com/"');
  });

  test("segundo botão da experiência só aparece com texto e URL", async () => {
    expect(noScripts(await html(site))).not.toContain("vv-xc-extra");
    const s = structuredClone(site);
    const exps = s.pages[0]?.blocks.find(b => b.type === "vvExperiences");
    const items = exps?.props.items as { extraUrl: string }[];
    if (items[2]) items[2].extraUrl = "https://eventos.exemplo.com/";
    expect(noScripts(await html(s))).toContain("vv-xc-extra");
  });

  test("anticópia: nada da referência no export inteiro", async () => {
    const files = await exportOnce();
    for (const f of files) {
      for (const term of FORBIDDEN)
        expect(f.content, `${f.path}: ${term}`).not.toContain(term);
    }
  });

  test("páginas internas e 404 renderizam com o menu e o rodapé", async () => {
    const files = await exportOnce();
    for (const p of [
      "privacidade/index.html",
      "termos/index.html",
      "404/index.html",
    ]) {
      const c = files.find(f => f.path === p)?.content ?? "";
      expect(c, p).toContain("vv-nav");
      expect(c, p).toContain("vv-foot");
    }
    expect(files.find(f => f.path === "404/index.html")?.content).toContain(
      "Voltar ao início"
    );
  });
});
