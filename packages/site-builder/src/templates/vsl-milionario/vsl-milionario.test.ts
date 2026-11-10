import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { COUNT_FMT_JS, FX_RUNTIME } from "../../renderer/fx-runtime.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("vsl-milionario");
if (!template) throw new Error("template vsl-milionario não registrado");
const { site } = template;
const blocks = [
  ...site.header,
  ...site.footer,
  ...site.pages.flatMap(p => p.blocks),
];
const count = (type: string, key: string) =>
  (blocks.find(b => b.type === type)?.props[key] as unknown[] | undefined)
    ?.length;

describe("template vsl-milionario", () => {
  test("aparece na lista e passa no schema", () => {
    const meta = listTemplates().find(t => t.id === "vsl-milionario");
    expect(meta?.name).toBe("VSL Milionário — E-book");
    expect(meta?.tags).toEqual(["Landing", "Cursos"]);
    expect(siteSchema.safeParse(site).success).toBe(true);
    expect(site.pages[0]?.title).toBe("E-book VSL Milionário");
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

  test("HTML publicado tem o conteúdo, a âncora e os 9 botões para a oferta", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    for (const needle of [
      "sb-vm",
      'id=\\"oferta\\"',
      "Você tem apenas 8 segundos para vender",
      "O Método por trás dos VSL&#x27;s que Realmente Vendem",
      "Literalmente os Segredos Revelados",
      "É IMPOSSÍVEL!",
      "R$247,00",
      "R$497,00",
      "simLinkCode=1f28bcba-cb39-43d1-aeef-9bf12e827df4",
      'data-sb-count=\\"4.9\\"',
      "1088175788",
      "© SIM Intermediações",
      "Desconto de 16% agora!",
      "Entrega imediata;",
      "%C2%B4-1080-x-1920-px-1-scaled.webp",
    ])
      expect(html).toContain(needle);
    expect(html.match(/href=\\"#oferta\\"/g)?.length).toBe(9);
    expect(html.match(/data-sb-count=/g)?.length).toBe(4);
    // só o botão do cartão de oferta vai para o checkout
    expect(html.match(/checkout\.simintermediacoes\.com/g)?.length).toBe(1);
  }, 60_000);

  test("listas completas: 6 cartões, 4 contadores, 4 benefícios, 3 bônus, 6 depoimentos e 6 perguntas", async () => {
    expect(count("vmFeatures", "items")).toBe(6);
    expect(count("vmStats", "counters")).toBe(4);
    expect(count("vmBenefits", "items")).toBe(4);
    expect(count("vmBonus", "items")).toBe(3);
    expect(count("vmTestimonials", "items")).toBe(6);
    expect(count("vmHighlights", "items")).toBe(3);
    expect(count("ebookFaq", "items")).toBe(6);
    const html = JSON.stringify(await exportSiteToStatic(site));
    expect(
      html.match(/class=\\"vm-fcard|vm-glass soft vm-fcard/g)?.length
    ).toBe(6);
    expect(html.match(/class=\\"vm-counter\\"/g)?.length).toBe(4);
    expect(html.match(/class=\\"vm-solid\\"/g)?.length).toBe(4);
    expect(html.match(/vm-glass vm-bcard/g)?.length).toBe(3);
    // 6 slides + o clone do início que o runtime acrescenta só no navegador
    expect(html.match(/class=\\"vm-tslide\\"/g)?.length).toBe(6);
    expect(html.match(/class=\\"eb-faq-item\\"/g)?.length).toBe(6);
    expect(html).toContain('name=\\"sb-eb-faq-0\\"');
    expect(html).toContain('name=\\"sb-eb-faq-1\\"');
    // o primeiro item de cada coluna começa aberto
    expect(
      html.match(/<details class=\\"eb-faq-item\\"[^>]*open/g)?.length
    ).toBe(2);
  }, 60_000);

  test("não tem os erros de digitação do original nem undefined", async () => {
    const html = JSON.stringify(await exportSiteToStatic(site));
    for (const bad of ["IMPOSSIVEL", "sequencia ", "um video", "videos "])
      expect(html).not.toContain(bad);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
  }, 60_000);

  test("animações: pulse no botão de compra e o carrossel avança de 3 em 3", async () => {
    const offer = blocks.find(b => b.type === "ebookOffer");
    expect(offer?.anchor).toBe("oferta");
    expect(offer?.fx?.["1.1.7"]?.enter).toBe("pulse");
    expect(offer?.fx?.["1.1"]?.enter).toBe("zoomIn");
    const html = JSON.stringify(await exportSiteToStatic(site));
    expect(html).toContain(
      `[data-block-id=\\"${offer?.id}\\"]>:nth-child(1)>:nth-child(1)>:nth-child(7).sb-in{animation:sb-fx-pulse`
    );
    expect(html).toContain('data-adv=\\"page\\"');
    expect(html).toContain('data-delay=\\"5000\\"');
  }, 60_000);

  test("contador decimal: 4.9 mantém uma casa e os inteiros não mudam", () => {
    // roda a mesma função que vai no navegador (`COUNT_FMT_JS`)
    const fmt = new Function(`${COUNT_FMT_JS}; return sbCountFmt;`)() as (
      n: number,
      d: number,
      sep: string,
      dsep: string
    ) => string;
    expect(fmt(4.9, 1, "", ".")).toBe("4.9");
    expect(fmt(4.9 * 0.5, 1, "", ".")).toBe("2.5");
    expect(fmt(4.9, 1, "", ",")).toBe("4,9");
    expect(fmt(0, 1, "", ".")).toBe("0.0");
    expect(fmt(10, 0, "", ".")).toBe("10");
    expect(fmt(12345, 0, ".", ".")).toBe("12.345");
    expect(fmt(12345.6, 1, ".", ",")).toBe("12.345,6");
    expect(FX_RUNTIME).toContain("function sbCountFmt");
    expect(FX_RUNTIME).toContain("data-decimals");
  });
});

describe("blocos comuns de e-book continuam como eram nos templates irmãos", () => {
  test("os HTMLs de outro-lado-internet e habilidades-comunicacao não têm as opções novas", async () => {
    const novas = [
      "eb-light",
      "eb-pill",
      "eb-from-inline",
      "eb-discount",
      "eb-list",
      "eb-cards",
      "eb-cols",
      "eb-faq-head",
      "eb-foot-div",
      "has-sec",
      "has-img",
      "roomy",
      'data-adv="page"',
    ];
    for (const id of ["outro-lado-internet", "habilidades-comunicacao"]) {
      const t = getTemplate(id);
      if (!t) throw new Error(`template ${id} não registrado`);
      const files = await exportSiteToStatic(t.site);
      // só o corpo: o CSS (`<style>`) e o runtime (`<script>`) são compartilhados e crescem com as opções novas
      const body = JSON.stringify(files)
        .replace(/<style>.*?<\/style>/g, "")
        .replace(/<script>.*?<\/script>/g, "");
      for (const n of novas)
        expect(body.replaceAll('\\"', '"')).not.toContain(n);
    }
  }, 60_000);
});
