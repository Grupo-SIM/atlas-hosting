import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { fontStylesheet } from "../../renderer/fonts.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("consultoria-financeira");
if (!template)
  throw new Error("template consultoria-financeira não registrado");
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

const exported = async () => JSON.stringify(await exportSiteToStatic(site));
/** HTML sem o escape do JSON, para procurar atributos e classes. */
const exportedHtml = async () => (await exported()).replaceAll('\\"', '"');

describe("template consultoria-financeira", () => {
  test("aparece na lista e passa no schema", () => {
    const meta = listTemplates().find(t => t.id === "consultoria-financeira");
    expect(meta?.name).toBe("Consultoria Financeira");
    expect(meta?.tags).toEqual(["Landing", "Negócios"]);
    expect(meta?.description).toContain("Migrada do Central do Marketing.");
    expect(siteSchema.safeParse(site).success).toBe(true);
    expect(site.pages[0]?.title).toBe("Consultoria Financeira");
    expect(site.theme.variant).toBe("consultoria");
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
    expect(count("cfStats", "items")).toBe(4);
    expect(count("cfServices", "items")).toBe(4);
    expect(count("cfWordStrip", "items")).toBe(5);
    expect(count("cfBonus", "items")).toBe(2);
    expect(count("cfTopics", "items")).toBe(4);
    expect(count("cfTestimonials", "items")).toBe(3);
    expect(count("ebookFaq", "items")).toBe(7);
  });

  test("HTML publicado tem o conteúdo, a âncora, o vídeo e o checkout", async () => {
    const html = await exportedHtml();
    for (const needle of [
      "sb-cf",
      'id="d1"',
      "player.vimeo.com/video/1095313115",
      'data-sb-count="80"',
      'data-sb-count="95"',
      'data-sb-count="30"',
      'data-sb-count="98"',
      "R$47,00",
      "R$97,00",
      "payment.ticto.app/O61B3DB33",
      "jb mídia",
      "Para quem é esta consultoria?",
      "Como Criar uma Renda Extra",
      "OFERTA ESPECIAL",
    ])
      expect(html).toContain(needle);
    // os botões "Adquirir…" rolam até a oferta; só o do cartão vai ao checkout
    expect(html.match(/href="#d1"/g)?.length).toBe(1 + 1 + 2 + 4 + 1);
    expect(html.match(/payment\.ticto\.app/g)?.length).toBe(1);
    expect(html.match(/class="cf-svc-card/g)?.length).toBe(4);
    expect(html.match(/class="cf-ws-col"/g)?.length).toBe(5);
    expect(html.match(/class="cf-bn-card"/g)?.length).toBe(2);
    expect(html.match(/class="cf-tp-card"/g)?.length).toBe(4);
    expect(html.match(/class="cf-ts-card/g)?.length).toBe(3);
    expect(html.match(/<details/g)?.length).toBe(7);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
  }, 60_000);

  test("título em duas fontes, depoimentos e FAQ", async () => {
    const html = await exportedHtml();
    expect(html).toContain('<em class="cf-it">FINANCEIRA</em>');
    expect(html).toContain('<em class="cf-it">leve</em>');
    expect(html).toContain("<em>frequentes</em>");
    // "tempo" sublinhado dentro do negrito
    expect(html).toContain("<strong><u>tempo</u> com quem você ama</strong>");
    // só o 3º depoimento some no tablet; só o 2º é destaque
    expect(html.match(/cf-hide-t/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html.match(/class="cf-ts-card hl cf-tex"/g)?.length).toBe(1);
    expect(html).toContain("eb-boxed");
  }, 60_000);

  test("não contém o que foi corrigido ou deixado de fora", async () => {
    const html = await exported();
    const ruim = [
      "Designation",
      "este consultoria",
      "um Renda Extra",
      String.fromCharCode(0x200b),
      "\\u200b",
      "ajax.googleapis.com",
    ];
    for (const r of ruim) expect(html).not.toContain(r);
  }, 60_000);

  test("fontes: itálico 300 da Noto Serif Display na variante", () => {
    const url = fontStylesheet(site) ?? "";
    expect(url).toContain("family=Noto+Serif+Display:ital,wght@1,300");
    expect(url).toContain("family=Titillium+Web:wght@200;300");
    expect(url).toContain("family=Montserrat:wght@300;400;500;600;700;800;900");
    expect(url).toContain("family=Roboto");
  });

  test("oferta: o botão pulsa uma vez, sem loop", () => {
    const offer = blocks.find(b => b.type === "ebookOffer");
    expect(offer?.fx?.["1.1.5"]?.enter).toBe("pulse");
    expect(offer?.fx?.["1.1.5"]?.loop).toBeUndefined();
    expect(offer?.anchor).toBe("d1");
  });
});

describe("extensões dos blocos de e-book", () => {
  test("FAQ em caixas (boxed)", async () => {
    const html = await exportedHtml();
    expect(html).toContain("eb-boxed");
  }, 60_000);

  test("os HTMLs dos templates irmãos não têm as opções novas", async () => {
    const novas = ["eb-boxed", "--eb-open-line", "sb-cf", "cf-hl"];
    for (const id of [
      "gatilhos-mentais",
      "outro-lado-internet",
      "habilidades-comunicacao",
      "vsl-milionario",
      "academia-do-corte",
      "viral-pack",
    ]) {
      const t = getTemplate(id);
      if (!t) throw new Error(`template ${id} não registrado`);
      const files = await exportSiteToStatic(t.site);
      const body = JSON.stringify(files)
        .replace(/<style>.*?<\/style>/g, "")
        .replace(/<script>.*?<\/script>/g, "");
      for (const n of novas)
        expect(body.replaceAll('\\"', '"')).not.toContain(n);
    }
  }, 120_000);
});
