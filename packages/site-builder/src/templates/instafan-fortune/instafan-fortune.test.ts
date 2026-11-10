import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { siteCss } from "../../renderer/styles.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("instafan-fortune");
if (!template) throw new Error("template instafan-fortune não registrado");
const { site } = template;
const blocks = [
  ...site.header,
  ...site.footer,
  ...site.pages.flatMap(p => p.blocks),
];

describe("template instafan-fortune", () => {
  test("aparece na lista e passa no schema", () => {
    expect(listTemplates().map(t => t.id)).toContain("instafan-fortune");
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

  test("HTML publicado tem o conteúdo, as âncoras e os links do original", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    for (const needle of [
      "sb-if",
      'id=\\"cp1\\"',
      'id=\\"cpcompra\\"',
      'href=\\"#cp1\\"',
      'href=\\"#cpcompra\\"',
      "InstaFanFortune",
      "<b>expressiva</b>",
      "<b>sem aparecer</b>",
      "Método <b>atemporal</b> para a <b>liberdade</b>",
      "RESULTADO GARANTIDO!",
      "Rumo ao sucesso",
      "ZERO RISCO!",
      "R$19,99",
      "R$37,00",
      "simLinkCode=0b15791e-665f-4fc2-bbaa-1b97f54008a4",
      "© SIM Intermediações",
      "O que está incluso na compra do InstaFanFortune?",
      "Terei algum tipo de suporte?",
      "cifrao-s.png",
      "encondee-img-02.webp",
      "bg-triangulo-insta-fortune.webp",
      "caixa-linha-azul.webp",
    ])
      expect(html).toContain(needle);
    const faq = blocks.find(b => b.type === "ifFaq");
    expect((faq?.props.items as unknown[] | undefined)?.length).toBe(9);
  }, 60_000);

  test("nenhuma página tem undefined nem bloco desconhecido; o popup de leads não volta", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
    for (const bad of ["SOU PATRIOTA", "PRECISAMOS DE VOCÊ", "ticto"])
      expect(html).not.toContain(bad);
  }, 60_000);

  test("pulse no botão de compra e CSS do efeito existem", async () => {
    expect(siteCss).toContain("@keyframes sb-fx-pulse");
    const offer = blocks.find(b => b.type === "ifOffer");
    expect(offer?.fx?.["1.2.5"]?.enter).toBe("pulse");
    const files = await exportSiteToStatic(site);
    expect(JSON.stringify(files)).toContain(
      `[data-block-id=\\"${offer?.id}\\"]>:nth-child(1)>:nth-child(2)>:nth-child(5).sb-in{animation:sb-fx-pulse`
    );
  }, 60_000);
});
