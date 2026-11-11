import { z } from "zod";
import { defineBlock } from "./define.js";
import {
  cls,
  DdSocials,
  ddPosts,
  flag,
  int,
  linkList,
  parsePiece,
  postTags,
  SearchIcon,
  ShareNets,
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
  Inline,
  postPath,
} from "./helpers.js";
import type { BlockDefinition } from "./types.js";
import { parseYouTubeVideoId, popupVideoEmbed } from "./youtube.js";

/** Blocos das páginas internas do Diário Aberto: contêineres, cabeçalhos de lista, post, barra lateral, sobre, contato e 404. */

/* ───────────────────────── contêineres ───────────────────────── */

const ddSplit = defineBlock(z.object({}), {
  fields: [],
  group: "layout",
  label: "Conteúdo + barra lateral (Diário)",
  render: (_p, _ctx, children) => (
    <section className="dd-cols" data-dd="split">
      <div className="dd-cols-in">
        <div className="dd-cols-a">{children[0]}</div>
        <div className="dd-cols-b">{children[1]}</div>
      </div>
    </section>
  ),
  type: "ddSplit",
});

const ddStack = defineBlock(z.object({ gap: int(0, 80, 0) }), {
  fields: [
    { key: "gap", kind: "number", label: "Espaço entre os blocos (px)" },
  ],
  group: "layout",
  label: "Pilha vertical (Diário)",
  render: (p, _ctx, children) => (
    <div className="dd-stack" style={styleVars({ "--dd-gap": `${p.gap}px` })}>
      {children}
    </div>
  ),
  type: "ddStack",
});

/* ───────────────────────── cabeçalhos de lista ───────────────────────── */

const ddCategoryHead = defineBlock(
  z.object({ label: str("Categoria:"), unit: str("posts") }),
  {
    fields: [
      { key: "label", kind: "text", label: "Rótulo pequeno" },
      { key: "unit", kind: "text", label: "Palavra depois da contagem" },
    ],
    group: "blog",
    label: "Título da categoria (Diário)",
    render: (p, ctx) => {
      const cat = ctx.current.category;
      const n = cat
        ? ddPosts(ctx, cat.slug, 0, 10_000).length
        : ddPosts(ctx, "", 0, 10_000).length;
      return (
        <header className="dd-listhead" data-dd="categoryHead">
          <span className="dd-listhead-label">{p.label}</span>
          <h1>{cat?.name ?? "Todas"}</h1>
          <span className="dd-listhead-count">
            {n} {n === 1 ? "post" : p.unit}
          </span>
          <hr />
        </header>
      );
    },
    type: "ddCategoryHead",
  }
);

const ddResultsHead = defineBlock(
  z.object({ label: str("Resultados para:") }),
  {
    fields: [{ key: "label", kind: "text", label: "Rótulo" }],
    group: "blog",
    label: "Título dos resultados da busca (Diário)",
    render: (p, ctx) => (
      <header className="dd-listhead" data-dd="resultsHead">
        <span className="dd-listhead-label">{p.label}</span>
        <h1 data-hf-q>{ctx.query.q ?? ""}</h1>
        <hr />
      </header>
    ),
    type: "ddResultsHead",
  }
);

const ddPageTitle = defineBlock(z.object({ text: str("Sobre mim") }), {
  fields: [{ key: "text", kind: "text", label: "Título" }],
  group: "content",
  label: "Título de página (Diário)",
  render: p => (
    <header className="dd-listhead" data-dd="pageTitle">
      <h1>{p.text}</h1>
      <hr />
    </header>
  ),
  type: "ddPageTitle",
});

/* ───────────────────────── post ───────────────────────── */

const ddPostHead = defineBlock(
  z.object({
    author: str("Clara Monteiro"),
    byLabel: str("Por"),
    showImage: flag("yes"),
  }),
  {
    fields: [
      { key: "author", kind: "text", label: "Autora" },
      { key: "byLabel", kind: "text", label: 'Texto antes da autora ("Por")' },
      {
        key: "showImage",
        kind: "select",
        label: "Mostrar a imagem de capa",
        options: YES_NO,
      },
    ],
    group: "blog",
    label: "Cabeçalho do post (Diário)",
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      const cat = categoryOf(ctx.site, post);
      return (
        <header className="dd-phead" data-dd="postHead">
          <p className="dd-pline">
            {p.byLabel} <b>{p.author}</b>
            {cat ? (
              <>
                {" "}
                em{" "}
                <a href={href(ctx, `/category/${cat.slug}/`)}>
                  <b>{cat.name}</b>
                </a>
              </>
            ) : null}{" "}
            em{" "}
            <time dateTime={post.publishedAt ?? undefined}>
              {formatDate(post.publishedAt)}
            </time>
          </p>
          <h1>{post.title}</h1>
          {p.showImage === "yes" && post.coverImage ? (
            <Img alt={post.title} className="dd-pimg" src={post.coverImage} />
          ) : null}
        </header>
      );
    },
    type: "ddPostHead",
  }
);

const ddPostBody = defineBlock(z.object({}), {
  fields: [],
  group: "blog",
  label: "Corpo do post (Diário)",
  render: (_p, ctx) => {
    const post = ctx.current.post;
    if (!post) return null;
    return (
      <div className="dd-body" data-dd="postBody">
        {post.blocks.map(b => {
          if (b.type !== "text")
            return <div key={b.id}>{ctx.renderBlocks([b])}</div>;
          const text = typeof b.props.text === "string" ? b.props.text : "";
          const piece = parsePiece(text);
          if (piece.kind === "h") return <h2 key={b.id}>{piece.text}</h2>;
          if (piece.kind === "ul")
            return (
              <ul key={b.id}>
                {piece.items.map(i => (
                  <li key={i}>
                    <Inline text={i} />
                  </li>
                ))}
              </ul>
            );
          if (piece.kind === "quote")
            return (
              <blockquote key={b.id}>
                <p>
                  <Inline text={piece.text} />
                </p>
                {piece.credit ? <cite>— {piece.credit}</cite> : null}
              </blockquote>
            );
          return (
            <p key={b.id}>
              <Inline text={piece.text} />
            </p>
          );
        })}
      </div>
    );
  },
  type: "ddPostBody",
});

const ddPostFoot = defineBlock(z.object({ tagsLabel: str("Tags:") }), {
  fields: [{ key: "tagsLabel", kind: "text", label: "Rótulo das tags" }],
  group: "blog",
  label: "Tags e compartilhar do post (Diário)",
  render: (p, ctx) => {
    const post = ctx.current.post;
    if (!post) return null;
    return (
      <div className="dd-pfoot" data-dd="postFoot">
        <div className="dd-tags">
          <span>{p.tagsLabel}</span>
          {postTags(ctx, post).map(t => (
            <a
              href={`${href(ctx, "/pesquisa/")}?q=${encodeURIComponent(t)}`}
              key={t}
            >
              #{t}
            </a>
          ))}
        </div>
        <div
          className="dd-nets dd-share"
          data-title={post.title}
          data-url={href(ctx, postPath(post))}
        >
          <ShareNets ctx={ctx} post={post} round />
        </div>
      </div>
    );
  },
  type: "ddPostFoot",
});

const ddAuthorBox = defineBlock(
  z.object({
    name: str("Clara Monteiro"),
    photo: str(),
    socials: linkList,
    text: str(),
    title: str("Eu sou a"),
  }),
  {
    fields: [
      { key: "photo", kind: "image", label: "Foto" },
      { key: "title", kind: "text", label: 'Texto antes do nome ("Eu sou a")' },
      { key: "name", kind: "text", label: "Nome" },
      { key: "text", kind: "textarea", label: "Texto curto" },
      SOCIAL_FIELD,
    ],
    group: "blog",
    label: "Caixa da autora (Diário)",
    render: (p, ctx) => (
      <aside className="dd-authorbox" data-dd="authorBox">
        <Img alt={p.name} src={p.photo} />
        <h3>
          {p.title} {p.name}
        </h3>
        <p>{p.text}</p>
        <DdSocials ctx={ctx} items={p.socials} />
      </aside>
    ),
    type: "ddAuthorBox",
  }
);

/* ───────────────────────── barra lateral ───────────────────────── */

const video = z.object({ thumb: str(), title: str(), url: str() });

const ddSidebar = defineBlock(
  z.object({
    aboutName: str("Clara Monteiro"),
    aboutPhoto: str(),
    aboutText: str(),
    aboutTitle: str("Sobre mim"),
    categoriesTitle: str("Categorias"),
    popular: str(),
    popularCount: int(1, 10, 3),
    popularTitle: str("Posts populares"),
    socials: linkList,
    videos: z.array(video).default([]),
    vlogTitle: str("Último vlog"),
  }),
  {
    fields: [
      {
        key: "aboutTitle",
        kind: "text",
        label: '"Sobre mim" — título do widget',
      },
      { key: "aboutPhoto", kind: "image", label: '"Sobre mim" — foto' },
      { key: "aboutName", kind: "text", label: '"Sobre mim" — nome' },
      {
        key: "aboutText",
        kind: "textarea",
        label: '"Sobre mim" — texto curto',
      },
      SOCIAL_FIELD,
      {
        key: "popularTitle",
        kind: "text",
        label: '"Posts populares" — título do widget',
      },
      {
        key: "popularCount",
        kind: "number",
        label: "Posts populares — quantidade",
      },
      {
        key: "popular",
        kind: "textarea",
        label:
          "Posts populares — endereços escolhidos (um por linha; vazio = os mais recentes. O modelo não guarda popularidade)",
      },
      {
        key: "categoriesTitle",
        kind: "text",
        label: '"Categorias" — título do widget',
      },
      {
        key: "vlogTitle",
        kind: "text",
        label: '"Último vlog" — título do widget (some sem vídeos)',
      },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          {
            key: "url",
            kind: "url",
            label: "Link do vídeo (YouTube ou Vimeo)",
          },
          {
            key: "thumb",
            kind: "image",
            label: "Miniatura (vazio = a do YouTube)",
          },
        ],
        key: "videos",
        kind: "list",
        label: "Vídeos do vlog",
      },
    ],
    group: "blog",
    label: "Barra lateral (Diário)",
    render: (p, ctx) => {
      const chosen = p.popular
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);
      const all = ddPosts(ctx, "", 0, 400);
      const popular = (
        chosen.length > 0
          ? chosen
              .map(slug => all.find(x => x.slug === slug))
              .filter((x): x is (typeof all)[number] => !!x)
          : all
      ).slice(0, p.popularCount);
      const videos = p.videos.filter(v => v.url);
      return (
        <aside className="dd-side" data-dd="sidebar">
          <section className="dd-widget">
            <h2 className="dd-wtitle">{p.aboutTitle}</h2>
            <div className="dd-wabout">
              <Img alt={p.aboutName} src={p.aboutPhoto} />
              <h3>{p.aboutName}</h3>
              <p>{p.aboutText}</p>
              <DdSocials ctx={ctx} items={p.socials} />
            </div>
          </section>
          <section className="dd-widget">
            <h2 className="dd-wtitle">{p.popularTitle}</h2>
            <div className="dd-wpop">
              {popular.map(post => {
                const cat = categoryOf(ctx.site, post);
                const link = href(ctx, postPath(post));
                return (
                  <article key={post.id}>
                    <a className="dd-wpop-img" href={link}>
                      <Img alt="" src={post.coverImage} />
                    </a>
                    <div>
                      <p className="dd-cline">
                        {cat ? (
                          <span className="dd-cat">{cat.name}</span>
                        ) : null}
                        {cat ? <span> em </span> : null}
                        <time dateTime={post.publishedAt ?? undefined}>
                          {formatDate(post.publishedAt)}
                        </time>
                      </p>
                      <h3>
                        <a href={link}>{post.title}</a>
                      </h3>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          <section className="dd-widget">
            <h2 className="dd-wtitle">{p.categoriesTitle}</h2>
            <ul className="dd-wcats">
              {ctx.site.categories.map(c => {
                const n = ddPosts(ctx, c.slug, 0, 10_000).length;
                return (
                  <li key={c.id}>
                    <a href={href(ctx, `/category/${c.slug}/`)}>
                      <span>{c.name}</span>
                      <b>{String(n).padStart(2, "0")}</b>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
          {videos.length > 0 ? (
            <section className="dd-widget">
              <h2 className="dd-wtitle">{p.vlogTitle}</h2>
              <div className="dd-wvlog">
                {videos.map(v => {
                  const id = parseYouTubeVideoId(v.url);
                  const thumb =
                    v.thumb ||
                    (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");
                  return (
                    <a
                      aria-label={v.title || "Assistir ao vídeo"}
                      className="dd-vid"
                      data-sb-video={popupVideoEmbed(v.url) ?? undefined}
                      href={v.url}
                      key={v.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <Img alt="" src={thumb} />
                      <i aria-hidden="true" className="dd-play">
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </i>
                      {v.title ? <span>{v.title}</span> : null}
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}
        </aside>
      );
    },
    type: "ddSidebar",
  }
);

/* ───────────────────────── sobre ───────────────────────── */

const ddAbout = defineBlock(
  z.object({ heading: str("Sobre mim"), image: str(), text: str() }),
  {
    fields: [
      { key: "image", kind: "image", label: "Imagem larga do topo" },
      { key: "heading", kind: "text", label: "Título" },
      {
        key: "text",
        kind: "textarea",
        label:
          "Texto (parágrafos separados por linha em branco; `## título`, linhas `- item` e `> citação — autor` também valem)",
      },
    ],
    group: "content",
    label: "Sobre mim (Diário)",
    render: p => (
      <article className="dd-about" data-dd="about">
        {p.image ? <Img alt="" className="dd-pimg" src={p.image} /> : null}
        <h1>{p.heading}</h1>
        <div className="dd-body">
          {p.text
            .split(/\n{2,}/)
            .filter(s => s.trim())
            .map(chunk => {
              const piece = parsePiece(chunk);
              if (piece.kind === "h") return <h2 key={chunk}>{piece.text}</h2>;
              if (piece.kind === "ul")
                return (
                  <ul key={chunk}>
                    {piece.items.map(i => (
                      <li key={i}>
                        <Inline text={i} />
                      </li>
                    ))}
                  </ul>
                );
              if (piece.kind === "quote")
                return (
                  <blockquote key={chunk}>
                    <p>
                      <Inline text={piece.text} />
                    </p>
                    {piece.credit ? <cite>— {piece.credit}</cite> : null}
                  </blockquote>
                );
              return (
                <p key={chunk}>
                  <Inline text={piece.text} />
                </p>
              );
            })}
        </div>
      </article>
    ),
    type: "ddAbout",
  }
);

/* ───────────────────────── contato (sem backend) ───────────────────────── */

const ddContactForm = defineBlock(
  z.object({
    actionUrl: str(),
    button: str("ENVIAR"),
    email: str(),
    intro: str("Quer falar comigo? Escreva uma mensagem: eu leio todas."),
    success: str("Mensagem recebida! Obrigada por escrever."),
  }),
  {
    fields: [
      { key: "intro", kind: "textarea", label: "Texto de abertura" },
      { key: "button", kind: "text", label: "Texto do botão" },
      { key: "success", kind: "text", label: "Mensagem de sucesso" },
      {
        key: "actionUrl",
        kind: "url",
        label:
          "URL que recebe o formulário. Vazio = NÃO envia nada: o visitante só vê a mensagem de sucesso (use o e-mail abaixo como alternativa)",
      },
      {
        key: "email",
        kind: "text",
        label: "E-mail de contato (mostrado abaixo do formulário)",
      },
    ],
    group: "content",
    label: "Formulário de contato (Diário)",
    render: (p, ctx) => (
      <div className="dd-contact" data-dd="contact">
        <p>{p.intro}</p>
        <form
          action={p.actionUrl ? href(ctx, p.actionUrl) : undefined}
          data-dd-form
          method="post"
        >
          <input
            aria-label="Nome"
            name="nome"
            placeholder="Seu nome"
            required
            type="text"
          />
          <input
            aria-label="E-mail"
            name="email"
            placeholder="Seu e-mail"
            required
            type="email"
          />
          <textarea
            aria-label="Mensagem"
            name="mensagem"
            placeholder="Sua mensagem"
            required
            rows={7}
          />
          <button className="dd-btn dd-btn-dark" type="submit">
            {p.button}
          </button>
          <p className="dd-ok" role="status">
            {p.success}
          </p>
        </form>
        {!p.actionUrl && ctx.mode === "edit" ? (
          <small className="dd-note">
            Sem URL de envio, o formulário não envia nada: informe a URL no
            painel do bloco.
          </small>
        ) : null}
        {p.email ? (
          <p className="dd-cfall">
            Ou escreva para <a href={`mailto:${p.email}`}>{p.email}</a>
          </p>
        ) : null}
      </div>
    ),
    type: "ddContactForm",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const ddNotFound = defineBlock(
  z.object({
    backLabel: str("VOLTAR PARA A HOME"),
    code: str("404"),
    searchPlaceholder: str("Pesquisar no blog"),
    text: str("A página que você procura não existe ou mudou de endereço."),
    title: str("Ops, página não encontrada"),
  }),
  {
    fields: [
      { key: "code", kind: "text", label: "Número grande" },
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        key: "searchPlaceholder",
        kind: "text",
        label: "Texto do campo de busca",
      },
      { key: "backLabel", kind: "text", label: "Texto do botão da home" },
    ],
    group: "content",
    label: "Página 404 (Diário)",
    render: (p, ctx) => (
      <section className="dd-nf" data-dd="notFound">
        <span className="dd-nf-code">{p.code}</span>
        <h1>{p.title}</h1>
        <p>{p.text}</p>
        <form
          action={href(ctx, "/pesquisa/")}
          className="dd-nf-search"
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
        <a className="dd-btn" href={href(ctx, "/")}>
          {p.backLabel}
        </a>
      </section>
    ),
    type: "ddNotFound",
  }
);

export const diarioPageBlocks: BlockDefinition[] = [
  ddSplit,
  ddStack,
  ddCategoryHead,
  ddResultsHead,
  ddPageTitle,
  ddPostHead,
  ddPostBody,
  ddPostFoot,
  ddAuthorBox,
  ddSidebar,
  ddAbout,
  ddContactForm,
  ddNotFound,
];

export { cls };
