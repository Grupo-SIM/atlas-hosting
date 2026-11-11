import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { fxCss } from "../../model/fx.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("grana-na-hora");
if (!template) throw new Error("template grana-na-hora não registrado");
const { site } = template;
const walk = (bs: typeof site.header): typeof site.header =>
  bs.flatMap(b => [b, ...walk(b.children ?? [])]);
const blocks = walk([
  ...site.header,
  ...site.footer,
  ...site.pages.flatMap(p => p.blocks),
]);
const count = (type: string, key: string) =>
  (blocks.find(b => b.type === type)?.props[key] as unknown[] | undefined)
    ?.length;

const exported = async (s = site) =>
  JSON.stringify(await exportSiteToStatic(s)).replaceAll('\\"', '"');

describe("template grana-na-hora", () => {
  test("aparece na lista e passa no schema", () => {
    const meta = listTemplates().find(t => t.id === "grana-na-hora");
    expect(meta?.name).toBe("Grana na Hora");
    expect(meta?.tags).toEqual(["Landing", "Cursos"]);
    expect(meta?.description).toContain("Migrada do Central do Marketing.");
    expect(siteSchema.safeParse(site).success).toBe(true);
    expect(site.pages).toHaveLength(1);
    expect(site.pages[0]?.title).toBe("Grana na Hora");
  });

  test("props de todos os blocos passam no schema e os ids são únicos", () => {
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def).toBeDefined();
      expect(def?.schema.safeParse(b.props).success).toBe(true);
    }
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("listas completas", () => {
    expect(count("ghHero", "tiles")).toBe(6);
    expect(count("ghFeatures", "items")).toBe(4);
    expect(count("ghFeatures", "toggle")).toBe(2);
    expect(count("ghFeatures", "slides")).toBe(2);
    expect(count("ghSteps", "steps")).toBe(2);
    expect(count("ghBonus", "items")).toBe(3);
    expect(count("ghTestimonials", "items")).toBe(5);
    expect(count("ghFaq", "items")).toBe(6);
  });

  test("HTML publicado tem o conteúdo, a âncora, a palavra girando e o checkout", async () => {
    const html = await exported();
    for (const needle of [
      "sb-gh",
      'id="oferta"',
      'data-words="HOJE?|AGORA?"',
      'data-sb-rotate="flip"',
      "O que acha de ganhar $",
      "R$67,00",
      "Desconto de 50% agora!",
      "payment.ticto.app/O291624A0",
      "JB Mídia",
      "Dúvidas Frequentes",
      "Oferta Exclusiva",
      "Para ajudar a acelerar seus resultados",
      "Agir e vencer!",
    ])
      expect(html).toContain(needle);
    // 1 hero + 1 mapa + 1 caixa + 1 chamada final + 2 passos + 3 bônus = 9 links para a oferta; só o cartão vai ao checkout.
    expect(html.match(/href="#oferta"/g)?.length).toBe(1 + 1 + 1 + 1 + 2 + 3);
    expect(html.match(/payment\.ticto\.app/g)?.length).toBe(1);
    expect(html.match(/class="gh-tile"/g)?.length).toBe(6);
    expect(html.match(/class="gh-feat-item"/g)?.length).toBe(4);
    expect(html.match(/class="gh-acc-item"/g)?.length).toBe(2 + 6);
    expect(html.match(/class="gh-step[ "]/g)?.length).toBe(2);
    expect(html.match(/class="gh-bonus-item"/g)?.length).toBe(3);
    expect(html.match(/class="gh-tq"/g)?.length).toBe(5);
    expect(html.match(/<details/g)?.length).toBe(8);
    // 6 quadros × 2 imagens (a normal e a do hover)
    const uploads =
      html.match(/uploads\/2025\/04\/[^"')\s]+\.(png|webp)/g) ?? [];
    for (const f of [
      "15.png",
      "gravacaoblogger.webp",
      "26.png",
      "moneyhoje.webp",
      "8.png",
      "9.png",
      "23.png",
      "24.png",
      "19.png",
      "ricaelinda.webp",
      "21.png",
      "22.png",
    ])
      expect(uploads.some(u => u.endsWith(`/${f}`))).toBe(true);
    expect(html.match(/class="alt"/g)?.length).toBe(6);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
  }, 60_000);

  test("bônus neutros: nada de livros, autores ou fotos de terceiros", async () => {
    const html = await exported();
    for (const ruim of [
      "DeMarco",
      "Ferriss",
      "Moran",
      "Lennington",
      "IMG04-1.png",
      "Frame-5-1.png",
      "Frame-6.png",
      "Saber mais",
    ])
      expect(html).not.toContain(ruim);
    for (const ok of [
      "Guia de primeiros passos no digital",
      "Planilha de controle de ganhos",
      "Checklist de 7 dias",
    ])
      expect(html).toContain(ok);
  }, 60_000);

  test("correções de digitação", async () => {
    const html = await exported();
    expect(html).not.toContain("restriçōes");
    expect(html).not.toContain("Infaliveis");
    expect(html).not.toContain("Está a procura");
    expect(html).toContain("Sem restrições...");
    expect(html).toContain("Técnicas Infalíveis");
    expect(html).toContain("Está à procura");
  }, 60_000);
});

describe("extensões de efeitos", () => {
  test("parallax só no desktop não se move até 1024px", () => {
    const desktop = fxCss("b", {
      "": { parallax: 2, parallaxScreens: "desktop" },
    });
    expect(desktop).toContain("@media (max-width:1024px)");
    expect(desktop).toContain("translate:none!important");
    // sem a opção (todos os templates antigos) o CSS é o de antes
    expect(fxCss("b", { "": { parallax: 2 } })).toBe("");
    expect(fxCss("b", { "": { enter: "fadeIn", parallax: 2 } })).not.toContain(
      "translate:none"
    );
  });

  test("o template usa o parallax só no desktop", () => {
    const withPar = blocks.filter(b =>
      Object.values(b.fx ?? {}).some(f => f.parallax)
    );
    expect(withPar.length).toBeGreaterThanOrEqual(4);
    for (const b of withPar)
      for (const f of Object.values(b.fx ?? {}))
        if (f.parallax) expect(f.parallaxScreens).toBe("desktop");
  });

  test("os templates que já usam parallax não ganham a regra nova", async () => {
    for (const id of ["margem", "sim-intermediacoes", "controle-motorista"]) {
      const t = getTemplate(id);
      if (!t) continue;
      expect(await exported(t.site)).not.toContain("translate:none!important");
    }
  }, 120_000);

  test("o HTML do hero tem a primeira palavra e o runtime respeita movimento reduzido", async () => {
    const html = await exported();
    expect(html).toContain('<span class="sb-rot-w">HOJE?</span>');
    const files = await exportSiteToStatic(site);
    const all = JSON.stringify(files);
    // o script (FX_RUNTIME) só liga a troca quando não há `prefers-reduced-motion`
    expect(all).toContain("data-sb-rotate");
    expect(all).toMatch(/if\(!w\|\|words\.length<2\|\|reduce\)return/);
  }, 60_000);

  test("carrossel em fade: o HTML do slider traz data-fade e o do depoimento não", async () => {
    const html = await exported();
    expect(html.match(/data-fade="1"/g)?.length).toBe(1);
    expect(html.match(/data-si-car="1"/g)?.length).toBe(2);
  }, 60_000);
});

describe("templates irmãos", () => {
  test("o HTML exportado deles não tem as opções novas", async () => {
    const novas = [
      "sb-rot",
      "data-sb-rotate",
      "data-fade",
      "sb-gh",
      'class="gh-',
    ];
    for (const id of [
      "outro-lado-internet",
      "habilidades-comunicacao",
      "vsl-milionario",
      "gatilhos-mentais",
      "academia-do-corte",
      "viral-pack",
    ]) {
      const t = getTemplate(id);
      if (!t) throw new Error(`template ${id} não registrado`);
      const files = await exportSiteToStatic(t.site);
      const body = JSON.stringify(files)
        .replace(/<style>.*?<\/style>/g, "")
        .replace(/<script>.*?<\/script>/g, "")
        .replaceAll('\\"', '"');
      for (const n of novas) expect(body).not.toContain(n);
    }
  }, 120_000);
});
