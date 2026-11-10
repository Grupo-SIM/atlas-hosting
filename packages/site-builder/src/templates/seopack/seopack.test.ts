import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("seopack");
if (!template) throw new Error("template seopack não registrado");
const { site } = template;
const blocks = [...site.header, ...site.pages[0].blocks, ...site.footer];

describe("template seopack", () => {
  test("aparece na tela de escolha", () => {
    expect(listTemplates().some(t => t.id === "seopack")).toBe(true);
  });

  test("passa no siteSchema e nos schemas dos blocos", () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
    for (const b of blocks) {
      expect(
        getBlockDefinition(b.type)?.schema.safeParse(b.props).success
      ).toBe(true);
    }
  });

  test("ids de bloco únicos e âncoras do menu existem", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(blocks.map(b => b.anchor).filter(Boolean)).toEqual([
      "sobre",
      "ferramentas",
      "planos",
      "faq",
    ]);
  });

  test("home publicada traz planos, cadastro, ferramentas, FAQ e carrosséis", async () => {
    const files = await exportSiteToStatic(site);
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain("sb-sp");
    expect(home).not.toContain("undefined");
    expect(home).not.toContain("Bloco desconhecido");
    // 3 planos + botão do cabeçalho
    expect(
      home.match(/seopack\.org\/v2\/login\/register\?r=kOYVgkoc/g)
    ).toHaveLength(4);
    expect(home).toContain("168,00");
    expect(home.match(/class="sp-tool"/g)).toHaveLength(10);
    expect(home.match(/<details/g)).toHaveLength(7);
    expect(home.match(/class="sb-cslider sg-car sp-car"/g)).toHaveLength(2);
    expect(home).toContain('id="planos"');
    expect(home).not.toContain("moonify");
  });
});
