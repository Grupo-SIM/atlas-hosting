import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("areaflix");
if (!template) throw new Error("template areaflix não registrado");
const { site } = template;
const blocks = [...site.header, ...site.pages[0].blocks, ...site.footer];

describe("template areaflix", () => {
  test("aparece na tela de escolha", () => {
    expect(listTemplates().some(t => t.id === "areaflix")).toBe(true);
  });

  test("passa no siteSchema e nos schemas dos blocos", () => {
    expect(siteSchema.safeParse(site).success).toBe(true);
    for (const b of blocks) {
      expect(
        getBlockDefinition(b.type)?.schema.safeParse(b.props).success
      ).toBe(true);
    }
  });

  test("ids de bloco únicos e âncoras dos botões existem", () => {
    const ids = blocks.map(b => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(blocks.map(b => b.anchor).filter(Boolean)).toEqual(["d1", "d2"]);
  });

  test("home publicada traz planos, checkout, vídeo, FAQ e carrossel", async () => {
    const files = await exportSiteToStatic(site);
    const home = files.find(f => f.path === "index.html")?.content ?? "";
    expect(home).toContain("sb-af");
    expect(home).not.toContain("undefined");
    expect(home).not.toContain("Bloco desconhecido");
    expect(home.match(/subscriptionLinkCode=/g)).toHaveLength(6);
    expect(home).toContain("R$ 3.907,00");
    expect(home).toContain("https://player.vimeo.com/video/1095720867");
    expect(home.match(/<details/g)).toHaveLength(5);
    expect(home).toContain('class="sb-cslider sb-af-car"');
    expect(home).toContain('id="d2"');
  });
});
