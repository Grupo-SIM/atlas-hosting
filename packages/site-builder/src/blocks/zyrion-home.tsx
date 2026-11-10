import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  href,
  Img,
  postPath,
  wpDate,
} from "./helpers.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import {
  int,
  LIST_DEFAULTS,
  shortDate,
  str,
  ZyCard,
  ZyList,
  zyAuthor,
  zyPosts,
} from "./zyrion-lib.js";

/** Blocos de seção do tema Zyrion: destaque, em alta, caixas, grade escura, tiles, carrossel e contêineres. */

const CAT: FieldDef = {
  key: "categorySlug",
  kind: "text",
  label: "Categoria (endereço; vazio = todas)",
};

type Post = ReturnType<typeof zyPosts>[number];

const Dot = () => <i className="zy-dot">•</i>;

/* ───────────────────────── destaque (slider + ticker + lista) ───────────────────────── */

const zyHero = defineBlock(
  z.object({
    categorySlug: str(),
    listCount: int(1, 12, 6),
    sliderCount: int(1, 12, 6),
    tickerCount: int(1, 20, 10),
    tickerLabel: str("ÚLTIMAS NOTÍCIAS"),
    tickerSeconds: int(10, 300, 80),
  }),
  {
    fields: [
      CAT,
      { key: "sliderCount", kind: "number", label: "Slides do destaque" },
      { key: "tickerLabel", kind: "text", label: "Texto do letreiro" },
      { key: "tickerCount", kind: "number", label: "Notícias no letreiro" },
      {
        key: "tickerSeconds",
        kind: "number",
        label: "Segundos por volta do letreiro",
      },
      { key: "listCount", kind: "number", label: "Posts na lista preta" },
    ],
    group: "blog",
    label: "Destaque Zyrion (slider + letreiro + lista)",
    render: (p, ctx) => {
      const slides = zyPosts(ctx, p.categorySlug, 0, p.sliderCount, true);
      const ticker = zyPosts(ctx, p.categorySlug, 0, p.tickerCount, true);
      const list = zyPosts(
        ctx,
        p.categorySlug,
        p.sliderCount,
        p.listCount,
        true
      );
      return (
        <section className="zy-sec zy-hero" data-zy="hero">
          <div className="zy-in zy-hero-in">
            <div className="zy-hero-l">
              <div
                className="zy-slider"
                data-delay="5000"
                data-speed="800"
                data-zy-slider
              >
                <div className="zy-sl-vp">
                  <div className="zy-sl-track">
                    {slides.map(post => {
                      const cat = categoryOf(ctx.site, post);
                      return (
                        <article className="zy-slide" key={post.id}>
                          <a
                            className="zy-sl-img"
                            href={href(ctx, postPath(post))}
                          >
                            <Img alt="" src={post.coverImage} />
                            <span className="zy-sl-date">
                              {shortDate(post.publishedAt)}
                            </span>
                          </a>
                          <div className="zy-sl-body">
                            <div className="zy-sl-info">
                              {cat ? (
                                <a href={href(ctx, categoryPath(cat))}>
                                  {cat.name}
                                </a>
                              ) : null}
                              <i>/</i>
                              <a href={href(ctx, "/")}>{zyAuthor(ctx)}</a>
                            </div>
                            <h2>
                              <a href={href(ctx, postPath(post))}>
                                {post.title}
                              </a>
                            </h2>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="zy-tick-wrap">
                <div className="zy-tick">
                  <span className="zy-tick-label">{p.tickerLabel}</span>
                  <div className="zy-tick-vp">
                    <div
                      className={
                        ctx.mode === "edit"
                          ? "zy-tick-track still"
                          : "zy-tick-track"
                      }
                      style={{ animationDuration: `${p.tickerSeconds}s` }}
                    >
                      {ticker.map(post => (
                        <a href={href(ctx, postPath(post))} key={post.id}>
                          {post.title}
                          <Dot />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="zy-hero-r">
              <ZyList
                ctx={ctx}
                opts={{
                  ...LIST_DEFAULTS,
                  colsMobile: 1,
                  colsTablet: 2,
                  dark: "yes",
                  ratio: 0.8,
                  showAuthor: "no",
                }}
                posts={list}
              />
            </div>
          </div>
        </section>
      );
    },
    type: "zyHero",
  }
);

/* ───────────────────────── em alta ───────────────────────── */

const zyTrending = defineBlock(
  z.object({
    categorySlug: str(),
    largeCount: int(1, 6, 2),
    smallCount: int(1, 12, 4),
    title: str("Em alta"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título do divisor" },
      CAT,
      {
        key: "largeCount",
        kind: "number",
        label: "Cartões grandes (coluna esquerda)",
      },
      {
        key: "smallCount",
        kind: "number",
        label: "Cartões pequenos (coluna direita)",
      },
    ],
    group: "blog",
    label: "Em alta (cartões grandes + pequenos)",
    render: (p, ctx) => {
      const big = zyPosts(ctx, p.categorySlug, 0, p.largeCount, true);
      const small = zyPosts(
        ctx,
        p.categorySlug,
        p.largeCount,
        p.smallCount,
        true
      );
      return (
        <section className="zy-sec zy-trend" data-zy="trending">
          <div className="zy-in zy-pad">
            <div className="zy-div">
              <h2>{p.title}</h2>
            </div>
            <div className="zy-trend-row">
              <div className="zy-grid zy-trend-l">
                {big.map(post => (
                  <ZyCard ctx={ctx} key={post.id} post={post} variant="large" />
                ))}
              </div>
              <div className="zy-grid zy-trend-r">
                {small.map(post => (
                  <ZyCard ctx={ctx} key={post.id} post={post} variant="small" />
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "zyTrending",
  }
);

/* ───────────────────────── caixas por categoria ───────────────────────── */

const boxItem = z.object({
  buttonLabel: str("Ver todas"),
  categorySlug: str(),
  offset: int(0, 200, 0),
  title: str(),
});

const zyCatBoxes = defineBlock(
  z.object({
    boxes: z.array(boxItem).default([]),
    count: int(1, 8, 3),
  }),
  {
    fields: [
      { key: "count", kind: "number", label: "Posts por caixa" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título do divisor" },
          CAT,
          {
            key: "offset",
            kind: "number",
            label: "Pular os primeiros N posts",
          },
          {
            key: "buttonLabel",
            kind: "text",
            label: "Texto do botão (vazio = sem botão)",
          },
        ],
        key: "boxes",
        kind: "list",
        label: "Caixas (2 por linha)",
      },
    ],
    group: "blog",
    label: "Caixas por categoria (2 × 2)",
    render: (p, ctx) => (
      <section className="zy-sec zy-boxes" data-zy="boxes">
        <div className="zy-in zy-pad zy-boxes-grid">
          {p.boxes.map(b => {
            const cat = ctx.site.categories.find(
              c => c.slug === b.categorySlug
            );
            return (
              <div className="zy-box" key={b.title + b.categorySlug}>
                <div className="zy-div">
                  <h2>{b.title}</h2>
                </div>
                <ZyList
                  ctx={ctx}
                  opts={{ ...LIST_DEFAULTS, colsTablet: 2, showAuthor: "yes" }}
                  posts={zyPosts(ctx, b.categorySlug, b.offset, p.count, true)}
                />
                {b.buttonLabel ? (
                  <a
                    className="zy-btn"
                    href={href(ctx, cat ? categoryPath(cat) : "/")}
                  >
                    {b.buttonLabel}
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    ),
    type: "zyCatBoxes",
  }
);

/* ───────────────────────── cartões de imagem de fundo (grade escura) ───────────────────────── */

const UserIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="14"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const ClockIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="14"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

function OverlayCard({
  ctx,
  post,
  wide,
}: {
  ctx: RenderContext;
  post: Post;
  wide?: boolean;
}) {
  const cat = categoryOf(ctx.site, post);
  return (
    <a
      className={wide ? "zy-ov wide" : "zy-ov"}
      href={href(ctx, postPath(post))}
      style={{ "--zy-bg": cssUrl(post.coverImage ?? "") } as CSSProperties}
    >
      {cat ? <span className="zy-ov-badge">{cat.name}</span> : <span />}
      <span className="zy-ov-text">
        <strong>{post.title}</strong>
        <span className="zy-ov-meta">
          <span>
            <UserIcon /> {zyAuthor(ctx)}
          </span>
          <span>
            <ClockIcon /> {wpDate(post.publishedAt)}
          </span>
        </span>
      </span>
    </a>
  );
}

const zyOverlayGrid = defineBlock(
  z.object({
    categorySlug: str(),
    cols: int(1, 4, 3),
    limit: int(1, 24, 6),
    offset: int(0, 200, 0),
    title: str("Tecnologia"),
    wideIndex: z.coerce.number().int().min(-1).max(23).default(-1).catch(-1),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título do divisor" },
      CAT,
      { key: "limit", kind: "number", label: "Quantidade de posts" },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
      {
        key: "cols",
        kind: "number",
        label: "Colunas no desktop (tablet 2, celular 1)",
      },
      {
        key: "wideIndex",
        kind: "number",
        label: "Item largo (posição 0, 1, 2…; -1 = nenhum)",
      },
    ],
    group: "blog",
    label: "Grade escura com imagem de fundo",
    render: (p, ctx) => (
      <section className="zy-sec zy-dark-sec" data-zy="overlayGrid">
        <div className="zy-in zy-pad">
          <div className="zy-div dark">
            <h2>{p.title}</h2>
          </div>
          <div
            className="zy-ov-grid"
            style={{ "--zy-cols": p.cols } as CSSProperties}
          >
            {zyPosts(ctx, p.categorySlug, p.offset, p.limit, true).map(
              (post, i) => (
                <OverlayCard
                  ctx={ctx}
                  key={post.id}
                  post={post}
                  wide={i === p.wideIndex}
                />
              )
            )}
          </div>
        </div>
      </section>
    ),
    type: "zyOverlayGrid",
  }
);

/* ───────────────────────── cartões simples (esportes) ───────────────────────── */

const zyCards = defineBlock(
  z.object({
    categorySlug: str(),
    cols: int(1, 4, 2),
    gap: int(0, 80, 28),
    limit: int(1, 24, 6),
    offset: int(0, 200, 0),
    title: str("Esportes"),
    variant: z
      .enum(["plain", "large", "small"])
      .default("plain")
      .catch("plain"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título do divisor (vazio = sem divisor)",
      },
      CAT,
      { key: "limit", kind: "number", label: "Quantidade de posts" },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
      { key: "cols", kind: "number", label: "Colunas (celular 1)" },
      { key: "gap", kind: "number", label: "Espaço entre cartões (px)" },
      {
        key: "variant",
        kind: "select",
        label: "Estilo do cartão",
        options: [
          { label: "Simples (imagem, título, data)", value: "plain" },
          { label: "Grande (selo, resumo, ler mais)", value: "large" },
          { label: "Pequeno (selo, título)", value: "small" },
        ],
      },
    ],
    group: "blog",
    label: "Cartões de notícias (Zyrion)",
    render: (p, ctx) => (
      <div data-zy="cards">
        {p.title ? (
          <div className="zy-div">
            <h2>{p.title}</h2>
          </div>
        ) : null}
        <div
          className="zy-grid zy-cards-grid"
          style={
            { "--zy-cols": p.cols, "--zy-gap": `${p.gap}px` } as CSSProperties
          }
        >
          {zyPosts(ctx, p.categorySlug, p.offset, p.limit, true).map(post => (
            <ZyCard ctx={ctx} key={post.id} post={post} variant={p.variant} />
          ))}
        </div>
      </div>
    ),
    type: "zyCards",
  }
);

/* ───────────────────────── tiles de categoria ───────────────────────── */

const tileItem = z.object({ image: str(), label: str(), url: str("#") });

const zyCategoryTiles = defineBlock(
  z.object({ items: z.array(tileItem).default([]) }),
  {
    fields: [
      {
        itemFields: [
          { key: "label", kind: "text", label: "Rótulo" },
          { key: "url", kind: "url", label: "Link" },
          { key: "image", kind: "image", label: "Imagem de fundo" },
        ],
        key: "items",
        kind: "list",
        label: "Tiles",
      },
    ],
    group: "content",
    label: "Tiles de categoria (zoom ao passar o mouse)",
    render: (p, ctx) => (
      <div className="zy-tiles" data-zy="tiles">
        {p.items.map(t => (
          <a className="zy-tile" href={href(ctx, t.url)} key={t.label + t.url}>
            <span
              className="zy-tile-bg"
              style={{ backgroundImage: cssUrl(t.image) }}
            />
            <span className="zy-tile-veil" />
            <h3>{t.label}</h3>
          </a>
        ))}
      </div>
    ),
    type: "zyCategoryTiles",
  }
);

/* ───────────────────────── carrossel de cartões escuros ───────────────────────── */

const zyCarousel = defineBlock(
  z.object({
    categorySlug: str(),
    limit: int(2, 24, 9),
    offset: int(0, 200, 0),
  }),
  {
    fields: [
      CAT,
      { key: "limit", kind: "number", label: "Quantidade de posts" },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
    ],
    group: "blog",
    label: "Carrossel de cartões escuros",
    render: (p, ctx) => (
      <section className="zy-sec zy-car" data-zy="carousel" data-zy-car>
        <div className="zy-car-vp">
          <div className="zy-car-track">
            {zyPosts(ctx, p.categorySlug, p.offset, p.limit, true).map(post => (
              <OverlayCard ctx={ctx} key={post.id} post={post} />
            ))}
          </div>
          <div className="zy-car-nav">
            <button aria-label="Anterior" type="button">
              ‹
            </button>
            <button aria-label="Próximo" type="button">
              ›
            </button>
          </div>
        </div>
      </section>
    ),
    type: "zyCarousel",
  }
);

/* ───────────────────────── contêineres ───────────────────────── */

const zySplit = defineBlock(
  z.object({
    gap: int(0, 120, 60),
    left: int(20, 80, 72),
  }),
  {
    fields: [
      {
        key: "left",
        kind: "number",
        label: "Largura da 1ª coluna em % (no celular e tablet empilha)",
      },
      { key: "gap", kind: "number", label: "Espaço entre colunas (px)" },
    ],
    group: "layout",
    label: "Duas colunas (Zyrion)",
    render: (p, _ctx, children) => (
      <section className="zy-sec zy-split" data-zy="split">
        <div
          className="zy-in zy-pad zy-split-in"
          style={
            {
              "--zy-gap": `${p.gap}px`,
              "--zy-left": p.left / 100,
            } as CSSProperties
          }
        >
          <div className="zy-split-a">{children[0]}</div>
          <div className="zy-split-b">{children[1]}</div>
        </div>
      </section>
    ),
    type: "zySplit",
  }
);

const zyStack = defineBlock(z.object({ gap: int(0, 80, 12) }), {
  fields: [
    { key: "gap", kind: "number", label: "Espaço entre os blocos (px)" },
  ],
  group: "layout",
  label: "Pilha vertical (Zyrion)",
  render: (p, _ctx, children) => (
    <div
      className="zy-stack"
      data-zy="stack"
      style={{ "--zy-gap": `${p.gap}px` } as CSSProperties}
    >
      {children}
    </div>
  ),
  type: "zyStack",
});

const zyBox = defineBlock(
  z.object({
    mobilePad: int(0, 80, 20),
    pad: int(0, 80, 36),
    title: str(),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título (divisor; vazio = sem divisor)",
      },
      { key: "pad", kind: "number", label: "Respiro interno (px)" },
      {
        key: "mobilePad",
        kind: "number",
        label: "Respiro interno no celular (px)",
      },
    ],
    group: "layout",
    label: "Caixa com gradiente (Zyrion)",
    render: (p, _ctx, children) => (
      <div
        className="zy-gbox"
        data-zy="box"
        style={
          {
            "--zy-pad": `${p.pad}px`,
            "--zy-pad-m": `${p.mobilePad}px`,
          } as CSSProperties
        }
      >
        {p.title ? (
          <div className="zy-div thin">
            <h2>{p.title}</h2>
          </div>
        ) : null}
        {children}
      </div>
    ),
    type: "zyBox",
  }
);

const zyCategoryMenu = defineBlock(z.object({}), {
  fields: [],
  group: "blog",
  label: "Menu de categorias (Zyrion)",
  render: (_p, ctx) => (
    <nav className="zy-catmenu" data-zy="catmenu">
      {ctx.site.categories.map(c => (
        <a
          aria-current={ctx.current.category?.id === c.id ? "page" : undefined}
          href={href(ctx, categoryPath(c))}
          key={c.id}
        >
          {c.name}
        </a>
      ))}
    </nav>
  ),
  type: "zyCategoryMenu",
});

const zyNewsletter = defineBlock(
  z.object({
    actionUrl: str(),
    buttonLabel: str("inscreva-se"),
    note: str(
      'Ao clicar no botão "Inscreva-se", você confirma que leu nossa Política de Privacidade.'
    ),
    placeholder: str("Seu e-mail"),
  }),
  {
    fields: [
      { key: "placeholder", kind: "text", label: "Texto do campo" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "note", kind: "textarea", label: "Aviso abaixo do botão" },
      {
        key: "actionUrl",
        kind: "url",
        label: "URL que recebe o e-mail (vazio = formulário desabilitado)",
      },
    ],
    group: "content",
    label: "Inscrição por e-mail (Zyrion)",
    render: (p, ctx) => {
      const off = !p.actionUrl;
      return (
        <form
          action={off ? undefined : href(ctx, p.actionUrl)}
          className="zy-news"
          data-zy="newsletter"
          method="post"
        >
          <input
            aria-label={p.placeholder}
            disabled={off}
            name="email"
            placeholder={p.placeholder}
            type="email"
          />
          <button disabled={off} type="submit">
            {p.buttonLabel}
          </button>
          <small>
            {off && ctx.mode === "edit"
              ? "Defina a URL de envio no painel para ativar o formulário."
              : p.note}
          </small>
        </form>
      );
    },
    type: "zyNewsletter",
  }
);

export const zyrionHomeBlocks: BlockDefinition[] = [
  zyHero,
  zyTrending,
  zyCatBoxes,
  zyOverlayGrid,
  zyCards,
  zyCategoryTiles,
  zyCarousel,
  zySplit,
  zyStack,
  zyBox,
  zyCategoryMenu,
  zyNewsletter,
];
