import { describe, expect, test } from "bun:test";
import { getTemplate } from "../templates/index.js";
import { diffSites } from "./diff.js";

const site = () => {
  const s = getTemplate("margem")?.site;
  if (!s) throw new Error("sem template");
  return s;
};

describe("diffSites", () => {
  test("sites iguais não têm mudanças", () => {
    expect(diffSites(site(), site())).toEqual([]);
  });

  test("nome, tema e menu", () => {
    const after = site();
    after.name = "Novo nome";
    after.theme.accent = "#ff0000";
    after.menu = [{ href: "/x", label: "X" }];
    const text = diffSites(site(), after).map(c => `${c.area}: ${c.text}`);
    expect(text.some(t => t.startsWith("Site: Nome"))).toBe(true);
    expect(text.some(t => t.startsWith("Tema:"))).toBe(true);
    expect(text).toContain("Menu: Itens do menu alterados");
  });

  test("bloco alterado, adicionado e removido numa página", () => {
    const before = site();
    const after = site();
    const page = after.pages[0];
    if (!page) throw new Error("sem página");
    const first = page.blocks[0];
    if (!first) throw new Error("sem bloco");
    first.props = { ...first.props, title: "Título mudou" };
    const removed = page.blocks.pop();
    page.blocks.push({ id: "novo-1", props: {}, type: "spacer" });
    const changes = diffSites(before, after);
    const area = `Página: ${page.title}`;
    expect(
      changes.filter(c => c.area === area && c.type === "changed").length
    ).toBeGreaterThan(0);
    expect(changes.some(c => c.area === area && c.type === "added")).toBe(true);
    if (removed) {
      expect(changes.some(c => c.area === area && c.type === "removed")).toBe(
        true
      );
    }
  });

  test("página criada e removida", () => {
    const after = site();
    const gone = after.pages.pop();
    after.pages.push({
      blocks: [],
      id: "p-nova",
      slug: "nova",
      status: "published",
      title: "Nova",
    });
    const changes = diffSites(site(), after);
    expect(changes).toContainEqual({
      area: "Página: Nova",
      text: "Página criada",
      type: "added",
    });
    if (gone) {
      expect(changes).toContainEqual({
        area: `Página: ${gone.title}`,
        text: "Página removida",
        type: "removed",
      });
    }
  });

  test("bloco oculto aparece como mudança", () => {
    const after = site();
    const block = after.pages[0]?.blocks[0];
    if (!block) throw new Error("sem bloco");
    block.hidden = true;
    expect(
      diffSites(site(), after).some(c => c.text.includes("ocultado"))
    ).toBe(true);
  });
});
