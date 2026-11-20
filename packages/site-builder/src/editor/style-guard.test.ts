import { describe, expect, test } from "bun:test";
import { siteSchema } from "../model/schema.js";
import { getTemplate } from "../templates/index.js";
import { updateBlockFx, updateBlockStyle, updateElementStyle } from "./tree.js";

const portal = () => {
  const site = getTemplate("portal-noticias")?.site;
  if (!site) throw new Error("template de teste não existe");
  return structuredClone(site);
};

describe("o editor não deixa entrar o que o servidor recusaria", () => {
  test("estilo do bloco: valor com `;`, NaN e propriedade fora da lista ficam de fora", () => {
    const site = portal();
    const id = site.footer[0]?.id ?? "";
    const next = updateBlockStyle(site, id, {
      background: "#123456",
      fontSize: Number.NaN,
      foo: "bar",
      margin: "0 0 24px;",
    });
    expect(next.footer[0]?.style).toEqual({ background: "#123456" });
    expect(siteSchema.safeParse(next).success).toBe(true);
  });

  test("estilo de elemento: o mesmo, e caminho fundo demais não é aplicado", () => {
    const site = portal();
    const id = site.footer[0]?.id ?? "";
    const next = updateElementStyle(site, id, "1.2", {
      color: "red",
      padding: "{x}",
    });
    expect(next.footer[0]?.elStyles).toEqual({ "1.2": { color: "red" } });
    const deep = Array.from({ length: 14 }, () => "1").join(".");
    expect(updateElementStyle(site, id, deep, { color: "red" })).toBe(site);
    expect(updateBlockFx(site, id, deep, { hover: "grow" })).toBe(site);
    expect(siteSchema.safeParse(next).success).toBe(true);
  });
});
