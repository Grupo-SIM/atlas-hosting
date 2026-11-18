import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import type { Site } from "../model/index.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { getTemplate } from "../templates/index.js";

const render = async (types: string[], props: Record<string, unknown> = {}) => {
  const site: Site = structuredClone(getTemplate("blog-viagens")?.site as Site);
  const home = site.pages.find(p => p.slug === "");
  for (const [i, type] of types.entries())
    home?.blocks.push({ id: `forma-${i}`, props, type });
  const { prelude } = await prerender(
    createElement(SiteRenderer, { path: "/", site, skipFxRuntime: true })
  );
  return (await new Response(prelude).text()).replace(
    /<style[\s\S]*?<\/style>/g,
    ""
  );
};

describe("formas", () => {
  test("linha, retângulo, quadrado e círculo", async () => {
    const out = await render([
      "shapeLine",
      "shapeRect",
      "shapeSquare",
      "shapeCircle",
    ]);
    expect(out).toContain('class="sb-fig sb-fig-line"');
    expect(out).toContain('class="sb-fig sb-fig-rect"');
    // As de lados iguais levam a classe extra, separada por espaço (já houve bug de classes coladas).
    expect(out).toContain('class="sb-fig sb-fig-square sb-fig-eq"');
    expect(out).toContain('class="sb-fig sb-fig-circle sb-fig-eq"');
  });

  test("alinhamento vira justify-content", async () => {
    expect(await render(["shapeRect"], { align: "right" })).toContain(
      "justify-content:flex-end"
    );
    expect(await render(["shapeRect"], { align: "center" })).toContain(
      "justify-content:center"
    );
  });

  test("não usa a classe das divisórias em onda (sb-shape)", async () => {
    expect(await render(["shapeRect"])).not.toContain('class="sb-shape');
  });

  test("todas as formas de lados iguais têm as três classes separadas", async () => {
    for (const [type, kind] of [
      ["shapeTriangle", "triangle"],
      ["shapeDiamond", "diamond"],
      ["shapePentagon", "pentagon"],
      ["shapeHexagon", "hexagon"],
      ["shapeStar", "star"],
      ["shapeArrow", "arrow"],
      ["shapeCross", "cross"],
    ] as const) {
      expect(await render([type])).toContain(
        `class="sb-fig sb-fig-${kind} sb-fig-eq"`
      );
    }
  });
});
