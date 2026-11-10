import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { ENTER_EFFECTS } from "../../model/fx.js";
import { siteSchema } from "../../model/schema.js";
import { FX_RUNTIME } from "../../renderer/fx-runtime.js";
import { siteCss } from "../../renderer/styles.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("outro-lado-internet");
if (!template) throw new Error("template outro-lado-internet não registrado");
const { site } = template;
const blocks = [
  ...site.header,
  ...site.footer,
  ...site.pages.flatMap(p => p.blocks),
];

describe("template outro-lado-internet", () => {
  test("aparece na lista e passa no schema", () => {
    expect(listTemplates().map(t => t.id)).toContain("outro-lado-internet");
    expect(siteSchema.safeParse(site).success).toBe(true);
  });

  test("props de todos os blocos passam no schema do bloco e os ids são únicos", () => {
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def).toBeDefined();
      expect(def?.schema.safeParse(b.props).success).toBe(true);
    }
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("HTML publicado tem o conteúdo e os links do original", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    for (const needle of [
      "sb-ol",
      'id=\\"pt1\\"',
      'id=\\"pt2\\"',
      'href=\\"#pt1\\"',
      'href=\\"#pt2\\"',
      "O OUTRO LADO DA",
      "PERIGOSO",
      "outro mundo?",
      "player.vimeo.com/video/830588189",
      "R$37,00",
      "R$49,90",
      "simLinkCode=3e8b2290-8148-48a5-a15f-4a20ffef9b75",
      "© SIM Intermediações",
      "precauções",
      "instantaneamente",
      "possível",
      "funcionam os reais perigos",
    ])
      expect(html).toContain(needle);
    for (const file of [
      "2025/06/hacker-green-matrix-1.webp",
      "2025/04/anonimo-knowhere.webp",
      "2025/04/codigo-pc.webp",
      "2025/04/3.jpg",
      "2025/04/estudando-dark-web.webp",
      "2025/04/pc-anonimos.webp",
      "2025/04/anonymus-dark.webp",
      "2025/04/anonimo-sumido-dark.webp",
      "2025/04/teste-image-outrolado.webp",
      "2025/04/fear-dark-anonymus.webp",
    ])
      expect(html).toContain(file);
    const hero = template.site.pages[0]?.blocks[0];
    expect(hero?.type).toBe("olHero");
    const faq = blocks.find(b => b.type === "olFaq");
    expect((faq?.props.items as unknown[] | undefined)?.length).toBe(7);
    expect(html).toContain("O que é Deep web?");
    expect(html).toContain("Como terei acesso?");
  }, 60_000);

  test("nenhuma página tem undefined nem bloco desconhecido; popups e erros de digitação não voltam", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
    for (const bad of [
      "SOU PATRIOTA",
      "PRECISAMOS DE VOCÊ",
      "ticto",
      "possivel ",
      "precauçōes",
      "instantâneamente",
      "como funciona os reais",
    ])
      expect(html).not.toContain(bad);
  }, 60_000);

  test("pulse: está em ENTER_EFFECTS, no botão de compra, e o CSS e o runtime existem", async () => {
    expect(ENTER_EFFECTS).toContain("pulse");
    expect(siteCss).toContain("@keyframes sb-fx-pulse");
    expect(FX_RUNTIME).toContain("data-ol-video");
    const offer = blocks.find(b => b.type === "olOffer");
    expect(offer?.fx?.["1.1.2.1.5"]?.enter).toBe("pulse");
    const files = await exportSiteToStatic(site);
    expect(JSON.stringify(files)).toContain(
      `[data-block-id=\\"${offer?.id}\\"]>:nth-child(1)>:nth-child(1)>:nth-child(2)>:nth-child(1)>:nth-child(5).sb-in{animation:sb-fx-pulse`
    );
  }, 60_000);
});
