import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../../blocks/registry.js";
import type { Block } from "../../model/index.js";
import { siteSchema } from "../../model/schema.js";
import { exportSiteToStatic } from "../../static/exportStatic.js";
import { getTemplate, listTemplates } from "../index.js";

const template = getTemplate("controle-motorista");
if (!template) throw new Error("template controle-motorista não registrado");
const { site } = template;
const blocks = [
  ...site.header,
  ...site.footer,
  ...site.pages.flatMap(p => p.blocks),
];

describe("template controle-motorista", () => {
  test("aparece na lista e passa no schema", () => {
    expect(listTemplates().map(t => t.id)).toContain("controle-motorista");
    expect(siteSchema.safeParse(site).success).toBe(true);
  });

  test("props de todos os blocos passam no schema do bloco", () => {
    for (const b of blocks) {
      const def = getBlockDefinition(b.type);
      expect(def).toBeDefined();
      expect(def?.schema.safeParse(b.props).success).toBe(true);
    }
  });

  test("ids de bloco únicos", () => {
    const ids: string[] = [];
    const walk = (list: Block[]) => {
      for (const b of list) {
        ids.push(b.id);
        walk(b.children ?? []);
      }
    };
    walk(blocks);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("HTML publicado mantém âncoras, links e conteúdo do original", async () => {
    const files = await exportSiteToStatic(site);
    const html = JSON.stringify(files);
    expect(html).toContain("sb-cm");
    expect(html).toContain('id=\\"d1\\"');
    expect(html).toContain('id=\\"d2\\"');
    expect(html).toContain('href=\\"#d1\\"');
    expect(html).toContain('href=\\"#d2\\"');
    expect(html).toContain("admin-motorista.simintermediacoes.com");
    expect(html).toContain("cliente-motorista.simintermediacoes.com");
    expect(html).toContain(
      "subscriptionLinkCode=46d8729c-af0e-4e5f-933e-f9ca4bf3c1ce"
    );
    expect(html).toContain(
      "subscriptionLinkCode=16eaf12e-7e03-4ab4-879b-00d7d13ecfa7"
    );
    expect(html).toContain("player.vimeo.com/video/1094638845");
    expect(html).toContain("Popular");
    expect(html).toContain(">69<");
    expect(html).toContain(">419<");
    expect(html).toContain("data-sb-top");
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("Bloco desconhecido");
    // erros de digitação do original corrigidos
    for (const typo of [
      "garagalos",
      "horario",
      "juntamente como",
      "se comportamento",
      "está os gargalos",
    ])
      expect(html).not.toContain(typo);
  }, 60_000);

  test("home tem 8 imagens no carrossel, 4 depoimentos e 6 perguntas", async () => {
    const files = await exportSiteToStatic(site);
    const html = files.find(f => f.path === "index.html")?.content ?? "";
    expect(html.match(/class="cm-slide"/g)?.length).toBe(8);
    expect(html.match(/class="cm-t-card"/g)?.length).toBe(4);
    expect(html.match(/class="cm-faq-item"/g)?.length).toBe(6);
    expect(html.match(/class="cm-dot( on)?"/g)?.length).toBe(8);
    expect(html.match(/class="cm-plan"/g)?.length).toBe(2);
  }, 60_000);

  test("efeitos do template usam caminhos válidos e os dois efeitos novos", () => {
    const fxs = blocks.flatMap(b => Object.values(b.fx ?? {}));
    expect(fxs.some(f => f.enter === "slideInUp")).toBe(true);
    expect(fxs.some(f => f.hover === "hang")).toBe(true);
  });
});
