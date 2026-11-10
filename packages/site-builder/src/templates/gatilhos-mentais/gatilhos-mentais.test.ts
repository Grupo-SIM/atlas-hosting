import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { fxCss, HOVER_EFFECTS } from "../../model/fx.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("gatilhos-mentais");
if (!template) throw new Error("template gatilhos-mentais não registrado");
const { site } = template;
const blocks = [
  ...site.header,
  ...site.footer,
  ...site.pages.flatMap(p => p.blocks),
];
const count = (type: string, key: string) =>
  (blocks.find(b => b.type === type)?.props[key] as unknown[] | undefined)
    ?.length;

describe("template gatilhos-mentais", () => {
  test("aparece na lista e passa no schema", () => {
    const meta = listTemplates().find(t => t.id === "gatilhos-mentais");
    expect(meta?.name).toBe("Gatilhos Mentais — E-book");
    expect(meta?.tags).toEqual(["Landing", "Cursos"]);
    expect(siteSchema.safeParse(site).success).toBe(true);
    expect(site.pages[0]?.title).toBe("E-book Gatilhos Mentais");
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

  test("listas completas: 4 recursos, 4 itens de confiança, 4 gatilhos, 3 bônus, 4 reviews, 4 números e 6 perguntas", () => {
    expect(count("gmFeatures", "items")).toBe(4);
    expect(count("gmTrustStrip", "items")).toBe(4);
    expect(count("gmTriggers", "items")).toBe(4);
    expect(count("gmBonus", "items")).toBe(3);
    expect(count("gmReviews", "items")).toBe(4);
    expect(count("gmReviews", "counters")).toBe(4);
    expect(count("ebookFaq", "items")).toBe(6);
  });

  test("HTML publicado tem o conteúdo, a âncora, o popup do vídeo e os contadores", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    for (const needle of [
      "sb-gm",
      'id=\\"d1\\"',
      "827825930",
      'data-sb-count=\\"24\\"',
      'data-prefix=\\"+\\"',
      "+38",
      'data-sb-count=\\"9000\\"',
      'data-sep=\\".\\"',
      "+9.000",
      "R$19,90",
      "R$37,00",
      "simLinkCode=1a2157e7-8ded-4c4f-a747-68ddba23cf04",
      "Qual o foco principal do e-book?",
      "Eu consigo aplicar o conteúdo para minha imagem pessoal?",
      "© SIM Intermediações",
      "100% DE CASHBACK INSTANTANEAMENTE",
      "estamos a um e-mail de distância",
      "sucesso (Só leva 7 dias) – Dr. Joe Dispenza",
      "Aprendizado rápido",
      "Escassez",
      "Curiosidade",
      "Gabriel Martins",
    ])
      expect(html).toContain(needle);
    // todos os botões da página rolam até a oferta; só o do cartão vai ao checkout
    expect(html.match(/href=\\"#d1\\"/g)?.length).toBeGreaterThanOrEqual(10);
    expect(html.match(/checkout\.simintermediacoes\.com/g)?.length).toBe(1);
    // o botão de play e o link do vídeo abrem o mesmo popup
    expect(html.match(/data-sb-video=/g)?.length).toBe(2);
    expect(html.match(/class=\\"gm-card\\"/g)?.length).toBe(4);
    expect(html.match(/class=\\"gm-trust-item\\"/g)?.length).toBe(4);
    expect(html.match(/class=\\"gm-tcard\\"/g)?.length).toBe(4);
    expect(html.match(/class=\\"gm-bcol\\"/g)?.length).toBe(3);
    expect(html.match(/class=\\"gm-review\\"/g)?.length).toBe(4);
    expect(html.match(/<details/g)?.length).toBe(6);
  }, 60_000);

  test("nenhuma página tem 'undefined' nem 'Bloco desconhecido' e o que foi corrigido/retirado não volta", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
    expect(html).not.toContain("Gatilho-1.png");
    expect(html).not.toContain("INSTANTÂNEAMENTE");
    expect(html).not.toContain("de distancia");
  }, 60_000);

  test("efeitos: hover pulse, pulso em loop e movimento reduzido", () => {
    expect(HOVER_EFFECTS).toContain("pulse");
    const loop = fxCss("b", { "": { enter: "pulse", loop: true } });
    expect(loop).toContain("infinite");
    expect(loop).toContain("sb-fx-pulse-loop");
    // só roda sem preferência por movimento reduzido
    expect(loop).toContain("prefers-reduced-motion:no-preference");
    const once = fxCss("b", { "": { enter: "pulse" } });
    expect(once).not.toContain("infinite");
    const hover = fxCss("b", { "": { hover: "pulse" } });
    expect(hover).toContain("sb-fx-hover-pulse");
    expect(hover).toContain("prefers-reduced-motion:no-preference");
  });

  test("o botão da oferta pulsa em loop e o pulso fica no CSS publicado", async () => {
    const offer = blocks.find(b => b.type === "ebookOffer");
    expect(offer?.fx?.["1.1.5"]).toEqual({ enter: "pulse", loop: true });
    const html = JSON.stringify(await exportSiteToStatic(site));
    expect(html).toContain("sb-fx-pulse-loop");
    expect(html).toContain("infinite alternate");
  }, 60_000);
});
