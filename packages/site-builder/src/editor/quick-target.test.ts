import { describe, expect, test } from "bun:test";
import type { Site } from "../model/index.js";
import {
  applyMedia,
  type MediaTarget,
  mediaMode,
  mediaTarget,
} from "./quick-target.js";

const fields = [
  { key: "image", kind: "image", label: "Imagem" },
  { key: "video", kind: "media", label: "Vídeo" },
  {
    itemFields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "photo", kind: "image", label: "Foto" },
    ],
    key: "cards",
    kind: "list",
    label: "Cards",
  },
] as never;

const site = {
  categories: [],
  categoryLayout: [],
  footer: [],
  header: [],
  menu: [],
  pages: [
    {
      blocks: [{ id: "b1", props: {}, type: "x" }],
      id: "home",
      slug: "",
      title: "Início",
    },
  ],
  postLayout: [],
  posts: [],
} as unknown as Site;

const find = (props: Record<string, unknown>, value: string) =>
  mediaTarget({
    defaults: {},
    fields,
    hint: { n: 1, value },
    props,
    site,
  });

describe("mediaMode", () => {
  test("imagem, link de rede/YouTube e arquivo de vídeo", () => {
    expect(mediaMode("https://x.com/a.jpg")).toBe("image");
    expect(mediaMode("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "link"
    );
    expect(mediaMode("https://exemplo.com/v.mp4")).toBe("imported");
    expect(mediaMode("")).toBe("image");
  });
});

describe("mediaTarget", () => {
  test("espaço de imagem ainda vazio: o bloco aponta o campo", () => {
    const empty = mediaTarget({
      defaults: {},
      fields,
      hint: { field: "image", n: 1, value: "" },
      props: { image: "" },
      site,
    });
    expect(empty).toMatchObject({ key: "image", kind: "block", value: "" });
    // Sem o bloco apontar o campo, vazio continua sem alvo; e campo já preenchido não vale como "vazio".
    expect(find({ image: "" }, "")).toBe(null);
    expect(
      mediaTarget({
        defaults: {},
        fields,
        hint: { field: "image", n: 1, value: "" },
        props: { image: "/a.jpg" },
        site,
      })
    ).toBe(null);
  });

  test("imagem do bloco", () => {
    expect(find({ image: "/a.jpg" }, "/a.jpg")).toMatchObject({
      key: "image",
      kind: "block",
    });
  });

  test("vídeo de link: o canvas só tem o ID do player", () => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    expect(find({ video: url }, "dQw4w9WgXcQ")).toMatchObject({
      key: "video",
      kind: "block",
      value: url,
    });
  });

  test("foto de um card da lista", () => {
    const cards = [
      { photo: "/1.jpg", title: "A" },
      { photo: "/2.jpg", title: "B" },
    ];
    expect(find({ cards }, "/2.jpg")).toMatchObject({
      index: 1,
      kind: "item",
      sub: "photo",
    });
  });

  test("a mesma mídia em dois campos é ambígua", () => {
    expect(find({ image: "/a.jpg", video: "/a.jpg" }, "/a.jpg")).toBeNull();
  });

  test("mídia que nenhum campo guarda", () => {
    expect(find({ image: "/a.jpg" }, "/outra.jpg")).toBeNull();
  });
});

describe("applyMedia", () => {
  const block = { defaults: {}, props: {} };
  const field = fields[0];

  test("troca e remove no campo do bloco", () => {
    const target: MediaTarget = {
      field,
      key: "image",
      kind: "block",
      value: "/a.jpg",
    };
    const next = applyMedia(site, "b1", target, "/b.jpg", block);
    expect(next.pages[0]?.blocks[0]?.props.image).toBe("/b.jpg");
    expect(
      applyMedia(site, "b1", target, "", block).pages[0]?.blocks[0]?.props.image
    ).toBe("");
    expect(site.pages[0]?.blocks[0]?.props.image).toBeUndefined();
  });

  test("troca só o item da lista", () => {
    const cards = [{ photo: "/1.jpg" }, { photo: "/2.jpg" }];
    const target: MediaTarget = {
      field: fields[2],
      index: 1,
      key: "cards",
      kind: "item",
      sub: "photo",
      value: "/2.jpg",
    };
    const next = applyMedia(site, "b1", target, "/novo.jpg", {
      defaults: {},
      props: { cards },
    });
    expect(next.pages[0]?.blocks[0]?.props.cards).toEqual([
      { photo: "/1.jpg" },
      { photo: "/novo.jpg" },
    ]);
  });
});
