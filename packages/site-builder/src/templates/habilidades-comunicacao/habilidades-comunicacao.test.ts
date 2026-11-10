import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { ENTER_EFFECTS, fxSchema } from "../../model/fx.js";
import type { Block } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("habilidades-comunicacao");
if (!template)
  throw new Error("template habilidades-comunicacao não registrado");
const { site } = template;

const all = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...all(b.children ?? [])]);
const blocks = [
  ...all(site.header),
  ...all(site.footer),
  ...site.pages.flatMap(p => all(p.blocks)),
];

const files = await exportSiteToStatic(site);
const html = files.find(f => f.path === "index.html")?.content ?? "";
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe("template habilidades-comunicacao", () => {
  test("aparece na tela de escolha", () => {
    const t = listTemplates().find(t => t.id === "habilidades-comunicacao");
    expect(t?.name).toBe("Habilidades de Comunicação — E-book");
    expect(t?.tags).toEqual(["Landing", "Cursos"]);
    expect(t?.description).toContain("Migrada do Central do Marketing");
  });

  test("passa no siteSchema e nos schemas de todos os blocos", () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def, b.type).toBeDefined();
      expect(def?.schema.safeParse(b.props).success, b.type).toBe(true);
    }
  });

  test("ids únicos e uma única rota", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug)).toEqual([""]);
    expect(site.pages[0]?.title).toBe("Habilidades de Comunicação – E-book");
  });

  test("a página publicada traz as seções do original", () => {
    expect(files.map(f => f.path)).toContain("index.html");
    expect(html).toContain("sb-hc");
    expect(html).toContain('id="pt1"');
    expect(count(html, /href="#pt1"/g)).toBe(2);
    expect(html).toContain("Comprar E-Book");
    expect(html).toContain("MUDAR!");
    expect(count(html, /class="hc-ben-card"/g)).toBe(6);
    expect(html).toContain("<em>mindset</em>");
    expect(count(html, /<article class="hc-chap-card"/g)).toBe(6);
    expect(html).toContain("CAPÍTULO 6");
    expect(html).toContain("#6");
    expect(count(html, /<li><svg[^>]*class="hc-star"/g)).toBe(3);
    expect(html).toContain("3 BÔNUS");
    expect(html).toContain("EXCLUSIVOS!");
    expect(html).toContain("R$24,90");
    expect(html).toContain("R$37,00");
    expect(html).toContain("simLinkCode=980b647d-a799-4935-8302-1d44e947b89e");
    expect(html).toContain("Equipe profissional à disposição.");
    expect(count(html, /<details class="eb-faq-item"/g)).toBe(6);
    expect(html).toMatch(/<details class="eb-faq-item"[^>]*open/);
    expect(html).toContain("© SIM Intermediações");
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
  });

  test("o cartão de oferta fica dentro do bloco de bônus, abaixo da lista e acima do suporte", () => {
    const bonus = html.indexOf('class="hc-sec hc-bonus"');
    const list = html.indexOf('class="hc-bonus-list"');
    const offer = html.indexOf('class="eb-offer');
    const support = html.indexOf('class="hc-support"');
    expect(bonus).toBeGreaterThan(-1);
    expect(list).toBeGreaterThan(bonus);
    expect(offer).toBeGreaterThan(list);
    expect(support).toBeGreaterThan(offer);
  });

  test("não migra os popups nem os erros de digitação do original", () => {
    for (const s of [
      "SOU PATRIOTA",
      "PRECISAMOS DE VOCÊ",
      "ticto",
      "negociaçōes",
      "situaçōes",
      "instantâneamente",
      "a disposição",
    ])
      expect(html).not.toContain(s);
    expect(html).toContain("negociações");
    expect(html).toContain("situações");
    expect(html).toContain("instantaneamente");
  });

  test("carrega Electrolize, Montserrat e Roboto", () => {
    expect(html).toContain("family=Electrolize:wght@400");
    expect(html).toContain("family=Montserrat");
    expect(html).toContain("family=Roboto");
  });

  test("entradas: pulse nos botões, bounce nos bônus e ícones alternados só no celular", () => {
    const fx = Object.fromEntries(blocks.map(b => [b.type, b.fx ?? {}]));
    expect(fx.hcHero?.["1.2.1.3"]?.enter).toBe("pulse");
    expect(fx.ebookOffer?.["1.1.5"]?.enter).toBe("pulse");
    expect(fx.hcBonus?.["1.1.1.1"]).toEqual({
      enter: "bounceIn",
      enterTablet: "bounceInLeft",
    });
    const icons = Object.entries(fx.hcBenefits ?? {}).filter(
      ([k]) => k.split(".").length === 5
    );
    expect(icons.length).toBe(6);
    expect(icons.map(([, v]) => v.enterMobile)).toEqual([
      "bounceInLeft",
      "bounceInRight",
      "bounceInLeft",
      "bounceInRight",
      "bounceInLeft",
      "bounceInRight",
    ]);
    for (const [, v] of icons) expect(v.enter).toBeUndefined();
    expect(html).toContain(
      "@media (prefers-reduced-motion:no-preference) and (max-width:767px)"
    );
  });

  test("os efeitos novos existem e o schema aceita entrada por tela", () => {
    for (const e of ["bounceIn", "bounceInLeft", "bounceInRight", "pulse"])
      expect(ENTER_EFFECTS as readonly string[]).toContain(e);
    expect(
      fxSchema.safeParse({ enterMobile: "bounceInRight", enterTablet: "none" })
        .success
    ).toBe(true);
    expect(fxSchema.safeParse({ enterMobile: "nada" }).success).toBe(false);
  });
});
