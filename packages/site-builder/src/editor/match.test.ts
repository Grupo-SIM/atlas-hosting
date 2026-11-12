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

describe("matchItem — texto com marcação e listas dentro de itens", () => {
  const fields = [
    { key: "text", kind: "textarea", label: "Texto" },
    {
      itemFields: [
        { key: "name", kind: "text", label: "Nome" },
        {
          itemFields: [{ key: "label", kind: "text", label: "Opção" }],
          key: "options",
          kind: "list",
          label: "Opções",
        },
      ],
      key: "cards",
      kind: "list",
      label: "Cartões",
    },
  ] as never;

  test("acha o campo mesmo com **negrito** e [link](url) no valor", () => {
    const m = matchItem(
      fields,
      { text: "Veja o **guia** e o [manual](https://x.com) agora" },
      {},
      { n: 1, value: "Veja o guia e o manual agora" }
    );
    expect(m.map(x => x.field.key)).toEqual(["text"]);
  });

  test("texto de uma opção dentro de um cartão abre o cartão", () => {
    const m = matchItem(
      fields,
      {
        cards: [
          { name: "A", options: [] },
          { name: "B", options: [{ label: "PAGO" }] },
        ],
      },
      {},
      { n: 1, value: "PAGO" }
    );
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({ index: 1, kind: "item" });
  });
});
