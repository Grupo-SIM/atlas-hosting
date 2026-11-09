import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("controle-patrimonial");
if (!template) throw new Error("template controle-patrimonial não registrado");
const { site } = template;
const blocks = [
  ...site.header,
  ...site.footer,
  ...site.pages.flatMap(p => p.blocks),
];

describe("template controle-patrimonial", () => {
  test("aparece na lista e passa no schema", () => {
    expect(listTemplates().map(t => t.id)).toContain("controle-patrimonial");
    expect(siteSchema.safeParse(site).success).toBe(true);
  });

  test("props de todos os blocos passam no schema do bloco", () => {
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def).toBeDefined();
      expect(def?.schema.safeParse(b.props).success).toBe(true);
    }
  });

  test("âncoras e links do original se mantêm no HTML publicado", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    expect(html).toContain('id=\\"d1\\"');
    expect(html).toContain('id=\\"d3\\"');
    expect(html).toContain('href=\\"#d1\\"');
    expect(html).toContain('href=\\"#d3\\"');
    expect(html).toContain("saas-patrimonial-front.simintermediacoes.com");
    expect(html).toContain("player.vimeo.com/video/1094636625");
    expect(html).not.toContain("moonify");
  }, 60_000);
});
