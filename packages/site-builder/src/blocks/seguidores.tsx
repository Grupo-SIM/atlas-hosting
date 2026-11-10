import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import type { Post } from "../model/index.js";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  formatDate,
  href,
  Img,
  newTab,
  postPath,
  SocialIcon,
  visiblePosts,
} from "./helpers.js";
import type { BlockDefinition, RenderContext } from "./types.js";

/**
 * Blocos do tema Seguidores em Alta (blog de marketing claro, roxo `#6F4CCE` e marca-texto amarelo). Todo texto,
 * imagem, link e item é prop editável; o visual vem de `renderer/seguidores.ts` (escopo `.sb-sg`). Os caminhos de
 * efeito (`Block.fx`) do template dependem da ordem dos filhos de cada bloco — veja o comentário de cada um.
 */
const str = (d = "") => z.string().default(d);
const yesNo = (d: "yes" | "no") => z.enum(["yes", "no"]).default(d).catch(d);
const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

const bg = (name: string, url: string) =>
  ({ [name]: cssUrl(url) }) as CSSProperties;

/** `[[palavra]]` vira marca-texto; o resto é texto puro. */
export function Hl({ text }: { text: string }): ReactNode {
  const parts: ReactNode[] = [];
  const re = /\[\[(.+?)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null = re.exec(text);
  while (m) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <span className="sg-hl" key={m.index}>
        {m[1]}
      </span>
    );
    last = m.index + m[0].length;
    m = re.exec(text);
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Linhas `Texto | endereço` (a parte do endereço é opcional). */
export function linkLines(text: string): { label: string; url: string }[] {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      const [label, ...rest] = l.split("|");
      return { label: label.trim(), url: rest.join("|").trim() || "#" };
    });
}

const samePath = (link: string, path: string | undefined) => {
  if (!path || !link.startsWith("/") || link.startsWith("//")) return false;
  const norm = (s: string) =>
    `/${s.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "")}`;
  return norm(link) === norm(path);
};

const words = (text: string, n: number) => {
  const w = text.trim().split(/\s+/);
  return w.length <= n ? w.join(" ") : `${w.slice(0, n).join(" ")}...`;
};

const level = z.enum(["h1", "h2", "h3"]).default("h2").catch("h2");
const LEVELS = [
  { label: "Título 1", value: "h1" },
  { label: "Título 2", value: "h2" },
  { label: "Título 3", value: "h3" },
];

function Tag({ as, children }: { as: string; children: ReactNode }) {
  if (as === "h1") return <h1>{children}</h1>;
  if (as === "h3") return <h3>{children}</h3>;
  return <h2>{children}</h2>;
}

/* ───────────────────────── cabeçalho ───────────────────────── */

/** Filhos: 1 = `header.sg-head` → 1.1 = barra → 1.1.1 = logo. */
const sgHeader = defineBlock(
  z.object({ logo: str(), logoAlt: str("Logo"), logoUrl: str("/") }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoAlt", kind: "text", label: "Texto alternativo da logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
    ],
    group: "layout",
    label: "Cabeçalho Seguidores em Alta",
    render: (p, ctx) => (
      <header className="sg-head">
        {/* biome-ignore lint/correctness/useUniqueElementIds: o menu do celular usa o label for=id; há um só cabeçalho por página */}
        <input
          aria-label="Abrir menu"
          className="sb-burger-input"
          id="sb-burger"
          type="checkbox"
        />
        <div className="sg-head-in">
          <div className="sg-logo">
            <a href={href(ctx, p.logoUrl)}>
              <Img alt={p.logoAlt} src={p.logo} />
            </a>
          </div>
          <label className="sg-burger" htmlFor="sb-burger">
            <i />
            <i />
            <i />
          </label>
          <nav className="sg-nav">
            {ctx.site.menu.map(item => (
              <a
                aria-current={
                  samePath(item.href, ctx.path) ? "page" : undefined
                }
                href={href(ctx, item.href)}
                key={item.href + item.label}
                {...newTab(item.href)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
    ),
    type: "sgHeader",
  }
);

/* ───────────────────────── título com marca-texto ───────────────────────── */

const sgHeading = defineBlock(
  z.object({
    align: z.enum(["left", "center"]).default("left").catch("left"),
    color: z.enum(["dark", "white"]).default("dark").catch("dark"),
    level,
    text: str("Título com [[destaque]]"),
  }),
  {
    fields: [
      {
        key: "text",
        kind: "textarea",
        label: "Título ([[palavra]] = marca-texto amarelo)",
      },
      { key: "level", kind: "select", label: "Nível", options: LEVELS },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento",
        options: [
          { label: "Esquerda", value: "left" },
          { label: "Centro", value: "center" },
        ],
      },
      {
        key: "color",
        kind: "select",
        label: "Cor do texto",
        options: [
          { label: "Preto", value: "dark" },
          { label: "Branco", value: "white" },
        ],
      },
    ],
    group: "content",
    label: "Título com marca-texto",
    render: p => (
      <div
        className={`sg-heading ${p.align === "center" ? "center" : ""} ${p.color === "white" ? "white" : ""}`}
      >
        <Tag as={p.level}>
          <Hl text={p.text} />
        </Tag>
      </div>
    ),
    type: "sgHeading",
  }
);

/* ───────────────────────── Lottie (genérico) ───────────────────────── */

const LOTTIE_URL = /^(https?:\/\/|\/)[^\s"'<>]+$/;

/** O player só é baixado pelo `fx-runtime` quando a página tem `[data-sb-lottie]`; no editor e sem JS é um quadro. */
const lottie = defineBlock(
  z.object({
    autoplay: yesNo("yes"),
    loop: yesNo("yes"),
    ratio: z.coerce.number().min(0.2).max(5).default(1).catch(1),
    speed: z.coerce.number().min(0.1).max(4).default(1).catch(1),
    url: str(),
    width: z.coerce.number().min(5).max(100).default(100).catch(100),
  }),
  {
    fields: [
      {
        key: "url",
        kind: "text",
        label: "Endereço do arquivo JSON da animação",
      },
      { key: "loop", kind: "select", label: "Repetir", options: YES_NO },
      {
        key: "autoplay",
        kind: "select",
        label: "Tocar sozinha",
        options: YES_NO,
      },
      { key: "speed", kind: "number", label: "Velocidade (1 = normal)" },
      { key: "ratio", kind: "number", label: "Proporção largura ÷ altura" },
      { key: "width", kind: "number", label: "Largura em %" },
    ],
    group: "media",
    label: "Animação Lottie",
    render: (p, ctx) => <LottieBox ctx={ctx} p={p} />,
    type: "lottie",
  }
);

function LottieBox({
  ctx,
  p,
}: {
  ctx: RenderContext;
  p: {
    autoplay: string;
    loop: string;
    ratio: number;
    speed: number;
    url: string;
    width: number;
  };
}) {
  const ok = LOTTIE_URL.test(p.url);
  const style = { aspectRatio: String(p.ratio), width: `${p.width}%` };
  if (!ok || ctx.mode === "edit")
    return (
      <div className="sb-lottie" style={style}>
        <div className="sb-lottie-ph">Animação Lottie</div>
      </div>
    );
  return (
    <div
      className="sb-lottie"
      data-autoplay={p.autoplay}
      data-loop={p.loop}
      data-sb-lottie={p.url}
      data-speed={p.speed}
      style={style}
    />
  );
}

const lottieProps = (url: string, ratio = 1) => ({ ratio, url });

/* ───────────────────────── hero ───────────────────────── */

/**
 * Filhos: 1 `section` → 1.1 linha → 1.1.1 texto (1 título, 2 parágrafo, 3 botão) e 1.1.2 composição
 * (1 Lottie de cima, 2 foto, 3 Lottie de baixo).
 */
const sgHero = defineBlock(
  z.object({
    buttonLabel: str("Ver todos os posts"),
    buttonUrl: str("/todos-os-posts/"),
    lottie1: str(),
    lottie1Ratio: z.coerce.number().min(0.2).max(5).default(1).catch(1),
    lottie2: str(),
    lottie2Ratio: z.coerce.number().min(0.2).max(5).default(1).catch(1),
    overlay: str(),
    photo: str(),
    text: str(),
    title: str("Título do [[hero]]"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título ([[palavra]] = marca-texto)",
      },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      {
        key: "overlay",
        kind: "image",
        label: "Imagem de fundo (canto inferior direito)",
      },
      { key: "photo", kind: "image", label: "Foto" },
      { key: "lottie1", kind: "text", label: "Animação de cima (JSON Lottie)" },
      {
        key: "lottie1Ratio",
        kind: "number",
        label: "Animação de cima — proporção largura ÷ altura",
      },
      {
        key: "lottie2",
        kind: "text",
        label: "Animação de baixo (JSON Lottie)",
      },
      {
        key: "lottie2Ratio",
        kind: "number",
        label: "Animação de baixo — proporção largura ÷ altura",
      },
    ],
    group: "content",
    label: "Hero Seguidores em Alta",
    render: (p, ctx) => (
      <section className="sg-hero" style={bg("--sg-ov", p.overlay)}>
        <div className="sg-hero-in">
          <div className="sg-hero-copy">
            <h1>
              <Hl text={p.title} />
            </h1>
            <p className="sg-hero-text">{p.text}</p>
            <div className="sg-hero-btn">
              {p.buttonLabel ? (
                <a
                  className="sg-btn"
                  href={href(ctx, p.buttonUrl)}
                  {...newTab(p.buttonUrl)}
                >
                  {p.buttonLabel}
                </a>
              ) : null}
            </div>
          </div>
          <div className="sg-hero-art">
            <LottieBox
              ctx={ctx}
              p={{
                autoplay: "yes",
                loop: "yes",
                speed: 1,
                width: 100,
                ...lottieProps(p.lottie1, p.lottie1Ratio),
              }}
            />
            <Img className="sg-hero-photo" src={p.photo} />
            <LottieBox
              ctx={ctx}
              p={{
                autoplay: "yes",
                loop: "yes",
                speed: 1,
                width: 100,
                ...lottieProps(p.lottie2, p.lottie2Ratio),
              }}
            />
          </div>
        </div>
      </section>
    ),
    type: "sgHero",
  }
);

/* ───────────────────────── grade de posts ───────────────────────── */

const LAYOUTS = [
  { label: "Cartão simples (imagem, título, resumo)", value: "card" },
  { label: "Lateral: título em 2 linhas e “Ler mais” em texto", value: "side" },
  { label: "Cartão roxo com botão amarelo", value: "dark" },
  { label: "Listagem: categoria, resumo e botão em pílula", value: "list" },
  { label: "Arquivo: etiqueta, título e “Ler mais »”", value: "archive" },
];

function pickPosts(
  all: Post[],
  p: {
    source: string;
    slugs: string;
    category: string;
    offset: number;
    limit: number;
  },
  ctx: RenderContext
): Post[] {
  let list = all;
  if (p.source === "picked") {
    const slugs = p.slugs.split(/[\s,]+/).filter(Boolean);
    list = slugs
      .map(s => all.find(x => x.slug === s))
      .filter((x): x is Post => !!x);
  } else if (p.source === "category") {
    const cat = ctx.site.categories.find(c => c.slug === p.category);
    list = cat ? all.filter(x => x.categoryId === cat.id) : [];
  } else if (p.source === "page") {
    const catId =
      ctx.current.category?.id ??
      ctx.site.categories.find(c => c.slug === ctx.query.category)?.id;
    const q = (ctx.query.q ?? "").toLowerCase();
    list = all.filter(
      x =>
        (!catId || x.categoryId === catId) &&
        (!q || `${x.title} ${x.excerpt}`.toLowerCase().includes(q))
    );
  }
  return list.slice(p.offset, p.limit > 0 ? p.offset + p.limit : undefined);
}

function SgCard({
  ctx,
  layout,
  moreLabel,
  post,
  showCategory,
  showSummary,
  summaryWords,
  hidden,
}: {
  ctx: RenderContext;
  hidden: boolean;
  layout: string;
  moreLabel: string;
  post: Post;
  showCategory: boolean;
  showSummary: boolean;
  summaryWords: number;
}) {
  const url = href(ctx, postPath(post));
  const cat = categoryOf(ctx.site, post);
  return (
    <article
      className={`sb-post-card sg-card sg-l-${layout}`}
      data-category={cat?.slug ?? ""}
      data-search={`${post.title} ${post.excerpt}`.slice(0, 4000)}
      data-sg-hide={hidden ? "" : undefined}
    >
      <a className="sg-thumb" href={url}>
        <Img alt={post.title} src={post.coverImage} />
        {layout === "archive" && cat ? (
          <span className="sg-badge">{cat.name}</span>
        ) : null}
      </a>
      <div className="sg-cbody">
        {showCategory && layout !== "archive" && cat ? (
          <a className="sg-cat" href={href(ctx, categoryPath(cat))}>
            {cat.name}
          </a>
        ) : null}
        <h3 className="sg-sc-title">
          <a href={url}>{post.title}</a>
        </h3>
        {showSummary ? (
          <p className="sg-sum">{words(post.excerpt, summaryWords)}</p>
        ) : null}
        {moreLabel ? (
          <a className="sg-more-link" href={url}>
            {moreLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Filhos: 1 `section` → 1.1 contêiner → (1.1.1 texto: 1 título, 2 parágrafo, quando há) → grade
 * (`.sg-grid-wrap`) → botão (`.sg-posts-cta`). Com texto: grade = 1.1.2 e botão = 1.1.3; sem texto: 1.1.1 e 1.1.2.
 */
const sgPostGrid = defineBlock(
  z.object({
    arrange: z.enum(["stack", "side"]).default("stack").catch("stack"),
    background: z.enum(["white", "soft"]).default("white").catch("white"),
    buttonLabel: str(),
    buttonUrl: str("/todos-os-posts/"),
    category: str(),
    columns: z.coerce.number().int().min(1).max(4).default(3).catch(3),
    emptyText: str("Nenhum post encontrado."),
    layout: z
      .enum(["card", "side", "dark", "list", "archive"])
      .default("card")
      .catch("card"),
    limit: z.coerce.number().int().min(0).max(100).default(6).catch(6),
    loadMore: z.coerce.number().int().min(0).max(50).default(0).catch(0),
    loadMoreLabel: str("Carregar mais"),
    moreLabel: str(),
    offset: z.coerce.number().int().min(0).default(0).catch(0),
    showCategory: yesNo("no"),
    showSummary: yesNo("yes"),
    slugs: str(),
    source: z
      .enum(["latest", "picked", "category", "page"])
      .default("latest")
      .catch("latest"),
    summaryWords: z.coerce.number().int().min(5).max(80).default(30).catch(30),
    text: str(),
    title: str(),
    titleAlign: z.enum(["center", "left"]).default("center").catch("center"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título ([[palavra]] = marca-texto)",
      },
      { key: "text", kind: "textarea", label: "Texto abaixo do título" },
      {
        key: "titleAlign",
        kind: "select",
        label: "Alinhamento do título",
        options: [
          { label: "Centro", value: "center" },
          { label: "Esquerda", value: "left" },
        ],
      },
      {
        key: "arrange",
        kind: "select",
        label: "Disposição",
        options: [
          { label: "Texto em cima, grade embaixo", value: "stack" },
          { label: "Grade à esquerda, texto à direita", value: "side" },
        ],
      },
      {
        key: "background",
        kind: "select",
        label: "Fundo da seção",
        options: [
          { label: "Branco", value: "white" },
          { label: "Lilás claro", value: "soft" },
        ],
      },
      {
        key: "source",
        kind: "select",
        label: "Quais posts",
        options: [
          { label: "Os mais recentes", value: "latest" },
          { label: "Posts escolhidos (lista de endereços)", value: "picked" },
          { label: "De uma categoria", value: "category" },
          {
            label: "Os da página (categoria aberta / pesquisa)",
            value: "page",
          },
        ],
      },
      {
        key: "slugs",
        kind: "textarea",
        label: "Posts escolhidos — um endereço (slug) por linha",
      },
      { key: "category", kind: "text", label: "Categoria — endereço (slug)" },
      { key: "limit", kind: "number", label: "Quantidade (0 = todos)" },
      { key: "offset", kind: "number", label: "Pular os primeiros" },
      { key: "columns", kind: "number", label: "Colunas no computador (1–4)" },
      {
        key: "layout",
        kind: "select",
        label: "Estilo do cartão",
        options: LAYOUTS,
      },
      {
        key: "showCategory",
        kind: "select",
        label: "Mostrar categoria",
        options: YES_NO,
      },
      {
        key: "showSummary",
        kind: "select",
        label: "Mostrar resumo",
        options: YES_NO,
      },
      { key: "summaryWords", kind: "number", label: "Palavras do resumo" },
      {
        key: "moreLabel",
        kind: "text",
        label: "Texto do “Ler mais” de cada cartão (vazio = sem)",
      },
      {
        key: "loadMore",
        kind: "number",
        label: "Mostrar N de cada vez e botão “carregar mais” (0 = tudo)",
      },
      {
        key: "loadMoreLabel",
        kind: "text",
        label: "Texto do botão “carregar mais”",
      },
      {
        key: "buttonLabel",
        kind: "text",
        label: "Botão da seção (vazio = sem)",
      },
      { key: "buttonUrl", kind: "url", label: "Link do botão da seção" },
      { key: "emptyText", kind: "text", label: "Mensagem sem resultados" },
    ],
    group: "blog",
    label: "Grade de posts Seguidores em Alta",
    render: (p, ctx) => {
      const posts = pickPosts(visiblePosts(ctx.site, ctx.mode), p, ctx);
      const step = p.loadMore;
      const hasCopy = !!(p.title || p.text);
      return (
        <section
          className={`sg-posts sg-sec ${p.background === "soft" ? "sg-soft" : ""} ${p.arrange === "side" ? "side" : ""} ${p.titleAlign === "center" ? "center-title" : ""}`}
        >
          <div className="sg-posts-in">
            {hasCopy ? (
              <div
                className="sg-posts-copy sg-posts-head"
                style={
                  p.titleAlign === "left" ? { textAlign: "left" } : undefined
                }
              >
                {p.title ? (
                  <h2 className="sg-h">
                    <Hl text={p.title} />
                  </h2>
                ) : null}
                {p.text ? <p className="sg-lead">{p.text}</p> : null}
              </div>
            ) : null}
            <div
              className="sg-grid-wrap"
              data-step={step > 0 ? step : undefined}
            >
              {posts.length === 0 && p.emptyText ? (
                <p className="sg-empty">{p.emptyText}</p>
              ) : null}
              <div className={`sg-grid c${p.columns}`} data-repeat-list="">
                {posts.map((post, i) => (
                  <SgCard
                    ctx={ctx}
                    hidden={step > 0 && i >= step}
                    key={post.id}
                    layout={p.layout}
                    moreLabel={
                      p.layout === "archive" && !p.moreLabel
                        ? "Ler mais »"
                        : p.moreLabel
                    }
                    post={post}
                    showCategory={p.showCategory === "yes"}
                    showSummary={
                      p.showSummary === "yes" && p.layout !== "archive"
                    }
                    summaryWords={p.summaryWords}
                  />
                ))}
              </div>
              {step > 0 && posts.length > step ? (
                <button className="sg-btn sg-more" type="button">
                  {p.loadMoreLabel}
                </button>
              ) : null}
            </div>
            {p.buttonLabel ? (
              <div className="sg-posts-cta">
                <a
                  className="sg-btn"
                  href={href(ctx, p.buttonUrl)}
                  {...newTab(p.buttonUrl)}
                >
                  {p.buttonLabel}
                </a>
              </div>
            ) : null}
          </div>
        </section>
      );
    },
    type: "sgPostGrid",
  }
);

/* ───────────────────────── contadores ───────────────────────── */

const fmtNumber = (n: number, sep: string) =>
  sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(n);

/** Filhos: 1 `section` → 1.1 grade → 1.1.n contador (1 número, 2 título). */
const sgCounters = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          prefix: str(),
          separator: str(),
          suffix: str(),
          title: str(),
          value: z.coerce.number().int().min(0).default(0).catch(0),
        })
      )
      .default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "value", kind: "number", label: "Valor final" },
          { key: "prefix", kind: "text", label: "Antes do número (ex.: +)" },
          { key: "suffix", kind: "text", label: "Depois do número (ex.: %)" },
          {
            key: "separator",
            kind: "text",
            label: "Separador de milhar (ex.: ,)",
          },
          { key: "title", kind: "text", label: "Título" },
        ],
        key: "items",
        kind: "list",
        label: "Contadores",
      },
    ],
    group: "content",
    label: "Contadores Seguidores em Alta",
    render: p => (
      <section className="sg-counters sg-sec">
        <div className="sg-counters-in">
          {p.items.map((it, i) => (
            <div className="sg-counter" key={`${it.title}-${i}`}>
              <span
                className="sg-num"
                data-ms="2000"
                data-prefix={it.prefix || undefined}
                data-sb-count={it.value}
                data-sep={it.separator || undefined}
                data-suffix={it.suffix || undefined}
              >
                {`${it.prefix}${fmtNumber(it.value, it.separator)}${it.suffix}`}
              </span>
              <div className="sg-ctitle">{it.title}</div>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "sgCounters",
  }
);

/* ───────────────────────── produtos ───────────────────────── */

/**
 * Filhos: 1 `section` → 1.1 linha → 1.1.1 coluna esquerda (1 título, 2 texto, 3 botão, 4 e 5 cartões) e
 * 1.1.2 coluna direita (1.. cartões).
 */
const sgProducts = defineBlock(
  z.object({
    buttonLabel: str("Conheça nossos produtos"),
    buttonUrl: str("#"),
    items: z
      .array(z.object({ image: str(), label: str("Ver mais"), url: str("#") }))
      .default([]),
    text: str(),
    title: str("Título da [[seção]]"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título ([[palavra]] = marca-texto)",
      },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "label", kind: "text", label: "Texto do botão" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Produtos (os 2 primeiros ficam na coluna do texto)",
      },
    ],
    group: "content",
    label: "Produtos Seguidores em Alta",
    render: (p, ctx) => {
      const card = (it: (typeof p.items)[number], i: number) => (
        <div
          className={i === 0 ? "sg-pcard first" : "sg-pcard"}
          key={`${it.url}-${i}`}
          style={bg("--sg-img", it.image)}
        >
          {it.label ? (
            <div className="sg-pcard-btn">
              <a
                className="sg-btn white"
                href={href(ctx, it.url)}
                {...newTab(it.url)}
              >
                {it.label}
              </a>
            </div>
          ) : null}
        </div>
      );
      return (
        <section className="sg-products sg-sec">
          <div className="sg-products-in">
            <div className="sg-pcol left">
              <h2 className="sg-h">
                <Hl text={p.title} />
              </h2>
              <p className="sg-lead">{p.text}</p>
              <div>
                {p.buttonLabel ? (
                  <a
                    className="sg-btn"
                    href={href(ctx, p.buttonUrl)}
                    {...newTab(p.buttonUrl)}
                  >
                    {p.buttonLabel}
                  </a>
                ) : null}
              </div>
              {p.items.slice(0, 2).map((it, i) => card(it, i))}
            </div>
            <div className="sg-pcol right">
              {p.items.slice(2).map((it, i) => card(it, i + 2))}
            </div>
          </div>
        </section>
      );
    },
    type: "sgProducts",
  }
);

/* ───────────────────────── redes sociais ───────────────────────── */

/** Filhos: 1 `section` → 1.1 linha → 1.1.1 colagem (1..4 logos) e 1.1.2 texto (1 título, 2 parágrafo). */
const sgSocialCollage = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), label: str(), url: str("#") }))
      .default([]),
    overlay: str(),
    text: str(),
    title: str("Siga-nos nas [[Redes Sociais]]"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título ([[palavra]] = marca-texto)",
      },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "overlay", kind: "image", label: "Textura de fundo da colagem" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Logo da rede" },
          { key: "label", kind: "text", label: "Nome da rede" },
          { key: "url", kind: "url", label: "Link do perfil" },
        ],
        key: "items",
        kind: "list",
        label: "Redes (as 4 primeiras entram na colagem)",
      },
    ],
    group: "content",
    label: "Colagem de redes sociais",
    render: (p, ctx) => (
      <section className="sg-social sg-sec">
        <div className="sg-social-in">
          <div className="sg-collage" style={bg("--sg-ov", p.overlay)}>
            {p.items.slice(0, 4).map((it, i) => (
              <a
                aria-label={it.label}
                href={href(ctx, it.url)}
                key={`${it.label}-${i}`}
                {...newTab(it.url)}
              >
                <Img alt={it.label} src={it.image} />
              </a>
            ))}
          </div>
          <div className="sg-social-copy">
            <h2 className="sg-h">
              <Hl text={p.title} />
            </h2>
            <p className="sg-lead">{p.text}</p>
          </div>
        </div>
      </section>
    ),
    type: "sgSocialCollage",
  }
);

/* ───────────────────────── comunidades ───────────────────────── */

/** Filhos: 1 `section` → 1.1 linha → 1.1.1 imagem (1 foto) e 1.1.2 texto (1 título, 2 parágrafo, 3 botão). */
const sgCommunity = defineBlock(
  z.object({
    buttonLabel: str("Ver mais"),
    buttonUrl: str("#"),
    image: str(),
    overlay: str(),
    text: str(),
    title: str("Título da [[seção]]"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título ([[palavra]] = marca-texto)",
      },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      { key: "buttonUrl", kind: "url", label: "Link do botão" },
      { key: "image", kind: "image", label: "Imagem (celular)" },
      { key: "overlay", kind: "image", label: "Textura de fundo da imagem" },
    ],
    group: "content",
    label: "Comunidades (imagem + texto)",
    render: (p, ctx) => (
      <section className="sg-comm sg-sec">
        <div className="sg-comm-in">
          <div className="sg-comm-art" style={bg("--sg-ov", p.overlay)}>
            <Img src={p.image} />
          </div>
          <div className="sg-comm-copy">
            <h2 className="sg-h">
              <Hl text={p.title} />
            </h2>
            <p>{p.text}</p>
            {p.buttonLabel ? (
              <a
                className="sg-btn"
                href={href(ctx, p.buttonUrl)}
                {...newTab(p.buttonUrl)}
              >
                {p.buttonLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    ),
    type: "sgCommunity",
  }
);

/* ───────────────────────── depoimentos ───────────────────────── */

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

const sgReviews = defineBlock(
  z.object({
    background: str(),
    items: z
      .array(
        z.object({
          image: str(),
          name: str(),
          rating: z.coerce.number().int().min(1).max(5).default(5).catch(5),
          text: str(),
        })
      )
      .default([]),
    seconds: z.coerce.number().int().min(2).max(30).default(5).catch(5),
    title: str("O que [[dizem]] sobre nós"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título ([[palavra]] = marca-texto)",
      },
      {
        key: "background",
        kind: "image",
        label: "Foto de fundo (fixa no computador)",
      },
      { key: "seconds", kind: "number", label: "Segundos entre os slides" },
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "rating", kind: "number", label: "Estrelas (1–5)" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
    ],
    group: "content",
    label: "Depoimentos Seguidores em Alta",
    render: p => (
      <section className="sg-reviews" style={bg("--sg-img", p.background)}>
        <div className="sg-reviews-in">
          <div className="sg-heading center white">
            <h2>
              <Hl text={p.title} />
            </h2>
          </div>
          <div className="sb-cslider sg-car" data-sec={p.seconds}>
            <div className="sb-cslider-track">
              {p.items.map((t, i) => (
                <figure className="sg-t" key={`${t.name}-${i}`}>
                  <div className="sg-t-head">
                    {t.image ? <Img src={t.image} /> : null}
                    <div>
                      <strong className="sg-t-name">{t.name}</strong>
                      <span
                        aria-label={`${t.rating} de 5 estrelas`}
                        className="sg-stars"
                        role="img"
                      >
                        {stars(t.rating)}
                      </span>
                    </div>
                  </div>
                  <p>{t.text}</p>
                </figure>
              ))}
            </div>
            <div className="sb-cslider-nav">
              <button aria-label="Anterior" type="button">
                ‹
              </button>
              <button aria-label="Próximo" type="button">
                ›
              </button>
            </div>
            <div className="sg-dots">
              {p.items.map((t, i) => (
                <button
                  aria-label={`Depoimento ${i + 1}`}
                  className={i === 0 ? "on" : undefined}
                  key={`${t.name}-${i}`}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    type: "sgReviews",
  }
);

/* ───────────────────────── blogs parceiros ───────────────────────── */

const sgBlogCards = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), name: str(), url: str("#") }))
      .default([]),
    title: str("Blogs [[Recomendados]]"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "textarea",
        label: "Título (vazio = sem; [[palavra]] = marca-texto)",
      },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem do blog" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Blogs",
      },
    ],
    group: "content",
    label: "Blogs recomendados",
    render: (p, ctx) => (
      <section className="sg-blogs-sec">
        {p.title ? (
          <h2 className="sg-h">
            <Hl text={p.title} />
          </h2>
        ) : null}
        <div className="sg-blogs">
          {p.items.map((it, i) => (
            <a
              className="sg-blog"
              href={href(ctx, it.url)}
              key={`${it.name}-${i}`}
              {...newTab(it.url)}
            >
              <Img alt={it.name} src={it.image} />
              <strong>{it.name}</strong>
            </a>
          ))}
        </div>
      </section>
    ),
    type: "sgBlogCards",
  }
);

/* ───────────────────────── banner de título ───────────────────────── */

/** Filhos: 1 `section` → 1.1 caixa com a foto → 1.1.1 caixa do título → 1.1.1.1 `h1`. */
const sgTitleBanner = defineBlock(
  z.object({
    image: str(),
    position: str("0 -220px"),
    title: str(),
    veil: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .default("#000000")
      .catch("#000000"),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título (vazio = nome da categoria)",
      },
      { key: "image", kind: "image", label: "Foto de fundo" },
      { key: "veil", kind: "color", label: "Cor do véu (50%)" },
      {
        key: "position",
        kind: "text",
        label: "Posição da foto (ex.: 0 -220px)",
      },
    ],
    group: "content",
    label: "Banner de título Seguidores em Alta",
    render: (p, ctx) => (
      <section className="sg-banner">
        <div
          className="sg-banner-box"
          style={
            {
              ...bg("--sg-img", p.image),
              "--sg-pos": /^[\d\s.%pxemrvwh-]+$/i.test(p.position)
                ? p.position
                : "0 0",
              "--sg-veil": p.veil,
            } as CSSProperties
          }
        >
          <div className="sg-banner-title">
            <h1>{p.title || ctx.current.category?.name || ""}</h1>
          </div>
        </div>
      </section>
    ),
    type: "sgTitleBanner",
  }
);

/* ───────────────────────── busca ───────────────────────── */

const sgSearch = defineBlock(
  z.object({
    buttonLabel: str("Pesquisar"),
    categoriesLabel: str(),
    placeholder: str("Digite aqui..."),
    selectLabel: str("Selecionar categoria"),
    title: str("O que você procura?"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (vazio = sem)" },
      { key: "placeholder", kind: "text", label: "Texto do campo de busca" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      {
        key: "categoriesLabel",
        kind: "text",
        label: "Título ao lado do seletor (vazio = sem)",
      },
      {
        key: "selectLabel",
        kind: "text",
        label: "Texto do seletor de categoria",
      },
    ],
    group: "blog",
    label: "Busca e categorias Seguidores em Alta",
    render: (p, ctx) => (
      <form action={href(ctx, "/pesquisa/")} className="sg-search" method="get">
        {p.title ? <h2>{p.title}</h2> : null}
        <div className="sg-search-row">
          <div className="sg-search-box">
            <input
              aria-label={p.placeholder}
              defaultValue={ctx.query.q ?? ""}
              name="q"
              placeholder={p.placeholder}
              type="search"
            />
            <button type="submit">{p.buttonLabel}</button>
          </div>
          <div className="sg-search-cats">
            {p.categoriesLabel ? <strong>{p.categoriesLabel}</strong> : null}
            <select
              aria-label={p.selectLabel}
              defaultValue={ctx.current.category?.slug ?? ""}
              name="category"
            >
              <option value="">{p.selectLabel}</option>
              {ctx.site.categories.map(c => (
                <option
                  data-href={href(ctx, categoryPath(c))}
                  key={c.id}
                  value={c.slug}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    ),
    type: "sgSearch",
  }
);

/** "Categoria: Nome" + botão voltar do arquivo e da pesquisa (escondido no celular). */
const sgCategoryBar = defineBlock(
  z.object({
    backLabel: str("Voltar"),
    backUrl: str("/categorias/"),
    label: str("Categoria:"),
    title: str(),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Texto antes do nome" },
      { key: "title", kind: "text", label: "Nome (vazio = categoria aberta)" },
      { key: "backLabel", kind: "text", label: "Texto do botão voltar" },
      { key: "backUrl", kind: "url", label: "Link do botão voltar" },
    ],
    group: "blog",
    label: "Barra da categoria Seguidores em Alta",
    render: (p, ctx) => (
      <div className="sg-cat-bar">
        <div>
          {p.label}{" "}
          <strong>{p.title || ctx.current.category?.name || ""}</strong>
        </div>
        <a className="sg-btn" href={href(ctx, p.backUrl)}>
          {p.backLabel}
        </a>
      </div>
    ),
    type: "sgCategoryBar",
  }
);

/* ───────────────────────── cards de categoria ───────────────────────── */

/** Filhos: 1 `section` → 1.1 grade → 1.1.n cartão (use `each` + `stagger` para a entrada escalonada). */
const sgCategoryCards = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), label: str(), slug: str() }))
      .default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "slug", kind: "text", label: "Categoria — endereço (slug)" },
          {
            key: "label",
            kind: "text",
            label: "Nome no cartão (vazio = nome da categoria)",
          },
          { key: "image", kind: "image", label: "Imagem" },
        ],
        key: "items",
        kind: "list",
        label: "Cartões (lista vazia = todas as categorias)",
      },
    ],
    group: "blog",
    label: "Cartões de categoria",
    render: (p, ctx) => {
      const items = p.items.length
        ? p.items
        : ctx.site.categories.map(c => ({
            image: "",
            label: c.name,
            slug: c.slug,
          }));
      return (
        <section>
          <div className="sg-ccards-in">
            {items.map((it, i) => {
              const cat = ctx.site.categories.find(c => c.slug === it.slug);
              return (
                <a
                  className="sg-ccard"
                  href={cat ? href(ctx, categoryPath(cat)) : "#"}
                  key={`${it.slug}-${i}`}
                >
                  <div className="sg-ccard-img">
                    <Img alt="" src={it.image} />
                  </div>
                  <div className="sg-ccard-name">
                    {it.label || cat?.name || it.slug}
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      );
    },
    type: "sgCategoryCards",
  }
);

/* ───────────────────────── post ───────────────────────── */

const sgPost = defineBlock(
  z.object({
    bannerImage: str(),
    bannerUrl: str("#"),
    buttonLabel: str("Pesquisar"),
    categoriesLabel: str("Categorias:"),
    placeholder: str("Digite aqui..."),
    selectLabel: str("Selecionar categoria"),
  }),
  {
    fields: [
      { key: "placeholder", kind: "text", label: "Texto do campo de busca" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão de busca" },
      {
        key: "categoriesLabel",
        kind: "text",
        label: "Título do seletor de categorias",
      },
      { key: "selectLabel", kind: "text", label: "Texto do seletor" },
      {
        key: "bannerImage",
        kind: "image",
        label: "Banner da lateral (fixo ao rolar)",
      },
      { key: "bannerUrl", kind: "url", label: "Link do banner" },
    ],
    group: "blog",
    label: "Página do post Seguidores em Alta",
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      const cat = categoryOf(ctx.site, post);
      return (
        <div className="sg-post">
          <article className="sg-post-main">
            <Img className="sg-post-cover" src={post.coverImage} />
            {cat ? (
              <p className="sg-post-cat">
                <a href={href(ctx, categoryPath(cat))}>{cat.name}</a>
              </p>
            ) : null}
            <h1 className="sg-post-title">{post.title}</h1>
            <p className="sg-post-date">{formatDate(post.publishedAt)}</p>
            <div className="sg-post-content">
              {ctx.renderBlocks(post.blocks)}
            </div>
          </article>
          <aside className="sg-side">
            <form action={href(ctx, "/pesquisa/")} method="get">
              <input
                aria-label={p.placeholder}
                name="q"
                placeholder={p.placeholder}
                type="search"
              />
              <button className="sg-btn" type="submit">
                {p.buttonLabel}
              </button>
            </form>
            <div className="sg-side-cats">
              <strong>{p.categoriesLabel}</strong>
              <select
                aria-label={p.selectLabel}
                defaultValue=""
                name="category"
              >
                <option value="">{p.selectLabel}</option>
                {ctx.site.categories.map(c => (
                  <option
                    data-href={href(ctx, categoryPath(c))}
                    key={c.id}
                    value={c.slug}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {p.bannerImage ? (
              <a
                className="sg-side-banner"
                href={href(ctx, p.bannerUrl)}
                {...newTab(p.bannerUrl)}
              >
                <Img src={p.bannerImage} />
              </a>
            ) : null}
          </aside>
        </div>
      );
    },
    type: "sgPost",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

/** Filhos: 1 `footer` → 1.1 contêiner da caixa CTA (1.1.1 caixa: 1 título, 2 texto). */
const sgFooter = defineBlock(
  z.object({
    about: str(),
    blogs: str(),
    blogsTitle: str("Blogs"),
    company: str(),
    contactTitle: str("Contato"),
    ctaOverlay: str(),
    ctaText: str(),
    ctaTitle: str("Título da [[chamada]]"),
    email: str(),
    legal: str(),
    logo: str(),
    others: str(),
    otherTitle: str("Outras Opções"),
    phone: str(),
    socials: str(),
  }),
  {
    fields: [
      {
        key: "ctaTitle",
        kind: "textarea",
        label: "Chamada — título ([[palavra]] = marca-texto)",
      },
      { key: "ctaText", kind: "textarea", label: "Chamada — texto" },
      {
        key: "ctaOverlay",
        kind: "image",
        label: "Chamada — imagem de fundo (10%)",
      },
      { key: "logo", kind: "image", label: "Logo" },
      { key: "about", kind: "textarea", label: "Texto sob a logo" },
      {
        key: "socials",
        kind: "textarea",
        label:
          "Redes sociais — uma por linha: nome | link (youtube, instagram, threads, x, tiktok, facebook…)",
      },
      { key: "blogsTitle", kind: "text", label: "Coluna 2 — título" },
      {
        key: "blogs",
        kind: "textarea",
        label: "Coluna 2 — links (Texto | endereço)",
      },
      { key: "otherTitle", kind: "text", label: "Coluna 3 — título" },
      {
        key: "others",
        kind: "textarea",
        label: "Coluna 3 — links (Texto | endereço)",
      },
      { key: "contactTitle", kind: "text", label: "Coluna 4 — título" },
      { key: "email", kind: "text", label: "E-mail" },
      { key: "phone", kind: "text", label: "Telefone" },
      {
        key: "company",
        kind: "text",
        label: "Nome da empresa (direitos autorais)",
      },
      {
        key: "legal",
        kind: "textarea",
        label: "Links da barra inferior (Texto | endereço)",
      },
    ],
    group: "layout",
    label: "Rodapé Seguidores em Alta",
    render: (p, ctx) => {
      const list = (text: string) =>
        linkLines(text).map(l => (
          <li key={l.label + l.url}>
            <a href={href(ctx, l.url)} {...newTab(l.url)}>
              {l.label}
            </a>
          </li>
        ));
      return (
        <footer className="sg-foot">
          <div className="sg-foot-cta-wrap">
            <div className="sg-foot-cta" style={bg("--sg-ov", p.ctaOverlay)}>
              <div className="sg-heading center white">
                <h2>
                  <Hl text={p.ctaTitle} />
                </h2>
              </div>
              <p>{p.ctaText}</p>
            </div>
          </div>
          <div className="sg-foot-dark">
            <div className="sg-foot-cols">
              <div className="c1">
                <div className="sg-foot-logo">
                  <Img alt="Logo" src={p.logo} />
                </div>
                <p className="sg-foot-about">{p.about}</p>
                <div className="sg-foot-social">
                  {linkLines(p.socials).map(s => (
                    <a
                      aria-label={s.label}
                      href={href(ctx, s.url)}
                      key={s.label + s.url}
                      {...newTab(s.url)}
                    >
                      <SocialIcon label={s.label} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="c2">
                <h4>{p.blogsTitle}</h4>
                <ul className="sg-foot-list">{list(p.blogs)}</ul>
              </div>
              <div className="c3">
                <h4>{p.otherTitle}</h4>
                <ul className="sg-foot-list">{list(p.others)}</ul>
              </div>
              <div className="c4">
                <h4>{p.contactTitle}</h4>
                <ul className="sg-foot-list">
                  {p.email ? (
                    <li>
                      <a href={`mailto:${p.email}`}>✉ {p.email}</a>
                    </li>
                  ) : null}
                  {p.phone ? (
                    <li>
                      <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>
                        ✆ {p.phone}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
            <div className="sg-foot-bar">
              <span>
                Copyright © {new Date().getFullYear()} {p.company}
              </span>
              <nav>
                {linkLines(p.legal).map(l => (
                  <a href={href(ctx, l.url)} key={l.label + l.url}>
                    {l.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </footer>
      );
    },
    type: "sgFooter",
  }
);

/* ───────────────────────── links na bio ───────────────────────── */

const sgLinkBio = defineBlock(
  z.object({
    avatar: str(),
    background: str(),
    bio: str(),
    items: z.array(z.object({ label: str(), url: str("#") })).default([]),
    name: str("Nome"),
  }),
  {
    fields: [
      { key: "avatar", kind: "image", label: "Foto ou logo" },
      { key: "name", kind: "text", label: "Nome" },
      { key: "bio", kind: "textarea", label: "Bio" },
      {
        key: "background",
        kind: "image",
        label: "Imagem de fundo (vazio = lilás claro)",
      },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Botões",
      },
    ],
    group: "content",
    label: "Links na bio",
    render: (p, ctx) => (
      <section
        className="sg-bio"
        style={p.background ? bg("--sg-img", p.background) : undefined}
      >
        <div className="sg-bio-in">
          {p.avatar ? <Img className="sg-avatar" src={p.avatar} /> : null}
          <h1>{p.name}</h1>
          <p>{p.bio}</p>
          <div className="sg-bio-links">
            {p.items.map((it, i) => (
              <a
                className="sg-btn"
                href={href(ctx, it.url)}
                key={`${it.label}-${i}`}
                {...newTab(it.url)}
              >
                {it.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    ),
    type: "sgLinkBio",
  }
);

export const seguidoresBlocks: BlockDefinition[] = [
  sgHeader,
  sgHeading,
  lottie,
  sgHero,
  sgPostGrid,
  sgCounters,
  sgProducts,
  sgSocialCollage,
  sgCommunity,
  sgReviews,
  sgBlogCards,
  sgTitleBanner,
  sgSearch,
  sgCategoryBar,
  sgCategoryCards,
  sgPost,
  sgFooter,
  sgLinkBio,
];
