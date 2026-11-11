import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import {
  COUNT_AT_JS,
  FX_RUNTIME,
  FX_VERSION,
} from "../../renderer/fx-runtime.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("academia-do-corte");
if (!template) throw new Error("template academia-do-corte não registrado");
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

const exported = async () => {
  const files = await exportSiteToStatic(site);
  return JSON.stringify(files);
};

describe("template academia-do-corte", () => {
  test("aparece na lista e passa no schema", () => {
    const meta = listTemplates().find(t => t.id === "academia-do-corte");
    expect(meta?.name).toBe("Academia do Corte — Curso de Barbearia");
    expect(meta?.tags).toEqual(["Landing", "Cursos"]);
    expect(meta?.description).toContain("Migrada do Central do Marketing.");
    expect(siteSchema.safeParse(site).success).toBe(true);
    expect(site.pages[0]?.title).toBe("Academia do Corte");
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

  test("listas completas", () => {
    expect(count("acFeatures", "items")).toBe(4);
    expect(count("acAbout", "counters")).toBe(2);
    expect(count("acCurriculum", "items")).toBe(12);
    expect(count("acInstructor", "items")).toBe(5);
    expect(count("acReviews", "items")).toBe(4);
    expect(count("ebookFaq", "items")).toBe(6);
  });

  test("HTML publicado tem o conteúdo, a âncora, os vídeos e os contadores", async () => {
    const html = await exported();
    for (const needle of [
      "sb-ac",
      'id=\\"oferta\\"',
      "zC6zv1abdPU",
      "HwEcKYH0UOo",
      'data-sb-count=\\"10\\"',
      'data-from=\\"1\\"',
      'data-sb-count=\\"98\\"',
      'data-from=\\"10\\"',
      "Aprenda do Zero",
      "Técnicas Práticas",
      "Bônus Exclusivos",
      "Aulas diretas",
      "Equipamentos",
      "Barba",
      "Detalhamento",
      "Profissionalismo",
      "Lucas Ferreira",
      "Rafael Lima",
      "MELHOR ESCOLHA",
      "R$47,00",
      "R$69,99",
      "simLinkCode=1e0b9e12-5d34-4a46-b5aa-d121f38deeae",
      "<strong>Sim!</strong>",
      "© SIM Intermediações",
      "Técnica de Movimento c",
    ])
      expect(html).toContain(needle);
    // todos os botões e links do mosaico rolam até a oferta; só o cartão vai ao checkout
    expect(html.match(/href=\\"#oferta\\"/g)?.length).toBeGreaterThanOrEqual(
      4 + 10
    );
    expect(html.match(/checkout\.simintermediacoes\.com/g)?.length).toBe(1);
    expect(html.match(/class=\\"ac-feat\\"/g)?.length).toBe(4);
    expect(html.match(/class=\\"ac-cur-item\\"/g)?.length).toBe(12);
    expect(html.match(/class=\\"ac-tile( big)?\\"/g)?.length).toBe(5);
    expect(html.match(/class=\\"ac-review\\"/g)?.length).toBe(4);
    expect(html.match(/<details/g)?.length).toBe(6);
    // lightbox do vídeo
    expect(html.match(/data-sb-video=/g)?.length).toBe(1);
  }, 60_000);

  test("nenhuma página tem 'undefined' nem 'Bloco desconhecido' e o que foi corrigido/retirado não volta", async () => {
    const html = await exported();
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
    for (const ruim of ["familia", "alto estima", "no inicio", "DEGRADE "])
      expect(html).not.toContain(ruim);
    expect(html.toLowerCase()).not.toContain("jquery");
    expect(html).not.toContain("ajax.googleapis");
    // garantia: uma versão só
    expect(html.match(/GARANTIA DE SATISFAÇÃO/gi)?.length).toBe(1);
  }, 60_000);

  test("o vídeo de fundo do hero é o do YouTube, mudo e em laço", async () => {
    const html = await exported();
    expect(html).toContain("youtube-nocookie.com/embed/zC6zv1abdPU");
    expect(html).toContain("mute=1");
    expect(html).toContain("loop=1");
  }, 60_000);

  test("contador com valor inicial: o runtime lê data-from e conta de from até o valor", () => {
    expect(FX_VERSION).toBeGreaterThanOrEqual(15);
    expect(FX_RUNTIME).toContain("data-from");
    expect(FX_RUNTIME).toContain("function sbCountAt");
    // roda a mesma função que vai no navegador (`COUNT_AT_JS`)
    const at = new Function(`${COUNT_AT_JS}; return sbCountAt;`)() as (
      from: number,
      end: number,
      k: number,
      dec: number
    ) => number;
    expect(at(1, 10, 0, 0)).toBe(1);
    expect(at(1, 10, 1, 0)).toBe(10);
    expect(at(10, 98, 0, 0)).toBe(10);
    expect(at(10, 98, 0.5, 0)).toBe(54);
    expect(at(10, 98, 1, 0)).toBe(98);
    // sem valor inicial é o de sempre (0 → fim)
    expect(at(0, 100, 0.25, 0)).toBe(25);
    expect(at(0, 4.9, 0.5, 1)).toBeCloseTo(2.45);
  });
});

describe("extensões dos blocos de e-book", () => {
  test("o cartão usa fita, botão sólido e lista à esquerda; o FAQ aceita negrito", async () => {
    const html = (await exported()).replaceAll('\\"', '"');
    for (const c of [
      "eb-has-ribbon",
      "eb-ribbon",
      "eb-btn-solid",
      "eb-list-plain",
    ])
      expect(html).toContain(c);
  }, 60_000);

  test("os HTMLs dos templates irmãos não têm as opções novas", async () => {
    const novas = [
      "eb-has-ribbon",
      "eb-ribbon",
      "eb-btn-solid",
      "eb-list-plain",
    ];
    for (const id of [
      "outro-lado-internet",
      "habilidades-comunicacao",
      "vsl-milionario",
      "gatilhos-mentais",
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
