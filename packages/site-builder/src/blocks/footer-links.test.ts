import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { matchItem } from "../editor/Inspector.js";
import type { Block, Site } from "../model/index.js";
import { SiteRenderer } from "../renderer/SiteRenderer.js";
import { getTemplate } from "../templates/index.js";
import { getBlockDefinition } from "./registry.js";

const portal = () => {
  const site = getTemplate("portal-noticias")?.site;
  if (!site) throw new Error("sem template");
  return site;
};

const footerOf = (site: Site): Block => {
  const f = site.footer.find(b => b.type === "footer");
  if (!f) throw new Error("sem rodapé");
  return f;
};

const html = async (site: Site) => {
  const { prelude } = await prerender(
    createElement(SiteRenderer, { path: "/", site, skipFxRuntime: true })
  );
  return new Response(prelude).text();
};

describe("links do rodapé", () => {
  test("sem personalizar, a coluna do menu usa o menu do site", async () => {
    const site = portal();
    const out = await html(site);
    for (const m of site.menu) expect(out).toContain(`>${m.label}</a>`);
  });

  test("menuLinks troca só o rodapé: o endereço novo aparece e o cabeçalho continua com o menu", async () => {
    const site = portal();
    footerOf(site).props.menuLinks = [
      { label: "Fale com a redação", url: "https://exemplo.com/contato" },
    ];
    const out = await html(site);
    const footer = out.slice(out.indexOf("<footer"));
    expect(footer).toContain('href="https://exemplo.com/contato"');
    expect(footer).toContain('target="_blank"');
    expect(footer).toContain("Fale com a redação");
    // O menu do site (que o cabeçalho usa) não mudou.
    const header = out.slice(0, out.indexOf("<footer"));
    for (const m of site.menu) expect(header).toContain(m.label);
  });

  test("legalLinks substitui Termos de Uso e Política de Privacidade", async () => {
    const site = portal();
    footerOf(site).props.legalLinks = [
      { label: "Privacidade", url: "https://exemplo.com/privacidade" },
    ];
    const out = await html(site);
    const footer = out.slice(out.indexOf("<footer"));
    expect(footer).toContain('href="https://exemplo.com/privacidade"');
    expect(footer).not.toContain("Termos de Uso");
  });
});

describe("clicar num link do rodapé personalizado", () => {
  const def = getBlockDefinition("footer");
  if (!def) throw new Error("footer não registrado");

  test("abre o item da lista (nome e endereço) daquele link", () => {
    const props = {
      menuLinks: [
        { label: "Início", url: "/" },
        { label: "Economia", url: "/category/economia/" },
      ],
    };
    const hits = matchItem(def.fields, props, def.defaults, {
      n: 1,
      value: "Economia",
    }).map(m =>
      m.kind === "item" ? `${m.field.key}#${m.index}` : m.field.key
    );
    expect(hits).toEqual(["menuLinks#1"]);
  });
});
