import { z } from "zod";
import { defineBlock } from "./define.js";
import { Img } from "./helpers.js";

const str = (d = "") => z.string().default(d).catch(d);
const align = z
  .enum(["left", "center", "right"])
  .default("center")
  .catch("center");
const JUSTIFY = {
  center: "center",
  left: "flex-start",
  right: "flex-end",
} as const;
const ALIGN_FIELD = {
  key: "align",
  kind: "select" as const,
  label: "Alinhamento na página",
  options: [
    { label: "Esquerda", value: "left" },
    { label: "Centro", value: "center" },
    { label: "Direita", value: "right" },
  ],
};
const SAMPLE =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop";

/** A imagem ou vídeo dentro de um aparelho: celular, tablet, notebook ou janela de navegador. */
const mockup = defineBlock(
  z.object({
    align,
    device: z
      .enum(["phone", "tablet", "laptop", "browser"])
      .default("phone")
      .catch("phone"),
    media: str(SAMPLE),
    url: str("meusite.com.br"),
    width: z.coerce.number().min(120).max(1000).default(320).catch(320),
  }),
  {
    fields: [
      {
        key: "device",
        kind: "select",
        label: "Aparelho",
        options: [
          { label: "Celular", value: "phone" },
          { label: "Tablet", value: "tablet" },
          { label: "Notebook", value: "laptop" },
          { label: "Janela do navegador", value: "browser" },
        ],
      },
      { key: "media", kind: "media", label: "Imagem ou vídeo na tela" },
      { key: "width", kind: "number", label: "Largura em px (120–1000)" },
      {
        key: "url",
        kind: "text",
        label: "Endereço na barra (só na janela do navegador)",
      },
      ALIGN_FIELD,
    ],
    group: "frames",
    label: "Mockup de aparelho",
    render: p => (
      <div
        className="sb-container sb-gfx-row"
        style={{ justifyContent: JUSTIFY[p.align] }}
      >
        <div
          className={`sb-dev sb-dev-${p.device}`}
          style={{ width: `min(100%, ${p.width}px)` }}
        >
          {p.device === "browser" ? (
            <div className="sb-dev-bar">
              <i />
              <i />
              <i />
              <span>{p.url}</span>
            </div>
          ) : null}
          <div className="sb-dev-screen">
            <Img alt="" src={p.media} />
          </div>
          {p.device === "laptop" ? <div className="sb-dev-base" /> : null}
        </div>
      </div>
    ),
    type: "mockup",
  }
);

const FRAMES = [
  { label: "Polaroid", value: "polaroid" },
  { label: "Quadro clássico", value: "classic" },
  { label: "Círculo", value: "circle" },
  { label: "Arco", value: "arch" },
  { label: "Hexágono", value: "hexagon" },
  { label: "Rolo de filme", value: "film" },
  { label: "Sombra deslocada", value: "offset" },
] as const;

/** Moldura decorativa para imagem ou vídeo. */
const mediaFrame = defineBlock(
  z.object({
    align,
    caption: str(""),
    frame: z
      .enum([
        "polaroid",
        "classic",
        "circle",
        "arch",
        "hexagon",
        "film",
        "offset",
      ])
      .default("polaroid")
      .catch("polaroid"),
    media: str(SAMPLE),
    width: z.coerce.number().min(120).max(1000).default(360).catch(360),
  }),
  {
    fields: [
      {
        key: "frame",
        kind: "select",
        label: "Moldura",
        options: FRAMES.map(f => ({ label: f.label, value: f.value })),
      },
      { key: "media", kind: "media", label: "Imagem ou vídeo" },
      { key: "caption", kind: "text", label: "Legenda (aparece na polaroid)" },
      { key: "width", kind: "number", label: "Largura em px (120–1000)" },
      ALIGN_FIELD,
    ],
    group: "frames",
    label: "Moldura de imagem",
    render: p => (
      <div
        className="sb-container sb-gfx-row"
        style={{ justifyContent: JUSTIFY[p.align] }}
      >
        <figure
          className={`sb-frm sb-frm-${p.frame}`}
          style={{ width: `min(100%, ${p.width}px)` }}
        >
          <div className="sb-frm-media">
            <Img alt={p.caption} src={p.media} />
          </div>
          {p.caption && p.frame === "polaroid" ? (
            <figcaption>{p.caption}</figcaption>
          ) : null}
        </figure>
      </div>
    ),
    type: "mediaFrame",
  }
);

export const frameBlocks = [mockup, mediaFrame];
