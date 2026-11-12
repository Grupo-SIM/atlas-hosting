import type { CSSProperties } from "react";
import { z } from "zod";
import { defineBlock } from "./define.js";
import { categoryPath, href, Img, postPath } from "./helpers.js";
import type { BlockDefinition } from "./types.js";

import {
  CalendarIcon,
  flag,
  int,
  LINK_FIELDS,
  linkList,
  SearchIcon,
  SOCIAL_FIELD,
  Socials,
  str,
  ZyList,
  zyPosts,
} from "./zyrion-lib.js";

const todayPt = () =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(new Date());

/* ───────────────────────── cabeçalho ───────────────────────── */

const zyHeader = defineBlock(
  z.object({
    logo: str(),
    searchLabel: str("Pesquisar"),
    socials: linkList,
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      {
        key: "searchLabel",
        kind: "text",
        label: "Texto da busca em tela cheia",
      },
      SOCIAL_FIELD,
    ],
    group: "layout",
    label: "Cabeçalho Zyrion",
    render: (p, ctx) => (
      <div className="zy-header" data-zy="header">
        <div className="zy-top">
          <div className="zy-in">
            <span className="zy-date">
              <CalendarIcon />
              <span data-sb-today>{todayPt()}</span>
            </span>
            <Socials ctx={ctx} items={p.socials} />
          </div>
        </div>
        <header className="zy-bar">
          <div className="zy-in">
            <a className="zy-logo" href={href(ctx, "/")}>
              <Img alt={ctx.site.name} src={p.logo} />
            </a>
            <div className="zy-right">
              {/* biome-ignore lint/correctness/useUniqueElementIds: o menu do celular usa label for=id; há um só cabeçalho por página */}
              <input
                aria-label="Abrir menu"
                className="zy-nav-input"
                id="sb-burger"
                type="checkbox"
              />
              <nav className="zy-nav">
                {ctx.site.menu.map(item => (
                  <a
                    aria-current={
                      item.href.replace(/\/$/, "") ===
                        (ctx.path ?? "").replace(/\/$/, "") && item.href !== "#"
                        ? "page"
                        : undefined
                    }
                    href={href(ctx, item.href)}
                    key={item.href + item.label}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              {/* biome-ignore lint/correctness/useUniqueElementIds: a busca em tela cheia usa label for=id */}
              <input
                aria-label={p.searchLabel}
                className="zy-search-input"
                id="zy-search"
                type="checkbox"
              />
              <label
                aria-label={p.searchLabel}
                className="zy-search-btn"
                htmlFor="zy-search"
              >
                <SearchIcon />
              </label>
              <label className="zy-nav-toggle" htmlFor="sb-burger">
                <i />
                <i />
                <i />
              </label>
              <div className="zy-overlay">
                <label
                  aria-label="Fechar"
                  className="zy-close"
                  htmlFor="zy-search"
                >
                  ×
                </label>
                <form action={href(ctx, "/pesquisa/")} method="get">
                  <input
                    aria-label={p.searchLabel}
                    name="q"
                    placeholder={p.searchLabel}
                    type="search"
                  />
                </form>
              </div>
            </div>
          </div>
        </header>
      </div>
    ),
    type: "zyHeader",
  }
);

/* ───────────────────────── divisor de seção ───────────────────────── */

const zyDivider = defineBlock(
  z.object({
    align: z.enum(["left", "center"]).default("left").catch("left"),
    dark: flag("no"),
    text: str("Em alta"),
    thin: flag("no"),
  }),
  {
    fields: [
      { key: "text", kind: "text", label: "Texto" },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento do texto",
        options: [
          { label: "Esquerda", value: "left" },
          { label: "Centro", value: "center" },
        ],
      },
      {
        key: "dark",
        kind: "select",
        label: "Fundo",
        options: [
          { label: "Claro", value: "no" },
          { label: "Escuro (texto branco)", value: "yes" },
        ],
      },
      {
        key: "thin",
        kind: "select",
        label: "Linha",
        options: [
          { label: "Grossa (home)", value: "no" },
          { label: "Fina 1px (post, rodapé)", value: "yes" },
        ],
      },
    ],
    group: "content",
    label: "Divisor de seção (Zyrion)",
    render: p => (
      <div
        className={`zy-div${p.align === "center" ? "center" : ""}${p.dark === "yes" ? "dark" : ""}${p.thin === "yes" ? "thin" : ""}`}
        data-zy="divider"
      >
        <h2>{p.text}</h2>
      </div>
    ),
    type: "zyDivider",
  }
);

/* ───────────────────────── lista com miniatura ───────────────────────── */

const zyPostList = defineBlock(
  z.object({
    buttonLabel: str(),
    categorySlug: str(),
    cols: int(1, 3, 1),
    colsMobile: int(1, 3, 1),
    colsTablet: int(1, 3, 1),
    dark: flag("no"),
    gap: int(0, 80, 20),
    limit: int(1, 24, 3),
    mediaGap: int(0, 60, 12),
    offset: int(0, 200, 0),
    ratio: z.coerce.number().min(0.4).max(2).default(1).catch(1),
    showAuthor: flag("yes"),
    showDate: flag("yes"),
    thumb: int(10, 50, 24),
    thumbMobile: int(10, 60, 32),
    thumbTablet: int(10, 60, 28),
  }),
  {
    fields: [
      {
        key: "categorySlug",
        kind: "text",
        label: "Categoria (endereço; vazio = todas)",
      },
      { key: "limit", kind: "number", label: "Quantidade de posts" },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
      { key: "cols", kind: "number", label: "Colunas (desktop)" },
      { key: "colsTablet", kind: "number", label: "Colunas (tablet)" },
      { key: "colsMobile", kind: "number", label: "Colunas (celular)" },
      {
        key: "thumb",
        kind: "number",
        label: "Largura da miniatura em % (desktop)",
      },
      {
        key: "thumbTablet",
        kind: "number",
        label: "Largura da miniatura em % (tablet)",
      },
      {
        key: "thumbMobile",
        kind: "number",
        label: "Largura da miniatura em % (celular)",
      },
      {
        key: "ratio",
        kind: "number",
        label: "Proporção da miniatura (largura ÷ altura; 1 = quadrada)",
      },
      { key: "gap", kind: "number", label: "Espaço entre itens (px)" },
      {
        key: "mediaGap",
        kind: "number",
        label: "Espaço entre miniatura e texto (px)",
      },
      {
        key: "dark",
        kind: "select",
        label: "Tema",
        options: [
          { label: "Claro", value: "no" },
          { label: "Escuro (texto branco)", value: "yes" },
        ],
      },
      {
        key: "showAuthor",
        kind: "select",
        label: "Mostrar autor",
        options: [
          { label: "Sim", value: "yes" },
          { label: "Não", value: "no" },
        ],
      },
      {
        key: "showDate",
        kind: "select",
        label: "Mostrar data",
        options: [
          { label: "Sim", value: "yes" },
          { label: "Não", value: "no" },
        ],
      },
      {
        key: "buttonLabel",
        kind: "text",
        label: 'Botão "Ver todas" — texto (vazio = sem botão)',
      },
    ],
    group: "blog",
    label: "Lista de posts com miniatura (Zyrion)",
    render: (p, ctx) => {
      const list = zyPosts(ctx, p.categorySlug, p.offset, p.limit);
      const cat = ctx.site.categories.find(c => c.slug === p.categorySlug);
      return (
        <div data-zy="postList">
          <ZyList ctx={ctx} opts={p} posts={list} />
          {p.buttonLabel ? (
            <a
              className="zy-btn"
              href={href(ctx, cat ? categoryPath(cat) : "/")}
            >
              {p.buttonLabel}
            </a>
          ) : null}
        </div>
      );
    },
    type: "zyPostList",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const zyFooter = defineBlock(
  z.object({
    brandName: str("Portal Zyrion"),
    categoriesTitle: str("Categorias"),
    contactTitle: str("Contato"),
    copyright: str("Todos os direitos reservados."),
    ctaLabel: str("Faça parte"),
    ctaText: str("Conteúdo premium e benefícios exclusivos!"),
    ctaTitle: str("Entre para a comunidade"),
    ctaUrl: str("/comunidade/"),
    description: str(),
    email: str(),
    emailLabel: str("E-MAIL"),
    latestCount: int(1, 6, 3),
    latestTitle: str("Últimas Notícias"),
    logo: str(),
    slogan: str("Notícias • Negócios • Entretenimento"),
    socials: linkList,
    terms: linkList,
    termsTitle: str("Termos"),
  }),
  {
    fields: [
      { key: "ctaTitle", kind: "text", label: "Caixa CTA — título" },
      { key: "ctaText", kind: "text", label: "Caixa CTA — texto" },
      { key: "ctaLabel", kind: "text", label: "Caixa CTA — botão" },
      { key: "ctaUrl", kind: "url", label: "Caixa CTA — link do botão" },
      { key: "logo", kind: "image", label: "Logo" },
      { key: "slogan", kind: "text", label: "Slogan" },
      { key: "description", kind: "textarea", label: "Descrição" },
      SOCIAL_FIELD,
      { key: "latestTitle", kind: "text", label: "Coluna 1 — título" },
      {
        key: "latestCount",
        kind: "number",
        label: "Coluna 1 — quantidade de posts",
      },
      {
        key: "categoriesTitle",
        kind: "text",
        label: "Coluna 2 — título (lista as categorias do site)",
      },
      { key: "termsTitle", kind: "text", label: "Coluna 3 — título" },
      {
        itemFields: LINK_FIELDS,
        key: "terms",
        kind: "list",
        label: "Coluna 3 — links",
      },
      { key: "contactTitle", kind: "text", label: "Coluna 4 — título" },
      { key: "emailLabel", kind: "text", label: "Rótulo acima do e-mail" },
      { key: "email", kind: "text", label: "E-mail de contato" },
      { key: "brandName", kind: "text", label: "Nome da marca (copyright)" },
      { key: "copyright", kind: "text", label: "Texto do copyright" },
    ],
    group: "layout",
    label: "Rodapé Zyrion",
    render: (p, ctx) => {
      const latest = zyPosts(ctx, "", 0, p.latestCount);
      return (
        <footer className="zy-foot" data-zy="footer">
          <div className="zy-cta">
            <div className="zy-cta-box">
              <h2>{`${p.ctaTitle} ${p.brandName}`.trim()}</h2>
              <p>{p.ctaText}</p>
              <a className="zy-cta-btn" href={href(ctx, p.ctaUrl)}>
                {p.ctaLabel}
              </a>
            </div>
          </div>
          <div className="zy-dark">
            <div className="zy-brand">
              <a href={href(ctx, "/")}>
                <Img alt={p.brandName} src={p.logo} />
              </a>
              <strong>{p.slogan}</strong>
              {p.description ? <p>{p.description}</p> : null}
              <Socials ctx={ctx} items={p.socials} />
            </div>
            <div className="zy-foot-cols">
              <div>
                <h3>{p.latestTitle}</h3>
                <div
                  className="zy-pl dark"
                  style={
                    {
                      "--zy-gap": "16px",
                      "--zy-mgap": "16px",
                      "--zy-ratio": 1.25,
                      "--zy-thumb": "18%",
                    } as CSSProperties
                  }
                >
                  {latest.map(post => (
                    <article className="zy-pl-item" key={post.id}>
                      <a href={href(ctx, postPath(post))}>
                        <Img alt="" src={post.coverImage} />
                      </a>
                      <div>
                        <a href={href(ctx, postPath(post))}>{post.title}</a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div>
                <h3>{p.categoriesTitle}</h3>
                <ul>
                  {ctx.site.categories.map(c => (
                    <li key={c.id}>
                      <a href={href(ctx, categoryPath(c))}>{c.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{p.termsTitle}</h3>
                <ul>
                  {p.terms.map(t => (
                    <li key={t.label + t.url}>
                      <a href={href(ctx, t.url)}>{t.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{p.contactTitle}</h3>
                <ul>
                  <li>
                    <strong>{p.emailLabel}</strong>
                    <br />
                    <a href={`mailto:${p.email}`}>{p.email}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="zy-copy">
            <div className="zy-in">
              © {new Date().getFullYear()} {p.brandName}. {p.copyright}
            </div>
          </div>
        </footer>
      );
    },
    type: "zyFooter",
  }
);

export const zyrionBlocks: BlockDefinition[] = [
  zyHeader,
  zyDivider,
  zyPostList,
  zyFooter,
];
