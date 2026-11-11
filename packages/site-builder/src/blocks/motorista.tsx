import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { frameProps } from "./frame.js";
import { href, Img } from "./helpers.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { inlineVideoEmbed } from "./youtube.js";

/**
 * Blocos do tema Controle de Motorista (escopo `.sb-cm`, CSS em `renderer/motorista.ts`). Todo texto, imagem,
 * link e item é prop editável. Os caminhos de `Block.fx` (`nth-child` a partir do bloco; `1` = a raiz do bloco)
 * dependem da ordem dos filhos descrita no comentário de cada bloco. Carrossel de imagens: `data-sb-slider`
 * (`fx-runtime.ts`); depoimentos: `.sb-cslider.sg-car` (setas no `nav-runtime.ts`, passar sozinho e bolinhas no
 * `fx-runtime.ts`); sem JS e no editor ficam parados.
 */
const str = (d = "") => z.string().default(d);
const int = (min: number, max: number, fallback: number) =>
  z.coerce.number().int().min(min).max(max).default(fallback).catch(fallback);
const HEX6 = /^#[0-9a-fA-F]{6}$/;
const hex = (fallback: string) =>
  z
    .string()
    .default(fallback)
    .catch(fallback)
    .transform(v => (HEX6.test(v) ? v : fallback));
const yesNo = (d: "yes" | "no") => z.enum(["yes", "no"]).default(d).catch(d);

const lines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

/** Texto com quebras de linha (`\n`) vira linhas separadas por `<br>`, sem HTML solto. */
function Breaks({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((l, i) => (
        <span key={l + i}>
          {i > 0 ? <br /> : null}
          {l}
        </span>
      ))}
    </>
  );
}

const CAR =
  "M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z";
const CHECK_SOLID =
  "M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z";
const PLUS =
  "M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z";
const MINUS =
  "M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z";

function Btn({
  children,
  ctx,
  url,
}: {
  children: ReactNode;
  ctx: RenderContext;
  url: string;
}) {
  if (!children) return null;
  return (
    <a className="cm-btn" href={href(ctx, url)}>
      {children}
    </a>
  );
}

const button = (key: string, label: string): FieldDef[] => [
  { key: `${key}Label`, kind: "text", label: `Texto do ${label}` },
  { key: `${key}Url`, kind: "url", label: `Link do ${label}` },
];
const titleField: FieldDef = { key: "title", kind: "text", label: "Título" };

/* ───────────────────── logo + barra azul de acesso ───────────────────── */

/** Filhos de `1`: `.1` faixa da logo, `.2` barra azul (botões em `1.2.1.n`). */
const cmHeader = defineBlock(
  z.object({
    background: str(),
    buttons: z.array(z.object({ label: str(), url: str("#") })).default([]),
    logo: str(),
    logoAlt: str(),
    overlay: hex("#137BC0"),
    overlayOpacity: int(0, 100, 90),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoAlt", kind: "text", label: "Nome da logo (acessibilidade)" },
      { key: "background", kind: "image", label: "Imagem de fundo da barra" },
      { key: "overlay", kind: "color", label: "Cor da camada sobre a imagem" },
      {
        key: "overlayOpacity",
        kind: "number",
        label: "Opacidade da camada (0 a 100)",
      },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "buttons",
        kind: "list",
        label: "Botões de acesso",
      },
    ],
    group: "layout",
    label: "Cabeçalho (Controle de Motorista)",
    render: (p, ctx) => (
      <header className="cm-head">
        <div className="cm-head-bar">
          <a className="cm-logo" href={href(ctx, "/")}>
            <Img alt={p.logoAlt} src={p.logo} />
          </a>
        </div>
        <div
          className="cm-nav-bar"
          style={
            {
              "--cm-ov": p.overlay,
              "--cm-ov-o": p.overlayOpacity / 100,
              backgroundImage: cssUrl(p.background),
            } as CSSProperties
          }
        >
          <div className="cm-wrap cm-nav-in">
            {p.buttons.map((b, i) => (
              <a className="cm-btn" href={href(ctx, b.url)} key={b.label + i}>
                {b.label}
              </a>
            ))}
          </div>
        </div>
      </header>
    ),
    type: "cmHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

/** `1.1` conteúdo: `.1` eyebrow, `.2` h1, `.3` texto, `.4` botão (o `<a>` é `1.1.4.1`). */
const cmHero = defineBlock(
  z.object({
    background: str(),
    buttonLabel: str("Fazer Assinatura"),
    buttonUrl: str("#"),
    eyebrow: str(),
    overlay: hex("#000000"),
    overlayOpacity: int(0, 100, 50),
    text: str(),
    title: str("Título principal"),
  }),
  {
    fields: [
      { key: "eyebrow", kind: "text", label: "Texto acima do título" },
      titleField,
      { key: "text", kind: "textarea", label: "Texto" },
      ...button("button", "botão"),
      { key: "background", kind: "image", label: "Imagem de fundo" },
      { key: "overlay", kind: "color", label: "Cor da camada" },
      {
        key: "overlayOpacity",
        kind: "number",
        label: "Opacidade da camada (0 a 100)",
      },
    ],
    group: "content",
    label: "Hero (Controle de Motorista)",
    render: (p, ctx) => (
      <section
        className="cm-hero"
        style={
          {
            "--cm-ov": p.overlay,
            "--cm-ov-o": p.overlayOpacity / 100,
            backgroundImage: cssUrl(p.background),
          } as CSSProperties
        }
      >
        <div className="cm-wrap cm-hero-in">
          <h3>{p.eyebrow}</h3>
          <h1>{p.title}</h1>
          <p className="cm-hero-text">{p.text}</p>
          <div className="cm-hero-btn">
            <Btn ctx={ctx} url={p.buttonUrl}>
              {p.buttonLabel}
            </Btn>
          </div>
        </div>
      </section>
    ),
    type: "cmHero",
  }
);

/* ───────────────────── barra branca sobreposta ───────────────────── */

/** `1.1` largura, `1.1.1` caixa: `.1` ícone, `.2` texto, `.3` botão (o `<a>` é `1.1.1.3.1`). Entra com `slideInUp` no bloco (`""`). */
const cmCtaBar = defineBlock(
  z.object({
    background: str(),
    buttonLabel: str("Saiba Mais"),
    buttonUrl: str("#"),
    text: str(),
  }),
  {
    fields: [
      { key: "background", kind: "image", label: "Fundo da coluna do ícone" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...button("button", "botão"),
    ],
    group: "content",
    label: "Barra branca sobre o hero (Controle de Motorista)",
    render: (p, ctx) => (
      <section className="cm-cta">
        <div className="cm-wrap">
          <div className="cm-cta-box">
            <div
              className="cm-cta-icon"
              style={{ backgroundImage: cssUrl(p.background) }}
            >
              <svg aria-hidden="true" viewBox="0 0 512 512">
                <path d={CAR} />
              </svg>
            </div>
            <p className="cm-cta-text">{p.text}</p>
            <div className="cm-cta-act">
              <Btn ctx={ctx} url={p.buttonUrl}>
                {p.buttonLabel}
              </Btn>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "cmCtaBar",
  }
);

/* ───────────────────────── carrossel de imagens ───────────────────────── */

const cmCarousel = defineBlock(
  z.object({
    autoplay: int(1000, 30000, 5000),
    gap: int(0, 100, 30),
    items: z.array(z.object({ alt: str(), image: str() })).default([]),
    perDesktop: int(1, 6, 4),
    perMobile: int(1, 4, 1),
    perTablet: int(1, 6, 2),
    showDots: yesNo("yes"),
    speed: int(100, 3000, 850),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "alt", kind: "text", label: "Descrição (acessibilidade)" },
        ],
        key: "items",
        kind: "list",
        label: "Imagens",
      },
      {
        key: "perDesktop",
        kind: "number",
        label: "Imagens por tela (computador)",
      },
      { key: "perTablet", kind: "number", label: "Imagens por tela (tablet)" },
      { key: "perMobile", kind: "number", label: "Imagens por tela (celular)" },
      { key: "gap", kind: "number", label: "Espaço entre imagens (px)" },
      {
        key: "autoplay",
        kind: "number",
        label: "Tempo entre trocas (milissegundos)",
      },
      {
        key: "speed",
        kind: "number",
        label: "Duração da troca (milissegundos)",
      },
      {
        key: "showDots",
        kind: "select",
        label: "Bolinhas quadradas",
        options: [
          { label: "Mostrar", value: "yes" },
          { label: "Esconder", value: "no" },
        ],
      },
    ],
    group: "media",
    label: "Carrossel de imagens (Controle de Motorista)",
    render: p => (
      <section
        className="cm-carousel"
        style={
          {
            "--cm-v-d": p.perDesktop,
            "--cm-v-m": p.perMobile,
            "--cm-v-t": p.perTablet,
          } as CSSProperties
        }
      >
        <div className="cm-wrap">
          <div
            className="cm-car-box"
            data-delay={Math.max(100, p.autoplay - p.speed)}
            data-sb-slider="1"
            data-speed={p.speed}
            style={{ "--cm-g": `${p.gap}px` } as CSSProperties}
          >
            <div className="cm-view">
              <div className="cm-track">
                {p.items.map((it, i) => (
                  <div className="cm-slide" key={it.image + i}>
                    <Img alt={it.alt} src={it.image} />
                  </div>
                ))}
              </div>
            </div>
            {p.showDots === "yes" ? (
              <div className="cm-dots">
                {p.items.map((it, i) => (
                  <button
                    aria-label={`Ir para a imagem ${i + 1}`}
                    className={i === 0 ? "cm-dot on" : "cm-dot"}
                    key={it.image + i}
                    type="button"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    ),
    type: "cmCarousel",
  }
);

/* ───────────────────────── título de seção ───────────────────────── */

/**
 * Filhos de `1.1`: `.1` título (ou a faixa com linhas), `.2` subtítulo (se houver), depois o ornamento (se houver).
 * `spaceTop` é o respiro acima (no tablet vale no máximo 50px).
 */
const cmSectionTitle = defineBlock(
  z.object({
    hideOnMobile: yesNo("no"),
    ornament: str(),
    size: z.enum(["normal", "big"]).default("normal").catch("normal"),
    spaceTop: int(0, 300, 101),
    style: z.enum(["center", "lines"]).default("center").catch("center"),
    subtitle: str(),
    title: str("Título da seção"),
  }),
  {
    fields: [
      titleField,
      {
        key: "subtitle",
        kind: "textarea",
        label: "Subtítulo (Enter quebra a linha)",
      },
      {
        key: "style",
        kind: "select",
        label: "Estilo",
        options: [
          { label: "Centralizado", value: "center" },
          { label: "Com linhas dos lados", value: "lines" },
        ],
      },
      {
        key: "size",
        kind: "select",
        label: "Tamanho do título",
        options: [
          { label: "Normal (36px)", value: "normal" },
          { label: "Grande (60px)", value: "big" },
        ],
      },
      {
        key: "ornament",
        kind: "image",
        label: "Ornamento embaixo (vazio = sem)",
      },
      { key: "spaceTop", kind: "number", label: "Espaço acima (px)" },
      {
        key: "hideOnMobile",
        kind: "select",
        label: "No celular",
        options: [
          { label: "Mostrar", value: "no" },
          { label: "Esconder", value: "yes" },
        ],
      },
    ],
    group: "content",
    label: "Título de seção (Controle de Motorista)",
    render: p => (
      <section
        className={[
          "cm-title",
          p.size === "big" ? "big" : "",
          p.style,
          p.hideOnMobile === "yes" ? "cm-hide-m" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ "--cm-top": `${p.spaceTop}px` } as CSSProperties}
      >
        <div className="cm-wrap">
          {p.style === "lines" ? (
            <div className="cm-lines">
              <h2>{p.title}</h2>
            </div>
          ) : (
            <h2 className="cm-title-h">{p.title}</h2>
          )}
          {p.subtitle ? (
            <p className="cm-title-sub">
              <Breaks text={p.subtitle} />
            </p>
          ) : null}
          {p.ornament ? <Img className="cm-orn-img" src={p.ornament} /> : null}
        </div>
      </section>
    ),
    type: "cmSectionTitle",
  }
);

/* ───────────────────── 6 vantagens em volta da imagem ───────────────────── */

const chipSchema = z.object({
  label: str(),
  number: str(),
  offset: z.coerce.number().int().min(-300).max(300).default(0).catch(0),
  url: str(),
});
const chipFields: FieldDef[] = [
  { key: "label", kind: "text", label: "Rótulo" },
  { key: "number", kind: "text", label: "Número" },
  { key: "url", kind: "url", label: "Link (opcional)" },
  {
    key: "offset",
    kind: "number",
    label: "Deslocamento horizontal (px; negativo avança)",
  },
];

/**
 * `1.1` linha: `.1` coluna esquerda (itens `1.1.1.n`), `.2` coluna da imagem (a `<img>` é `1.1.2.1`),
 * `.3` coluna direita (itens `1.1.3.n`).
 */
const cmFeatureRing = defineBlock(
  z.object({
    background: str(),
    image: str(),
    left: z.array(chipSchema).default([]),
    right: z.array(chipSchema).default([]),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem central" },
      { key: "background", kind: "image", label: "Imagem de fundo (arco)" },
      {
        itemFields: chipFields,
        key: "left",
        kind: "list",
        label: "Vantagens da esquerda (número à direita)",
      },
      {
        itemFields: chipFields,
        key: "right",
        kind: "list",
        label: "Vantagens da direita (número à esquerda)",
      },
    ],
    group: "content",
    label: "Vantagens em volta da imagem (Controle de Motorista)",
    render: (p, ctx) => {
      const chip = (
        c: z.infer<typeof chipSchema>,
        side: "left" | "right",
        i: number
      ) => {
        const Tag = c.url ? "a" : "div";
        const label = (
          <span className="cm-chip-label" key="l">
            {c.label}
          </span>
        );
        const num = (
          <span className="cm-chip-num" key="n">
            {c.number}
          </span>
        );
        return (
          <Tag
            className="cm-chip"
            href={c.url ? href(ctx, c.url) : undefined}
            key={c.label + i}
            style={
              side === "left"
                ? { marginRight: `${c.offset}px` }
                : { marginLeft: `${c.offset}px` }
            }
          >
            {side === "left" ? [label, num] : [num, label]}
          </Tag>
        );
      };
      return (
        <section
          className="cm-ring"
          style={{ backgroundImage: cssUrl(p.background) }}
        >
          <div className="cm-wrap cm-ring-in">
            <div className="cm-ring-col left">
              {p.left.map((c, i) => chip(c, "left", i))}
            </div>
            <div className="cm-ring-mid">
              <Img src={p.image} />
            </div>
            <div className="cm-ring-col right">
              {p.right.map((c, i) => chip(c, "right", i))}
            </div>
          </div>
        </section>
      );
    },
    type: "cmFeatureRing",
  }
);

/* ───────────────────────── três pilares ───────────────────────── */

/** Filhos de `1`: uma coluna por pilar (`1.n`); em cada uma, `.1` conteúdo > ícone, título, texto. */
const cmPillars = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          background: str(),
          hoverColor: hex("#FFFFFF"),
          icon: str(),
          overlay: hex("#242424"),
          overlayOpacity: int(0, 100, 90),
          text: str(),
          title: str(),
          url: str(),
        })
      )
      .default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "background", kind: "image", label: "Foto de fundo" },
          { key: "overlay", kind: "color", label: "Cor da camada" },
          {
            key: "overlayOpacity",
            kind: "number",
            label: "Opacidade da camada (0 a 100)",
          },
          { key: "icon", kind: "image", label: "Ícone" },
          { key: "title", kind: "text", label: "Título" },
          {
            key: "hoverColor",
            kind: "color",
            label: "Cor do título ao passar o mouse",
          },
          { key: "url", kind: "url", label: "Link do título (opcional)" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "items",
        kind: "list",
        label: "Pilares",
      },
    ],
    group: "content",
    label: "Três pilares em faixa (Controle de Motorista)",
    render: (p, ctx) => (
      <section className="cm-pillars">
        {p.items.map((it, i) => (
          <div
            className="cm-pillar"
            key={it.title + i}
            style={
              {
                "--cm-hov": it.hoverColor,
                "--cm-ov": it.overlay,
                "--cm-ov-o": it.overlayOpacity / 100,
                backgroundImage: cssUrl(it.background),
              } as CSSProperties
            }
          >
            <div className="cm-pillar-in">
              {it.icon ? (
                <Img className="cm-pillar-icon" src={it.icon} />
              ) : null}
              <h3>
                {it.url ? <a href={href(ctx, it.url)}>{it.title}</a> : it.title}
              </h3>
              <p>{it.text}</p>
            </div>
          </div>
        ))}
      </section>
    ),
    type: "cmPillars",
  }
);

/* ───────────────────── imagem + recursos 2×2 + CTA ───────────────────── */

/**
 * `1.1` linha: `.1` imagem, `.2` corpo > `.1` grade (recursos `1.1.2.1.n`), `.2` botão (o `<a>` é `1.1.2.2.1`).
 */
const cmPlatform = defineBlock(
  z.object({
    buttonLabel: str("ADQUIRIR SISTEMA"),
    buttonUrl: str("#"),
    features: z
      .array(z.object({ icon: str(), text: str(), title: str() }))
      .default([]),
    image: str(),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem da esquerda" },
      {
        itemFields: [
          { key: "icon", kind: "image", label: "Ícone" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
        ],
        key: "features",
        kind: "list",
        label: "Recursos",
      },
      ...button("button", "botão"),
    ],
    group: "content",
    label: "Imagem e recursos (Controle de Motorista)",
    render: (p, ctx) => (
      <section className="cm-plat">
        <div className="cm-wrap cm-plat-in">
          <div className="cm-plat-img">
            <Img src={p.image} />
          </div>
          <div className="cm-plat-body">
            <div className="cm-feats">
              {p.features.map((f, i) => (
                <div className="cm-feat" key={f.title + i}>
                  <div className="cm-feat-icon">
                    <Img src={f.icon} />
                  </div>
                  <div>
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="cm-plat-cta">
              <Btn ctx={ctx} url={p.buttonUrl}>
                {p.buttonLabel}
              </Btn>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "cmPlatform",
  }
);

/* ───────────────────────── vídeo ───────────────────────── */

/** Filhos de `1.1`: `.1` ornamento (linha | ícone | linha), `.2` título, `.3` vídeo. */
const cmVideo = defineBlock(
  z.object({ ornament: str(), title: str(), videoUrl: str() }),
  {
    fields: [
      { key: "ornament", kind: "image", label: "Ícone entre as linhas" },
      titleField,
      { key: "videoUrl", kind: "url", label: "Vídeo (YouTube ou Vimeo)" },
    ],
    group: "media",
    label: "Vídeo com ornamento (Controle de Motorista)",
    render: (p, ctx) => {
      const src = inlineVideoEmbed(p.videoUrl);
      return (
        <section className="cm-video">
          <div className="cm-wrap">
            <div className="cm-orn">
              {p.ornament ? <Img src={p.ornament} /> : <span />}
            </div>
            {p.title ? <h2 className="cm-video-title">{p.title}</h2> : null}
            <div className="cm-video-frame">
              {src ? (
                <iframe
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  {...frameProps(ctx, src)}
                  title={p.title || "Vídeo"}
                />
              ) : null}
            </div>
          </div>
        </section>
      );
    },
    type: "cmVideo",
  }
);

/* ───────────────────────── tríptico ───────────────────────── */

/**
 * `1.1` linha: `.1` imagem esquerda (cinza), `.2` centro (foto com camada no hover + título embaixo), `.3` imagem
 * direita (cinza). O título fica abaixo da foto, como no original (Themesflat `tf-imagebox` estilo 1).
 */
const cmTriptych = defineBlock(
  z.object({
    center: str(),
    centerLabel: str(),
    centerUrl: str("#"),
    hideOnMobile: yesNo("yes"),
    left: str(),
    right: str(),
  }),
  {
    fields: [
      { key: "left", kind: "image", label: "Imagem da esquerda (em cinza)" },
      { key: "center", kind: "image", label: "Imagem do centro" },
      { key: "centerLabel", kind: "text", label: "Título do centro" },
      { key: "centerUrl", kind: "url", label: "Link do título" },
      { key: "right", kind: "image", label: "Imagem da direita (em cinza)" },
      {
        key: "hideOnMobile",
        kind: "select",
        label: "No celular",
        options: [
          { label: "Esconder", value: "yes" },
          { label: "Mostrar", value: "no" },
        ],
      },
    ],
    group: "media",
    label: "Três imagens (Controle de Motorista)",
    render: (p, ctx) => (
      <section
        className={`cm-tri${p.hideOnMobile === "yes" ? "cm-hide-m" : ""}`}
      >
        <div className="cm-wrap cm-tri-in">
          <div className="cm-tri-side l">
            <Img src={p.left} />
          </div>
          <div className="cm-tri-mid">
            <div className="cm-tri-pic">
              <Img src={p.center} />
            </div>
            <div className="cm-tri-cap">
              <h4>
                <a href={href(ctx, p.centerUrl)}>{p.centerLabel}</a>
              </h4>
            </div>
          </div>
          <div className="cm-tri-side r">
            <Img src={p.right} />
          </div>
        </div>
      </section>
    ),
    type: "cmTriptych",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

/** Filhos de `1.1`: `.1` caixa escura com o carrossel, `.2` ornamento (se houver). */
const cmTestimonials = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), name: str(), role: str(), text: str() }))
      .default([]),
    ornament: str(),
    seconds: int(1, 60, 5),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
      {
        key: "seconds",
        kind: "number",
        label: "Tempo em cada depoimento (segundos)",
      },
      {
        key: "ornament",
        kind: "image",
        label: "Ornamento embaixo (vazio = sem)",
      },
    ],
    group: "content",
    label: "Depoimentos em carrossel (Controle de Motorista)",
    render: p => (
      <section className="cm-testi">
        <div className="cm-wrap">
          <div className="cm-testi-box sb-cslider sg-car" data-sec={p.seconds}>
            <div className="sb-cslider-track cm-testi-track">
              {p.items.map((it, i) => (
                <figure
                  className="cm-t-card"
                  key={it.name + i}
                  style={{ margin: 0 }}
                >
                  <blockquote className="cm-t-text" style={{ margin: 0 }}>
                    {it.text}
                  </blockquote>
                  <figcaption className="cm-t-foot">
                    {it.image ? <Img alt={it.name} src={it.image} /> : null}
                    <div>
                      <span className="cm-t-name">{it.name}</span>
                      <span className="cm-t-role">{it.role}</span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="sb-cslider-nav">
              {["Anterior", "Próximo"].map((label, k) => (
                <button aria-label={label} key={label} type="button">
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <path d={k === 0 ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
                  </svg>
                </button>
              ))}
            </div>
            <div className="cm-testi-dots sg-dots">
              {p.items.map((it, i) => (
                <button
                  aria-label={`Ir para o depoimento ${i + 1}`}
                  className={i === 0 ? "on" : undefined}
                  key={it.name + i}
                  type="button"
                />
              ))}
            </div>
          </div>
          {p.ornament ? (
            <div className="cm-testi-orn">
              <Img src={p.ornament} />
            </div>
          ) : null}
        </div>
      </section>
    ),
    type: "cmTestimonials",
  }
);

/* ───────────────────────── tabela de preços ───────────────────────── */

const planSchema = z.object({
  buttonLabel: str("Adquirir Agora"),
  buttonUrl: str("#"),
  cents: str(),
  color: hex("#1896FE"),
  currency: str("R$"),
  items: str(),
  name: str(),
  ribbon: str(),
  subtitle: str(),
  whole: str(),
});

/**
 * Filhos de `1`: `.1` cabeçalho (título `1.1.1`, subtítulo `1.1.2`), `.2` área dos cartões >
 * `.1` container > `.1` colunas (um plano por coluna: `1.2.1.1.n`).
 */
const cmPricing = defineBlock(
  z.object({
    overlayImage: str(),
    plans: z.array(planSchema).default([]),
    subtitle: str(),
    title: str(),
  }),
  {
    fields: [
      titleField,
      {
        key: "subtitle",
        kind: "textarea",
        label: "Subtítulo (Enter quebra a linha)",
      },
      {
        key: "overlayImage",
        kind: "image",
        label: "Imagem de fundo (camada a 10%)",
      },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome do plano" },
          { key: "subtitle", kind: "text", label: "Subtítulo" },
          { key: "currency", kind: "text", label: "Moeda" },
          { key: "whole", kind: "text", label: "Preço (parte inteira)" },
          { key: "cents", kind: "text", label: "Preço (centavos)" },
          { key: "color", kind: "color", label: "Cor do cabeçalho" },
          {
            key: "items",
            kind: "textarea",
            label: "Benefícios (um por linha)",
          },
          { key: "buttonLabel", kind: "text", label: "Texto do botão" },
          { key: "buttonUrl", kind: "url", label: "Link do botão" },
          {
            key: "ribbon",
            kind: "text",
            label: "Faixa no canto (vazio = sem)",
          },
        ],
        key: "plans",
        kind: "list",
        label: "Planos",
      },
    ],
    group: "content",
    label: "Tabela de preços (Controle de Motorista)",
    render: (p, ctx) => (
      <section className="cm-pricing">
        <div
          className="cm-title lines"
          style={{ "--cm-top": "80px" } as CSSProperties}
        >
          <div className="cm-wrap">
            <div className="cm-lines">
              <h2>{p.title}</h2>
            </div>
            {p.subtitle ? (
              <p className="cm-title-sub">
                <Breaks text={p.subtitle} />
              </p>
            ) : null}
          </div>
        </div>
        <div
          className="cm-price-area"
          style={{ "--cm-ov-img": cssUrl(p.overlayImage) } as CSSProperties}
        >
          <div className="cm-price-in">
            <div className="cm-price-cols">
              {p.plans.map((pl, i) => (
                <div className="cm-plan-col" key={pl.name + i}>
                  <article
                    className="cm-plan"
                    style={{ "--cm-plan": pl.color } as CSSProperties}
                  >
                    {pl.ribbon ? (
                      <div className="cm-ribbon">
                        <span>{pl.ribbon}</span>
                      </div>
                    ) : null}
                    <div className="cm-plan-top">
                      <div className="cm-plan-head">
                        <h3>{pl.name}</h3>
                        <p>{pl.subtitle}</p>
                      </div>
                      <div className="cm-plan-price">
                        <span className="cm-plan-cur">{pl.currency}</span>
                        <span className="cm-plan-int">{pl.whole}</span>
                        <span className="cm-plan-dec">{pl.cents}</span>
                      </div>
                    </div>
                    <ul className="cm-plan-list">
                      {lines(pl.items).map((l, k) => (
                        <li key={l + k}>
                          <svg aria-hidden="true" viewBox="0 0 512 512">
                            <path d={CHECK_SOLID} />
                          </svg>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="cm-plan-foot">
                      <Btn ctx={ctx} url={pl.buttonUrl}>
                        {pl.buttonLabel}
                      </Btn>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    type: "cmPricing",
  }
);

/* ───────────────────────── FAQ ───────────────────────── */

/** Filhos de `1.1`: `.1` título com linhas, `.2` lista (`<details>`: o primeiro começa aberto, um por vez). */
const cmFaq = defineBlock(
  z.object({
    items: z.array(z.object({ answer: str(), question: str() })).default([]),
    title: str(),
  }),
  {
    fields: [
      titleField,
      {
        itemFields: [
          { key: "question", kind: "text", label: "Pergunta" },
          { key: "answer", kind: "textarea", label: "Resposta" },
        ],
        key: "items",
        kind: "list",
        label: "Perguntas",
      },
    ],
    group: "content",
    label: "Perguntas frequentes (Controle de Motorista)",
    render: p => (
      <section className="cm-faq">
        <div className="cm-wrap">
          <div className="cm-lines">
            <h2>{p.title}</h2>
          </div>
          <div className="cm-faq-list">
            {p.items.map((it, i) => (
              <details
                className="cm-faq-item"
                key={it.question + i}
                name="sb-cm-faq"
                open={i === 0}
              >
                <summary>
                  <span>{it.question}</span>
                  <span aria-hidden="true" className="cm-faq-ic">
                    <svg className="plus" viewBox="0 0 448 512">
                      <path d={PLUS} />
                    </svg>
                    <svg className="minus" viewBox="0 0 448 512">
                      <path d={MINUS} />
                    </svg>
                  </span>
                </summary>
                <div className="cm-faq-a">
                  <p>{it.answer}</p>
                </div>
              </details>
            ))}
          </div>
          <div className="cm-faq-gap" />
        </div>
      </section>
    ),
    type: "cmFaq",
  }
);

/* ───────────────────────── rodapé e 404 ───────────────────────── */

const cmFooter = defineBlock(z.object({ copyright: str() }), {
  fields: [{ key: "copyright", kind: "text", label: "Texto do rodapé" }],
  group: "layout",
  label: "Rodapé (Controle de Motorista)",
  render: p => (
    <footer className="cm-foot">
      <div className="cm-wrap cm-foot-in">
        <div className="cm-foot-line" />
        <p className="cm-foot-text">{p.copyright}</p>
        <div className="cm-foot-line" />
      </div>
    </footer>
  ),
  type: "cmFooter",
});

const cmNotFound = defineBlock(
  z.object({
    buttonLabel: str("Voltar para o início"),
    buttonUrl: str("/"),
    text: str(),
    title: str("Página não encontrada"),
  }),
  {
    fields: [
      titleField,
      { key: "text", kind: "textarea", label: "Texto" },
      ...button("button", "botão"),
    ],
    group: "content",
    label: "Página 404 (Controle de Motorista)",
    render: (p, ctx) => (
      <section className="cm-wrap cm-404">
        <h1>{p.title}</h1>
        <p>{p.text}</p>
        <div className="cm-404-btn">
          <Btn ctx={ctx} url={p.buttonUrl}>
            {p.buttonLabel}
          </Btn>
        </div>
      </section>
    ),
    type: "cmNotFound",
  }
);

export const motoristaBlocks: BlockDefinition[] = [
  cmHeader,
  cmHero,
  cmCtaBar,
  cmCarousel,
  cmSectionTitle,
  cmFeatureRing,
  cmPillars,
  cmPlatform,
  cmVideo,
  cmTriptych,
  cmTestimonials,
  cmPricing,
  cmFaq,
  cmFooter,
  cmNotFound,
];
