import { z } from "zod";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  href,
  Img,
  postPath,
  SocialIcon,
} from "./helpers.js";
import {
  CatTag,
  flag,
  HfAd,
  HfCard,
  HfItem,
  hfPosts,
  int,
  LINK_FIELDS,
  linkList,
  parseLinks,
  SearchIcon,
  SOCIAL_FIELD,
  Socials,
  str,
  styleVars,
  YES_NO,
} from "./holofote-lib.js";
import type { BlockDefinition } from "./types.js";

/** Blocos do tema Holofote: cabeçalho/menu/menu lateral, destaques, grade de notícias, lista, rodapé e contêineres. */

/* ───────────────────────── cabeçalho ───────────────────────── */

const Burger = () => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth="2.4"
    viewBox="0 0 24 24"
  >
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

const hfHeader = defineBlock(
  z.object({
    dark: z.enum(["auto", "yes", "no"]).default("auto").catch("auto"),
    logo: str(),
    logoWhite: str(),
    searchPlaceholder: str("busca"),
    socials: linkList,
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo (preto, para fundo claro)" },
      {
        key: "logoWhite",
        kind: "image",
        label: "Logo branco (cabeçalho escuro de categoria)",
      },
      {
        key: "dark",
        kind: "select",
        label: "Cabeçalho escuro",
        options: [
          { label: "Só nas páginas de categoria", value: "auto" },
          { label: "Sempre", value: "yes" },
          { label: "Nunca", value: "no" },
        ],
      },
      { key: "searchPlaceholder", kind: "text", label: "Texto da busca" },
      SOCIAL_FIELD,
    ],
    group: "layout",
    label: "Cabeçalho Holofote (menu lateral e busca)",
    render: (p, ctx) => {
      const dark =
        p.dark === "yes" || (p.dark === "auto" && !!ctx.current.category);
      const logo = dark && p.logoWhite ? p.logoWhite : p.logo;
      const current = (url: string) =>
        url !== "#" &&
        url.replace(/\/$/, "") === (ctx.path ?? "").replace(/\/$/, "")
          ? ("page" as const)
          : undefined;
      const items = ctx.site.menu.map(item => (
        <li key={item.href + item.label}>
          <a aria-current={current(item.href)} href={href(ctx, item.href)}>
            {item.label}
          </a>
        </li>
      ));
      return (
        <div
          className={dark ? "hf-header hf-dark" : "hf-header"}
          data-hf="header"
        >
          {/* biome-ignore lint/correctness/useUniqueElementIds: o menu lateral usa label for=id; há um só cabeçalho por página */}
          <input
            aria-label="Abrir menu"
            className="hf-burger-input"
            id="sb-burger"
            type="checkbox"
          />
          {/* biome-ignore lint/correctness/useUniqueElementIds: a busca do celular usa label for=id */}
          <input
            aria-label="Abrir busca"
            className="hf-search-input"
            id="hf-search"
            type="checkbox"
          />
          <header className="hf-bar">
            <label
              aria-label="Menu"
              className="hf-burger-btn"
              htmlFor="sb-burger"
            >
              <Burger />
            </label>
            <a className="hf-logo" href={href(ctx, "/")}>
              <Img alt={ctx.site.name} src={logo} />
            </a>
            {dark && ctx.current.category ? (
              <span className="hf-catname">{ctx.current.category.name}</span>
            ) : null}
            <form
              action={href(ctx, "/pesquisa/")}
              className="hf-sform"
              method="get"
            >
              <input
                aria-label={p.searchPlaceholder}
                name="q"
                placeholder={p.searchPlaceholder}
                type="search"
              />
              <button aria-label="Buscar" type="submit">
                <SearchIcon />
              </button>
            </form>
            <Socials ctx={ctx} items={p.socials} />
            <label aria-label="Buscar" className="hf-lupa" htmlFor="hf-search">
              <SearchIcon />
            </label>
            <div className="hf-smobile">
              <form
                action={href(ctx, "/pesquisa/")}
                className="hf-smobile-form"
                method="get"
              >
                <input
                  aria-label={p.searchPlaceholder}
                  name="q"
                  placeholder={p.searchPlaceholder}
                  type="search"
                />
              </form>
              <label
                aria-label="Fechar busca"
                className="hf-smobile-x"
                htmlFor="hf-search"
              >
                ×
              </label>
            </div>
          </header>
          <nav aria-label="Menu principal" className="hf-menu">
            <ul>{items}</ul>
          </nav>
          <label
            aria-label="Fechar menu"
            className="hf-veil"
            htmlFor="sb-burger"
          />
          <aside className="hf-drawer">
            <a className="hf-drawer-logo" href={href(ctx, "/")}>
              <Img alt={ctx.site.name} src={p.logo} />
            </a>
            <ul>{items}</ul>
          </aside>
        </div>
      );
    },
    type: "hfHeader",
  }
);

/** Faixa de anúncio logo abaixo do cabeçalho (728×90; no celular 320×50). */
const hfAdStrip = defineBlock(z.object({}), {
  fields: [],
  group: "media",
  label: "Faixa de anúncio do cabeçalho (Holofote)",
  render: (_p, ctx) => (
    <div className="hf-adstrip" data-hf="adStrip">
      <HfAd ctx={ctx} size="banner" />
    </div>
  ),
  type: "hfAdStrip",
});

/* ───────────────────────── destaques 1 + 4 ───────────────────────── */

const hfFeatured = defineBlock(
  z.object({
    categorySlug: str(),
    hoverVeil: flag("no"),
    offset: int(0, 200, 0),
  }),
  {
    fields: [
      {
        key: "categorySlug",
        kind: "text",
        label: "Categoria (endereço; vazio = a da página, ou todas)",
      },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
      {
        key: "hoverVeil",
        kind: "select",
        label: "Véu escuro ao passar o mouse",
        options: YES_NO,
      },
    ],
    group: "blog",
    label: "Destaques 1 + 4 (Holofote)",
    render: (p, ctx) => {
      const slug = p.categorySlug || ctx.current.category?.slug || "";
      const list = hfPosts(ctx, slug, p.offset, 5, true);
      const [big, ...small] = list;
      const card = (post: (typeof list)[number], cls: string) => {
        const cat = categoryOf(ctx.site, post);
        return (
          <a className={cls} href={href(ctx, postPath(post))} key={post.id}>
            <Img alt="" src={post.coverImage} />
            <span className="hf-fcap">
              {cat ? <CatTag>{cat.name}</CatTag> : null}
              <strong>{post.title}</strong>
            </span>
          </a>
        );
      };
      return (
        <section
          className={
            p.hoverVeil === "yes" || ctx.current.category
              ? "hf-feat veil"
              : "hf-feat"
          }
          data-hf="featured"
        >
          {big ? card(big, "hf-fcard hf-fbig") : null}
          <div className="hf-fgrid">
            {small.map(post => card(post, "hf-fcard"))}
          </div>
        </section>
      );
    },
    type: "hfFeatured",
  }
);

/* ───────────────────────── Últimas Notícias ───────────────────────── */

const hfLatest = defineBlock(
  z.object({
    adAfter: str("2,4,6,9,12,15,18,21"),
    buttonLabel: str("Veja mais"),
    categorySlug: str(),
    count: int(1, 200, 24),
    layout: z.enum(["grid", "split"]).default("grid").catch("grid"),
    offset: int(0, 200, 0),
    step: int(0, 60, 12),
    title: str("Últimas Notícias"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da seção" },
      {
        key: "categorySlug",
        kind: "text",
        label: "Categoria (endereço; vazio = a da página, ou todas)",
      },
      {
        key: "layout",
        kind: "select",
        label: "Disposição",
        options: [
          { label: "Grade de cartões", value: "grid" },
          {
            label: "Dividida: grade + lista com rolagem (categoria)",
            value: "split",
          },
        ],
      },
      { key: "count", kind: "number", label: "Máximo de posts" },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
      {
        key: "step",
        kind: "number",
        label: '"Veja mais": cartões por vez (0 = mostrar todos, sem botão)',
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
      {
        key: "adAfter",
        kind: "text",
        label:
          "Anúncio 300×250 depois dos cartões nº (ex.: 2,4,6,9; vazio = sem)",
      },
    ],
    group: "blog",
    label: "Últimas Notícias (Holofote)",
    render: (p, ctx) => {
      const slug = p.categorySlug || ctx.current.category?.slug || "";
      const list = hfPosts(ctx, slug, p.offset, p.count);
      const visible = ctx.mode === "edit" || p.step <= 0 ? list.length : p.step;
      const ads = new Set(
        p.adAfter
          .split(",")
          .map(n => Number(n.trim()))
          .filter(n => n > 0)
      );
      const cells = list.flatMap((post, i) => {
        const out = [
          <HfCard ctx={ctx} hidden={i >= visible} key={post.id} post={post} />,
        ];
        if (ads.has(i + 1))
          out.push(
            <div
              className="hf-adcell"
              hidden={i >= visible || undefined}
              key={`ad-${post.id}`}
            >
              <HfAd ctx={ctx} size="square" />
            </div>
          );
        return out;
      });
      const more =
        p.step > 0 && list.length > visible ? (
          <button
            className="hf-more"
            data-hf-btn
            data-step={p.step}
            type="button"
          >
            {p.buttonLabel}
          </button>
        ) : null;
      const grid = <div className="hf-grid">{cells}</div>;
      return (
        <section className="hf-sec" data-hf="latest" data-hf-more>
          <h2 className="hf-h2">{p.title}</h2>
          {p.layout === "split" ? (
            <div className="hf-twocol">
              <div className="hf-twocol-a">{grid}</div>
              <aside aria-label={p.title} className="hf-twocol-b">
                {list.map(post => (
                  <HfItem ctx={ctx} key={post.id} post={post} />
                ))}
              </aside>
            </div>
          ) : (
            grid
          )}
          {more}
        </section>
      );
    },
    type: "hfLatest",
  }
);

/* ───────────────────────── lista compacta ───────────────────────── */

const hfPostList = defineBlock(
  z.object({
    box: flag("no"),
    categorySlug: str(),
    count: int(1, 100, 8),
    mode: z.enum(["recent", "search"]).default("recent").catch("recent"),
    offset: int(0, 200, 0),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título (vazio = sem título)" },
      {
        key: "mode",
        kind: "select",
        label: "Posts",
        options: [
          { label: "Mais recentes", value: "recent" },
          { label: "Resultado da busca (?q=)", value: "search" },
        ],
      },
      {
        key: "categorySlug",
        kind: "text",
        label: "Categoria (endereço; vazio = todas)",
      },
      { key: "count", kind: "number", label: "Quantidade" },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
      {
        key: "box",
        kind: "select",
        label: "Dentro de caixa branca",
        options: YES_NO,
      },
    ],
    group: "blog",
    label: "Lista compacta de notícias (Holofote)",
    render: (p, ctx) => {
      const search = p.mode === "search";
      const q = (ctx.query.q ?? "").trim().toLowerCase();
      const list = hfPosts(ctx, p.categorySlug, p.offset, 200)
        .filter(
          post =>
            !search ||
            !q ||
            `${post.title} ${post.excerpt}`.toLowerCase().includes(q)
        )
        .slice(0, p.count);
      return (
        <section
          className={p.box === "yes" ? "hf-listbox box" : "hf-listbox"}
          data-hf="postList"
        >
          {p.title ? <h2 className="hf-side-title">{p.title}</h2> : null}
          <div className="hf-list">
            {list.map(post => (
              <HfItem ctx={ctx} key={post.id} post={post} search={search} />
            ))}
          </div>
        </section>
      );
    },
    type: "hfPostList",
  }
);

/* ───────────────────────── contêineres ───────────────────────── */

const hfSplit = defineBlock(
  z.object({
    gray: flag("yes"),
    layout: z.enum(["post", "results"]).default("post").catch("post"),
  }),
  {
    fields: [
      {
        key: "gray",
        kind: "select",
        label: "Fundo cinza da página (post, tag, busca)",
        options: YES_NO,
      },
      {
        key: "layout",
        kind: "select",
        label: "Proporção das colunas (abaixo de 992px empilha)",
        options: [
          { label: "Post: matéria 820px + barra lateral 300px", value: "post" },
          { label: "Resultados (tag, busca): 8/12 + 4/12", value: "results" },
        ],
      },
    ],
    group: "layout",
    label: "Duas colunas (Holofote)",
    render: (p, _ctx, children) => (
      <section
        className={`hf-cols${p.layout === "results" ? "results" : ""}${p.gray === "yes" ? "hf-gray" : ""}`}
        data-hf="split"
      >
        <div className="hf-cols-in">
          <div className="hf-cols-a">{children[0]}</div>
          <div className="hf-cols-b">{children[1]}</div>
        </div>
      </section>
    ),
    type: "hfSplit",
  }
);

const hfStack = defineBlock(z.object({ gap: int(0, 80, 0) }), {
  fields: [
    { key: "gap", kind: "number", label: "Espaço entre os blocos (px)" },
  ],
  group: "layout",
  label: "Pilha vertical (Holofote)",
  render: (p, _ctx, children) => (
    <div className="hf-stack" style={styleVars({ "--hf-gap": `${p.gap}px` })}>
      {children}
    </div>
  ),
  type: "hfStack",
});

/* ───────────────────────── rodapé + modal de compartilhar ───────────────────────── */

const column = z.object({ links: str(), title: str() });

const NET_ICONS = {
  mail: (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  pinterest: (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 0 0-3.64 19.3c-.09-.82-.17-2.07.03-2.96l1.2-5.1s-.3-.62-.3-1.52c0-1.43.83-2.5 1.87-2.5.88 0 1.3.66 1.3 1.45 0 .88-.56 2.2-.85 3.43-.24 1.02.52 1.86 1.52 1.86 1.82 0 3.22-1.92 3.22-4.7 0-2.45-1.76-4.17-4.28-4.17-2.92 0-4.63 2.19-4.63 4.45 0 .88.34 1.82.76 2.33.08.1.1.19.07.3l-.28 1.16c-.04.18-.15.22-.34.13-1.28-.6-2.08-2.47-2.08-3.97 0-3.23 2.35-6.2 6.78-6.2 3.56 0 6.33 2.54 6.33 5.93 0 3.54-2.23 6.39-5.33 6.39-1.04 0-2.02-.54-2.35-1.18l-.64 2.38c-.23.89-.86 2-1.28 2.68A10 10 0 1 0 12 2z" />
    </svg>
  ),
  whatsapp: (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z" />
    </svg>
  ),
};

const hfFooter = defineBlock(
  z.object({
    columns: z.array(column).default([]),
    copyright: str("Holofote"),
    note: str(),
    shareHint: str("Onde deseja compartilhar?"),
    socials: linkList,
    socialsTitle: str("Redes sociais"),
  }),
  {
    fields: [
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título da coluna" },
          {
            key: "links",
            kind: "textarea",
            label: "Links (um por linha: Texto | endereço)",
          },
        ],
        key: "columns",
        kind: "list",
        label: "Colunas de links",
      },
      { key: "socialsTitle", kind: "text", label: "Coluna de redes — título" },
      SOCIAL_FIELD,
      {
        key: "copyright",
        kind: "text",
        label: "Nome no copyright (© ano nome)",
      },
      {
        key: "note",
        kind: "text",
        label: "Texto opcional à direita da faixa inferior",
      },
      {
        key: "shareHint",
        kind: "text",
        label: 'Modal de compartilhar — texto ("Onde deseja compartilhar?")',
      },
    ],
    group: "layout",
    label: "Rodapé Holofote (com modal de compartilhar)",
    render: (p, ctx) => (
      <footer className="hf-foot" data-hf="footer">
        <div className="hf-foot-top">
          <div className="hf-in hf-foot-cols">
            {p.columns.map(c => (
              <div className="hf-foot-col" key={c.title}>
                <h4>{c.title}</h4>
                <ul>
                  {parseLinks(c.links).map(l => (
                    <li key={l.label + l.url}>
                      <a href={href(ctx, l.url)}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="hf-foot-col hf-foot-soc">
              <Socials ctx={ctx} items={p.socials} />
              <h4>{p.socialsTitle}</h4>
            </div>
          </div>
        </div>
        <div className="hf-foot-bot">
          <div className="hf-in hf-foot-bot-in">
            <span>
              Copyright © {p.copyright} {new Date().getFullYear()} - Todos os
              Direitos Reservados.
            </span>
            {p.note ? <span>{p.note}</span> : null}
          </div>
        </div>
        <div
          aria-labelledby="hf-modal-title"
          aria-modal="true"
          className="hf-modal"
          data-hf="shareModal"
          hidden
          role="dialog"
        >
          <div className="hf-modal-box">
            <button
              aria-label="Fechar"
              className="hf-modal-x"
              data-hf-close
              type="button"
            >
              ×
            </button>
            {/* biome-ignore lint/correctness/useUniqueElementIds: um só modal por página; aria-labelledby aponta para ele */}
            <h5 className="hf-modal-title" id="hf-modal-title">
              Compartilhar
            </h5>
            <p>{p.shareHint}</p>
            <div className="hf-nets">
              <a
                data-net="facebook"
                href="#share"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="hf-net" style={{ background: "#3b5998" }}>
                  <SocialIcon label="facebook" />
                  <i className="hf-sr">Facebook</i>
                </span>
              </a>
              <a
                data-net="twitter"
                href="#share"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="hf-net" style={{ background: "#00aced" }}>
                  <SocialIcon label="x" />
                  <i className="hf-sr">X</i>
                </span>
              </a>
              <a
                data-net="pinterest"
                href="#share"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="hf-net" style={{ background: "#cb2027" }}>
                  {NET_ICONS.pinterest}
                  <i className="hf-sr">Pinterest</i>
                </span>
              </a>
              <a
                data-net="whatsapp"
                href="#share"
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="hf-net" style={{ background: "#34af23" }}>
                  {NET_ICONS.whatsapp}
                  <i className="hf-sr">WhatsApp</i>
                </span>
              </a>
              <a data-net="mail" href="#share">
                <span className="hf-net" style={{ background: "#ee0066" }}>
                  {NET_ICONS.mail}
                  <i className="hf-sr">E-mail</i>
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    ),
    type: "hfFooter",
  }
);

export const holofoteBlocks: BlockDefinition[] = [
  hfHeader,
  hfAdStrip,
  hfFeatured,
  hfLatest,
  hfPostList,
  hfSplit,
  hfStack,
  hfFooter,
];

export { categoryPath, LINK_FIELDS };
