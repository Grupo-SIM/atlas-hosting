import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import { href, Img, LinkButton, newTab, safeUrl } from "./helpers.js";
import type { BlockDefinition } from "./types.js";
import { popupVideoEmbed } from "./youtube.js";

/**
 * Blocos do tema Marketplace (vitrine de produtos digitais escura, gradiente laranja→rosa). Todo texto,
 * imagem, link, quantidade e cor é prop editável; o visual vem de `renderer/marketplace.ts` (escopo `.sb-mk`).
 * `textMarquee` e `siteEmbed` são genéricos: o CSS básico deles fica em `renderer/styles.ts`.
 */
const str = (d = "") => z.string().default(d);
const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);
/** Cor digitada pelo usuário que vai para uma variável CSS: só `#rgb`/`#rrggbb` (vazio = cor do tema). */
const hexColor = z
  .string()
  .regex(/^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6})?$/)
  .default("")
  .catch("");

const paragraphs = (text: string) =>
  text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

/* ───────────────────────── hero / 404 ───────────────────────── */

const mkHero = defineBlock(
  z.object({
    background: str(),
    button2Label: str(),
    button2Url: str("#"),
    buttonLabel: str("Explorar"),
    buttonUrl: str("#"),
    decorA: str(),
    decorB: str(),
    image: str(),
    imageHover: str(),
    layout: z.enum(["hero", "error"]).default("hero").catch("hero"),
    level: z.enum(["h1", "h2"]).default("h1").catch("h1"),
    text: str(),
    title: str("Tudo o que você precisa, em um só lugar"),
  }),
  {
    fields: [
      {
        key: "layout",
        kind: "select",
        label: "Disposição",
        options: [
          {
            label: "Hero: foto inclinada à esquerda, texto à direita",
            value: "hero",
          },
          {
            label:
              "Cartão (página 404): texto à esquerda, arte apagada à direita",
            value: "error",
          },
        ],
      },
      { key: "title", kind: "textarea", label: "Título" },
      {
        key: "level",
        kind: "select",
        label: "Nível do título",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
        ],
      },
      {
        key: "text",
        kind: "textarea",
        label: "Texto (linha em branco separa parágrafos)",
      },
      { key: "buttonLabel", kind: "text", label: "Botão principal — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão principal — link" },
      {
        key: "button2Label",
        kind: "text",
        label: "Botão secundário — texto (vazio = sem botão)",
      },
      { key: "button2Url", kind: "url", label: "Botão secundário — link" },
      {
        key: "image",
        kind: "image",
        label: "Foto (hero) ou arte (404)",
        related: ["imageHover"],
      },
      {
        key: "imageHover",
        kind: "image",
        label: "Foto ao passar o mouse (hero; vazio = não troca)",
        related: ["image"],
      },
      { key: "background", kind: "image", label: "Textura de fundo" },
      {
        key: "decorA",
        kind: "image",
        label: "Enfeite 1 (linhas, canto inferior direito)",
      },
      {
        key: "decorB",
        kind: "image",
        label: "Enfeite 2 (linhas, canto superior direito)",
      },
    ],
    group: "content",
    label: "Hero do Marketplace",
    render: (p, ctx) => {
      const Tag = p.level;
      return (
        <section
          className={`sb-mk-hero v-${p.layout}`}
          style={{ "--mk-bg": cssUrl(p.background) } as CSSProperties}
        >
          <div className="sb-mk-hero-in">
            <div className="sb-mk-hero-media">
              <span aria-hidden="true" className="sb-mk-hero-band" />
              <Img alt="" className="sb-mk-hero-photo" src={p.image} />
              {/* Troca no hover (cross-fade): vem por último para não mudar os caminhos de estilo/efeito. */}
              {p.imageHover && p.layout === "hero" ? (
                <Img
                  alt=""
                  className="sb-mk-hero-photo sb-mk-hero-alt"
                  src={p.imageHover}
                />
              ) : null}
            </div>
            <div className="sb-mk-hero-text">
              <Tag>{p.title}</Tag>
              {/* Parágrafos agrupados: título, texto e botões têm sempre a mesma posição (efeitos por caminho). */}
              <div className="sb-mk-hero-copy">
                {paragraphs(p.text).map(t => (
                  <p key={t}>{t}</p>
                ))}
              </div>
              <div className="sb-mk-btns">
                <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
                <LinkButton
                  ctx={ctx}
                  label={p.button2Label}
                  url={p.button2Url}
                  variant="light"
                />
              </div>
            </div>
          </div>
          {p.decorA ? (
            <Img alt="" className="sb-mk-decor a" src={p.decorA} />
          ) : (
            <span hidden />
          )}
          {p.decorB ? (
            <Img alt="" className="sb-mk-decor b" src={p.decorB} />
          ) : (
            <span hidden />
          )}
        </section>
      );
    },
    type: "mkHero",
  }
);

/* ───────────────────── cartões (produtos / parceiros) ───────────────────── */

const mkCards = defineBlock(
  z.object({
    avatar: str(),
    columns: int(1, 4, 3),
    items: z
      .array(
        z.object({
          image: str(),
          linkLabel: str("Adquirir agora"),
          tag: str(),
          text: str(),
          title: str(),
          url: str("#"),
        })
      )
      .default([]),
  }),
  {
    fields: [
      {
        key: "columns",
        kind: "number",
        label: "Colunas no computador (1 a 4)",
      },
      {
        key: "avatar",
        kind: "image",
        label: "Imagem redonda do botão (todos os cartões)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem de fundo" },
          { key: "tag", kind: "text", label: "Etiqueta" },
          { key: "title", kind: "text", label: "Título" },
          { key: "text", kind: "textarea", label: "Texto" },
          { key: "linkLabel", kind: "text", label: "Texto do botão" },
          {
            key: "url",
            kind: "url",
            label: "Link (outro site abre em nova aba)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Cartões",
      },
    ],
    group: "content",
    label: "Cartões com foto (Marketplace)",
    render: (p, ctx) => (
      <section className="sb-container sb-mk-cards">
        <div
          className="sb-mk-cards-grid"
          style={{ "--mk-cols": p.columns } as CSSProperties}
        >
          {p.items.map((it, i) => (
            <a
              className="sb-mk-card"
              href={href(ctx, it.url)}
              key={it.title + i}
              {...newTab(it.url)}
            >
              <div className="sb-mk-card-in">
                <Img alt="" className="sb-mk-card-img" src={it.image} />
                {it.tag ? (
                  <span className="sb-mk-tag">{it.tag}</span>
                ) : (
                  <span hidden />
                )}
                <div className="sb-mk-card-body">
                  <h3>{it.title}</h3>
                  {it.text ? <p>{it.text}</p> : null}
                  {it.linkLabel ? (
                    <span className="sb-mk-pill">
                      {p.avatar ? <Img alt="" src={p.avatar} /> : null}
                      <span>{it.linkLabel}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    ),
    type: "mkCards",
  }
);

/* ───────────────────────── ranking ───────────────────────── */

const mkRank = defineBlock(
  z.object({
    badge: str("🔥"),
    columns: int(1, 6, 5),
    items: z
      .array(z.object({ image: str(), title: str(), url: str("#") }))
      .default([]),
  }),
  {
    fields: [
      {
        key: "columns",
        kind: "number",
        label: "Colunas no computador (1 a 6)",
      },
      {
        key: "badge",
        kind: "text",
        label: "Selo sobre a miniatura (emoji; vazio = sem selo)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Miniatura" },
          { key: "title", kind: "text", label: "Nome" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Itens (numerados na ordem: 01, 02…)",
      },
    ],
    group: "content",
    label: "Ranking numerado (Marketplace)",
    render: (p, ctx) => (
      <section className="sb-container sb-mk-rank">
        <ol
          className="sb-mk-rank-list"
          style={{ "--mk-cols": p.columns } as CSSProperties}
        >
          {p.items.map((it, i) => (
            <li key={it.title + i}>
              <a href={href(ctx, it.url)} {...newTab(it.url)}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span className="th">
                  <Img alt="" src={it.image} />
                  {p.badge ? <i aria-hidden="true">{p.badge}</i> : null}
                </span>
                <strong>{it.title}</strong>
              </a>
            </li>
          ))}
        </ol>
      </section>
    ),
    type: "mkRank",
  }
);

/* ───────────────────────── letreiro ───────────────────────── */

const textMarquee = defineBlock(
  z.object({
    color: hexColor,
    direction: z.enum(["left", "right"]).default("left").catch("left"),
    items: z.array(z.object({ text: str() })).default([]),
    seconds: int(5, 300, 55),
    separator: str("·"),
    size: int(16, 400, 200),
    sizeMobile: int(12, 200, 60),
    sizeTablet: int(12, 300, 90),
  }),
  {
    fields: [
      {
        itemFields: [{ key: "text", kind: "text", label: "Frase" }],
        key: "items",
        kind: "list",
        label: "Frases",
      },
      { key: "separator", kind: "text", label: "Separador entre as frases" },
      {
        key: "seconds",
        kind: "number",
        label: "Segundos para uma volta (5–300)",
      },
      {
        key: "direction",
        kind: "select",
        label: "Direção",
        options: [
          { label: "Para a esquerda", value: "left" },
          { label: "Para a direita", value: "right" },
        ],
      },
      {
        key: "color",
        kind: "color",
        label: "Cor do texto (vazio = cor principal do tema)",
      },
      {
        key: "size",
        kind: "number",
        label: "Tamanho da letra no computador (px)",
      },
      { key: "sizeTablet", kind: "number", label: "Tamanho no tablet (px)" },
      { key: "sizeMobile", kind: "number", label: "Tamanho no celular (px)" },
    ],
    group: "media",
    label: "Letreiro de texto",
    render: (p, ctx) => {
      const group = (hidden: boolean) => (
        <span aria-hidden={hidden || undefined} className="sb-tmq-group">
          {p.items.map((it, i) => (
            <span key={it.text + i}>
              <span className="sb-tmq-item">{it.text}</span>
              {p.separator ? (
                <span className="sb-tmq-sep">{p.separator}</span>
              ) : null}
            </span>
          ))}
        </span>
      );
      return (
        <div
          className={`sb-tmq dir-${p.direction}`}
          style={
            {
              "--tmq-color": p.color || "var(--sb-accent)",
              "--tmq-d": `${p.size}px`,
              "--tmq-dur": `${p.seconds}s`,
              "--tmq-m": `${p.sizeMobile}px`,
              "--tmq-t": `${p.sizeTablet}px`,
            } as CSSProperties
          }
        >
          {/* No editor fica parado e sem a cópia (que só existe para o laço não ter emenda). */}
          <div
            className={
              ctx.mode === "edit" ? "sb-tmq-track is-still" : "sb-tmq-track"
            }
          >
            {group(false)}
            {ctx.mode === "edit" ? null : group(true)}
          </div>
        </div>
      );
    },
    type: "textMarquee",
  }
);

/* ───────────────────────── banner de título ───────────────────────── */

const mkBanner = defineBlock(
  z.object({
    leftImage: str(),
    rightImage: str(),
    title: str(),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título (vazio = nome da categoria ou do post aberto)",
      },
      { key: "leftImage", kind: "image", label: "Foto da esquerda" },
      { key: "rightImage", kind: "image", label: "Foto da direita" },
    ],
    group: "layout",
    label: "Banner de título (Marketplace)",
    render: (p, ctx) => (
      <section className="sb-mk-banner">
        <div className="side l">
          <Img alt="" src={p.leftImage} />
        </div>
        <div className="mid">
          <h1>
            {p.title ||
              ctx.current.category?.name ||
              ctx.current.post?.title ||
              ""}
          </h1>
        </div>
        <div className="side r">
          <Img alt="" src={p.rightImage} />
        </div>
      </section>
    ),
    type: "mkBanner",
  }
);

/* ───────────────────────── capa de vídeo ───────────────────────── */

const mkVideo = defineBlock(
  z.object({
    image: str(),
    playLabel: str("Assistir ao vídeo"),
    videoUrl: str(),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem de capa" },
      {
        key: "videoUrl",
        kind: "url",
        label: "Vídeo do botão de play (YouTube ou Vimeo; abre em popup)",
      },
      {
        key: "playLabel",
        kind: "text",
        label: "Texto do botão para leitores de tela",
      },
    ],
    group: "media",
    label: "Capa de vídeo com play",
    render: p => (
      <section className="sb-container sb-mk-video">
        <div
          className="sb-mk-video-box"
          style={{ backgroundImage: cssUrl(p.image) }}
        >
          {p.videoUrl ? (
            <a
              aria-label={p.playLabel || "Assistir ao vídeo"}
              className="sb-mk-play"
              data-sb-video={popupVideoEmbed(p.videoUrl) ?? undefined}
              href={safeUrl(p.videoUrl)}
              rel="noopener"
              target="_blank"
            >
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
              <span className="sb-mk-sr">
                {p.playLabel || "Assistir ao vídeo"}
              </span>
            </a>
          ) : null}
        </div>
      </section>
    ),
    type: "mkVideo",
  }
);

/* ───────────────────────── site incorporado ───────────────────────── */

/** Só páginas http(s) entram no `iframe` (nada de `javascript:`/`data:`). */
const embeddable = (url: string) =>
  /^https?:\/\//i.test(url.trim()) ? url.trim() : "";

const siteEmbed = defineBlock(
  z.object({
    height: int(200, 4000, 900),
    linkLabel: str("Abrir o site em nova aba"),
    title: str("Site do produto"),
    url: str(),
  }),
  {
    fields: [
      { key: "url", kind: "url", label: "Endereço do site (https://…)" },
      { key: "height", kind: "number", label: "Altura em px (200–4000)" },
      { key: "title", kind: "text", label: "Título (para leitores de tela)" },
      {
        key: "linkLabel",
        kind: "text",
        label: "Texto do link para abrir fora (vazio = sem link)",
      },
    ],
    group: "media",
    label: "Site incorporado (iframe)",
    render: p => {
      const src = embeddable(p.url);
      return (
        <section className="sb-embed">
          {src ? (
            <iframe
              height={p.height}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              src={src}
              style={{ height: `${p.height}px` }}
              title={p.title || "Site incorporado"}
            />
          ) : (
            <div className="sb-embed-empty">
              Informe o endereço do site (https://…)
            </div>
          )}
          {src && p.linkLabel ? (
            <p className="sb-embed-link">
              <a href={src} rel="noopener noreferrer" target="_blank">
                {p.linkLabel}
              </a>
            </p>
          ) : null}
        </section>
      );
    },
    type: "siteEmbed",
  }
);

export const marketplaceBlocks: BlockDefinition[] = [
  mkHero,
  mkCards,
  mkRank,
  textMarquee,
  mkBanner,
  mkVideo,
  siteEmbed,
];
