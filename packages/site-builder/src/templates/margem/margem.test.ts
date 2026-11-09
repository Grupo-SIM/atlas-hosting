import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block, Site } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { MARGEM_RUNTIME } from "../../renderer/margem-runtime.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";
import { BRAND } from "./brand.js";
import { CASE_PHOTOS, METHOD_PHOTOS, WALL } from "./images.js";
import { FILTERS, ROWS } from "./projects.js";

const template = getTemplate("margem");
if (!template) throw new Error("template margem não registrado");
const { site } = template;

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

describe("template margem", () => {
  test("aparece na tela de escolha com tags e contagem de páginas", () => {
    const meta = listTemplates().find(t => t.id === "margem");
    expect(meta?.name).toBe("Margem");
    expect(meta?.tags).toEqual(["Portfólio", "Estúdio", "Landing"]);
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

  test("usa a variante, a fonte Geist e a marca de brand.ts", () => {
    expect(site.theme.variant).toBe("margem");
    expect(site.theme.fontBody).toContain("'Geist'");
    expect(site.theme.bg).toBe(BRAND.colors.bg);
    expect(site.theme.favicon?.startsWith("data:image/svg+xml,")).toBe(true);
    expect(site.theme.favicon).not.toContain(";");
  });

  test("fotos: 28 paredes, 4 destaques, 3 do método, todas diferentes", () => {
    expect(WALL).toHaveLength(28);
    const ids = [
      ...WALL.map(p => p.id),
      ...Object.values(CASE_PHOTOS).map(p => p.id),
      ...Object.values(METHOD_PHOTOS).map(p => p.id),
    ];
    expect(ids).toHaveLength(35);
    expect(new Set(ids).size).toBe(35);
    for (const p of Object.values(CASE_PHOTOS))
      expect(p.ratio).toBeGreaterThan(1);
    for (const p of WALL) expect(p.ratio).toBeGreaterThan(0.2);
  });

  test("índice: 15 projetos, cada um num filtro que existe", () => {
    expect(ROWS).toHaveLength(15);
    const values = FILTERS.map(f => f.value);
    for (const r of ROWS) expect(values).toContain(r.filter);
  });

  test("home renderiza todas as seções com os marcadores do runtime", async () => {
    const out = await html(site, "/");
    for (const kind of [
      "nav",
      "tunnel",
      "manifesto",
      "method",
      "index",
      "quote",
      "footer",
    ])
      expect(out).toContain(`data-mg="${kind}"`);
    expect(out).toContain("sb-mg");
    expect(out).toContain("Torra Alta");
    expect(out).toContain("Marcas que ainda fazem sentido");
    expect(out).toContain('id="projetos"');
    // contagem por filtro, calculada no render: "Todos" e "Identidade"
    expect(out).toContain("15 de 41 projetos");
    expect(out).toContain("6 de 41 projetos");
  });

  test("no editor nada fica preso nem animado (versão estática)", async () => {
    const out = await html(site, "/", "edit");
    expect(out).not.toMatch(/class="[^"]*\bmg-live\b/);
    expect(out).toContain("mg-case-img");
  });

  test("exporta todas as rotas, com o runtime do Margem inline", async () => {
    const files = await exportSiteToStatic(site);
    expect(files.map(f => f.path).sort()).toEqual([
      "404.html",
      "404/index.html",
      "index.html",
    ]);
    for (const f of files) {
      expect(f.content).toContain("window.sbMargem()");
      expect(f.content).toContain('rel="icon"');
    }
  }, 60_000);

  test("o runtime é JavaScript válido", () => {
    expect(() => new Function(MARGEM_RUNTIME)).not.toThrow();
  });

  test("desligar o runtime não destrói o WebGL (o StrictMode do dev monta, desmonta e monta de novo)", () => {
    // `loseContext()` no desmonte faz o `getContext` da segunda montagem devolver o contexto perdido
    // e o túnel cai na versão estática na prévia do `next dev`.
    expect(MARGEM_RUNTIME).not.toContain(".loseContext()");
    expect(MARGEM_RUNTIME).toContain("isContextLost()");
  });

  test("outros templates não levam o runtime do Margem", async () => {
    const other = getTemplate("blog-viagens");
    if (!other) throw new Error("blog-viagens sumiu");
    const files = await exportSiteToStatic(other.site);
    expect(files.some(f => f.content.includes("sbMargem"))).toBe(false);
  }, 60_000);
});
