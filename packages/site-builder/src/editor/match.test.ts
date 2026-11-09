import { describe, expect, test } from "bun:test";
import { getBlockDefinition } from "../blocks/registry.js";
import { matchItem } from "./Inspector.js";

describe("matchItem — campos relacionados", () => {
  const def = getBlockDefinition("mkHero");
  if (!def) throw new Error("mkHero não registrado");
  const keys = (props: Record<string, unknown>, value: string) =>
    matchItem(def.fields, props, def.defaults, { n: 1, value }).map(
      m => m.field.key
    );

  test("clicar na foto do hero abre também a foto do hover (mesmo vazia)", () => {
    expect(keys({ image: "/a.jpg", imageHover: "" }, "/a.jpg")).toEqual([
      "image",
      "imageHover",
    ]);
  });

  test("clicar na foto do hover abre as duas, na ordem do painel", () => {
    expect(keys({ image: "/a.jpg", imageHover: "/b.jpg" }, "/b.jpg")).toEqual([
      "image",
      "imageHover",
    ]);
  });

  test("clicar no título não puxa as fotos", () => {
    expect(keys({ image: "/a.jpg", title: "Olá mundo" }, "Olá mundo")).toEqual([
      "title",
    ]);
  });
});
