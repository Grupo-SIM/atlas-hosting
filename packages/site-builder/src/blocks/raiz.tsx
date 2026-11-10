import type { CSSProperties } from "react";
import { z } from "zod";
import type { Post } from "../model/index.js";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  href,
  Img,
  newTab,
  postPath,
  SocialIcon,
  safeUrl,
  visiblePosts,
} from "./helpers.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { videoEmbed, vimeoEmbed } from "./youtube.js";

/**
 * Blocos do tema Marketing Raiz (blog de marketing claro, roxo `#6617FF`, funil escuro com botões amarelos). Todo
 * texto, imagem, link e item é prop editável; o visual vem de `renderer/raiz.ts` (escopo `.sb-mr`) e o movimento
 * (paginação, carrossel com miniaturas, botão atrasado, telas do funil e barra do quiz) de `fx-runtime.ts`.
 * As páginas internas reaproveitam os blocos `sg*` do Seguidores em Alta.
 * Os caminhos de efeito (`Block.fx`) dependem da ordem dos filhos — veja o comentário de cada bloco.
 */
const str = (d = "") => z.string().default(d);
const num = (d: number, min: number, max: number) =>
  z.coerce.number().min(min).max(max).default(d).catch(d);
const yesNo = (d: "yes" | "no") => z.enum(["yes", "no"]).default(d).catch(d);
const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];
const bgVar = (name: string, url: string) =>
  ({ [name]: cssUrl(url) }) as CSSProperties;

const words = (text: string, n: number) => {
  const w = text.trim().split(/\s+/);
  return w.length <= n ? w.join(" ") : `${w.slice(0, n).join(" ")}...`;
};

/** Linhas `Texto | endereço` (a parte do endereço é opcional). */
const linkLines = (text: string) =>
  text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      const [label, ...rest] = l.split("|");
      return { label: label.trim(), url: rest.join("|").trim() || "#" };
    });

const samePath = (link: string, path: string | undefined) => {
  if (!path || !link.startsWith("/") || link.startsWith("//")) return false;
  const norm = (s: string) =>
    `/${s.split(/[?#]/)[0].replace(/^\/+|\/+$/g, "")}`;
  return norm(link) === norm(path);
};

const stars = (n: number) =>
  "★".repeat(Math.max(0, Math.min(5, Math.round(n)))) +
  "☆".repeat(5 - Math.max(0, Math.min(5, Math.round(n))));

/* ───────────────────────── escolha de posts ───────────────────────── */

const SOURCES = [
  { label: "Os mais recentes", value: "latest" },
  { label: "Posts escolhidos (lista de endereços)", value: "picked" },
  { label: "De uma categoria", value: "category" },
  { label: "Os da página (categoria aberta / pesquisa)", value: "page" },
];

interface Pick {
  category: string;
  limit: number;
  offset: number;
  slugs: string;
  source: string;
}

function pickPosts(all: Post[], p: Pick, ctx: RenderContext): Post[] {
  let list = all;
  if (p.source === "picked") {
    list = p.slugs
      .split(/[\s,]+/)
      .filter(Boolean)
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

const pickFields = (): FieldDef[] => [
  { key: "source", kind: "select", label: "Quais posts", options: SOURCES },
  {
    key: "slugs",
    kind: "textarea",
    label: "Posts escolhidos — um endereço (slug) por linha",
  },
  { key: "category", kind: "text", label: "Categoria — endereço (slug)" },
  { key: "limit", kind: "number", label: "Quantidade (0 = todos)" },
  { key: "offset", kind: "number", label: "Pular os primeiros" },
];

const pickShape = {
  category: str(),
  limit: z.coerce.number().int().min(0).max(200).default(0).catch(0),
  offset: z.coerce.number().int().min(0).default(0).catch(0),
  slugs: str(),
  source: z
    .enum(["latest", "picked", "category", "page"])
    .default("latest")
    .catch("latest"),
};

/* ───────────────────────── cartão de post ───────────────────────── */

function MrCard({
  ctx,
  height,
  layout,
  page,
  post,
  showSummary,
  summaryWords,
}: {
  ctx: RenderContext;
  height: number;
  layout: string;
  page: number;
  post: Post;
  showSummary: boolean;
  summaryWords: number;
}) {
  const url = href(ctx, postPath(post));
  const cat = categoryOf(ctx.site, post);
  return (
    <article
      className={`sb-post-card mr-card mr-l-${layout}`}
      data-category={cat?.slug ?? ""}
      data-mr-page={page}
      data-search={`${post.title} ${post.excerpt}`.slice(0, 4000)}
      style={{ "--mr-h": `${height}px` } as CSSProperties}
    >
      <a className="mr-thumb" href={url}>
        <Img alt={post.title} src={post.coverImage} />
      </a>
      <h3 className="mr-ctitle">
        <a href={url}>{post.title}</a>
      </h3>
      {showSummary ? (
        <p className="mr-csum">{words(post.excerpt, summaryWords)}</p>
      ) : null}
    </article>
  );
}

function Pager({ edit, pages }: { edit: boolean; pages: number }) {
  if (pages < 2) return null;
  return (
    <nav aria-label="Páginas" className={`mr-pager${edit ? "edit" : ""}`}>
      {Array.from({ length: pages }, (_, i) => (
        <button
          aria-label={`Página ${i + 1}`}
          className={i === 0 ? "on" : undefined}
          data-mr-go={i + 1}
          key={`p${i + 1}`}
          type="button"
        >
          {i + 1}
        </button>
      ))}
    </nav>
  );
}

/* ───────────────────────── cabeçalho ───────────────────────── */

/** Filhos: 1 = `header.mr-head` → 1.2 = linha → 1.2.1 = logo. */
const mrHeader = defineBlock(
  z.object({ logo: str(), logoAlt: str("Logo"), logoUrl: str("/") }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoAlt", kind: "text", label: "Texto alternativo da logo" },
      { key: "logoUrl", kind: "url", label: "Link da logo" },
    ],
    group: "layout",
    label: "Cabeçalho Marketing Raiz",
    render: (p, ctx) => (
      <header className="mr-head">
        {/* biome-ignore lint/correctness/useUniqueElementIds: o menu do celular usa o label for=id; há um só cabeçalho por página */}
        <input
          aria-label="Abrir menu"
          className="sb-burger-input"
          id="sb-burger"
          type="checkbox"
        />
        <div className="mr-head-in">
          <div className="mr-logo">
            <a href={href(ctx, p.logoUrl)}>
              <Img alt={p.logoAlt} src={p.logo} />
            </a>
          </div>
          <label className="mr-burger" htmlFor="sb-burger">
            <i />
            <i />
            <i />
          </label>
          <nav className="mr-nav">
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
    type: "mrHeader",
  }
);

/* ───────────────────────── hero ───────────────────────── */

/**
 * Filhos: 1 `section` → 1.1 contêiner → 1.1.1 coluna do texto (1 título, 2 subtítulo) e 1.1.2 coluna dos cartões
 * (1.1.2.n cartão). No celular a coluna dos cartões some (o original mostra "No posts found." ali — bug).
 */
const mrHero = defineBlock(
  z.object({
    image: str(),
    slugs: str(),
    subtitle: str("A verdade sobre como vender na internet"),
    summaryWords: z.coerce.number().int().min(5).max(60).default(17).catch(17),
    title: str("ESQUEÇA O MARKETING NUTELLA!"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo (some no celular)" },
      { key: "image", kind: "image", label: "Foto de fundo" },
      {
        key: "slugs",
        kind: "textarea",
        label:
          "Posts dos cartões — um endereço (slug) por linha (vazio = os 2 mais recentes)",
      },
      { key: "summaryWords", kind: "number", label: "Palavras do resumo" },
    ],
    group: "content",
    label: "Hero Marketing Raiz",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode);
      const picked = pickPosts(
        all,
        {
          category: "",
          limit: 2,
          offset: 0,
          slugs: p.slugs,
          source: p.slugs.trim() ? "picked" : "latest",
        },
        ctx
      );
      return (
        <section className="mr-hero" style={bgVar("--mr-img", p.image)}>
          <div className="mr-hero-in">
            <div className="mr-hero-copy">
              <h1>{p.title}</h1>
              {p.subtitle ? (
                <div className="mr-hero-sub">{p.subtitle}</div>
              ) : null}
            </div>
            <div className="mr-hero-side">
              {picked.map(post => {
                const url = href(ctx, postPath(post));
                return (
                  <a className="mr-hc" href={url} key={post.id}>
                    <Img alt={post.title} src={post.coverImage} />
                    <div className="mr-hc-body">
                      <h3 className="mr-hc-title">{post.title}</h3>
                      <p className="mr-hc-sum">
                        {words(post.excerpt, p.summaryWords)}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      );
    },
    type: "mrHero",
  }
);

/* ───────────────────────── melhores + últimas + lateral ───────────────────────── */

const SOCIAL_DEFAULT =
  "Youtube | https://www.youtube.com/@marketingraiz | #ff0000\nInstagram | https://www.instagram.com/mktraiz.br | #c13584";

/**
 * Filhos: 1 `section` → 1.1 contêiner → 1.1.1 coluna da esquerda (1 bloco "Melhores", 2 bloco "Últimas"; cada um:
 * 1 título, 2 grade) e 1.1.2 coluna da direita (1 banner, 2 redes sociais).
 */
const mrHighlights = defineBlock(
  z.object({
    bannerImage: str(),
    bannerUrl: str("#"),
    bestSlugs: str(),
    bestTitle: str("Melhores Post's"),
    imageHeight: z.coerce
      .number()
      .int()
      .min(80)
      .max(500)
      .default(260)
      .catch(260),
    latestCount: z.coerce.number().int().min(0).max(12).default(2).catch(2),
    latestTitle: str("Últimas Novidades"),
    socials: str(SOCIAL_DEFAULT),
  }),
  {
    fields: [
      { key: "bestTitle", kind: "text", label: "Título do 1º bloco" },
      {
        key: "bestSlugs",
        kind: "textarea",
        label: "Posts do 1º bloco — um endereço (slug) por linha",
      },
      { key: "latestTitle", kind: "text", label: "Título do 2º bloco" },
      {
        key: "latestCount",
        kind: "number",
        label: "Quantos posts recentes no 2º bloco",
      },
      { key: "imageHeight", kind: "number", label: "Altura das imagens (px)" },
      { key: "bannerImage", kind: "image", label: "Banner da lateral" },
      { key: "bannerUrl", kind: "url", label: "Link do banner" },
      {
        key: "socials",
        kind: "textarea",
        label: "Redes sociais — uma por linha: nome | link | cor (#rrggbb)",
      },
    ],
    group: "blog",
    label: "Destaques Marketing Raiz",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode);
      const best = pickPosts(
        all,
        {
          category: "",
          limit: 0,
          offset: 0,
          slugs: p.bestSlugs,
          source: "picked",
        },
        ctx
      );
      const latest = all.slice(0, p.latestCount);
      const grid = (list: Post[]) => (
        <div className="c2 mr-grid">
          {list.map(post => (
            <MrCard
              ctx={ctx}
              height={p.imageHeight}
              key={post.id}
              layout="side"
              page={1}
              post={post}
              showSummary={false}
              summaryWords={0}
            />
          ))}
        </div>
      );
      return (
        <section className="mr-hl">
          <div className="mr-hl-in">
            <div className="mr-hl-left">
              <div className="mr-block">
                <h2 className="mr-st">{p.bestTitle}</h2>
                {grid(best)}
              </div>
              <div className="mr-block">
                <h2 className="mr-st">{p.latestTitle}</h2>
                {grid(latest)}
              </div>
            </div>
            <div className="mr-hl-right">
              {p.bannerImage ? (
                <a
                  className="mr-side-banner"
                  href={href(ctx, p.bannerUrl)}
                  {...newTab(p.bannerUrl)}
                >
                  <Img src={p.bannerImage} />
                </a>
              ) : null}
              <div className="mr-socials">
                {p.socials
                  .split("\n")
                  .map(l => l.trim())
                  .filter(Boolean)
                  .map(l => {
                    const [label, url, color] = l.split("|").map(s => s.trim());
                    const bg = /^#[0-9a-fA-F]{6}$/.test(color ?? "")
                      ? color
                      : "#000000";
                    return (
                      <a
                        href={href(ctx, url || "#")}
                        key={l}
                        style={{ background: bg }}
                        {...newTab(url ?? "")}
                      >
                        <SocialIcon label={label} />
                        {label}
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "mrHighlights",
  }
);

/* ───────────────────────── grade de posts (com paginação) ───────────────────────── */

const mrPostGrid = defineBlock(
  z.object({
    ...pickShape,
    columns: z.coerce.number().int().min(1).max(4).default(3).catch(3),
    emptyText: str("Nenhum post encontrado."),
    filter: yesNo("no"),
    filterButton: str("Pesquisar"),
    filterLabel: str("Categorias:"),
    filterPlaceholder: str("Digite aqui..."),
    filterSelect: str("Selecionar categoria"),
    imageHeight: z.coerce
      .number()
      .int()
      .min(80)
      .max(500)
      .default(200)
      .catch(200),
    layout: z.enum(["card", "side"]).default("card").catch("card"),
    perPage: z.coerce.number().int().min(0).max(100).default(10).catch(10),
    showSummary: yesNo("yes"),
    summaryWords: z.coerce.number().int().min(5).max(80).default(30).catch(30),
    title: str(),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título da seção (linha azul; vazio = sem)",
      },
      ...pickFields(),
      { key: "columns", kind: "number", label: "Colunas no computador (1–4)" },
      {
        key: "layout",
        kind: "select",
        label: "Estilo do cartão",
        options: [
          { label: "Cartão (imagem, título, resumo)", value: "card" },
          { label: "Lateral (título grande em 2 linhas)", value: "side" },
        ],
      },
      { key: "imageHeight", kind: "number", label: "Altura da imagem (px)" },
      {
        key: "showSummary",
        kind: "select",
        label: "Mostrar resumo",
        options: YES_NO,
      },
      { key: "summaryWords", kind: "number", label: "Palavras do resumo" },
      {
        key: "perPage",
        kind: "number",
        label: "Posts por página (0 = tudo, sem paginação)",
      },
      {
        key: "filter",
        kind: "select",
        label: "Mostrar busca e categorias acima",
        options: YES_NO,
      },
      {
        key: "filterPlaceholder",
        kind: "text",
        label: "Texto do campo de busca",
      },
      { key: "filterButton", kind: "text", label: "Texto do botão de busca" },
      { key: "filterLabel", kind: "text", label: "Título ao lado do seletor" },
      { key: "filterSelect", kind: "text", label: "Texto do seletor" },
      { key: "emptyText", kind: "text", label: "Mensagem sem resultados" },
    ],
    group: "blog",
    label: "Grade de posts Marketing Raiz",
    render: (p, ctx) => {
      const posts = pickPosts(visiblePosts(ctx.site, ctx.mode), p, ctx);
      const per = p.perPage;
      const pages = per > 0 ? Math.ceil(posts.length / per) : 1;
      const list = p.filter === "yes";
      return (
        <section className={list ? "mr-list" : "mr-block"}>
          {list ? (
            <div className="mr-list-bar">
              <form
                action={href(ctx, "/pesquisa/")}
                className="sg-search"
                method="get"
              >
                <div className="sg-search-box">
                  <input
                    aria-label={p.filterPlaceholder}
                    name="q"
                    placeholder={p.filterPlaceholder}
                    type="search"
                  />
                  <button type="submit">{p.filterButton}</button>
                </div>
                <div className="sg-search-cats">
                  {p.filterLabel ? <strong>{p.filterLabel}</strong> : null}
                  <select
                    aria-label={p.filterSelect}
                    defaultValue=""
                    name="category"
                  >
                    <option value="">{p.filterSelect}</option>
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
              </form>
            </div>
          ) : null}
          {p.title ? <h2 className="mr-st">{p.title}</h2> : null}
          <div data-mr-pages={per > 0 ? per : undefined}>
            {posts.length === 0 && p.emptyText ? (
              <p className="sg-empty">{p.emptyText}</p>
            ) : null}
            <div className={`mr-grid c${p.columns}`}>
              {posts.map((post, i) => (
                <MrCard
                  ctx={ctx}
                  height={p.imageHeight}
                  key={post.id}
                  layout={p.layout}
                  page={per > 0 ? Math.floor(i / per) + 1 : 1}
                  post={post}
                  showSummary={p.showSummary === "yes"}
                  summaryWords={p.summaryWords}
                />
              ))}
            </div>
            {per > 0 ? (
              <Pager edit={ctx.mode === "edit"} pages={pages} />
            ) : null}
          </div>
        </section>
      );
    },
    type: "mrPostGrid",
  }
);

/* ───────────────────────── carrossel de produtos + depoimentos ───────────────────────── */

const SLIDE = z.object({ alt: str(), image: str(), url: str("#") });
const TESTIMONIAL = z.object({
  image: str(),
  name: str(),
  rating: z.coerce.number().int().min(1).max(5).default(5).catch(5),
  text: str(),
});

/**
 * Filhos: 1 `section` → 1.1 contêiner → 1.1.1 carrossel de mídia (1 janela, 2 setas, 3 miniaturas) e 1.1.2
 * depoimentos. Um bloco só para as 3 versões (desktop/tablet/celular) do original: só as medidas mudam.
 */
const mrShowcase = defineBlock(
  z.object({
    reviewSeconds: num(5, 1, 30),
    seconds: num(5, 1, 30),
    slides: z.array(SLIDE).default([]),
    speed: num(500, 100, 3000),
    testimonials: z.array(TESTIMONIAL).default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "image", kind: "image", label: "Imagem" },
          { key: "url", kind: "url", label: "Link da página" },
          { key: "alt", kind: "text", label: "Texto alternativo" },
        ],
        key: "slides",
        kind: "list",
        label: "Slides do carrossel (a miniatura é a própria imagem)",
      },
      { key: "seconds", kind: "number", label: "Segundos entre slides" },
      { key: "speed", kind: "number", label: "Velocidade da troca (ms)" },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome" },
          { key: "image", kind: "image", label: "Foto" },
          { key: "text", kind: "textarea", label: "Depoimento" },
          { key: "rating", kind: "number", label: "Estrelas (1–5)" },
        ],
        key: "testimonials",
        kind: "list",
        label: "Depoimentos",
      },
      {
        key: "reviewSeconds",
        kind: "number",
        label: "Segundos entre depoimentos",
      },
    ],
    group: "content",
    label: "Carrossel e depoimentos Marketing Raiz",
    render: (p, ctx) => (
      <section className="mr-show">
        <div className="mr-show-in">
          {p.slides.length ? (
            <div
              className="mr-media"
              data-mr-media={p.seconds}
              data-speed={p.speed}
            >
              <div className="mr-media-view">
                <div className="mr-media-track">
                  {p.slides.map((s, i) => (
                    <a
                      className="mr-slide"
                      href={href(ctx, s.url)}
                      key={`${s.image}-${i}`}
                      {...newTab(s.url)}
                    >
                      <Img alt={s.alt} src={s.image} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="mr-arrows">
                <button aria-label="Anterior" type="button">
                  ‹
                </button>
                <button aria-label="Próximo" type="button">
                  ›
                </button>
              </div>
              <div className="mr-thumbs">
                {p.slides.map((s, i) => (
                  <button
                    aria-label={`Slide ${i + 1}`}
                    className={`mr-thumb-btn${i === 0 ? "on" : ""}`}
                    key={`${s.image}-${i}`}
                    type="button"
                  >
                    <Img src={s.image} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {p.testimonials.length ? (
            <div className="mr-rev">
              <div className="sb-cslider sg-car" data-sec={p.reviewSeconds}>
                <div className="sb-cslider-track">
                  {p.testimonials.map((t, i) => (
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
                  {p.testimonials.map((t, i) => (
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
          ) : null}
        </div>
      </section>
    ),
    type: "mrShowcase",
  }
);

/* ───────────────────────── cartões de categoria ───────────────────────── */

const mrCategories = defineBlock(
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
    label: "Cartões de categoria Marketing Raiz",
    render: (p, ctx) => {
      const items = p.items.length
        ? p.items
        : ctx.site.categories.map(c => ({
            image: "",
            label: c.name,
            slug: c.slug,
          }));
      return (
        <section className="mr-cats">
          {items.map((it, i) => {
            const cat = ctx.site.categories.find(c => c.slug === it.slug);
            return (
              <a
                className="mr-cat"
                href={cat ? href(ctx, categoryPath(cat)) : "#"}
                key={`${it.slug}-${i}`}
              >
                <Img alt="" src={it.image} />
                <span>{it.label || cat?.name || it.slug}</span>
              </a>
            );
          })}
        </section>
      );
    },
    type: "mrCategories",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const mrFooter = defineBlock(
  z.object({
    blogs: str(),
    blogsTitle: str("Blogs"),
    contactTitle: str("Fale conosco"),
    copyright: str(),
    email: str(),
    logo: str(),
    others: str(),
    othersTitle: str("Outras Opções"),
    policies: str(),
    policiesTitle: str("Políticas e Termos"),
    socials: str(),
    socialsTitle: str("Redes Sociais"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "othersTitle", kind: "text", label: "Coluna 2 — título" },
      {
        key: "others",
        kind: "textarea",
        label: "Coluna 2 — links (Texto | endereço)",
      },
      { key: "policiesTitle", kind: "text", label: "Coluna 3 — título" },
      {
        key: "policies",
        kind: "textarea",
        label: "Coluna 3 — links (Texto | endereço)",
      },
      { key: "blogsTitle", kind: "text", label: "Coluna 4 — título" },
      {
        key: "blogs",
        kind: "textarea",
        label: "Coluna 4 — links (Texto | endereço)",
      },
      {
        key: "socialsTitle",
        kind: "text",
        label: "Coluna 5 — título das redes",
      },
      {
        key: "socials",
        kind: "textarea",
        label:
          "Redes sociais — uma por linha: nome | link (instagram, threads, youtube, x, tiktok, video, facebook…)",
      },
      { key: "contactTitle", kind: "text", label: "Título do contato" },
      { key: "email", kind: "text", label: "E-mail" },
      { key: "copyright", kind: "text", label: "Direitos autorais" },
    ],
    group: "layout",
    label: "Rodapé Marketing Raiz",
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
        <footer className="mr-foot">
          <div className="mr-foot-in">
            <div className="mr-foot-row">
              <div className="logo">
                <Img alt="Logo" src={p.logo} />
              </div>
              <div>
                <h2>{p.othersTitle}</h2>
                <ul>{list(p.others)}</ul>
              </div>
              <div>
                <h2>{p.policiesTitle}</h2>
                <ul>{list(p.policies)}</ul>
              </div>
              <div>
                <h2>{p.blogsTitle}</h2>
                <ul>{list(p.blogs)}</ul>
              </div>
              <div>
                <h2>{p.socialsTitle}</h2>
                <div className="mr-foot-social">
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
                {p.email ? (
                  <>
                    <h2>{p.contactTitle}</h2>
                    <ul>
                      <li>
                        <a href={`mailto:${p.email}`}>{p.email}</a>
                      </li>
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
            <div className="mr-foot-bar">{p.copyright}</div>
          </div>
        </footer>
      );
    },
    type: "mrFooter",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const mrNotFound = defineBlock(
  z.object({
    actionsTitle: str("Você pode também:"),
    button1Label: str("VOLTAR PARA PÁGINA PRINCIPAL"),
    button1Url: str("/"),
    button2Label: str(),
    button2Url: str("#"),
    count: z.coerce.number().int().min(0).max(10).default(5).catch(5),
    image: str(),
    latestTitle: str("Últimas postagens:"),
    text: str(
      "Ops.. Parece que essa página não existe mais. Lamentamos por isso."
    ),
  }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem" },
      { key: "text", kind: "text", label: "Mensagem" },
      { key: "latestTitle", kind: "text", label: "Título da lista de posts" },
      { key: "count", kind: "number", label: "Quantos posts recentes" },
      { key: "actionsTitle", kind: "text", label: "Título dos botões" },
      { key: "button1Label", kind: "text", label: "Botão 1 — texto" },
      { key: "button1Url", kind: "url", label: "Botão 1 — link" },
      {
        key: "button2Label",
        kind: "text",
        label: "Botão 2 — texto (vazio = sem)",
      },
      { key: "button2Url", kind: "url", label: "Botão 2 — link" },
    ],
    group: "content",
    label: "Página 404 Marketing Raiz",
    render: (p, ctx) => (
      <section className="mr-nf">
        {p.image ? <Img alt="" src={p.image} /> : null}
        <h1>{p.text}</h1>
        {p.count > 0 ? (
          <>
            <h2>{p.latestTitle}</h2>
            <ul>
              {visiblePosts(ctx.site, ctx.mode)
                .slice(0, p.count)
                .map(post => (
                  <li key={post.id}>
                    <a href={href(ctx, postPath(post))}>{post.title}</a>
                  </li>
                ))}
            </ul>
          </>
        ) : null}
        <h2>{p.actionsTitle}</h2>
        <div className="mr-nf-btns">
          <a href={href(ctx, p.button1Url)} {...newTab(p.button1Url)}>
            {p.button1Label}
          </a>
          {p.button2Label ? (
            <a href={href(ctx, p.button2Url)} {...newTab(p.button2Url)}>
              {p.button2Label}
            </a>
          ) : null}
        </div>
      </section>
    ),
    type: "mrNotFound",
  }
);

/* ───────────────────────── funil ───────────────────────── */

const funnelBg = { background: str() };
const bgField: FieldDef = {
  key: "background",
  kind: "image",
  label: "Imagem de fundo (escura)",
};

/** Vimeo/YouTube → player limpo (sem título, retrato e autor). */
function playerSrc(url: string): string | null {
  const vim = vimeoEmbed(url);
  if (vim) {
    const u = vim.split("?")[0];
    const h = /[?&]h=([\w]+)/.exec(vim);
    return `${u}?title=0&portrait=0&byline=0${h ? `&h=${h[1]}` : ""}`;
  }
  return videoEmbed(url);
}

/**
 * Filhos: 1 `section` → 1.1 contêiner → 1.1.1 `div.mr-vsl` (1 título, 2 subtítulo, 3 vídeo, 4 botão). O botão
 * aparece com fade depois de `delaySeconds` e então pulsa; no editor e sem JS ele já aparece.
 */
const mrVsl = defineBlock(
  z.object({
    ...funnelBg,
    buttonLabel: str("Quero continuar"),
    buttonUrl: str("#"),
    delaySeconds: num(30, 0, 3600),
    subtitle: str(),
    title: str("Título do vídeo"),
    video: str(),
  }),
  {
    fields: [
      bgField,
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      { key: "video", kind: "text", label: "Vídeo (link do Vimeo ou YouTube)" },
      {
        key: "delaySeconds",
        kind: "number",
        label: "Segundos até o botão aparecer",
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      {
        key: "buttonUrl",
        kind: "url",
        label: "Link do botão (próxima página)",
      },
    ],
    group: "content",
    label: "Funil — vídeo com botão atrasado",
    render: (p, ctx) => {
      const src = playerSrc(p.video);
      return (
        <section className="mr-fun" style={bgVar("--mr-img", p.background)}>
          <div className="mr-fun-in">
            <div className="mr-vsl">
              <h1>{p.title}</h1>
              {p.subtitle ? <p>{p.subtitle}</p> : null}
              <div className="mr-video">
                {src ? (
                  <iframe allowFullScreen src={src} title={p.title} />
                ) : null}
              </div>
              <div className="mr-vsl-btn" data-mr-delay={p.delaySeconds}>
                <a
                  className="video mr-btn"
                  href={href(ctx, p.buttonUrl)}
                  {...newTab(p.buttonUrl)}
                >
                  {p.buttonLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      );
    },
    type: "mrVsl",
  }
);

const SCREEN = z.object({
  buttonLabel: str("Continuar..."),
  items: str(),
  text: str(),
  title: str(),
  url: str(),
});

function Screen({ ctx, s }: { ctx: RenderContext; s: z.infer<typeof SCREEN> }) {
  return (
    <div className="mr-step">
      {s.title ? <h2>{s.title}</h2> : null}
      {s.text
        .split(/\n{2,}/)
        .filter(Boolean)
        .map(t => (
          <p key={t}>{t}</p>
        ))}
      {s.items.trim() ? (
        <ul>
          {s.items
            .split("\n")
            .map(l => l.trim())
            .filter(Boolean)
            .map(l => (
              <li key={l}>{l}</li>
            ))}
        </ul>
      ) : null}
      {s.url ? (
        <a className="strong mr-btn" href={href(ctx, s.url)} {...newTab(s.url)}>
          {s.buttonLabel}
        </a>
      ) : (
        <button className="mr-btn" data-mr-next="" type="button">
          {s.buttonLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Filhos: 1 `section` → 1.1 contêiner → 1.1.1 `div[data-mr-flow]` → 1.1.1.n telas. Cada tela troca com fade
 * (~600 ms); a última deve ter um link. Sem JS todas as telas aparecem empilhadas.
 */
const mrSteps = defineBlock(
  z.object({
    ...funnelBg,
    screens: z.array(SCREEN).default([]),
  }),
  {
    fields: [
      bgField,
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título (opcional)" },
          {
            key: "text",
            kind: "textarea",
            label: "Texto (linha em branco separa parágrafos)",
          },
          {
            key: "items",
            kind: "textarea",
            label: "Lista com ✓ — um item por linha (opcional)",
          },
          { key: "buttonLabel", kind: "text", label: "Texto do botão" },
          {
            key: "url",
            kind: "url",
            label: "Link do botão (vazio = vai para a próxima tela)",
          },
        ],
        key: "screens",
        kind: "list",
        label: "Telas",
      },
    ],
    group: "content",
    label: "Funil — história em telas",
    render: (p, ctx) => (
      <section className="mr-fun" style={bgVar("--mr-img", p.background)}>
        <div className="mr-fun-in">
          <div className="mr-flow" data-mr-flow="">
            {p.screens.map((s, i) => (
              <Screen ctx={ctx} key={`${s.text}-${i}`} s={s} />
            ))}
          </div>
        </div>
      </section>
    ),
    type: "mrSteps",
  }
);

const QUESTION = z.object({ answers: str(), text: str() });

/**
 * Filhos: 1 `section` → 1.1 contêiner → 1.1.1 `div[data-mr-flow]` → telas: 1 abertura, 2…n perguntas, depois
 * "analisando" (barra de progresso) e a tela final. A barra começa em `start`% e soma `step`% a cada `interval` ms.
 */
const mrQuiz = defineBlock(
  z.object({
    ...funnelBg,
    ctaLabel: str("Quero continuar"),
    ctaUrl: str("#"),
    doneText: str("Concluído!"),
    finalText: str(),
    finalTitle: str("Resultado"),
    interval: num(250, 50, 2000),
    introButton: str("COMEÇAR"),
    introText: str(),
    introTitle: str(),
    loadingTitle: str("Analisando suas respostas..."),
    questions: z.array(QUESTION).default([]),
    start: num(5, 0, 100),
    step: num(3.7, 0.1, 20),
  }),
  {
    fields: [
      bgField,
      { key: "introTitle", kind: "text", label: "Abertura — título" },
      { key: "introText", kind: "textarea", label: "Abertura — texto" },
      { key: "introButton", kind: "text", label: "Abertura — botão" },
      {
        itemFields: [
          { key: "text", kind: "textarea", label: "Pergunta" },
          {
            key: "answers",
            kind: "textarea",
            label: "Respostas — uma por linha",
          },
        ],
        key: "questions",
        kind: "list",
        label: "Perguntas (qualquer resposta avança)",
      },
      { key: "loadingTitle", kind: "text", label: "Tela de análise — título" },
      { key: "start", kind: "number", label: "Barra — começa em (%)" },
      { key: "step", kind: "number", label: "Barra — soma a cada passo (%)" },
      {
        key: "interval",
        kind: "number",
        label: "Barra — tempo de cada passo (ms)",
      },
      { key: "doneText", kind: "text", label: "Texto ao chegar em 100%" },
      { key: "finalTitle", kind: "text", label: "Tela final — título" },
      { key: "finalText", kind: "textarea", label: "Tela final — mensagem" },
      { key: "ctaLabel", kind: "text", label: "Tela final — botão" },
      { key: "ctaUrl", kind: "url", label: "Tela final — link do botão" },
    ],
    group: "content",
    label: "Funil — quiz com barra de análise",
    render: (p, ctx) => (
      <section className="mr-fun" style={bgVar("--mr-img", p.background)}>
        <div className="mr-fun-in">
          <div className="mr-flow mr-quiz" data-mr-flow="">
            <div className="mr-step">
              {p.introTitle ? <h2>{p.introTitle}</h2> : null}
              {p.introText ? <p className="mr-quiz-q">{p.introText}</p> : null}
              <button className="mr-btn" data-mr-next="" type="button">
                {p.introButton}
              </button>
            </div>
            {p.questions.map((q, i) => (
              <div className="mr-step" key={`${q.text}-${i}`}>
                <p className="mr-quiz-q">{q.text}</p>
                <div className="mr-answers">
                  {q.answers
                    .split("\n")
                    .map(a => a.trim())
                    .filter(Boolean)
                    .map(a => (
                      <button
                        className="mr-btn"
                        data-mr-next=""
                        key={a}
                        type="button"
                      >
                        {a}
                      </button>
                    ))}
                </div>
              </div>
            ))}
            <div className="mr-analyzing mr-step">
              <p className="mr-load">{p.loadingTitle}</p>
              <div
                className="mr-bar"
                data-interval={p.interval}
                data-start={p.start}
                data-step={p.step}
              >
                <div className="mr-bar-fill" style={{ width: `${p.start}%` }}>
                  {p.start}%
                </div>
              </div>
              <div className="mr-done">{p.doneText}</div>
            </div>
            <div className="mr-step">
              <h2 className="mr-final-title">{p.finalTitle}</h2>
              {p.finalText
                ? p.finalText
                    .split(/\n{2,}/)
                    .filter(Boolean)
                    .map(t => <p key={t}>{t}</p>)
                : null}
              <a
                className="strong mr-btn"
                href={href(ctx, p.ctaUrl)}
                {...newTab(p.ctaUrl)}
              >
                {p.ctaLabel}
              </a>
            </div>
          </div>
        </div>
      </section>
    ),
    type: "mrQuiz",
  }
);

/** Captura de e-mail neutra: envia para uma URL configurável (sem backend próprio). */
const mrCapture = defineBlock(
  z.object({
    ...funnelBg,
    actionUrl: str(),
    buttonLabel: str("Quero receber"),
    placeholder: str("Digite seu melhor e-mail"),
    title: str("Receba o material no seu e-mail"),
  }),
  {
    fields: [
      bgField,
      { key: "title", kind: "text", label: "Título" },
      { key: "placeholder", kind: "text", label: "Texto do campo" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      {
        key: "actionUrl",
        kind: "url",
        label:
          "Endereço que recebe o e-mail (formulário da sua ferramenta de e-mail marketing)",
      },
    ],
    group: "content",
    label: "Funil — captura de e-mail",
    render: (p, ctx) => {
      const action = p.actionUrl.trim();
      const off = !action;
      return (
        <section className="mr-fun" style={bgVar("--mr-img", p.background)}>
          <div className="mr-capture mr-fun-in">
            <h1>{p.title}</h1>
            <form action={off ? undefined : safeUrl(action)} method="post">
              <input
                aria-label={p.placeholder}
                disabled={off}
                name="email"
                placeholder={p.placeholder}
                required
                type="email"
              />
              <button className="strong mr-btn" disabled={off} type="submit">
                {p.buttonLabel}
              </button>
            </form>
            {off && ctx.mode === "edit" ? (
              <p className="mr-notice">
                Formulário desligado: informe o endereço que recebe o e-mail nas
                propriedades do bloco.
              </p>
            ) : null}
          </div>
        </section>
      );
    },
    type: "mrCapture",
  }
);

export const raizBlocks: BlockDefinition[] = [
  mrHeader,
  mrHero,
  mrHighlights,
  mrPostGrid,
  mrShowcase,
  mrCategories,
  mrFooter,
  mrNotFound,
  mrVsl,
  mrSteps,
  mrQuiz,
  mrCapture,
];
