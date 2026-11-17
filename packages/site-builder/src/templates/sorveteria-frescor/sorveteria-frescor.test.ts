import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { getBlockDefinition } from "../../blocks/registry.js";
import { parseClock, parseDays } from "../../blocks/sorveteria-lib.js";
import { fxCss, fxRuntimeData, HOVER_EFFECTS } from "../../model/fx.js";
import type { Block, Site } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { SiteRenderer } from "../../renderer/SiteRenderer.js";
import { FR_STATUS_JS } from "../../renderer/sorveteria.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("sorveteria-frescor");
if (!template) throw new Error("template sorveteria-frescor não registrado");
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
  "Zero Grau",
  "zerograu",
  "ZG_CONTENT",
  "Isaias",
  "Manoel Julião",
  "Tucumã",
  "Seis de Agosto",
  "6 de Agosto",
  "Via Verde",
  "Aureleano",
  "Rio Branco",
  "anota.ai",
  "wabiz",
  "fidelimax",
  "5568992241159",
  "5568992168565",
  "5568999411212",
  "JB Mídia",
  "mascote-zerograu",
  "acai-header-01",
  "JULIAO-",
  "TUCUMa-",
];

interface Spec {
  c: number;
  d: number[];
  o: number;
  tz: string;
}
// A mesma função que roda no navegador (o texto é do `fx-runtime`).
const status = new Function(`${FR_STATUS_JS}; return frStatusAt;`)() as (
  spec: Spec,
  ms: number
) => { n: number; s: string };

const ALL = [0, 1, 2, 3, 4, 5, 6];
const RB = "America/Rio_Branco"; // UTC−5, sem horário de verão

describe("template sorveteria-frescor", () => {
  test("aparece na galeria com nome e tags", () => {
    const meta = listTemplates().find(t => t.id === "sorveteria-frescor");
    expect(meta?.name).toBe("Frescor — Sorveteria, Açaí e Pizza");
    expect(meta?.tags).toEqual(["Landing", "Restaurante"]);
    expect(meta?.pageCount).toBe(site.pages.length);
  });

  test("passa no siteSchema e toda prop é válida; ids únicos; páginas e menu", () => {
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
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug).sort()).toEqual(
      ["", "404", "historia", "privacidade", "termos"].sort()
    );
    expect(site.menu.map(m => m.label)).toEqual([
      "Início",
      "Nossa História",
      "Cardápio",
      "Contato",
    ]);
    const slugs = new Set(site.pages.map(p => p.slug));
    const anchors = (site.pages[0]?.blocks ?? []).map(b => b.anchor);
    for (const m of site.menu) {
      const [path, hash] = m.href.split("#");
      expect(slugs.has((path ?? "").replace(/^\/|\/$/g, ""))).toBe(true);
      if (hash) expect(anchors).toContain(hash);
    }
  });

  test(
    "export da home: slides, cartões, seletor, rodapé e JSON-LD",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      const body = noScripts(home);
      expect(home).toContain("sb-fr");
      expect(home.match(/<h1[ >]/g)).toHaveLength(1);
      expect(body.match(/class="si-slide/g)).toHaveLength(3);
      expect(body.match(/class="fr-cta"/g)).toHaveLength(3);
      // 5 cartões: 3 unidades + clube + Instagram
      expect(body.match(/<article class="fr-card /g)).toHaveLength(5);
      expect(body).toContain("fr-c-club");
      expect(body).toContain("fr-c-insta");
      // botão verde só com link de WhatsApp
      const btns = [
        ...body.matchAll(
          /<a class="fr-btn (fr-btn-wa|fr-btn-white)" href="([^"]*)"/g
        ),
      ];
      expect(btns.length).toBeGreaterThan(0);
      for (const m of btns)
        expect(m[1] === "fr-btn-wa", m[2]).toBe(
          /^https:\/\/wa\.me\//.test(m[2] ?? "")
        );
      expect(body).toContain("fr-btn-wa");
      expect(home).not.toContain('href=""');
      // seletor: instrução + 3 unidades
      const select = home.match(/<select[\s\S]*?<\/select>/)?.[0] ?? "";
      expect(select.match(/<option/g)).toHaveLength(4);
      // rodapé: 3 colunas de unidade com horário
      expect(body.match(/class="fr-foot-hours"/g)).toHaveLength(3);
      expect(body).toContain("Todos os dias: 14h às 23h");
      expect(body).toContain("Seg a Sáb: 15h às 22h");
      // JSON-LD: 3 IceCreamShop, nenhum FAQPage
      const ld = [
        ...home.matchAll(
          /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
        ),
      ].flatMap(m => JSON.parse(m[1] ?? "[]") as Record<string, unknown>[]);
      expect(ld.filter(o => o["@type"] === "IceCreamShop")).toHaveLength(3);
      expect(home).not.toContain("FAQPage");
      expect(body).not.toMatch(/>\s*>\s*</);
      for (const f of files.filter(x => x.path.endsWith(".html"))) {
        expect(f.content, f.path).not.toContain("Bloco desconhecido");
        expect(noScripts(f.content), f.path).not.toContain("undefined");
        expect(f.content, f.path).not.toContain('href="#"');
      }
    },
    EXPORT_TIMEOUT
  );

  test("botão sem URL some (iFood vazio)", async () => {
    const files = await exportOnce();
    const home = noScripts(
      files.find(f => f.path === "index.html")?.content ?? ""
    );
    expect(home).not.toContain("Pedir no iFood");
    expect(home).not.toMatch(/>iFood</);
  });

  test("o fuso da loja vai para o rodapé; nome inválido volta ao padrão", async () => {
    const files = await exportOnce();
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain("America/Sao_Paulo");
    const s = structuredClone(site);
    s.theme.timezone = RB;
    expect(await html(s)).toContain("America/Rio_Branco");
    s.theme.timezone = "Nao/Existe";
    expect(await html(s)).toContain("America/Sao_Paulo");
  });

  test("história, legais e 404 renderizam com cabeçalho e rodapé", async () => {
    const files = await exportOnce();
    for (const p of [
      "historia/index.html",
      "privacidade/index.html",
      "termos/index.html",
      "404/index.html",
    ]) {
      const c = files.find(f => f.path === p)?.content ?? "";
      expect(c, p).toContain("fr-bar");
      expect(c, p).toContain("fr-foot");
    }
    const h = files.find(f => f.path === "historia/index.html")?.content ?? "";
    expect(h.match(/class="fr-tl-item"/g)).toHaveLength(4);
    expect(h).toContain("comunidade.");
    expect(h).not.toContain("comunidade..");
    expect(h.match(/<h1[ >]/g)).toHaveLength(1);
    expect(files.find(f => f.path === "404/index.html")?.content).toContain(
      "Essa página derreteu"
    );
  });

  test("o menu marca a página atual de verdade", async () => {
    const cur = (h: string) =>
      [...h.matchAll(/aria-current="page"[^>]*>([^<]+)</g)].map(m => m[1]);
    expect(new Set(cur(await html(site, "/historia/")))).toEqual(
      new Set(["Nossa História"])
    );
    expect(cur(await html(site, "/"))).toContain("Início");
  });

  test("anticópia: nada da referência no export inteiro", async () => {
    const files = await exportOnce();
    for (const f of files)
      for (const term of FORBIDDEN)
        expect(f.content, `${f.path}: ${term}`).not.toContain(term);
  });
});

describe("horário de funcionamento", () => {
  const spec: Spec = { c: 23 * 60, d: ALL, o: 14 * 60, tz: RB };
  const at = (h: number, m = 0) => Date.UTC(2026, 10, 18, h, m); // quarta

  test("14h–23h em Rio Branco: aberto às 15h locais (20h UTC)", () => {
    expect(status(spec, at(20)).s).toBe("open");
  });
  test("fechado às 23h30 locais (04h30 UTC)", () => {
    expect(status(spec, at(28, 30)).s).toBe("closed");
  });
  test("abre em 30 min às 13h30 locais", () => {
    expect(status(spec, at(18, 30))).toEqual({ n: 30, s: "soon" });
  });
  test("o fuso conta (Brasília está 2h à frente de Rio Branco)", () => {
    // 16h UTC = 11h em Rio Branco (fechado) e 13h em Brasília (fechado, mas abre em 60 min)
    expect(status(spec, at(16)).s).toBe("closed");
    expect(status({ ...spec, tz: "America/Sao_Paulo" }, at(16))).toEqual({
      n: 60,
      s: "soon",
    });
    // 19h UTC = 14h em Rio Branco (aberto)
    expect(status(spec, at(19)).s).toBe("open");
  });
  test("horário que passa da meia-noite (18h–2h)", () => {
    const night: Spec = {
      c: 2 * 60,
      d: ALL,
      o: 18 * 60,
      tz: "America/Sao_Paulo",
    };
    expect(status(night, Date.UTC(2026, 10, 18, 22)).s).toBe("open"); // 19h
    expect(status(night, Date.UTC(2026, 10, 19, 3)).s).toBe("open"); // 0h
    expect(status(night, Date.UTC(2026, 10, 19, 6)).s).toBe("closed"); // 3h
  });
  test("dias e horas escritos como texto", () => {
    expect(parseDays("seg-sab")).toEqual([1, 2, 3, 4, 5, 6]);
    expect(parseDays("sex-dom")).toEqual([0, 5, 6]);
    expect(parseDays("todos")).toEqual(ALL);
    expect(parseClock("14h30", 0)).toBe(870);
    expect(parseClock("23:00", 0)).toBe(1380);
    expect(parseClock("lixo", 99)).toBe(99);
    const sat: Spec = {
      c: 22 * 60,
      d: [1, 2, 3, 4, 5, 6],
      o: 15 * 60,
      tz: "UTC",
    };
    expect(status(sat, Date.UTC(2026, 10, 15, 18)).s).toBe("closed"); // domingo
  });
});

describe("hover tilt", () => {
  test("está no schema do fx e vai para o runtime", () => {
    expect(HOVER_EFFECTS).toContain("tilt");
    const fx = { "": { hover: "tilt", tiltGlare: true, tiltMax: 8 } } as const;
    expect(fxRuntimeData(fx as never)).toEqual([{ g: 1, p: "", t: 8 }]);
    expect(fxCss("b1", fx as never)).not.toContain("undefined");
  });
  test("a home usa o tilt nos cartões", () => {
    const cards = site.pages[0]?.blocks.find(b => b.type === "frOrderCards");
    expect(cards?.fx?.["1.1.3"]?.hover).toBe("tilt");
  });
  test("quem não usa o tilt não ganha nada no runtime", () => {
    expect(fxRuntimeData({ "": { enter: "fadeIn", hover: "lift" } })).toEqual([
      { e: 1, p: "" },
    ]);
  });
});
