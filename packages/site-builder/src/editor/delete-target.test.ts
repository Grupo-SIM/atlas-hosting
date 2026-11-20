import { describe, expect, test } from "bun:test";
import { deleteTargetFor } from "./delete-target.js";

const socials = {
  itemFields: [{ key: "url", kind: "url", label: "Link" }],
  key: "socials",
  kind: "list",
  label: "Redes",
} as never;
const title = { key: "title", kind: "text", label: "Título" } as never;

const run = (over: Partial<Parameters<typeof deleteTargetFor>[0]>) =>
  deleteTargetFor({
    elPath: "1.2",
    listLength: () => 4,
    matches: [],
    position: 1,
    siblings: 4,
    ...over,
  });

describe("deleteTargetFor", () => {
  test("sem elemento selecionado: o bloco inteiro", () => {
    expect(run({ elPath: "" })).toEqual({ kind: "block" });
  });

  test("item inteiro de uma lista (ícone de rede social): sai da lista", () => {
    expect(
      run({ matches: [{ field: socials, index: 1, kind: "item" }] })
    ).toEqual({ index: 1, key: "socials", kind: "listItem" });
  });

  test("trecho de dentro do item (irmãos não batem com a lista): só ele some", () => {
    expect(
      run({
        matches: [{ field: socials, index: 1, kind: "item" }],
        siblings: 2,
      })
    ).toEqual({ kind: "hide", path: "1.2" });
    expect(
      run({
        matches: [{ field: socials, index: 1, kind: "item" }],
        position: 3,
      })
    ).toEqual({ kind: "hide", path: "1.2" });
  });

  test("título, texto ou imagem do bloco: só ele some, o bloco fica", () => {
    expect(run({ matches: [{ field: title, kind: "field" }] })).toEqual({
      kind: "hide",
      path: "1.2",
    });
    expect(run({ matches: [] })).toEqual({ kind: "hide", path: "1.2" });
  });

  test("dúvida entre dois itens: não apaga item de lista, só oculta o elemento", () => {
    expect(
      run({
        matches: [
          { field: socials, index: 1, kind: "item" },
          { field: socials, index: 2, kind: "item" },
        ],
      })
    ).toEqual({ kind: "hide", path: "1.2" });
  });
});
