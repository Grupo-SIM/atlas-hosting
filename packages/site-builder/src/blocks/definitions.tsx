import { z } from "zod";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  formatDate,
  href,
  Img,
  LinkButton,
  PostCard,
  postPath,
  safeUrl,
  visiblePosts,
} from "./helpers.js";
import type { BlockDefinition, FieldDef } from "./types.js";

const str = (d = "") => z.string().default(d);

const linkFields = (label = "Botão"): FieldDef[] => [
  { key: "buttonLabel", kind: "text", label: `${label} — texto` },
  { key: "buttonUrl", kind: "url", label: `${label} — link` },
];

const header = defineBlock(
  z.object({
    buttonLabel: str("Marketplace"),
    buttonUrl: str("#"),
    logo: str(),
    logoText: str("Meu Site"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoText", kind: "text", label: "Nome ao lado do logo" },
      ...linkFields(),
    ],
    group: "layout",
    label: "Cabeçalho",
    render: (p, ctx) => (
      <header className="sb-header sb-container">
        <a className="sb-logo" href={href(ctx, "/")}>
          {p.logo ? <Img alt={p.logoText} src={p.logo} /> : null}
          <strong>{p.logoText}</strong>
        </a>
        <nav className="sb-nav">
          {ctx.site.menu.map(item => (
            <a href={href(ctx, item.href)} key={item.href + item.label}>
              {item.label}
            </a>
          ))}
        </nav>
        <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
      </header>
    ),
    type: "header",
  }
);

const footer = defineBlock(
  z.object({
    copyright: str("Copyright © Meu Site"),
    email: str(),
    helpText: str(),
    logo: str(),
    logoText: str("Meu Site"),
    socials: z.array(z.object({ label: str(), url: str("#") })).default([]),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "logoText", kind: "text", label: "Nome" },
      { key: "email", kind: "text", label: "E-mail de contato" },
      { key: "helpText", kind: "text", label: "Texto de apoio" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Rede" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "socials",
        kind: "list",
        label: "Redes sociais",
      },
      { key: "copyright", kind: "text", label: "Copyright" },
    ],
    group: "layout",
    label: "Rodapé",
    render: (p, ctx) => (
      <footer className="sb-footer">
        <div className="sb-container sb-footer-grid">
          <div className="sb-footer-brand">
            {p.logo ? <Img alt={p.logoText} src={p.logo} /> : null}
            <strong>{p.logoText}</strong>
          </div>
          <div>
            <h4>Menu</h4>
            {ctx.site.menu.map(item => (
              <a href={href(ctx, item.href)} key={item.href + item.label}>
                {item.label}
              </a>
            ))}
          </div>
          <div>
            <h4>Fale conosco</h4>
            {p.email ? <a href={`mailto:${p.email}`}>{p.email}</a> : null}
            {p.helpText ? <span>{p.helpText}</span> : null}
            <h4>Redes Sociais</h4>
            <div className="sb-socials">
              {p.socials.map(s => (
                <a href={safeUrl(s.url)} key={s.label + s.url}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="sb-container sb-footer-bottom">
          <span>{p.copyright}</span>
          <span>
            {ctx.site.pages
              .filter(pg =>
                ["termos-de-uso", "politica-de-privacidade"].includes(pg.slug)
              )
              .map(pg => (
                <a href={href(ctx, `/${pg.slug}/`)} key={pg.id}>
                  {pg.title}
                </a>
              ))}
          </span>
        </div>
      </footer>
    ),
    type: "footer",
  }
);

const whatsappFloat = defineBlock(
  z.object({
    label: str("Entre nas nossas comunidades"),
    url: str("#"),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Texto" },
      { key: "url", kind: "url", label: "Link" },
    ],
    group: "layout",
    label: "Botão flutuante WhatsApp",
    render: p => (
      <a className="sb-float" href={safeUrl(p.url)}>
        {p.label}
      </a>
    ),
    type: "whatsappFloat",
  }
);

const hero = defineBlock(
  z.object({
    backgroundImage: str(),
    buttonLabel: str("Explorar Conteúdos →"),
    buttonUrl: str("#conteudos"),
    text: str("Título principal do seu site"),
  }),
  {
    fields: [
      { key: "backgroundImage", kind: "image", label: "Imagem de fundo" },
      { key: "text", kind: "textarea", label: "Texto" },
      ...linkFields(),
    ],
    group: "content",
    label: "Hero",
    render: (p, ctx) => (
      <section
        className="sb-hero"
        style={
          p.backgroundImage
            ? { backgroundImage: `url(${JSON.stringify(p.backgroundImage)})` }
            : undefined
        }
      >
        <div className="sb-container">
          <h1>{p.text}</h1>
          <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
        </div>
      </section>
    ),
    type: "hero",
  }
);

const heading = defineBlock(
  z.object({
    align: z.enum(["left", "center"]).default("left"),
    level: z.enum(["h1", "h2", "h3"]).default("h2"),
    subtitle: str(),
    text: str("Título"),
  }),
  {
    fields: [
      { key: "text", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        key: "level",
        kind: "select",
        label: "Nível",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
        ],
      },
      {
        key: "align",
        kind: "select",
        label: "Alinhamento",
        options: [
          { label: "Esquerda", value: "left" },
          { label: "Centro", value: "center" },
        ],
      },
    ],
    group: "content",
    label: "Título",
    render: p => {
      const Tag = p.level;
      return (
        <div className={`sb-container sb-heading sb-align-${p.align}`}>
          <Tag>{p.text}</Tag>
          {p.subtitle ? <p className="sb-sub">{p.subtitle}</p> : null}
        </div>
      );
    },
    type: "heading",
  }
);

const text = defineBlock(z.object({ text: str("Escreva seu texto aqui.") }), {
  fields: [
    {
      key: "text",
      kind: "textarea",
      label: "Texto (linha em branco separa parágrafos)",
    },
  ],
  group: "content",
  label: "Texto",
  render: p => (
    <div className="sb-container sb-text">
      {p.text.split(/\n{2,}/).map(para => (
        <p key={para}>{para}</p>
      ))}
    </div>
  ),
  type: "text",
});

const image = defineBlock(z.object({ alt: str(), src: str() }), {
  fields: [
    { key: "src", kind: "image", label: "Imagem" },
    { key: "alt", kind: "text", label: "Texto alternativo" },
  ],
  group: "media",
  label: "Imagem",
  render: p => (
    <div className="sb-container sb-image">
      <Img alt={p.alt} src={p.src} />
    </div>
  ),
  type: "image",
});

const button = defineBlock(
  z.object({ buttonLabel: str("Clique aqui"), buttonUrl: str("#") }),
  {
    fields: linkFields(),
    group: "content",
    label: "Botão",
    render: (p, ctx) => (
      <div className="sb-container sb-align-center">
        <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
      </div>
    ),
    type: "button",
  }
);

const videoGrid = defineBlock(
  z.object({
    title: str("Últimas novidades:"),
    videos: z.array(z.object({ title: str(), youtubeId: str() })).default([]),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título do vídeo" },
          { key: "youtubeId", kind: "text", label: "ID do YouTube" },
        ],
        key: "videos",
        kind: "list",
        label: "Vídeos",
      },
    ],
    group: "media",
    label: "Vídeos do YouTube",
    render: p => (
      <section className="sb-container">
        <h2>{p.title}</h2>
        <div className="sb-grid sb-grid-3">
          {p.videos.map(v => (
            <iframe
              allowFullScreen
              className="sb-video"
              key={v.youtubeId}
              loading="lazy"
              src={`https://www.youtube.com/embed/${v.youtubeId}`}
              title={v.title || "Vídeo"}
            />
          ))}
        </div>
      </section>
    ),
    type: "videoGrid",
  }
);

const categoryGrid = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str("/categorias/"),
    images: z.array(z.object({ src: str() })).default([]),
    limit: z.coerce.number().default(0),
    subtitle: str(),
    title: str("Categorias"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [{ key: "src", kind: "image", label: "Imagem" }],
        key: "images",
        kind: "list",
        label: "Imagens dos cards (na ordem das categorias)",
      },
      { key: "limit", kind: "number", label: "Máx. de cards (0 = todos)" },
      ...linkFields(),
    ],
    group: "blog",
    label: "Grade de categorias",
    render: (p, ctx) => {
      const cats =
        p.limit > 0
          ? ctx.site.categories.slice(0, p.limit)
          : ctx.site.categories;
      return (
        <section className="sb-container">
          {p.title ? <h2>{p.title}</h2> : null}
          {p.subtitle ? <p className="sb-sub">{p.subtitle}</p> : null}
          <div className="sb-grid sb-grid-3">
            {cats.map((c, i) => (
              <a
                className="sb-card sb-cat-card"
                href={href(ctx, categoryPath(c))}
                key={c.id}
              >
                <span>{c.name}</span>
                <Img src={p.images[i]?.src} />
              </a>
            ))}
          </div>
          <div className="sb-align-center">
            <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
        </section>
      );
    },
    type: "categoryGrid",
  }
);

const stats = defineBlock(
  z.object({
    items: z
      .array(z.object({ label: str(), suffix: str(), value: str() }))
      .default([]),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "value", kind: "text", label: "Número" },
          { key: "suffix", kind: "text", label: "Sufixo (+, %)" },
          { key: "label", kind: "text", label: "Legenda" },
        ],
        key: "items",
        kind: "list",
        label: "Números",
      },
    ],
    group: "content",
    label: "Contadores",
    render: p => (
      <section className="sb-container sb-align-center">
        {p.title ? <h2>{p.title}</h2> : null}
        <div className="sb-stats">
          {p.items.map(i => (
            <div key={i.label + i.value}>
              <strong>
                {i.value}
                <small>{i.suffix}</small>
              </strong>
              <span>{i.label}</span>
            </div>
          ))}
        </div>
      </section>
    ),
    type: "stats",
  }
);

const cardGrid = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str(),
    cards: z
      .array(
        z.object({ image: str(), tag: str(), title: str(), url: str("#") })
      )
      .default([]),
    title: str("Ferramentas & Soluções"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      ...linkFields("Botão do título"),
      {
        itemFields: [
          { key: "tag", kind: "text", label: "Etiqueta" },
          { key: "title", kind: "text", label: "Título" },
          { key: "image", kind: "image", label: "Imagem" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "cards",
        kind: "list",
        label: "Cards (o primeiro vira destaque largo)",
      },
    ],
    group: "content",
    label: "Cards de destaque",
    render: (p, ctx) => {
      const [first, ...rest] = p.cards;
      return (
        <section className="sb-container">
          <div className="sb-row-between">
            <h2>{p.title}</h2>
            <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
          </div>
          {first ? (
            <a className="sb-card sb-feature" href={href(ctx, first.url)}>
              <Img src={first.image} />
              <div>
                {first.tag ? <span className="sb-tag">{first.tag}</span> : null}
                <h3>{first.title}</h3>
              </div>
            </a>
          ) : null}
          <div className="sb-grid sb-grid-3">
            {rest.map(c => (
              <a
                className="sb-card sb-feature sb-feature-tall"
                href={href(ctx, c.url)}
                key={c.title}
              >
                <Img src={c.image} />
                <div>
                  {c.tag ? <span className="sb-tag">{c.tag}</span> : null}
                  <h3>{c.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      );
    },
    type: "cardGrid",
  }
);

const featuredPost = defineBlock(
  z.object({ label: str("Melhor Post"), postSlug: str() }),
  {
    fields: [
      { key: "label", kind: "text", label: "Rótulo" },
      {
        key: "postSlug",
        kind: "text",
        label: "Slug do post (vazio = mais recente)",
      },
    ],
    group: "blog",
    label: "Post em destaque",
    render: (p, ctx) => {
      const posts = visiblePosts(ctx.site, ctx.mode);
      const post = posts.find(x => x.slug === p.postSlug) ?? posts[0];
      if (!post) return null;
      return (
        <section className="sb-container">
          <div className="sb-card sb-featured-post">
            <h3>{p.label}</h3>
            <Img src={post.coverImage} />
            <p>{post.title}</p>
            <LinkButton
              ctx={ctx}
              label="Ver Mais"
              url={postPath(post)}
              variant="light"
            />
          </div>
        </section>
      );
    },
    type: "featuredPost",
  }
);

const testimonials = defineBlock(
  z.object({
    items: z
      .array(
        z.object({ avatar: str(), name: str(), quote: str(), role: str() })
      )
      .default([]),
    subtitle: str(),
    title: str("O que dizem sobre nós"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          { key: "quote", kind: "textarea", label: "Depoimento" },
          { key: "name", kind: "text", label: "Nome" },
          { key: "role", kind: "text", label: "Cargo" },
          { key: "avatar", kind: "image", label: "Foto" },
        ],
        key: "items",
        kind: "list",
        label: "Depoimentos",
      },
    ],
    group: "content",
    label: "Depoimentos",
    render: p => (
      <section className="sb-container">
        <div className="sb-align-center">
          <h2>{p.title}</h2>
          {p.subtitle ? <p className="sb-sub">{p.subtitle}</p> : null}
        </div>
        <div className="sb-grid sb-grid-3">
          {p.items.map(t => (
            <figure className="sb-card sb-testimonial" key={t.name + t.quote}>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <Img className="sb-avatar" src={t.avatar} />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    ),
    type: "testimonials",
  }
);

const splitSection = defineBlock(
  z.object({
    buttonLabel: str("Ver Mais →"),
    buttonUrl: str("#"),
    image: str(),
    text: str(),
    title: str("Título da seção"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "image", kind: "image", label: "Imagem" },
      ...linkFields(),
    ],
    group: "content",
    label: "Texto + imagem",
    render: (p, ctx) => (
      <section className="sb-container sb-split">
        <div>
          <h2>{p.title}</h2>
          <p>{p.text}</p>
          <LinkButton ctx={ctx} label={p.buttonLabel} url={p.buttonUrl} />
        </div>
        <Img src={p.image} />
      </section>
    ),
    type: "splitSection",
  }
);

function filterPosts(
  posts: ReturnType<typeof visiblePosts>,
  query: Record<string, string>,
  categoryId?: string
) {
  const q = (query.q ?? "").trim().toLowerCase();
  return posts.filter(
    p =>
      (!categoryId || p.categoryId === categoryId) &&
      (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q))
  );
}

const postExplorer = defineBlock(
  z.object({
    limit: z.coerce.number().default(6),
    title: str("Todos os conteúdos"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "limit", kind: "number", label: "Quantidade de posts" },
    ],
    group: "blog",
    label: "Busca + lista de posts",
    render: (p, ctx) => {
      const cat = ctx.site.categories.find(c => c.slug === ctx.query.category);
      const posts = filterPosts(
        visiblePosts(ctx.site, ctx.mode),
        ctx.query,
        cat?.id
      ).slice(0, p.limit);
      return (
        // biome-ignore lint/correctness/useUniqueElementIds: âncora fixa (#conteudos) usada pelo botão do hero
        <section className="sb-container" id="conteudos">
          <h2 className="sb-align-center">{p.title}</h2>
          <form
            action={href(ctx, "/blogs/")}
            className="sb-filter"
            method="get"
          >
            <input
              defaultValue={ctx.query.q ?? ""}
              name="q"
              placeholder="Digite aqui..."
              type="search"
            />
            <select defaultValue={ctx.query.category ?? ""} name="category">
              <option value="">Selecionar categoria</option>
              {ctx.site.categories.map(c => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button className="sb-btn sb-btn-primary" type="submit">
              Pesquisar
            </button>
          </form>
          <div className="sb-grid sb-grid-3">
            {posts.map(post => (
              <PostCard ctx={ctx} key={post.id} post={post} />
            ))}
          </div>
          {posts.length === 0 ? (
            <p className="sb-align-center">Nenhum conteúdo encontrado.</p>
          ) : null}
        </section>
      );
    },
    type: "postExplorer",
  }
);

const postList = defineBlock(
  z.object({
    limit: z.coerce.number().default(6),
    title: str("Mais conteúdos como esse:"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "limit", kind: "number", label: "Quantidade" },
    ],
    group: "blog",
    label: "Lista de posts (relacionados / categoria)",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode).filter(
        x => x.id !== ctx.current.post?.id
      );
      const posts = filterPosts(all, ctx.query, ctx.current.category?.id).slice(
        0,
        p.limit
      );
      return (
        <section className="sb-container">
          {p.title ? <h2>{p.title}</h2> : null}
          <div className="sb-grid sb-grid-3">
            {posts.map(post => (
              <PostCard ctx={ctx} key={post.id} post={post} />
            ))}
          </div>
        </section>
      );
    },
    type: "postList",
  }
);

const categoryHeader = defineBlock(z.object({ backLabel: str("Voltar") }), {
  fields: [{ key: "backLabel", kind: "text", label: "Texto do voltar" }],
  group: "blog",
  label: "Cabeçalho de categoria",
  render: (p, ctx) => (
    <div className="sb-container sb-heading">
      <a className="sb-link" href={href(ctx, "/blogs/")}>
        ← {p.backLabel}
      </a>
      <h1>{ctx.current.category?.name ?? "Categoria"}</h1>
    </div>
  ),
  type: "categoryHeader",
});

const postHeader = defineBlock(z.object({}), {
  fields: [],
  group: "blog",
  label: "Cabeçalho do post",
  render: (_p, ctx) => {
    const post = ctx.current.post;
    if (!post) return null;
    const cat = categoryOf(ctx.site, post);
    return (
      <div className="sb-container sb-post-header">
        <h1>{post.title}</h1>
        <Img src={post.coverImage} />
        {cat ? <span className="sb-tag">{cat.name}</span> : null}
        <time>{formatDate(post.publishedAt)}</time>
      </div>
    );
  },
  type: "postHeader",
});

const postContent = defineBlock(z.object({}), {
  fields: [],
  group: "blog",
  label: "Conteúdo do post",
  render: (_p, ctx) => (
    <div className="sb-post-content">
      {ctx.current.post ? ctx.renderBlocks(ctx.current.post.blocks) : null}
    </div>
  ),
  type: "postContent",
});

const sidebarBanner = defineBlock(z.object({ image: str(), url: str("#") }), {
  fields: [
    { key: "image", kind: "image", label: "Banner" },
    { key: "url", kind: "url", label: "Link" },
  ],
  group: "blog",
  label: "Barra lateral (busca + categorias + banner)",
  render: (p, ctx) => (
    <aside className="sb-sidebar">
      <form action={href(ctx, "/blogs/")} className="sb-filter" method="get">
        <input name="q" placeholder="Digite aqui..." type="search" />
        <button className="sb-btn sb-btn-primary" type="submit">
          Pesquisar
        </button>
      </form>
      <h4>Categorias</h4>
      <ul>
        {ctx.site.categories.map(c => (
          <li key={c.id}>
            <a href={href(ctx, categoryPath(c))}>{c.name}</a>
          </li>
        ))}
      </ul>
      {p.image ? (
        <a href={safeUrl(p.url)}>
          <Img src={p.image} />
        </a>
      ) : null}
    </aside>
  ),
  type: "sidebarBanner",
});

/** Contêiner de duas colunas: filho 0 = principal, filho 1 = lateral. */
const twoColumns = defineBlock(z.object({}), {
  fields: [],
  group: "layout",
  label: "Duas colunas",
  render: (_p, _ctx, children) => (
    <div className="sb-container sb-two-cols">
      <div className="sb-col-main">{children[0]}</div>
      <div className="sb-col-side">{children[1]}</div>
    </div>
  ),
  type: "twoColumns",
});

const linkCards = defineBlock(
  z.object({
    items: z
      .array(z.object({ image: str(), name: str(), url: str("#") }))
      .default([]),
    title: str("Nossos blogs"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        itemFields: [
          { key: "name", kind: "text", label: "Nome" },
          { key: "url", kind: "url", label: "Link" },
          { key: "image", kind: "image", label: "Imagem" },
        ],
        key: "items",
        kind: "list",
        label: "Itens",
      },
    ],
    group: "content",
    label: "Cards de links externos",
    render: p => (
      <section className="sb-container">
        <h2>{p.title}</h2>
        <div className="sb-grid sb-grid-3">
          {p.items.map(i => (
            <a
              className="sb-card sb-cat-card"
              href={safeUrl(i.url)}
              key={i.name}
            >
              <span>{i.name}</span>
              <Img src={i.image} />
            </a>
          ))}
        </div>
      </section>
    ),
    type: "linkCards",
  }
);

export const blockDefinitions: BlockDefinition[] = [
  header,
  footer,
  whatsappFloat,
  hero,
  heading,
  text,
  image,
  button,
  videoGrid,
  categoryGrid,
  stats,
  cardGrid,
  featuredPost,
  testimonials,
  splitSection,
  postExplorer,
  postList,
  categoryHeader,
  postHeader,
  postContent,
  sidebarBanner,
  twoColumns,
  linkCards,
];
