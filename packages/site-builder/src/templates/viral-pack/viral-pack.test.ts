import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("viral-pack");
if (!template) throw new Error("template viral-pack não registrado");
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

describe("template viral-pack", () => {
  test("aparece na lista e passa no schema", () => {
    const meta = listTemplates().find(t => t.id === "viral-pack");
    expect(meta?.name).toBe("Viral Pack — Pack de Conteúdo");
    expect(meta?.tags).toEqual(["Landing", "Marketing"]);
    expect(meta?.description).toContain("Migrada do Central do Marketing.");
    expect(siteSchema.safeParse(site).success).toBe(true);
    expect(site.pages[0]?.title).toBe("ViralPack");
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
    expect(count("vpHighlights", "items")).toBe(4);
    expect(count("vpBenefits", "items")).toBe(8);
    expect(count("ebookFaq", "items")).toBe(12);
    expect(count("mosaicHero", "tiles")).toBe(20);
  });

  test("HTML publicado tem o conteúdo, a âncora e o checkout", async () => {
    const html = await exported();
    for (const needle of [
      "sb-vp",
      'id=\\"oferta\\"',
      "GERE MILHÕES DE VIEWS",
      "COM O VIRAL PACK",
      "R$29,90",
      "Desconto de 45% agora!",
      "simLinkCode=1ef10aab-812a-47cf-b1cf-859f55a8a579",
      "© SIM Intermediações",
      "Perguntas Frequentes",
      "OFERTA EXCLUSIVA",
    ])
      expect(html).toContain(needle);
    expect(html.match(/href=\\"#oferta\\"/g)?.length).toBe(1 + 1 + 8);
    expect(html.match(/checkout\.simintermediacoes\.com/g)?.length).toBe(1);
    expect(html.match(/class=\\"vp-hl-item\\"/g)?.length).toBe(4);
    expect(html.match(/class=\\"vp-ben-card\\"/g)?.length).toBe(8);
    expect(html.match(/<details/g)?.length).toBe(12);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
  }, 60_000);

  test("não contém os pôsteres de terceiros, 'Youtube' nem a busca oculta", async () => {
    const html = await exported();
    for (const ruim of [
      "prison-break",
      "divertidamente",
      "the-100",
      "jurassic-park",
      "top-gun",
      "game-of-thrones",
      "esquedrao",
      "fastandfurious",
      "la-casa-de-papel",
      "the-choosen",
      "684x1024",
      "716YB2xcvOL",
      "Youtube",
      "jkit-search",
    ])
      expect(html).not.toContain(ruim);
  }, 60_000);
});

describe("extensões dos blocos de e-book", () => {
  test("oferta com textura, botão contorno, FAQ em cartões laterais", async () => {
    const html = (await exported()).replaceAll('\\"', '"');
    for (const c of [
      "eb-texture",
      "eb-btn-outline",
      "eb-solid",
      "eb-split",
      "eb-faq-split",
    ])
      expect(html).toContain(c);
  }, 60_000);

  test("os HTMLs dos templates irmãos não têm as opções novas", async () => {
    const novas = [
      "eb-texture",
      "eb-btn-outline",
      "eb-solid",
      "eb-split",
      "eb-faq-split",
      "has-pad",
    ];
    for (const id of [
      "outro-lado-internet",
      "habilidades-comunicacao",
      "vsl-milionario",
      "gatilhos-mentais",
      "academia-do-corte",
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
