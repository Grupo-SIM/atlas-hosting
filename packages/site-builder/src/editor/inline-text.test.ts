import { describe, expect, test } from "bun:test";
import { inlineTextPatch } from "./inline-text.js";

const fields = [
  { key: "title", kind: "text", label: "Título" },
  { key: "body", kind: "textarea", label: "Texto" },
  { key: "image", kind: "image", label: "Imagem" },
  {
    itemFields: [
      { key: "name", kind: "text", label: "Nome" },
      { key: "role", kind: "text", label: "Cargo" },
    ],
    key: "team",
    kind: "list",
    label: "Equipe",
  },
] as never;

const patch = (
  props: Record<string, unknown>,
  oldText: string,
  newText: string,
  defaults: Record<string, unknown> = {}
) =>
  inlineTextPatch(
    fields,
    props,
    defaults,
    { n: 1, value: oldText },
    oldText,
    newText
  );

describe("inlineTextPatch", () => {
  test("grava o texto novo no campo que guarda o texto da tela", () => {
    expect(patch({ title: "Olá mundo" }, "Olá mundo", "Oi")).toEqual({
      title: "Oi",
    });
  });

  test("vale o texto padrão do bloco quando a prop ainda não foi editada", () => {
    expect(patch({}, "Padrão", "Novo", { title: "Padrão" })).toEqual({
      title: "Novo",
    });
  });

  test("troca só o campo do item da lista, sem tocar nos outros itens", () => {
    const team = [
      { name: "Ana", role: "CEO" },
      { name: "Beto", role: "CTO" },
    ];
    expect(patch({ team }, "Beto", "Bia")).toEqual({
      team: [
        { name: "Ana", role: "CEO" },
        { name: "Bia", role: "CTO" },
      ],
    });
  });

  test("texto com **negrito** não é editado no canvas (perderia a marcação)", () => {
    expect(
      patch({ body: "Veja o **guia** agora" }, "Veja o guia agora", "x")
    ).toBe(null);
  });

  test("campo com várias linhas não é editado no canvas", () => {
    expect(patch({ body: "linha 1\nlinha 2" }, "linha 1 linha 2", "x")).toBe(
      null
    );
  });

  test("o mesmo texto em dois campos é ambíguo", () => {
    expect(patch({ body: "Igual", title: "Igual" }, "Igual", "x")).toBe(null);
  });

  test("texto que nenhum campo guarda não é editado", () => {
    expect(patch({ title: "Outro" }, "Sumiu", "x")).toBe(null);
  });
});
