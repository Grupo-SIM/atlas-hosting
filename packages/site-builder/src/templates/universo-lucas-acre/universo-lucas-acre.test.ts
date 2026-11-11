import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block, Site } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { fontStylesheet } from "../../renderer/fonts.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { UNIVERSO_RUNTIME } from "../../renderer/universo-runtime.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";
import { LUCAS, MARCAS, OPTIONS, SEO } from "./data.js";

const ID = "universo-lucas-acre";
const template = getTemplate(ID);
if (!template) throw new Error(`template ${ID} não registrado`);
const { site } = template;

/** O export de todas as rotas é caro: os testes compartilham uma execução só. */
let exported: ReturnType<typeof exportSiteToStatic> | undefined;
const exportOnce = () => (exported ??= exportSiteToStatic(site));
const fileOf = async (path: string) => {
  const f = (await exportOnce()).find(x => x.path === path);
  if (!f) throw new Error(`${path} não exportado`);
  return f.content;
};
const EXPORT_TIMEOUT = 120_000;

const allBlocks = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...allBlocks(b.children ?? [])]);
const everyBlock = (s: Site) => [
  ...s.pages.flatMap(p => allBlocks(p.blocks)),
  ...allBlocks(s.header),
  ...allBlocks(s.footer),
];

async function html(s: Site, path: string, mode: "edit" | "view" = "view") {
  const { prelude } = await prerender(
    createElement(SiteRenderer, { mode, path, site: s, skipFxRuntime: true })
  );
  return new Response(prelude).text();
}

const count = (text: string, needle: string | RegExp) =>
  typeof needle === "string"
    ? text.split(needle).length - 1
    : (
        text.match(
          new RegExp(needle.source, `${needle.flags.replace("g", "")}g`)
        ) ?? []
      ).length;

const withProps = (
  s: Site,
  type: string,
  props: Record<string, unknown>
): Site => {
  const copy = structuredClone(s);
  for (const b of everyBlock(copy))
    if (b.type === type) Object.assign(b.props, props);
  return copy;
};

describe("template universo-lucas-acre", () => {
  test("aparece na tela de escolha com nome, tags, descrição e miniatura", () => {
    const meta = listTemplates().find(t => t.id === ID);
    expect(meta?.name).toBe("Universo — Hub de Links em Cartas");
    expect(meta?.tags).toEqual(["Landing", "Marketing"]);
    expect(meta?.description).toContain("três cartas em leque que viram");
    expect(meta?.preview.startsWith("data:image/svg+xml,")).toBe(true);
    expect(meta?.pageCount).toBe(6);
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

  test("rotas: /, /pago/, /gratuito/, /lucas-acre/, /marcas/ e 404, todas sem cabeçalho nem rodapé", () => {
    expect(site.pages.map(p => p.slug)).toEqual([
      "",
      "pago",
      "gratuito",
      "lucas-acre",
      "marcas",
      "404",
    ]);
    expect(site.pages.every(p => p.bare && p.status === "published")).toBe(
      true
    );
    expect(site.header).toEqual([]);
    expect(site.footer).toEqual([]);
  });

  test("todo link interno das escolhas aponta para uma página que existe", () => {
    const slugs = new Set(site.pages.map(p => `/${p.slug}/`));
    const internal = OPTIONS.flatMap(o => o.choices)
      .map(c => c.url)
      .filter(u => u.startsWith("/"));
    expect(internal.length).toBe(4);
    for (const u of internal) expect(slugs.has(u), u).toBe(true);
  });

  test("variante, Oswald (só pesos que existem) e SEO em português", () => {
    expect(site.theme.variant).toBe("universo");
    const css = fontStylesheet(site) ?? "";
    expect(css).toContain("family=Oswald:wght@400;500;600;700");
    expect(css).not.toContain("Cinzel");
    expect(site.name).toBe(SEO.title);
    expect(site.theme.favicon?.startsWith("data:image/svg+xml,")).toBe(true);
    expect(site.theme.favicon).not.toContain(";");
  });

  test("as redes do Lucas Acre vêm do mesmo registro do sim-intermediacoes", () => {
    expect(LUCAS.instagram).toBe("https://www.instagram.com/olucasacre/");
    expect(LUCAS.tiktok).toBe("https://www.tiktok.com/@lucasacre");
    expect(LUCAS.youtube).toBe("https://www.youtube.com/@lucasacre");
  });

  test("o runtime é JavaScript válido e não redeclara nomes de fora", () => {
    expect(() => new Function(UNIVERSO_RUNTIME)).not.toThrow();
    for (const name of [
      "off",
      "on",
      "arr",
      "later",
      "reduce",
      "mm",
      "pad",
      "store",
      "scaled",
    ]) {
      const found =
        UNIVERSO_RUNTIME.match(
          new RegExp(`(?:var |,)${name}=|function ${name}\\(`, "g")
        ) ?? [];
      expect(found.length, name).toBe(1);
    }
  });

  test(
    "home exportada: carregamento, 3 cartas, 5 opções (frente e verso), 5 pontos, cronômetro e o runtime",
    async () => {
      const out = await fileOf("index.html");
      expect(out).toContain('<html lang="pt-BR">');
      expect(out).toContain(`<title>${SEO.title}</title>`);
      expect(out).toContain(
        `<meta name="description" content="${SEO.description}">`
      );
      expect(out).toContain("sb-uv");
      expect(out).toContain('data-uv="stage"');
      expect(out).toContain("uv-loader");
      expect(out).toContain("MEU UNIVERSO");
      for (const n of ["I", "II", "III"])
        expect(out).toContain(`aria-label="Carta ${n}"`);
      expect(count(out, 'class="uv-card"')).toBe(3);
      expect(count(out, 'class="uv-opt"')).toBe(5);
      expect(count(out, "uv-face uv-front")).toBe(5);
      expect(count(out, "uv-face uv-verso")).toBe(5);
      expect(count(out, /class="uv-dot( on)?"/)).toBe(5);
      expect(out).toContain('aria-label="Ir para a opção 5"');
      expect(out).toContain("uv-timer");
      expect(out).toContain("00:30");
      expect(out).toContain('data-timer="30"');
      expect(out).toContain("TEM CERTEZA QUE QUER CONTINUAR?");
      expect(out).toContain("SIM INTERMEDIAÇÕES - SERVIÇOS DIGITAIS");
      expect(out).toContain("window.sbUniverso()");
      // a camada de contagem vem fechada
      expect(out).toMatch(/class="uv-cd"[^>]*hidden=""/);
    },
    EXPORT_TIMEOUT
  );

  test(
    "páginas internas: /marcas/ rolável com 16 itens e 1 em breve sem link; /pago/ com CURSOS em breve",
    async () => {
      const marcas = await fileOf("marcas/index.html");
      expect(count(marcas, /class="uv-item( is-soon)?"/)).toBe(16);
      expect(count(marcas, 'class="uv-item is-soon"')).toBe(1);
      expect(count(marcas, ">EM BREVE<")).toBe(1);
      expect(marcas).toContain("uv-scroll");
      expect(marcas).toContain("--uv-h:320px");
      expect(marcas).not.toContain("fraternidadesim");
      expect(MARCAS.find(m => m.soon)?.name).toBe("Fraternidade SIM");
      expect(marcas).toContain("BEM-VINDO AO ECOSSISTEMA");
      expect(marcas).toContain("38.486.051/0001-48");
      expect(marcas).toContain("FEITO POR SIM INT");

      const pago = await fileOf("pago/index.html");
      expect(pago).toMatch(/is-soon"><span class="uv-nm">CURSOS</);
      expect(count(pago, 'class="uv-item"')).toBe(2);
      expect(pago).not.toMatch(/<a[^>]*><span class="uv-nm">CURSOS/);

      const lucas = await fileOf("lucas-acre/index.html");
      expect(lucas).toContain("estranhamente interessante");
      expect(lucas).toContain("https://t.me/canaldoluketa");

      for (const path of [
        "pago/index.html",
        "gratuito/index.html",
        "lucas-acre/index.html",
        "marcas/index.html",
        "404.html",
      ]) {
        const out = await fileOf(path);
        expect(out, path).toContain('data-uv="panel"');
        expect(out, path).toContain("window.sbUniverso()");
        expect(out, path).toContain('class="uv-back" href="/"');
      }
      expect(await fileOf("404.html")).toContain("PÁGINA NÃO ENCONTRADA");
    },
    EXPORT_TIMEOUT
  );

  test(
    "nenhuma página com undefined nem bloco desconhecido",
    async () => {
      for (const f of await exportOnce()) {
        expect(f.content, f.path).not.toContain("undefined");
        expect(f.content, f.path).not.toContain("Bloco desconhecido");
      }
    },
    EXPORT_TIMEOUT
  );

  test(
    "sem open redirect: nada de /redirect?to= e todo data-uv-go tem href absoluto das props",
    async () => {
      const known = new Set([
        ...OPTIONS.map(o => o.url),
        ...OPTIONS.flatMap(o => o.choices.map(c => c.url)),
        ...everyBlock(site).flatMap(b =>
          Array.isArray(b.props.items)
            ? (b.props.items as { url: string }[]).map(i => i.url)
            : []
        ),
      ]);
      let total = 0;
      for (const f of await exportOnce()) {
        expect(f.content, f.path).not.toContain("/redirect?to=");
        expect(f.content, f.path).not.toContain("/redirect");
        for (const m of f.content.matchAll(/<a\b[^>]*\bdata-uv-go=""[^>]*>/g)) {
          total++;
          const hrefAttr = /\bhref="([^"]+)"/.exec(m[0])?.[1] ?? "";
          expect(hrefAttr, m[0]).toMatch(/^https:\/\//);
          expect(known.has(hrefAttr.replaceAll("&amp;", "&")), hrefAttr).toBe(
            true
          );
        }
      }
      expect(total).toBeGreaterThan(20);
    },
    EXPORT_TIMEOUT
  );

  test(
    "anticópia: nada do jogo de terceiros nem da arte da referência volta",
    async () => {
      const banned = [
        "Scope Creep",
        "scope-creep",
        "ScopeCreep",
        "Project Manager",
        "WHAT DO YOU DO",
        "YOU FEEL",
        "eyes.mp4",
        "M 10,42 A 46,46 0 0 1 90,42",
        "M6,34 L34,6",
        "M15,60 L15,24 L24,15 L60,15",
        "M 20 1 L 180 1 L 190 11",
        "M27,3 L49,15.5",
        "M12 4C9 4 7 6 7 9c0 1.5",
        "M58,78 Q150,40 242,78",
        "clip-path:polygon(0 0,100% 0,100% 58%,50% 100%,0 58%)",
        "Cinzel Decorative",
        "Go to option",
        "sim_visited",
      ];
      const files = await exportOnce();
      const edit = await html(
        withProps(site, "uvStage", { editorState: "back" }),
        "/",
        "edit"
      );
      for (const text of [
        ...files.map(f => f.content),
        edit,
        UNIVERSO_RUNTIME,
        JSON.stringify(site),
      ])
        for (const b of banned)
          expect(text.toLowerCase()).not.toContain(b.toLowerCase());
    },
    EXPORT_TIMEOUT
  );

  test("editor: estados parados, sem o runtime", async () => {
    const fan = await html(site, "/", "edit");
    expect(fan).toMatch(
      /class="uv-stage uv-live uv-still"[^>]*data-state="fan"/
    );
    expect(fan).toContain("uv-cards is-in");
    const loader = await html(
      withProps(site, "uvStage", { editorState: "loader" }),
      "/",
      "edit"
    );
    expect(loader).toContain('data-state="loader"');
    const car = await html(
      withProps(site, "uvStage", { editorOption: 3, editorState: "carousel" }),
      "/",
      "edit"
    );
    expect(car).toContain('data-state="carousel"');
    expect(car).toContain("translateX(-200%)");
    expect(car).toMatch(/aria-current="true" aria-label="Ir para a opção 3"/);
    const back = await html(
      withProps(site, "uvStage", { editorOption: 2, editorState: "back" }),
      "/",
      "edit"
    );
    expect(count(back, "uv-opt is-back")).toBe(1);
    const cd = await html(
      withProps(site, "uvStage", { editorState: "countdown" }),
      "/",
      "edit"
    );
    expect(cd).not.toMatch(/class="uv-cd"[^>]*hidden/);
    expect(cd).toContain("5…");
    expect(cd).toContain("3…");
    const panel = await html(
      withProps(site, "uvPanel", { editorState: "countdown" }),
      "/marcas/",
      "edit"
    );
    expect(panel).toContain("uv-page uv-still");
    expect(panel).not.toMatch(/class="uv-cd"[^>]*hidden/);
  });

  test(
    "outros templates não levam o runtime do Universo",
    async () => {
      const other = getTemplate("margem");
      if (!other) throw new Error("margem sumiu");
      const files = await exportSiteToStatic(other.site);
      expect(files.some(f => f.content.includes("sbUniverso"))).toBe(false);
      expect(files.some(f => f.content.includes("sb-uv"))).toBe(false);
    },
    EXPORT_TIMEOUT
  );
});
