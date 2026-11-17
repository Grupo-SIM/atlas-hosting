import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block, Site } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { fontStylesheet } from "../../renderer/fonts.js";
import { sautCss } from "../../renderer/saut.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("saut-marketing");
if (!template) throw new Error("template saut-marketing não registrado");
const { site } = template;

/** O export de todas as rotas é caro: os testes compartilham uma execução só. */
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

const count = (html: string, needle: string) => html.split(needle).length - 1;
const noScripts = (html: string) =>
  html.replace(/<(script|style)[\s\S]*?<\/\1>/g, "");

describe("template saut-marketing", () => {
  test("aparece na tela de escolha com nome, tags e as 4 páginas", () => {
    const meta = listTemplates().find(t => t.id === "saut-marketing");
    expect(meta?.name).toBe("SAUT — Agência de Marketing e Tecnologia");
    expect(meta?.tags).toEqual(["Landing", "Marketing"]);
    expect(meta?.pageCount).toBe(4);
    expect(site.pages.map(p => p.slug)).toEqual([
      "",
      "privacidade",
      "termos",
      "404",
    ]);
  });

  test("passa no siteSchema e toda prop é válida para o schema do bloco (nada cai nos defaults)", () => {
    const parsed = siteSchema.safeParse(site);
    if (!parsed.success) console.error(parsed.error.issues.slice(0, 5));
    expect(parsed.success).toBe(true);
    for (const b of everyBlock(site)) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      const r = def?.schema.safeParse(b.props);
      if (!r?.success) console.error(b.type, r?.error.issues);
      expect(r?.success).toBe(true);
    }
    const ids = everyBlock(site).map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("as âncoras do menu existem na home", () => {
    const home = site.pages[0]?.blocks ?? [];
    const anchors = home.map(b => b.anchor);
    for (const a of [
      "sobre",
      "servicos",
      "como-funciona",
      "resultados",
      "contato",
    ])
      expect(anchors).toContain(a);
    const header = site.header[0];
    const links = ((header?.props.links ?? []) as { url: string }[]).map(
      l => l.url
    );
    expect(links).toEqual([
      "/#sobre",
      "/#servicos",
      "/#como-funciona",
      "/#resultados",
      "/#contato",
    ]);
  });

  test("fontes: Inter Tight (400–800) e Newsreader (500–600) entram no Google Fonts", () => {
    const url = fontStylesheet(site) ?? "";
    expect(url).toContain("family=Inter+Tight:wght@400;500;600;800");
    expect(url).toContain("family=Newsreader:wght@500;600");
  });

  test(
    "export estático: hero, 3 cartões, 8 logos, 4 serviços, 5 passos com ícone, 2 cases, 4 números, CTA, faixa e rodapé",
    async () => {
      const files = await exportOnce();
      const home = files.find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain("sb-sa");
      expect(home).toContain('lang="pt-BR"');
      expect(count(home, "<h1")).toBe(1);
      expect(home).toContain("Transformamos visibilidade em oportunidades");
      expect(count(home, 'class="sa-card ')).toBe(3);
      expect(count(home, 'class="sa-logo-cell"')).toBe(8);
      expect(count(home, 'class="sa-svc"')).toBe(4);
      expect(count(home, 'class="sa-step"')).toBe(5);
      expect(count(home, 'class="sa-step-ic"')).toBe(5);
      expect(count(home, 'class="sa-step-ic"><svg')).toBe(5);
      expect(count(home, 'class="sa-case"')).toBe(2);
      expect(count(home, 'class="sa-imp-n"')).toBe(4);
      expect(count(home, "data-sb-count")).toBeGreaterThanOrEqual(10);
      expect(home).toContain('class="sa-cta"');
      expect(home).toMatch(/class="sa-cta-r"[\s\S]*?class="sa-btn dark"/);
      expect(home).toMatch(
        /class="sa-band sa-box[^"]*"[\s\S]*?class="sa-btn dark"/
      );
      expect(count(home, 'class="sa-fcol')).toBe(4);
      expect(home).toContain("Tecnologia potencializada por pessoas");
    },
    EXPORT_TIMEOUT
  );

  test(
    "contadores em pt-BR: 1.220, 96,8 (com decimal) e 18 mi+",
    async () => {
      const home =
        (await exportOnce()).find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain(">1.220<");
      expect(home).toContain('data-sb-count="1220"');
      expect(home).toContain('data-sep="."');
      expect(home).toContain('data-dsep=","');
      expect(home).toContain(">96,8<");
      expect(home).toContain('data-sb-count="96.8"');
      expect(home).toContain('data-decimals="1"');
      expect(home).toContain('data-sb-count="95"');
      expect(home).toContain('data-sb-count="68"');
      expect(home).toMatch(
        /data-sb-count="18"[^>]*>18<\/span><i class="sa-sfx"> mi\+<\/i>/
      );
    },
    EXPORT_TIMEOUT
  );

  test(
    "nenhum href vazio ou '#', nada de 'undefined' nem bloco desconhecido, textos corrigidos",
    async () => {
      const files = await exportOnce();
      const htmls = files.filter(f => f.path.endsWith(".html"));
      expect(htmls.length).toBeGreaterThanOrEqual(4);
      for (const f of htmls) {
        const body = noScripts(f.content);
        expect(body, f.path).not.toContain('href="#"');
        expect(body, f.path).not.toContain('href=""');
        expect(body, f.path).not.toContain("undefined");
        expect(body, f.path).not.toContain("Bloco desconhecido");
        for (const bad of ["All rights reserved", "1,220", "96.8%", "Midía"])
          expect(body, f.path).not.toContain(bad);
      }
      const home = htmls.find(f => f.path === "index.html")?.content ?? "";
      expect(home).toContain("Todos os direitos reservados.");
      expect(home).toContain("Mídia");
      expect(home).toContain("capacidade, não para substituir");
      expect(home).toContain("https://wa.me/5568999764761");
      expect(home).toContain("https://www.instagram.com/sautmrkt/");
      expect(home).toContain("mailto:saut.mktdigital@gmail.com");
      expect(home).toContain("https://ebooksim.com/");
      expect(home).toContain("https://atlashosting.com.br/");
      expect(home).toContain("https://zyrionbrazil.com/");
    },
    EXPORT_TIMEOUT
  );

  test(
    "anticópia: o export não traz nada do kit comercial nem dos logos de terceiros",
    async () => {
      const files = await exportOnce();
      const all = files.map(f => f.content).join("\n");
      for (const bad of [
        "Pitwo",
        "Sarah Mitchell",
        "David Carter",
        "Emily Rodriguez",
        "Client Testimonials",
        "Trusted by Businesses",
        "Hero-Image.jpg",
        "Why-Us-Image.jpg",
        "Our-Impact.jpg",
        "AI-Marketing-Strategy.jpg",
        "Zap-Icon",
        "Shield-Icon",
        "Shape-300x77",
        "Gray-Dot-Pattern",
        "Green-Dot-Pattern",
        "Testimonial-Logo",
        "10-300x172",
        "4-300x172",
        "site-300x172",
        "site-2-300x172",
        "SAUT-1-LOGO-313-x-180",
        "unsplash_183Yxo3vsGY",
      ])
        expect(all, bad).not.toContain(bad);
      for (let i = 1; i <= 5; i++) expect(all).not.toContain(`Avatar-${i}.png`);
      // o logo sem nome da referência e os logos reais dos clientes não voltam
      expect(all).not.toContain("uploads/2026/08/7.png");
      for (const t of [
        "Construtora Rio",
        "O Novo Acre",
        "Zero Grau",
        "Deep Soul",
        "Haras 73",
      ])
        expect(all).not.toContain(t);
    },
    EXPORT_TIMEOUT
  );

  test("as imagens da SAUT e do Unsplash são as permitidas", () => {
    const urls = JSON.stringify(site).match(/https:\/\/[^"\\]+/g) ?? [];
    const media = urls.filter(u => /\.(png|jpe?g|webp)(\?|$)|unsplash/.test(u));
    expect(media.length).toBeGreaterThan(10);
    for (const u of media)
      expect(
        u.startsWith("https://sautmarketing.com/wp-content/uploads/") ||
          u.startsWith("https://images.unsplash.com/")
      ).toBe(true);
  });

  test("celular: nenhuma largura fixa maior que a tela (sem rolagem lateral)", () => {
    // regressão do hero da referência (página com 438px em 390px): nenhum `width` fixo grande sem `max-width`/`min()`
    for (const rule of sautCss.split("}")) {
      const w = rule.match(/[{;]width:(\d+)px/);
      if (w && Number(w[1]) > 300)
        expect(rule, `largura fixa ${w[1]}px sem max-width`).toMatch(
          /max-width:|aspect-ratio/
        );
    }
    // colunas de grade fixas em px (fora de minmax(0,…)) estouram a tela
    for (const m of sautCss.matchAll(/grid-template-columns:([^;}]+)/g)) {
      const cols = (m[1] ?? "").replace(/minmax\([^)]*\)/g, "");
      expect(cols, m[0]).not.toMatch(/\b[3-9]\d\dpx|\b\d{4,}px/);
    }
    // o bloco de celular redefine as colunas que ficam apertadas
    const mobile = sautCss.slice(sautCss.indexOf("@media (max-width:767px)"));
    expect(mobile).toContain(".sa-cards{grid-template-columns:minmax(0,1fr)");
    expect(mobile).toContain(".sa-steps{grid-template-columns:minmax(0,1fr)");
    // as regras de celular existem também sob .sb-narrow (preview estreito do editor)
    expect(sautCss).toContain(".sb-sa.sb-narrow .sa-cards");
  });
});
