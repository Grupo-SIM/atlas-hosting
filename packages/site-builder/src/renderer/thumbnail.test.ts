import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { getTemplate, listTemplates } from "../templates/index.js";
import { SiteRenderer } from "./SiteRenderer.js";
import { thumbnailHash, thumbnailSite } from "./thumbnail.js";

describe("thumbnailSite", () => {
  test("mantém só a home, o cabeçalho e os primeiros blocos, sem mexer no original", () => {
    for (const meta of listTemplates()) {
      const site = getTemplate(meta.id)?.site;
      if (!site) throw new Error(meta.id);
      const before = JSON.stringify(site);
      const thumb = thumbnailSite(site);
      expect(JSON.stringify(site), meta.id).toBe(before);
      expect(thumb.header, meta.id).toEqual(site.header);
      expect(thumb.footer, meta.id).toEqual([]);
      const home = site.pages.find(p => p.slug === "");
      if (home) {
        expect(thumb.pages, meta.id).toHaveLength(1);
        expect(thumb.pages[0]?.blocks, meta.id).toEqual(
          home.blocks.slice(0, 4)
        );
      }
    }
  });

  test("site sem página inicial fica como está", () => {
    const site = getTemplate(listTemplates()[0]?.id ?? "")?.site;
    if (!site) throw new Error("sem template");
    const noHome = { ...site, pages: site.pages.filter(p => p.slug !== "") };
    expect(thumbnailSite(noHome)).toBe(noHome);
  });
});

describe("CSS das miniaturas", () => {
  const render = async (sites: ReturnType<typeof thumbnailSite>[]) => {
    const { prelude } = await prerender(
      createElement(
        "div",
        null,
        ...sites.map((site, i) =>
          createElement(SiteRenderer, {
            key: i,
            path: "/",
            site,
            skipFxRuntime: true,
            thumbnail: true,
          })
        )
      )
    );
    return new Response(prelude).text();
  };
  const cssBytes = (html: string) =>
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].reduce(
      (n, m) => n + (m[1]?.length ?? 0),
      0
    );

  test("o CSS base e o da variante saem uma vez só, mesmo com várias miniaturas", async () => {
    const site = getTemplate("margem")?.site;
    if (!site) throw new Error("sem template");
    const one = await render([thumbnailSite(site)]);
    const five = await render(
      Array.from({ length: 5 }, () => thumbnailSite(site))
    );
    expect(cssBytes(five)).toBe(cssBytes(one));
    expect(five.match(/<div class="sb /g)?.length).toBe(5);
  });

  test("duas variantes diferentes dividem o CSS base", async () => {
    const a = getTemplate("margem")?.site;
    const b = getTemplate("universo-lucas-acre")?.site;
    if (!(a && b)) throw new Error("sem template");
    const both = await render([thumbnailSite(a), thumbnailSite(b)]);
    const sep =
      cssBytes(await render([thumbnailSite(a)])) +
      cssBytes(await render([thumbnailSite(b)]));
    expect(cssBytes(both)).toBeLessThan(sep - 40_000);
  });

  test("fora da miniatura o site publicado continua com o <style> próprio", async () => {
    const site = getTemplate("margem")?.site;
    if (!site) throw new Error("sem template");
    const { prelude } = await prerender(
      createElement(SiteRenderer, { path: "/", site, skipFxRuntime: true })
    );
    const html = await new Response(prelude).text();
    expect(html).not.toContain('precedence="sb"');
    expect(html).toContain("<style>");
  });
});

describe("thumbnailHash", () => {
  test("muda quando o que a miniatura mostra muda e é estável quando não muda", () => {
    const site = getTemplate("margem")?.site;
    if (!site) throw new Error("sem template");
    const same = thumbnailHash(structuredClone(site));
    expect(same).toBe(thumbnailHash(site));
    const changed = structuredClone(site);
    changed.theme.bg = "#123456";
    expect(thumbnailHash(changed)).not.toBe(same);
  });

  test("o que a miniatura não mostra (rodapé, blocos do fim) não muda o hash", () => {
    const site = getTemplate("margem")?.site;
    if (!site) throw new Error("sem template");
    const other = structuredClone(site);
    other.footer = [];
    expect(thumbnailHash(other)).toBe(thumbnailHash(site));
  });
});
