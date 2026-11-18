import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import type { Site } from "../model/index.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { getTemplate } from "../templates/index.js";

const render = async (props: Record<string, string>) => {
  const site: Site = structuredClone(getTemplate("blog-viagens")?.site as Site);
  const home = site.pages.find(p => p.slug === "");
  home?.blocks.push({ id: "post-x", props, type: "postItem" });
  const { prelude } = await prerender(
    createElement(SiteRenderer, { path: "/", site, skipFxRuntime: true })
  );
  const html = (await new Response(prelude).text()).replace(
    /<style[\s\S]*?<\/style>/g,
    ""
  );
  return html.slice(html.indexOf('data-block-id="post-x"') - 10);
};

describe("bloco Post", () => {
  test("título, imagem e descrição", async () => {
    const out = await render({
      description: "Primeiro parágrafo.\n\nSegundo.",
      media: "https://exemplo.com/foto.jpg",
      title: "Meu post",
    });
    expect(out).toContain("<h2>Meu post</h2>");
    expect(out).toContain('src="https://exemplo.com/foto.jpg"');
    expect(out).toContain("<p>Primeiro parágrafo.</p>");
    expect(out).toContain("<p>Segundo.</p>");
  });

  test("vídeo de arquivo toca e link do YouTube vira player", async () => {
    expect(await render({ media: "https://exemplo.com/v.mp4" })).toMatch(
      /<video[^>]*src="https:\/\/exemplo\.com\/v\.mp4"/
    );
    expect(
      await render({ media: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
    ).toContain("youtube");
  });

  test("somente a mídia: sem título nem descrição", async () => {
    const out = await render({ media: "https://exemplo.com/foto.jpg" });
    expect(out).not.toContain("<h2>");
    expect(out).not.toContain("sb-text");
  });
});
