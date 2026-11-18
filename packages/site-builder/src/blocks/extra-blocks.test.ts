import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import type { Site } from "../model/index.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { getTemplate } from "../templates/index.js";
import { getBlockDefinition } from "./registry.js";

const render = async (type: string, props: Record<string, unknown> = {}) => {
  const site: Site = structuredClone(getTemplate("blog-viagens")?.site as Site);
  site.pages
    .find(p => p.slug === "")
    ?.blocks.push({ id: "extra-x", props, type });
  const { prelude } = await prerender(
    createElement(SiteRenderer, { path: "/", site, skipFxRuntime: true })
  );
  const html = (await new Response(prelude).text()).replace(
    /<style[\s\S]*?<\/style>/g,
    ""
  );
  return html.slice(html.indexOf('data-block-id="extra-x"'));
};

const TYPES = [
  "shapeTriangle",
  "shapeDiamond",
  "shapePentagon",
  "shapeHexagon",
  "shapeStar",
  "shapeArrow",
  "shapeCross",
  "badge",
  "divider",
  "progress",
  "iconBlock",
  "marquee",
  "barChart",
  "donutChart",
  "lineChart",
  "table",
  "mockup",
  "mediaFrame",
];

describe("blocos extras", () => {
  test("todos estão registrados e renderizam com os valores padrão", async () => {
    for (const type of TYPES) {
      expect(getBlockDefinition(type)).toBeDefined();
      expect((await render(type)).length).toBeGreaterThan(40);
    }
  });

  test("gráfico de barras: uma barra por item, com a altura proporcional", async () => {
    const out = await render("barChart", {
      items: [
        { color: "#ff0000", label: "A", value: 50 },
        { label: "B", value: 100 },
      ],
    });
    expect(out).toContain("height:50%");
    expect(out).toContain("height:100%");
    expect(out).toContain("background:#ff0000");
  });

  test("pizza mostra a % de cada fatia na legenda", async () => {
    const out = await render("donutChart", {
      items: [
        { label: "X", value: 1 },
        { label: "Y", value: 3 },
      ],
    });
    expect(out).toContain("25%");
    expect(out).toContain("75%");
  });

  test("tabela: cabeçalho e linhas vindos do texto colado", async () => {
    const out = await render("table", { data: "Nome\tIdade\nAna\t30" });
    expect(out).toContain("<th>Nome</th>");
    expect(out).toContain("<td>Ana</td>");
  });

  test("mockup do navegador mostra a barra com o endereço; notebook tem a base", async () => {
    expect(
      await render("mockup", { device: "browser", url: "loja.com" })
    ).toContain("loja.com");
    expect(await render("mockup", { device: "laptop" })).toContain(
      "sb-dev-base"
    );
  });

  test("ícone desconhecido cai na estrela; selo mostra o texto", async () => {
    expect(await render("iconBlock", { icon: "nao-existe" })).toContain(
      "<path"
    );
    expect(await render("badge", { text: "-30%" })).toContain("-30%");
  });
});
