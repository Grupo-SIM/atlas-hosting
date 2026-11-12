import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img } from "./helpers.js";
import { int, str } from "./sim-lib.js";
import type { BlockDefinition, RenderContext } from "./types.js";

/**
 * Blocos da página de vendas "Viral Pack" (prefixo `vp`, escopo `.sb-vp`, CSS em `renderer/viralpack.ts`) e o hero
 * genérico `mosaicHero` (mosaico de imagens com véu e texto sobreposto). Oferta, FAQ e rodapé são os blocos comuns
 * `ebook*`. Todo texto, imagem e link é prop.
 *
 * Ordem dos filhos (da qual dependem os caminhos de `Block.fx`; `1` = a seção). Camadas decorativas ficam sempre depois
 * do conteúdo:
 * - `mosaicHero`: `1.1` conteúdo (`.1` h1, `.2` texto, `.3` traço, `.4` botão), `1.2` logo (se houver), depois mosaico e véu.
 * - `vpHighlights`: `1.1` grade; `1.1.N` = destaque N (`.1` ícone, `.2` título).
 * - `vpSplit`: `1.1` linha (`.1` imagem, `.2` coluna do texto: `.1` título, `.2` texto, `.3` botão).
 * - `vpShowcase`: `1.1` conteúdo (`.1` título, `.2` texto, `.3` mockup).
 * - `vpBenefits`: `1.1` cabeçalho, `1.2` grade de linhas de 4 (`1.2.R` = linha R; `1.2.R.N` = cartão: `.1` título,
 *   `.2` subtítulo, `.3` botão).
 */

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;
const color = (d: string) => z.string().regex(COLOR).default(d).catch(d);
const safeColor = (v: string, d: string) => (COLOR.test(v) ? v : d);

const list = <T extends z.ZodRawShape>(shape: T) =>
  z.array(z.object(shape)).default([]).catch([]);

/** `**negrito**` e `__sublinhado__` no meio de um texto; `\n` vira quebra de linha. */
function rich(text: string): ReactNode {
  return text.split("\n").flatMap((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*|__[^_]+__)/).map((t, i) => {
      if (t.startsWith("**") && t.endsWith("**") && t.length > 4)
        // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
        return <strong key={i}>{t.slice(2, -2)}</strong>;
      if (t.startsWith("__") && t.endsWith("__") && t.length > 4)
        // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do trecho
        return <u key={i}>{t.slice(2, -2)}</u>;
      return t;
    });
    // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade da linha
    return li ? [<br key={`br${li}`} />, ...parts] : parts;
  });
}

function Btn({
  ctx,
  label,
  small = false,
  url,
}: {
  ctx: RenderContext;
  label: string;
  small?: boolean;
  url: string;
}) {
  if (!label) return null;
  return (
    <a className={small ? "vp-btn sm" : "vp-btn"} href={href(ctx, url)}>
      {label}
    </a>
  );
}

/* ───────────────────────── hero com mosaico ───────────────────────── */

const tileSchema = z.object({
  alt: str(),
  image: str(),
  shape: z
    .enum(["portrait", "landscape"])
    .default("portrait")
    .catch("portrait"),
});
type Tile = z.infer<typeof tileSchema>;

/** Divide as peças em 4 colunas (em ordem); retratos seguidos formam pares, paisagem ocupa a linha toda. */
function mosaicColumns(tiles: Tile[]): Tile[][][] {
  const per = Math.max(1, Math.ceil(tiles.length / 4));
  const cols: Tile[][][] = [];
  for (let c = 0; c < 4; c++) {
    const rows: Tile[][] = [];
    for (const t of tiles.slice(c * per, (c + 1) * per)) {
      const last = rows[rows.length - 1];
      if (
        t.shape === "portrait" &&
        last &&
        last.length === 1 &&
        last[0]?.shape === "portrait"
      )
        last.push(t);
      else rows.push([t]);
    }
    cols.push(rows);
  }
  return cols;
}

const mosaicHero = defineBlock(
  z.object({
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    dashColor: color("#FFA33E"),
    logo: str(),
    logoAlt: str("Logo"),
    logoUrl: str("/"),
    logoWidth: int(20, 400, 110),
    text: str(),
    textColor: color("#FFFFFF"),
    tiles: z.array(tileSchema).default([]).catch([]),
    title: str(),
    veil: color("#000000B8"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título (Enter quebra a linha; **negrito**)",
      },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "logo", kind: "image", label: "Logo (canto superior esquerdo)" },
      { key: "logoAlt", kind: "text", label: "Texto alternativo do logo" },
      { key: "logoUrl", kind: "url", label: "Link do logo" },
      { key: "logoWidth", kind: "number", label: "Largura do logo (px)" },
      { key: "dashColor", kind: "color", label: "Cor do traço" },
      { key: "textColor", kind: "color", label: "Cor do texto" },
      { key: "veil", kind: "color", label: "Véu sobre o mosaico (cor + alfa)" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Texto alternativo" },
          {
            key: "shape",
            kind: "select",
            label: "Formato",
            options: [
              { label: "Retrato (2 por linha)", value: "portrait" },
              { label: "Paisagem (linha inteira)", value: "landscape" },
            ],
          },
        ],
        key: "tiles",
        kind: "list",
        label:
          "Imagens do mosaico (4 colunas, em ordem; a 4ª coluna some no tablet)",
      },
    ],
    group: "layout",
    label: "Hero com mosaico de imagens",
    render: (p, ctx) => {
      const cols = mosaicColumns(p.tiles);
      return (
        <section
          className="mh"
          style={
            {
              "--mh-logo-w": `${p.logoWidth}px`,
              "--mh-text": safeColor(p.textColor, "#FFFFFF"),
              "--mh-veil": safeColor(p.veil, "#000000B8"),
              "--vp-orange": safeColor(p.dashColor, "#FFA33E"),
            } as CSSProperties
          }
        >
          <div className="mh-in">
            {p.title ? <h1 className="vp-h1 mh-h1">{rich(p.title)}</h1> : null}
            {p.text ? <p className="mh-p">{p.text}</p> : null}
            <hr className="mh-dash" />
            <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
          {p.logo ? (
            <div className="mh-logo">
              <a href={href(ctx, p.logoUrl)}>
                <Img alt={p.logoAlt} src={p.logo} />
              </a>
            </div>
          ) : null}
          <div aria-hidden="true" className="mh-bg">
            {cols.map((rows, c) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a coluna é identificada pela posição
              <div className="mh-col" key={c}>
                {rows.map((row, r) => (
                  <div
                    className={
                      row[0]?.shape === "landscape" ? "mh-row l" : "mh-row"
                    }
                    // biome-ignore lint/suspicious/noArrayIndexKey: a linha é identificada pela posição
                    key={r}
                  >
                    {row.map((t, i) => (
                      <img
                        alt={t.alt}
                        className={
                          t.shape === "landscape" ? "mh-tile l" : "mh-tile"
                        }
                        // biome-ignore lint/suspicious/noArrayIndexKey: a peça é identificada pela posição
                        key={i}
                        loading="lazy"
                        src={t.image}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div aria-hidden="true" className="mh-veil" />
        </section>
      );
    },
    type: "mosaicHero",
  }
);

/* ───────────────────────── destaques ───────────────────────── */

const vpHighlights = defineBlock(
  z.object({
    items: list({ alt: str(), image: str(), title: str() }),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Ícone" },
          { key: "alt", kind: "text", label: "Texto alternativo do ícone" },
          { key: "title", kind: "text", label: "Título" },
        ],
        key: "items",
        kind: "list",
        label: "Destaques",
      },
    ],
    group: "content",
    label: "Destaques (ícones com legenda)",
    render: p => (
      <section className="vp-hl">
        <div className="vp-hl-grid">
          {p.items.map((it, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do item
            <div className="vp-hl-item" key={i}>
              <Img alt={it.alt} className="vp-hl-img" src={it.image} />
              <p className="vp-hl-t">{it.title}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "vpHighlights",
  }
);

/* ───────────────────────── imagem + texto ───────────────────────── */

const vpSplit = defineBlock(
  z.object({
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    image: str(),
    imageAlt: str(),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem (esquerda)" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo da imagem" },
      { key: "title", kind: "textarea", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
    ],
    group: "content",
    label: "Imagem e texto com botão",
    render: (p, ctx) => (
      <section className="vp-split">
        <div className="vp-split-in">
          <Img alt={p.imageAlt} className="vp-split-img" src={p.image} />
          <div className="vp-split-copy">
            {p.title ? <h2 className="vp-h2">{p.title}</h2> : null}
            {p.text ? <p className="vp-split-p">{p.text}</p> : null}
            <Btn ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
        </div>
      </section>
    ),
    type: "vpSplit",
  }
);

/* ───────────────────────── monetizar ───────────────────────── */

const vpShowcase = defineBlock(
  z.object({
    bgColor: color("#3A3A3A"),
    bgImage: str(),
    image: str(),
    imageAlt: str(),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (__sublinhado__, **negrito**)",
      },
      { key: "image", kind: "image", label: "Mockup (encosta embaixo)" },
      { key: "imageAlt", kind: "text", label: "Texto alternativo do mockup" },
      { key: "bgImage", kind: "image", label: "Textura de fundo" },
      { key: "bgColor", kind: "color", label: "Cor de fundo" },
    ],
    group: "content",
    label: "Seção com textura e mockup",
    render: p => (
      <section
        className="vp-show"
        style={
          {
            "--vp-bgc": safeColor(p.bgColor, "#3A3A3A"),
            ...(p.bgImage ? { "--vp-bgi": cssUrl(p.bgImage) } : {}),
          } as CSSProperties
        }
      >
        <div className="vp-show-in">
          {p.title ? <h2 className="vp-h2">{p.title}</h2> : null}
          {p.text ? <p>{rich(p.text)}</p> : null}
          {p.image ? (
            <Img alt={p.imageAlt} className="vp-show-img" src={p.image} />
          ) : null}
        </div>
      </section>
    ),
    type: "vpShowcase",
  }
);

/* ───────────────────────── benefícios ───────────────────────── */

const vpBenefits = defineBlock(
  z.object({
    buttonLabel: str("Adquirir Agora"),
    buttonUrl: str("#oferta"),
    items: list({ image: str(), subtitle: str(), title: str() }),
    text: str(),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão dos cartões" },
      { key: "buttonUrl", kind: "url", label: "Link do botão dos cartões" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto de fundo" },
          { key: "title", kind: "text", label: "Título" },
          { key: "subtitle", kind: "text", label: "Subtítulo" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões (4 por linha)",
      },
    ],
    group: "content",
    label: "Benefícios (cartões com foto que clareia no hover)",
    render: (p, ctx) => {
      const rows: (typeof p.items)[] = [];
      for (let i = 0; i < p.items.length; i += 4)
        rows.push(p.items.slice(i, i + 4));
      return (
        <section className="vp-ben">
          <div className="vp-ben-head">
            {p.title ? <h2 className="vp-h2">{p.title}</h2> : null}
            {p.text ? <p>{p.text}</p> : null}
          </div>
          <div className="vp-ben-grid">
            {rows.map((row, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a linha é identificada pela posição
              <div className="vp-ben-row" key={r}>
                {row.map((it, i) => (
                  <div
                    className="vp-ben-card"
                    // biome-ignore lint/suspicious/noArrayIndexKey: a posição é a identidade do cartão
                    key={i}
                    style={
                      it.image
                        ? ({ "--vp-img": cssUrl(it.image) } as CSSProperties)
                        : undefined
                    }
                  >
                    <h3 className="vp-ben-t">{it.title}</h3>
                    {it.subtitle ? (
                      <p className="vp-ben-s">{it.subtitle}</p>
                    ) : null}
                    <Btn
                      ctx={ctx}
                      label={p.buttonLabel}
                      small
                      url={p.buttonUrl}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      );
    },
    type: "vpBenefits",
  }
);

export const viralpackBlocks: BlockDefinition[] = [
  mosaicHero,
  vpHighlights,
  vpSplit,
  vpShowcase,
  vpBenefits,
];
