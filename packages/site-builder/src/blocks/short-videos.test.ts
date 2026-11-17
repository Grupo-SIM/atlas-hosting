import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import type { Block, Site } from "../model/index.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { getTemplate } from "../templates/index.js";

const findShorts = (blocks: Block[]): Block | undefined => {
  for (const b of blocks) {
    if (b.type === "shortVideos") return b;
    const inner = findShorts(b.children ?? []);
    if (inner) return inner;
  }
  return undefined;
};

const render = async (items: Record<string, string>[]) => {
  const site: Site = structuredClone(
    getTemplate("portal-noticias")?.site as Site
  );
  const block = findShorts(site.pages.flatMap(p => p.blocks));
  if (!block) throw new Error("sem vídeos curtos");
  block.props.items = items;
  const { prelude } = await prerender(
    createElement(SiteRenderer, { path: "/", site, skipFxRuntime: true })
  );
  const text = await new Response(prelude).text();
  // Só o HTML: o CSS também cita as classes.
  return text.replace(/<style[\s\S]*?<\/style>/g, "");
};

describe("vídeos curtos", () => {
  test("arquivo de vídeo toca no cartão (mudo, em loop) e a imagem vira a capa", async () => {
    const out = await render([
      {
        duration: "10 seg",
        image: "https://exemplo.com/capa.jpg",
        title: "Com vídeo",
        url: "/",
        video: "https://exemplo.com/corte.mp4",
      },
    ]);
    expect(out).toMatch(/<video[^>]*src="https:\/\/exemplo\.com\/corte\.mp4"/);
    expect(out).toContain('poster="https://exemplo.com/capa.jpg"');
    expect(out).toContain('data-reel="https://exemplo.com/corte.mp4"');
    expect(out).not.toContain("sb-short-play");
  });

  test("sem arquivo, a imagem é a capa e não há <video>", async () => {
    const out = await render([
      {
        duration: "10 seg",
        image: "https://exemplo.com/capa.jpg",
        title: "Só imagem",
        url: "/",
        video: "",
      },
    ]);
    expect(out).not.toMatch(/<video/);
    expect(out).toContain("sb-short-play");
  });

  test("vídeo com esquema que não é http(s) não vira <video>", async () => {
    const out = await render([
      {
        duration: "1 min",
        image: "",
        title: "Ruim",
        url: "/",
        video: "javascript:alert(1)//x.mp4",
      },
    ]);
    expect(out).not.toMatch(/<video/);
  });
});
