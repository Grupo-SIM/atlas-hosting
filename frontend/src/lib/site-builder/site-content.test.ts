import { describe, expect, test } from "bun:test";
import { getTemplate } from "@repo/site-builder";
import { checkSiteContent } from "./site-content";

const portal = () => {
  const site = getTemplate("portal-noticias")?.site;
  if (!site) throw new Error("template de teste não existe");
  return structuredClone(site);
};

describe("checkSiteContent", () => {
  test("site válido: grava sem aviso", () => {
    const res = checkSiteContent(portal());
    expect(res.ok).toBe(true);
    expect(res.ok && res.aviso).toBeUndefined();
  });

  test("estilo inválido no rodapé: salva o resto e avisa", () => {
    const site = portal();
    const footer = site.footer[0];
    if (!footer) throw new Error("sem rodapé");
    footer.style = { background: "#111", margin: "0 0 24px;" };
    const res = checkSiteContent(site);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.site.footer[0]?.style).toEqual({ background: "#111" });
    expect(res.aviso).toContain("estilo inválido");
  });

  test("conteúdo que não dá para consertar: diz onde", () => {
    const res = checkSiteContent({
      ...portal(),
      pages: [{ blocks: [], id: 1 }],
    });
    expect(res.ok).toBe(false);
    expect(!res.ok && res.error).toContain("página 1");
  });

  test("lixo: recusa sem quebrar", () => {
    expect(checkSiteContent(null).ok).toBe(false);
    expect(checkSiteContent("x").ok).toBe(false);
  });
});
