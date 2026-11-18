import { describe, expect, test } from "bun:test";
import { inlineTarget, inlineTextPatch } from "./inline-text.js";

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

describe("inlineTarget — texto que vem do site, não do bloco", () => {
  const site = {
    categories: [{ id: "c1", name: "Economia", slug: "economia" }],
    menu: [
      { href: "/", label: "Início" },
      { children: [{ href: "/x", label: "Sub" }], href: "/a", label: "Área" },
    ],
    posts: [
      {
        excerpt: "Resumo do post",
        id: "p1",
        slug: "pacote",
        title: "Pacote de incentivos",
      },
    ],
  } as never;
  const run = (hint: Record<string, unknown>, oldText: string) =>
    inlineTarget({
      defaults: {},
      fields: [],
      hint: { n: 1, value: oldText, ...hint },
      newText: "Novo",
      oldText,
      props: {},
      site,
    });

  test("título do post vem do link do card", () => {
    expect(run({ href: "/pacote/" }, "Pacote de incentivos")).toEqual({
      id: "p1",
      kind: "post",
      patch: { title: "Novo" },
      what: "Título",
    });
  });

  test("resumo do post", () => {
    expect(run({ href: "/pacote/" }, "Resumo do post")).toMatchObject({
      patch: { excerpt: "Novo" },
    });
  });

  test("item e subitem do menu", () => {
    const a = run({}, "Início");
    expect(a?.kind === "menu" && a.menu[0]?.label).toBe("Novo");
    const b = run({}, "Sub");
    expect(b?.kind === "menu" && b.menu[1]?.children?.[0]?.label).toBe("Novo");
  });

  test("texto que o site não guarda não é editado", () => {
    expect(run({}, "Qualquer coisa")).toBe(null);
  });
});
