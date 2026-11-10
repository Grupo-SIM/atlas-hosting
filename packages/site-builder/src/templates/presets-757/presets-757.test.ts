import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { FX_RUNTIME } from "../../renderer/fx-runtime.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("presets-757");
if (!template) throw new Error("template presets-757 não registrado");
const { site } = template;

const all = (blocks: Block[]): Block[] =>
  blocks.flatMap(b => [b, ...all(b.children ?? [])]);
const blocks = [
  ...all(site.header),
  ...all(site.footer),
  ...site.pages.flatMap(p => all(p.blocks)),
];

const files = await exportSiteToStatic(site);
const page = (path: string) => files.find(f => f.path === path)?.content ?? "";
const html = page("index.html");
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe("template presets-757", () => {
  test("aparece na tela de escolha", () => {
    const t = listTemplates().find(t => t.id === "presets-757");
    expect(t?.name).toBe("757 Presets — Pacotes de Lightroom");
    expect(t?.tags).toEqual(["Landing", "Fotografia"]);
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

  test("ids únicos e as rotas do original (+ 404)", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(site.pages.map(p => p.slug)).toEqual([
      "",
      "politica-de-devolucao",
      "404",
    ]);
    expect(files.map(f => f.path)).toContain(
      "politica-de-devolucao/index.html"
    );
  });

  test("a home traz as seções do original", () => {
    expect(html).toContain("sb-p7");
    expect(html).toContain("cinematográficas");
    expect(count(html, /data-p7-cmp="1"/g)).toBe(6);
    expect(count(html, /class="p7-cmp-a"/g)).toBe(6);
    expect(html).toContain('data-t="Antes"');
    expect(html).toContain('data-t="Depois"');
    expect(html).toContain("O que é o 757 Presets?");
    expect(count(html, /class="p7-sc-card"/g)).toBe(5);
    expect(html).toContain("SEGREDO05-PRESETS-757.jpg");
    expect(html).toContain("depo1-984x1024.jpg");
    expect(html).toContain("@757_marcelo");
    expect(html).toContain("instagram.com/videomakerdofuturo");
    expect(count(html, /class="p7-goal( tight)?"/g)).toBe(4);
    expect(html).toContain("Objetivo 4");
    expect(count(html, /data-si-car="1"/g)).toBe(1);
    expect(html).toContain("R$69,99");
    expect(html).toContain("<del>R$99,00</del>");
    expect(html).toContain("simLinkCode=57532e13-eefc-4c51-80a1-13e1b1ef795f");
    expect(html).toContain("100% DE CASHBACK!");
    expect(count(html, /data-p7-cd="1796898000"/g)).toBe(2);
    expect(count(html, /<details class="p7-faq-item"/g)).toBe(12);
    expect(html).not.toMatch(/<details class="p7-faq-item"[^>]*open/);
    expect(html).toContain("PIRATARIA É CRIME!");
    expect(html).toContain("/politica-de-devolucao/");
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
  });

  test("#pt1 é o id do bloco de oferta e todo botão de chamada aponta para ele", () => {
    expect(count(html, /id="pt1"/g)).toBe(1);
    expect(count(html, /href="#pt1"/g)).toBe(5);
    const price = html.indexOf('class="p7-price"');
    const anchor = html.indexOf('id="pt1"');
    expect(anchor).toBeGreaterThan(-1);
    expect(price).toBeGreaterThan(-1);
  });

  test("não migra a imagem quebrada do hero", () => {
    expect(html).not.toContain("Animation-1744462393643");
  });

  test("a página de devolução e a 404 usam o mesmo rodapé", () => {
    const returns = page("politica-de-devolucao/index.html");
    expect(returns).toContain("Política de Devolução");
    expect(returns).toContain("contatosimintermediacoes@gmail.com");
    expect(returns).toContain("PIRATARIA É CRIME!");
    expect(page("404.html")).toContain("Página não encontrada");
  });

  test("carrega Montserrat e Roboto", () => {
    expect(html).toContain("family=Montserrat");
    expect(html).toContain("family=Roboto");
  });

  test("o hero pulsa o botão de chamada", () => {
    const hero = blocks.find(b => b.type === "p7Hero");
    expect(hero?.fx?.["1.2.2.1"]?.enter).toBe("pulse");
  });

  test("o runtime liga o comparador e o contador", () => {
    expect(FX_RUNTIME).toContain("[data-p7-cmp]");
    expect(FX_RUNTIME).toContain("[data-p7-cd]");
  });
});
