import { z } from "zod";
import type { MenuItem } from "../model/index.js";
import { defineBlock } from "./define.js";
import {
  Chevron,
  cls,
  DdLightCard,
  DdPhotoCard,
  DdSocials,
  ddPosts,
  flag,
  int,
  linkList,
  SearchIcon,
  SOCIAL_FIELD,
  str,
  styleVars,
  YES_NO,
} from "./diario-lib.js";
import {
  categoryOf,
  formatDate,
  href,
  Img,
  newTab,
  postPath,
  safeUrl,
} from "./helpers.js";
import type { BlockDefinition, RenderContext } from "./types.js";

/** Blocos do tema Diário Aberto: cabeçalho (faixa da autora + menu com mega-menu + busca), destaques, masonry, faixa de fotos, rodapé e modal de assinatura. */

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

/** Marca em texto (Playfair 900) ou imagem, quando o usuário envia uma. */
const Wordmark = ({ image, name }: { image: string; name: string }) =>
  image ? (
    <Img alt={name} src={image} />
  ) : (
    <span className="dd-wordmark">{name}</span>
  );

/** Caminho sem barras nas pontas (a home chega como "/" ou "//"). */
const norm = (s: string) => s.replace(/^\/+|\/+$/g, "");

const isCurrent = (ctx: RenderContext, url: string) =>
  url !== "#" && norm(url) === norm(ctx.path ?? "");

/* ───────────────────────── cabeçalho ───────────────────────── */

const ddHeader = defineBlock(
  z.object({
    greeting: str("Oi, eu sou a Clara"),
    layout: z.enum(["auto", "home", "compact"]).default("auto").catch("auto"),
    logo: str(),
    logoText: str("Diário Aberto"),
    photo: str(),
    previewMega: flag("no"),
    searchLabel: str("Pesquisar"),
    searchPlaceholder: str("O que você procura?"),
    socials: linkList,
    subscribeLabel: str("ASSINAR"),
    subtitle: str(),
  }),
  {
    fields: [
      {
        key: "layout",
        kind: "select",
        label: "Formato da faixa da autora",
        options: [
          {
            label: "Automático (home na página inicial, compacto nas demais)",
            value: "auto",
          },
          {
            label: "Home (sociais, foto grande e nome ao fundo)",
            value: "home",
          },
          { label: "Compacto (páginas internas)", value: "compact" },
        ],
      },
      {
        key: "greeting",
        kind: "text",
        label: "Frase da autora (nome ao fundo)",
      },
      { key: "subtitle", kind: "text", label: "Subtítulo (formato compacto)" },
      { key: "photo", kind: "image", label: "Foto da autora" },
      { key: "logoText", kind: "text", label: "Nome do blog (logo em texto)" },
      {
        key: "logo",
        kind: "image",
        label: "Logo em imagem (opcional; vence o texto)",
      },
      SOCIAL_FIELD,
      { key: "searchLabel", kind: "text", label: "Texto do botão de busca" },
      {
        key: "searchPlaceholder",
        kind: "text",
        label: "Texto do campo de busca",
      },
      {
        key: "subscribeLabel",
        kind: "text",
        label: "Texto do botão de assinatura",
      },
      {
        key: "previewMega",
        kind: "select",
        label: "Mostrar o mega-menu aberto no editor",
        options: YES_NO,
      },
    ],
    group: "layout",
    label: "Cabeçalho Diário (faixa da autora, menu e busca)",
    render: (p, ctx) => {
      const onHome =
        !ctx.current.post &&
        !ctx.current.category &&
        norm(ctx.path ?? "") === "";
      const compact =
        p.layout === "compact" || (p.layout === "auto" && !onHome);
      const menu = ctx.site.menu;
      const mid = Math.ceil(menu.length / 2);
      const posts = (slug: string) => ddPosts(ctx, slug, 0, 4);
      const mega = (
        <div
          className={cls(
            "dd-mega",
            ctx.mode === "edit" && p.previewMega === "yes" && "is-preview"
          )}
        >
          <div className="dd-tabs">
            {[
              { name: "Todas", slug: "", url: "/" },
              ...ctx.site.categories.map(c => ({
                name: c.name,
                slug: c.slug,
                url: `/category/${c.slug}/`,
              })),
            ].map(tab => (
              <div className="dd-tab" key={tab.slug || "todas"}>
                <a href={href(ctx, tab.url)}>{tab.name}</a>
                <div className="dd-tabpanel">
                  {posts(tab.slug).map(post => (
                    <a
                      className="dd-mpost"
                      href={href(ctx, postPath(post))}
                      key={post.id}
                    >
                      <Img alt="" src={post.coverImage} />
                      <span>{post.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
      const item = (m: MenuItem) => {
        const isMega = m.dynamic === "categories";
        const sub = m.children ?? [];
        return (
          <li
            className={cls(
              (isMega || sub.length > 0) && "dd-has",
              isMega && "dd-hasmega"
            )}
            key={m.href + m.label}
          >
            <a
              aria-current={isCurrent(ctx, m.href) ? "page" : undefined}
              href={href(ctx, m.href)}
            >
              {m.label}
              {isMega || sub.length > 0 ? <Chevron /> : null}
            </a>
            {isMega ? mega : null}
            {sub.length > 0 ? (
              <ul className="dd-sub">
                {sub.map(s => (
                  <li key={s.href + s.label}>
                    <a href={href(ctx, s.href)}>{s.label}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      };
      const drawerItem = (m: MenuItem) => {
        const list =
          m.dynamic === "categories"
            ? ctx.site.categories.map(c => ({
                href: `/category/${c.slug}/`,
                label: c.name,
              }))
            : (m.children ?? []);
        return list.length > 0 ? (
          <li key={m.href + m.label}>
            <details>
              <summary>
                {m.label}
                <Chevron />
              </summary>
              <ul>
                {list.map(s => (
                  <li key={s.href + s.label}>
                    <a href={href(ctx, s.href)}>{s.label}</a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ) : (
          <li key={m.href + m.label}>
            <a
              aria-current={isCurrent(ctx, m.href) ? "page" : undefined}
              href={href(ctx, m.href)}
            >
              {m.label}
            </a>
          </li>
        );
      };
      const logo = (
        <a className="dd-logo" href={href(ctx, "/")}>
          <Wordmark image={p.logo} name={p.logoText} />
        </a>
      );
      const subscribe = (
        <button
          className="dd-btn dd-btn-dark"
          popoverTarget="dd-subscribe"
          type="button"
        >
          {p.subscribeLabel}
        </button>
      );
      return (
        <div
          className={cls("dd-header", compact ? "dd-compact" : "dd-home")}
          data-dd="header"
        >
          {/* biome-ignore lint/correctness/useUniqueElementIds: o menu lateral usa label for=id; há um só cabeçalho por página */}
          <input
            aria-label="Abrir menu"
            className="dd-burger-input"
            id="sb-burger"
            type="checkbox"
          />
          {/* biome-ignore lint/correctness/useUniqueElementIds: a busca usa label for=id */}
          <input
            aria-label="Abrir busca"
            className="dd-search-input"
            id="dd-search"
            type="checkbox"
          />
          <div className="dd-strip">
            <span aria-hidden="true" className="dd-bgname">
              {p.greeting}
            </span>
            {compact ? (
              <div className="dd-strip-in dd-strip-compact">
                <a className="dd-photo" href={href(ctx, "/sobre/")}>
                  <Img alt={p.greeting} src={p.photo} />
                </a>
                <div className="dd-strip-text">
                  <p className="dd-hello">{p.greeting}</p>
                  {p.subtitle ? (
                    <p className="dd-sub-hello">{p.subtitle}</p>
                  ) : null}
                  <DdSocials ctx={ctx} items={p.socials} withText />
                </div>
              </div>
            ) : (
              <div className="dd-strip-in">
                <DdSocials ctx={ctx} items={p.socials} />
                <a className="dd-photo" href={href(ctx, "/sobre/")}>
                  <Img alt={p.greeting} src={p.photo} />
                </a>
                <div className="dd-strip-r">
                  <label className="dd-searchlink" htmlFor="dd-search">
                    <SearchIcon />
                    {p.searchLabel}
                  </label>
                  {subscribe}
                </div>
              </div>
            )}
          </div>
          <header className="dd-bar">
            <div className="dd-bar-in">
              <label
                aria-label="Menu"
                className="dd-burger-btn"
                htmlFor="sb-burger"
              >
                <Burger />
              </label>
              {compact ? (
                <>
                  {logo}
                  <nav aria-label="Menu principal" className="dd-menu">
                    <ul>{menu.map(item)}</ul>
                  </nav>
                  <div className="dd-bar-r">
                    <label
                      aria-label={p.searchLabel}
                      className="dd-lupa"
                      htmlFor="dd-search"
                    >
                      <SearchIcon />
                    </label>
                    {subscribe}
                  </div>
                </>
              ) : (
                <>
                  <nav
                    aria-label="Menu principal"
                    className="dd-menu dd-menu-l"
                  >
                    <ul>{menu.slice(0, mid).map(item)}</ul>
                  </nav>
                  {logo}
                  <nav
                    aria-label="Menu principal (continuação)"
                    className="dd-menu dd-menu-r"
                  >
                    <ul>{menu.slice(mid).map(item)}</ul>
                    <label
                      aria-label={p.searchLabel}
                      className="dd-lupa"
                      htmlFor="dd-search"
                    >
                      <SearchIcon />
                    </label>
                  </nav>
                </>
              )}
            </div>
            <div className="dd-searchbox">
              <form action={href(ctx, "/pesquisa/")} method="get">
                <input
                  aria-label={p.searchPlaceholder}
                  name="q"
                  placeholder={p.searchPlaceholder}
                  type="search"
                />
              </form>
              <label
                aria-label="Fechar busca"
                className="dd-searchx"
                htmlFor="dd-search"
              >
                ×
              </label>
            </div>
          </header>
          <label
            aria-label="Fechar menu"
            className="dd-veil-menu"
            htmlFor="sb-burger"
          />
          <aside className="dd-drawer">
            <a className="dd-drawer-logo" href={href(ctx, "/")}>
              <Wordmark image={p.logo} name={p.logoText} />
            </a>
            <ul>{menu.map(drawerItem)}</ul>
            <form
              action={href(ctx, "/pesquisa/")}
              className="dd-drawer-search"
              method="get"
            >
              <input
                aria-label={p.searchPlaceholder}
                name="q"
                placeholder={p.searchPlaceholder}
                type="search"
              />
            </form>
            <DdSocials ctx={ctx} items={p.socials} />
            {subscribe}
          </aside>
        </div>
      );
    },
    type: "ddHeader",
  }
);

/* ───────────────────────── destaques em mosaico ───────────────────────── */

const ddFeatured = defineBlock(
  z.object({
    categorySlug: str(),
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
    ],
    group: "blog",
    label: "Destaques em mosaico (Diário)",
    render: (p, ctx) => {
      const slug = p.categorySlug || ctx.current.category?.slug || "";
      const [big, ...small] = ddPosts(ctx, slug, p.offset, 4, true);
      return (
        <section className="dd-mosaic" data-dd="featured">
          {big ? <DdPhotoCard ctx={ctx} post={big} title="h2" /> : null}
          <div className="dd-mright">
            {small.map(post => (
              <DdPhotoCard ctx={ctx} key={post.id} post={post} />
            ))}
          </div>
        </section>
      );
    },
    type: "ddFeatured",
  }
);

/* ───────────────────────── grade masonry ───────────────────────── */

const ddMasonry = defineBlock(
  z.object({
    buttonLabel: str("CARREGAR MAIS"),
    cards: z
      .enum(["alternate", "light"])
      .default("alternate")
      .catch("alternate"),
    categorySlug: str(),
    columns: z.enum(["wide", "two"]).default("wide").catch("wide"),
    count: int(1, 200, 45),
    mode: z.enum(["recent", "search"]).default("recent").catch("recent"),
    offset: int(0, 200, 0),
    step: int(0, 60, 15),
  }),
  {
    fields: [
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
        label: "Categoria (endereço; vazio = a da página, ou todas)",
      },
      {
        key: "columns",
        kind: "select",
        label: "Colunas",
        options: [
          { label: "Largura total: 4 / 3 / 2 / 1 colunas", value: "wide" },
          { label: "Duas colunas (com barra lateral)", value: "two" },
        ],
      },
      {
        key: "cards",
        kind: "select",
        label: "Cartões",
        options: [
          { label: "Alternados (claro e sobre foto)", value: "alternate" },
          { label: "Só claros", value: "light" },
        ],
      },
      { key: "count", kind: "number", label: "Máximo de posts" },
      { key: "offset", kind: "number", label: "Pular os primeiros N posts" },
      {
        key: "step",
        kind: "number",
        label:
          '"Carregar mais": cartões por vez (0 = mostrar todos, sem botão)',
      },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
    ],
    group: "blog",
    label: "Grade masonry (Diário)",
    render: (p, ctx) => {
      const slug = p.categorySlug || ctx.current.category?.slug || "";
      const search = p.mode === "search";
      const q = (ctx.query.q ?? "").trim().toLowerCase();
      const list = ddPosts(ctx, slug, p.offset, 400)
        .filter(
          post =>
            !search ||
            !q ||
            `${post.title} ${post.excerpt}`.toLowerCase().includes(q)
        )
        .slice(0, p.count);
      const visible = ctx.mode === "edit" || p.step <= 0 ? list.length : p.step;
      return (
        <section
          className={cls(
            "dd-masonry sg-grid-wrap",
            p.columns === "two" && "dd-two"
          )}
          data-dd="masonry"
          data-step={p.step > 0 ? p.step : undefined}
        >
          <div className="dd-mgrid">
            {list.map((post, i) =>
              p.cards === "alternate" && i % 2 === 1 ? (
                <DdPhotoCard
                  center
                  ctx={ctx}
                  hidden={i >= visible}
                  key={post.id}
                  post={post}
                />
              ) : (
                <DdLightCard
                  ctx={ctx}
                  hidden={i >= visible}
                  key={post.id}
                  post={post}
                />
              )
            )}
          </div>
          {p.step > 0 && list.length > p.step ? (
            <div className="dd-morerow">
              <button className="dd-btn sg-more" type="button">
                {p.buttonLabel}
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.4"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
                </svg>
              </button>
            </div>
          ) : null}
        </section>
      );
    },
    type: "ddMasonry",
  }
);

/* ───────────────────────── faixa de fotos ───────────────────────── */

const photoItem = z.object({
  image: str(),
  large: str(),
  url: str(),
});

const ddPhotoStrip = defineBlock(
  z.object({
    items: z.array(photoItem).default([]),
    label: str("Fotos do blog"),
    seconds: int(8, 200, 28),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Descrição (acessibilidade)" },
      {
        itemFields: [
          { key: "image", kind: "image", label: "Foto" },
          {
            key: "large",
            kind: "image",
            label: "Foto grande (abre ao clicar; vazio = a mesma)",
          },
          {
            key: "url",
            kind: "url",
            label: "Link (vence a foto grande; ex.: perfil do Instagram)",
          },
        ],
        key: "items",
        kind: "list",
        label: "Fotos",
      },
      {
        key: "seconds",
        kind: "number",
        label: "Segundos para uma volta completa (maior = mais devagar)",
      },
    ],
    group: "media",
    label: "Faixa de fotos (Diário)",
    render: (p, ctx) => {
      const edit = ctx.mode === "edit";
      const one = (it: z.infer<typeof photoItem>, i: number, dup: boolean) => {
        const target = it.url || it.large || it.image;
        return (
          <a
            aria-hidden={dup || undefined}
            className="dd-pitem"
            href={href(ctx, target)}
            key={`${dup ? "d" : "o"}${i}`}
            tabIndex={dup ? -1 : undefined}
            {...newTab(safeUrl(target))}
          >
            <Img alt={dup ? "" : `Foto ${i + 1}`} src={it.image} />
          </a>
        );
      };
      return (
        <section
          aria-label={p.label}
          className={cls("dd-photos", edit && "is-edit")}
          data-dd="photoStrip"
        >
          <div
            className="dd-ptrack"
            style={styleVars({ "--dd-sec": `${p.seconds}s` })}
          >
            {p.items.map((it, i) => one(it, i, false))}
            {edit ? null : p.items.map((it, i) => one(it, i, true))}
          </div>
        </section>
      );
    },
    type: "ddPhotoStrip",
  }
);

/* ───────────────────────── rodapé ───────────────────────── */

const ddFooter = defineBlock(
  z.object({
    copyright: str("Diário Aberto"),
    links: str(),
    logo: str(),
    logoText: str("Diário Aberto"),
    rights: str("Todos os direitos reservados."),
    socials: linkList,
  }),
  {
    fields: [
      { key: "logoText", kind: "text", label: "Nome do blog (logo em texto)" },
      { key: "logo", kind: "image", label: "Logo branco em imagem (opcional)" },
      {
        key: "links",
        kind: "textarea",
        label: "Links (um por linha: Texto | endereço)",
      },
      SOCIAL_FIELD,
      {
        key: "copyright",
        kind: "text",
        label: "Nome no copyright (© ano nome)",
      },
      {
        key: "rights",
        kind: "text",
        label: "Texto depois do nome no copyright",
      },
    ],
    group: "layout",
    label: "Rodapé Diário",
    render: (p, ctx) => {
      const links = p.links
        .split("\n")
        .map(l => l.trim())
        .filter(Boolean)
        .map(l => {
          const [label, url] = l.split("|").map(s => s.trim());
          return { label: label ?? "", url: url || "#" };
        });
      return (
        <footer className="dd-foot" data-dd="footer">
          <div className="dd-foot-in">
            <ul className="dd-foot-links">
              {links.map(l => (
                <li key={l.label + l.url}>
                  <a href={href(ctx, l.url)}>{l.label}</a>
                </li>
              ))}
            </ul>
            <a className="dd-foot-logo" href={href(ctx, "/")}>
              <Wordmark image={p.logo} name={p.logoText} />
            </a>
            <DdSocials ctx={ctx} items={p.socials} />
          </div>
          <div className="dd-foot-copy">
            <p>
              © {new Date().getFullYear()} {p.copyright}. {p.rights}
            </p>
          </div>
        </footer>
      );
    },
    type: "ddFooter",
  }
);

/* ───────────────────────── modal de assinatura ───────────────────────── */

const ddSubscribe = defineBlock(
  z.object({
    actionUrl: str(),
    button: str("ASSINAR"),
    emailPlaceholder: str("Seu e-mail"),
    namePlaceholder: str("Seu nome"),
    showInEditor: flag("no"),
    success: str("Pronto! Você está na lista."),
    text: str("Receba só os melhores posts por e-mail"),
    title: str("Junte-se a nós hoje"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "text", label: "Texto" },
      { key: "namePlaceholder", kind: "text", label: "Texto do campo de nome" },
      {
        key: "emailPlaceholder",
        kind: "text",
        label: "Texto do campo de e-mail",
      },
      { key: "button", kind: "text", label: "Texto do botão" },
      { key: "success", kind: "text", label: "Mensagem de sucesso" },
      {
        key: "actionUrl",
        kind: "url",
        label:
          "URL que recebe nome e e-mail (da sua ferramenta de e-mail marketing). Vazio = NÃO envia nada: o visitante só vê a mensagem de sucesso",
      },
      {
        key: "showInEditor",
        kind: "select",
        label: "Mostrar o modal aberto no editor",
        options: YES_NO,
      },
    ],
    group: "layout",
    label: "Modal de assinatura (Diário)",
    render: (p, ctx) => {
      const edit = ctx.mode === "edit";
      if (edit && p.showInEditor !== "yes")
        return (
          <div className="dd-modal-note" data-dd="subscribe">
            Modal de assinatura (abre pelo botão "{p.button}" do cabeçalho).
          </div>
        );
      const body = (
        <div className="dd-modal-box">
          {edit ? null : (
            <button
              aria-label="Fechar"
              className="dd-modal-x"
              popoverTarget="dd-subscribe"
              popoverTargetAction="hide"
              type="button"
            >
              ×
            </button>
          )}
          <h2 className="dd-modal-title">{p.title}</h2>
          <p>{p.text}</p>
          <form
            action={p.actionUrl ? href(ctx, p.actionUrl) : undefined}
            data-dd-form
            method="post"
          >
            <input
              aria-label={p.namePlaceholder}
              name="nome"
              placeholder={p.namePlaceholder}
              type="text"
            />
            <input
              aria-label={p.emailPlaceholder}
              name="email"
              placeholder={p.emailPlaceholder}
              required
              type="email"
            />
            <button className="dd-btn dd-btn-dark dd-btn-full" type="submit">
              {p.button}
            </button>
            <p className="dd-ok" role="status">
              {p.success}
            </p>
          </form>
        </div>
      );
      return edit ? (
        <div className="dd-modal is-static" data-dd="subscribe">
          {body}
        </div>
      ) : (
        // biome-ignore lint/correctness/useUniqueElementIds: o botão do cabeçalho aponta para este id (popovertarget)
        <div
          className="dd-modal"
          data-dd="subscribe"
          id="dd-subscribe"
          popover="auto"
        >
          {body}
        </div>
      );
    },
    type: "ddSubscribe",
  }
);

export const diarioBlocks: BlockDefinition[] = [
  ddHeader,
  ddFeatured,
  ddMasonry,
  ddPhotoStrip,
  ddFooter,
  ddSubscribe,
];

export { categoryOf, formatDate };
