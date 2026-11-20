import { describe, expect, test } from "bun:test";
import { getTemplate, listTemplates } from "../templates/index.js";
import { describeSiteIssue, repairSite } from "./repair.js";
import { siteSchema } from "./schema.js";

const base = () => {
  const site = getTemplate("portal-noticias")?.site;
  if (!site) throw new Error("template de teste não existe");
  return structuredClone(site);
};

describe("repairSite", () => {
  test("site válido passa igual, sem avisos", () => {
    for (const meta of listTemplates()) {
      const site = getTemplate(meta.id)?.site;
      const { content, fixes } = repairSite(site);
      expect(fixes).toEqual([]);
      expect(content).toEqual(JSON.parse(JSON.stringify(site)));
    }
  });

  test("um estilo inválido no rodapé não derruba o site: some só ele", () => {
    const site = base();
    const footer = site.footer[0];
    if (!footer) throw new Error("sem rodapé");
    footer.style = { background: "#fff", padding: "10px;" };
    footer.elStyles = {
      "1.2": { color: "red", fontSize: Number.NaN },
      "não-é-caminho": { color: "blue" },
    };
    expect(siteSchema.safeParse(site).success).toBe(false);

    const { content, fixes } = repairSite(site);
    expect(siteSchema.safeParse(content).success).toBe(true);
    const fixed = (content as typeof site).footer[0];
    expect(fixed?.style).toEqual({ background: "#fff" });
    expect(fixed?.elStyles).toEqual({ "1.2": { color: "red" } });
    expect(fixes.join(" ")).toContain("estilo inválido");
  });

  test("propriedade fora da lista, valor gigante e âncora com espaço", () => {
    const site = base();
    const block = site.pages[0]?.blocks[0];
    if (!block) throw new Error("sem bloco");
    block.style = {
      background: `linear-gradient(${"#fff,".repeat(200)}#000)`,
      color: "#000",
      foo: "bar",
    } as never;
    block.anchor = "minha seção";
    const { content } = repairSite(site);
    expect(siteSchema.safeParse(content).success).toBe(true);
    const b = (content as typeof site).pages[0]?.blocks[0];
    expect(b?.style).toEqual({ color: "#000" });
    expect(b?.anchor).toBeUndefined();
  });

  test("títulos vazios, slug com acento e tema com número", () => {
    const site = base();
    const page = site.pages[1];
    if (!page) throw new Error("sem página");
    page.title = "  ";
    page.slug = "Política Nacional";
    site.name = "";
    site.theme = { ...site.theme, adsSide: 2 as never };
    const { content, fixes } = repairSite(site);
    expect(siteSchema.safeParse(content).success).toBe(true);
    const out = content as typeof site;
    expect(out.pages[1]?.title).toBe("Sem título");
    expect(out.pages[1]?.slug).toBe("politica-nacional");
    expect(out.name).toBe("Meu site");
    expect(out.theme.adsSide).toBe("2");
    expect(fixes.length).toBeGreaterThan(0);
  });

  test("efeito com valor fora da faixa é descartado", () => {
    const site = base();
    const block = site.pages[0]?.blocks[0];
    if (!block) throw new Error("sem bloco");
    block.fx = { "": { enter: "fadeUp", enterMs: 99_999 } as never };
    const { content } = repairSite(site);
    expect(siteSchema.safeParse(content).success).toBe(true);
  });

  test("não altera o objeto recebido", () => {
    const site = base();
    const block = site.pages[0]?.blocks[0];
    if (!block) throw new Error("sem bloco");
    block.style = { padding: "1px;" };
    repairSite(site);
    expect(block.style).toEqual({ padding: "1px;" });
  });
});

test("conteúdo sem forma de site não vira um site vazio", () => {
  for (const lixo of [
    { lixo: true },
    { name: "x", pages: [] },
    null,
    "x",
    [],
  ]) {
    const { content, fixes } = repairSite(lixo);
    expect(content).toEqual(lixo);
    expect(fixes).toEqual([]);
    expect(siteSchema.safeParse(content).success).toBe(false);
  }
});

describe("describeSiteIssue", () => {
  test("caminho do erro em português", () => {
    expect(describeSiteIssue(["pages", 2, "blocks", 0, "style"])).toBe(
      "página 3 → bloco 1 → estilo"
    );
    expect(describeSiteIssue(["footer", 0, "elStyles"])).toBe(
      "rodapé 1 → estilo"
    );
    expect(describeSiteIssue([])).toBe("conteúdo");
  });
});
