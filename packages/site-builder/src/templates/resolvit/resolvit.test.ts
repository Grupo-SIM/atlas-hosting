import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("resolvit");
if (!template) throw new Error("template resolvit não registrado");
const { site } = template;
const blocks = [...site.header, ...site.pages[0].blocks, ...site.footer];

describe("template resolvit", () => {
  test("aparece na tela de escolha", () => {
    expect(listTemplates().some(t => t.id === "resolvit")).toBe(true);
  });

  test("passa no siteSchema e nos schemas dos blocos", () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
    for (const b of blocks) {
      expect(
        getBlockDefinition(b.type)?.schema.safeParse(b.props).success
      ).toBe(true);
    }
  });

  test("ids únicos e a âncora #oferta existe", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(blocks.map(b => b.anchor).filter(Boolean)).toEqual(["oferta"]);
  });

  test("home publicada traz oferta, vídeo, FAQ e carrossel", async () => {
    const files = await exportSiteToStatic(site);
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain("sb-rv");
    expect(home).not.toContain("undefined");
    expect(home).not.toContain("Bloco desconhecido");
    expect(home).toContain("simLinkCode=04cfa7b5");
    expect(home).toContain("347");
    expect(home).toContain("SwviWI2C570");
    expect(home.match(/<details/g)).toHaveLength(6);
    expect(home).toContain('class="sb-cslider sb-rv-car"');
    expect(home).toContain('id="oferta"');
  });
});
