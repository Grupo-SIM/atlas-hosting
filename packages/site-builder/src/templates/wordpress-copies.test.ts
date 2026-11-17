import { describe, expect, test } from "bun:test";
import {
  getTemplate,
  isWordpressTemplate,
  listTemplates,
  listWordpressTemplates,
  peekTemplate,
  wordpressSourceId,
} from "./index.js";

describe("cópias para sites importados do WordPress", () => {
  const originals = listTemplates();
  const copies = listWordpressTemplates();

  test("existe uma cópia para cada template, com id wp-<original>", () => {
    expect(copies.map(c => c.id)).toEqual(originals.map(o => `wp-${o.id}`));
    for (const c of copies) {
      expect(isWordpressTemplate(c.id)).toBe(true);
      expect(c.tags).toContain("WordPress");
      expect(c.name.endsWith("(WordPress)")).toBe(true);
    }
  });

  test("a lista pública não mostra as cópias", () => {
    expect(originals.some(o => isWordpressTemplate(o.id))).toBe(false);
    expect(originals.some(o => o.tags.includes("WordPress"))).toBe(false);
  });

  test("cada cópia resolve e tem o mesmo conteúdo do original", () => {
    for (const o of originals) {
      const copy = getTemplate(`wp-${o.id}`);
      const base = getTemplate(o.id);
      expect(copy?.site).toEqual(base?.site);
      expect(wordpressSourceId(`wp-${o.id}`)).toBe(o.id);
    }
  });

  test("getTemplate devolve cópia profunda: mexer na cópia não altera o original", () => {
    const id = originals[0]?.id as string;
    const copy = getTemplate(`wp-${id}`);
    if (!copy) throw new Error("sem cópia");
    copy.site.name = "alterado";
    expect(peekTemplate(id)?.site.name).not.toBe("alterado");
    expect(peekTemplate(`wp-${id}`)?.site.name).not.toBe("alterado");
  });
});
