import { z } from "zod";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  formatDate,
  href,
  Img,
  Inline,
  LinkButton,
  PostCard,
  postPath,
  SocialIcon,
  safeUrl,
  visiblePosts,
} from "./helpers.js";
import type { BlockDefinition, FieldDef, RenderContext } from "./types.js";
import { latestVideoEmbed, videoEmbed } from "./youtube.js";

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
          {p.logo ? (
            <Img alt={p.logoText || ctx.site.name} src={p.logo} />
          ) : null}
          {p.logoText ? <strong>{p.logoText}</strong> : null}
        </a>
        <nav className="sb-nav">
          {ctx.site.menu.map(item => {
            const subs =
              item.dynamic === "categories"
                ? ctx.site.categories.map(c => ({
                    href: categoryPath(c),
                    label: c.name,
                  }))
                : (item.children ?? []);
            return (
              <div
                className={subs.length ? "sb-nav-item has-sub" : "sb-nav-item"}
                key={item.href + item.label}
              >
                <a href={href(ctx, item.href)}>
                  {item.label}
                  {subs.length ? <i aria-hidden="true" /> : null}
                </a>
                {subs.length ? (
                  <div className="sb-nav-sub">
                    {subs.map(s => (
                      <a href={href(ctx, s.href)} key={s.href + s.label}>
                        {s.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
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
    extraLinks: z.array(z.object({ label: str(), url: str("#") })).default([]),
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
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "extraLinks",
        kind: "list",
        label: "Links extras no menu do rodapé",
      },
      { key: "copyright", kind: "text", label: "Copyright" },
    ],
    group: "layout",
    label: "Rodapé",
    render: (p, ctx) => (
      <footer className="sb-footer">
        <div className="sb-container sb-footer-grid">
          <div className="sb-footer-brand">
            {p.logo ? (
              <Img alt={p.logoText || ctx.site.name} src={p.logo} />
            ) : null}
            {p.logoText ? <strong>{p.logoText}</strong> : null}
          </div>
          <div>
            <h4>Menu</h4>
            {ctx.site.menu.map(item => (
              <a href={href(ctx, item.href)} key={item.href + item.label}>
                {item.label}
              </a>
            ))}
            {p.extraLinks.map(l => (
              <a href={safeUrl(l.url)} key={l.url + l.label}>
                {l.label}
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
                <a
                  aria-label={s.label}
                  href={safeUrl(s.url)}
                  key={s.label + s.url}
                  title={s.label}
                >
                  <SocialIcon label={s.label} />
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
          <LinkButton
            ctx={ctx}
            label={p.buttonLabel}
            size="lg"
            url={p.buttonUrl}
          />
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
    watermark: str(),
  }),
  {
    fields: [
      { key: "text", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      { key: "watermark", kind: "text", label: "Texto grande ao fundo" },
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
          {p.watermark ? (
            <span aria-hidden="true" className="sb-watermark">
              {p.watermark}
            </span>
          ) : null}
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
      label:
        "Texto (linha em branco separa parágrafos; **negrito**, *itálico*, [texto](link))",
    },
  ],
  group: "content",
  label: "Texto",
  render: p => (
    <div className="sb-container sb-text">
      {p.text.split(/\n{2,}/).map(para => (
        <p key={para}>
          <Inline text={para} />
        </p>
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
  z.object({
    buttonLabel: str("Clique aqui"),
    buttonUrl: str("#"),
    variant: z.enum(["primary", "wide"]).default("primary"),
  }),
  {
    fields: [
      ...linkFields(),
      {
        key: "variant",
        kind: "select",
        label: "Aparência",
        options: [
          { label: "Padrão", value: "primary" },
          { label: "Largo (link na bio)", value: "wide" },
        ],
      },
    ],
    group: "content",
    label: "Botão",
    render: (p, ctx) => (
      <div className="sb-container sb-align-center">
        <LinkButton
          ctx={ctx}
          label={p.buttonLabel}
          url={p.buttonUrl}
          variant={p.variant}
        />
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

const channelVideos = defineBlock(
  z.object({
    items: z
      .array(
        z.object({
          channel: z
            .object({ id: str(), input: str(), name: str() })
            .default({}),
          mode: z.enum(["latest", "specific"]).default("latest"),
          title: str(),
          video: str(),
        })
      )
      .default([]),
    title: str("Vídeos dos canais"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título da seção" },
      {
        itemFields: [
          { key: "channel", kind: "youtubeChannel", label: "Canal" },
          {
            key: "mode",
            kind: "select",
            label: "O que mostrar",
            options: [
              { label: "Sempre o último vídeo do canal", value: "latest" },
              { label: "Um vídeo específico", value: "specific" },
            ],
          },
          {
            key: "video",
            kind: "text",
            label: "Link do vídeo",
            showWhen: { equals: "specific", key: "mode" },
          },
          { key: "title", kind: "text", label: "Título (opcional)" },
        ],
        key: "items",
        kind: "list",
        label: "Canais",
      },
    ],
    group: "media",
    label: "Vídeos de canais",
    render: (p, ctx) => {
      const players = p.items.flatMap((item, i) => {
        const src =
          item.mode === "specific"
            ? videoEmbed(item.video)
            : latestVideoEmbed(item.channel.id);
        const title =
          item.title || item.channel.name || item.channel.input || "Vídeo";
        if (src)
          return [
            // biome-ignore lint/suspicious/noArrayIndexKey: itens da lista não têm id estável
            <figure className="sb-channel-video" key={`${i}-${src}`}>
              <iframe
                allowFullScreen
                className="sb-video"
                loading="lazy"
                src={src}
                title={title}
              />
              {item.title || item.channel.name ? (
                <figcaption>{item.title || item.channel.name}</figcaption>
              ) : null}
            </figure>,
          ];
        // No site publicado, item incompleto some; no editor mostra o que falta.
        return ctx.mode === "edit"
          ? [
              // biome-ignore lint/suspicious/noArrayIndexKey: itens da lista não têm id estável
              <div className="sb-channel-video sb-channel-empty" key={i}>
                {item.mode === "specific"
                  ? "Cole o link do vídeo"
                  : "Escolha o canal"}
              </div>,
            ]
          : [];
      });
      return (
        <section className="sb-container">
          {p.title ? <h2>{p.title}</h2> : null}
          <div className="sb-grid sb-grid-3">{players}</div>
        </section>
      );
    },
    type: "channelVideos",
  }
);

const categoryGrid = defineBlock(
  z.object({
    buttonLabel: str(),
    buttonUrl: str("/categorias/"),
    images: z.array(z.object({ src: str(), text: str() })).default([]),
    limit: z.coerce.number().default(0),
    subtitle: str(),
    title: str("Categorias"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "subtitle", kind: "text", label: "Subtítulo" },
      {
        itemFields: [
          { key: "src", kind: "image", label: "Imagem" },
          { key: "text", kind: "textarea", label: "Descrição" },
        ],
        key: "images",
        kind: "list",
        label: "Imagens e textos dos cards (na ordem das categorias)",
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
                className={`sb-card sb-cat-card${p.images[i]?.src ? "" : "plain"}`}
                href={href(ctx, categoryPath(c))}
                key={c.id}
              >
                <span className="sb-cat-head">
                  <span>{c.name}</span>
                  <b aria-hidden="true">↗</b>
                </span>
                {p.images[i]?.src ? <Img src={p.images[i]?.src} /> : null}
                {p.images[i]?.text ? (
                  <small className="sb-cat-text">{p.images[i]?.text}</small>
                ) : null}
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
    backgroundImage: str(),
    items: z
      .array(z.object({ label: str(), suffix: str(), value: str() }))
      .default([]),
    title: str(),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "backgroundImage", kind: "image", label: "Imagem de fundo" },
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
      <section className="sb-container sb-align-center sb-stats-wrap">
        {p.backgroundImage ? <Img alt="" src={p.backgroundImage} /> : null}
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
            <LinkButton
              ctx={ctx}
              label={p.buttonLabel}
              size="lg"
              url={p.buttonUrl}
            />
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
  z.object({
    backgroundImage: str(),
    backgroundImage2: str(),
    backgroundImage3: str(),
    label: str("Melhor Post"),
    postSlug: str(),
    sideImage: str(),
  }),
  {
    fields: [
      { key: "label", kind: "text", label: "Rótulo" },
      {
        key: "backgroundImage",
        kind: "image",
        label: "Ondas ao fundo (camada 1)",
      },
      {
        key: "backgroundImage3",
        kind: "image",
        label: "Ondas ao fundo (camada 2)",
      },
      {
        key: "backgroundImage2",
        kind: "image",
        label: "Ondas ao fundo (camada 3, na frente)",
      },
      { key: "sideImage", kind: "image", label: "Imagem decorativa ao lado" },
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
        <section className="sb-featured-wrap">
          {p.backgroundImage ? (
            <Img alt="" className="w1" src={p.backgroundImage} />
          ) : null}
          {p.backgroundImage3 ? (
            <Img alt="" className="w3" src={p.backgroundImage3} />
          ) : null}
          {p.backgroundImage2 ? (
            <Img alt="" className="w2" src={p.backgroundImage2} />
          ) : null}
          <div className="sb-container sb-featured-inner">
            {p.sideImage ? <Img alt="" src={p.sideImage} /> : null}
            <div className="sb-card sb-featured-post">
              <h3>
                {p.label}
                <i />
              </h3>
              <Img src={post.coverImage} />
              <p>{post.title}</p>
              <LinkButton
                ctx={ctx}
                label="Ver Mais"
                url={postPath(post)}
                variant="light"
              />
            </div>
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
    decoration: str(),
    image: str(),
    text: str(),
    title: str("Título da seção"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "image", kind: "image", label: "Imagem" },
      {
        key: "decoration",
        kind: "image",
        label: "Imagem decorativa (opcional)",
      },
      ...linkFields(),
    ],
    group: "content",
    label: "Texto + imagem",
    render: (p, ctx) => (
      <section className="sb-container sb-split">
        {p.decoration ? (
          <Img alt="" className="sb-split-deco" src={p.decoration} />
        ) : null}
        <div>
          <h2>{p.title}</h2>
          <p>{p.text}</p>
          <LinkButton
            ctx={ctx}
            label={p.buttonLabel}
            size="lg"
            url={p.buttonUrl}
          />
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

const CAROUSEL_JS = `(function(){document.querySelectorAll('.sb-mag-main').forEach(function(box){if(box.dataset.ready)return;box.dataset.ready='1';var t=box.querySelector('.sb-mag-track'),d=box.querySelectorAll('.sb-mag-dots button');if(!t||d.length<2)return;function cur(){return Math.round(t.scrollLeft/t.clientWidth)}function mark(){var i=cur();d.forEach(function(b,j){b.className=j===i?'on':''})}function go(i){t.scrollTo({left:i*t.clientWidth,behavior:'smooth'})}d.forEach(function(b,j){b.onclick=function(){go(j)}});t.addEventListener('scroll',mark,{passive:true});mark();setInterval(function(){if(box.matches(':hover'))return;go((cur()+1)%d.length)},5000)})})();`;

const postExplorer = defineBlock(
  z.object({
    layout: z.enum(["grid", "magazine"]).default("grid"),
    limit: z.coerce.number().default(6),
    title: str("Todos os conteúdos"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "layout",
        kind: "select",
        label: "Aparência",
        options: [
          { label: "Grade de cards", value: "grid" },
          { label: "Destaque + lista", value: "magazine" },
        ],
      },
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
      if (p.layout === "magazine") {
        const slides = posts.slice(0, 3);
        const side = posts.slice(3, 6);
        const catName = (post: (typeof posts)[number]) =>
          categoryOf(ctx.site, post)?.name ?? "";
        return (
          // biome-ignore lint/correctness/useUniqueElementIds: âncora fixa (#conteudos) usada pelo botão do hero
          <section className="sb-container" id="conteudos">
            <h2 className="sb-align-center">{p.title}</h2>
            <form
              action={href(ctx, "/pesquisa/")}
              className="sb-mag"
              method="get"
            >
              <div className="sb-mag-search">
                <input
                  defaultValue={ctx.query.q ?? ""}
                  name="q"
                  placeholder="Digite aqui..."
                  type="search"
                />
                <button className="sb-btn sb-btn-primary" type="submit">
                  Pesquisar
                </button>
              </div>
              <div className="sb-mag-cats">
                <strong>Categorias</strong>
                <select defaultValue={ctx.query.category ?? ""} name="category">
                  <option value="">Selecionar categoria</option>
                  {ctx.site.categories.map(c => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {slides.length ? (
                <div className="sb-mag-main">
                  <div className="sb-mag-track">
                    {slides.map(post => (
                      <a
                        className="sb-mag-slide"
                        href={href(ctx, postPath(post))}
                        key={post.id}
                      >
                        <Img alt={post.title} src={post.coverImage} />
                        <small>{catName(post)}</small>
                        <h3>{post.title}</h3>
                        <p>{post.excerpt}</p>
                      </a>
                    ))}
                  </div>
                  {slides.length > 1 ? (
                    <div className="sb-mag-dots">
                      {slides.map((post, i) => (
                        <button
                          aria-label={`Notícia ${i + 1}`}
                          className={i === 0 ? "on" : ""}
                          key={post.id}
                          type="button"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="sb-mag-side">
                {side.slice(0, 3).map(post => (
                  <a href={href(ctx, postPath(post))} key={post.id}>
                    <Img alt={post.title} src={post.coverImage} />
                    <span>
                      <h3>{post.title}</h3>
                      <em>Ver mais »</em>
                    </span>
                  </a>
                ))}
              </div>
            </form>
            {posts.length === 0 ? (
              <p className="sb-align-center">Nenhum conteúdo encontrado.</p>
            ) : null}
            {/* Pontos e troca automática do carrossel; script fixo, sem conteúdo do usuário. */}
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: script constante */}
            <script dangerouslySetInnerHTML={{ __html: CAROUSEL_JS }} />
          </section>
        );
      }
      return (
        // biome-ignore lint/correctness/useUniqueElementIds: âncora fixa (#conteudos) usada pelo botão do hero
        <section className="sb-container" id="conteudos">
          <h2 className="sb-align-center">{p.title}</h2>
          <form
            action={href(ctx, "/pesquisa/")}
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
    nextUrl: str(),
    offset: z.coerce.number().default(0),
    prevUrl: str(),
    title: str("Mais conteúdos como esse:"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "limit", kind: "number", label: "Quantidade" },
      {
        key: "offset",
        kind: "number",
        label: "Pular os primeiros (paginação)",
      },
      { key: "prevUrl", kind: "url", label: "Link da página anterior" },
      { key: "nextUrl", kind: "url", label: "Link da próxima página" },
    ],
    group: "blog",
    label: "Lista de posts (relacionados / categoria)",
    render: (p, ctx) => {
      const all = visiblePosts(ctx.site, ctx.mode).filter(
        x => x.id !== ctx.current.post?.id
      );
      const posts = filterPosts(all, ctx.query, ctx.current.category?.id).slice(
        p.offset,
        p.offset + p.limit
      );
      return (
        <section className="sb-container">
          {p.title ? <h2>{p.title}</h2> : null}
          <div className="sb-grid sb-grid-3">
            {posts.map(post => (
              <PostCard compact ctx={ctx} key={post.id} post={post} />
            ))}
          </div>
          {p.prevUrl || p.nextUrl ? (
            <nav className="sb-pager">
              {p.prevUrl ? (
                <a
                  className="sb-btn sb-btn-primary"
                  href={href(ctx, p.prevUrl)}
                >
                  « Anterior
                </a>
              ) : null}
              {p.nextUrl ? (
                <a
                  className="sb-btn sb-btn-primary"
                  href={href(ctx, p.nextUrl)}
                >
                  Próxima »
                </a>
              ) : null}
            </nav>
          ) : null}
        </section>
      );
    },
    type: "postList",
  }
);

const categorySearch = defineBlock(z.object({}), {
  fields: [],
  group: "blog",
  label: "Busca da categoria",
  render: (_p, ctx) => (
    <form
      action={href(ctx, "/pesquisa/")}
      className="sb-container sb-mag sb-cat-search"
      method="get"
    >
      <div className="sb-mag-search">
        <input
          defaultValue={ctx.query.q ?? ""}
          name="q"
          placeholder="Digite aqui..."
          type="search"
        />
        <button className="sb-btn sb-btn-primary" type="submit">
          Pesquisar
        </button>
      </div>
      <div className="sb-mag-cats">
        <strong>Categorias</strong>
        <select defaultValue={ctx.current.category?.slug ?? ""} name="category">
          <option value="">Selecionar categoria</option>
          {ctx.site.categories.map(c => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  ),
  type: "categorySearch",
});

const categoryHeader = defineBlock(
  z.object({
    backLabel: str("Voltar"),
    backUrl: str("/categorias/"),
    title: str(),
  }),
  {
    fields: [
      {
        key: "title",
        kind: "text",
        label: "Título (vazio = nome da categoria)",
      },
      { key: "backLabel", kind: "text", label: "Texto do voltar" },
      { key: "backUrl", kind: "url", label: "Link do voltar" },
    ],
    group: "blog",
    label: "Cabeçalho de categoria",
    render: (p, ctx) => (
      <div className="sb-container sb-cat-header">
        <h1>{p.title || ctx.current.category?.name || "Categoria"}</h1>
        <a className="sb-btn sb-btn-primary" href={href(ctx, p.backUrl)}>
          {p.backLabel}
        </a>
      </div>
    ),
    type: "categoryHeader",
  }
);

const SHOW_OPTIONS = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

const postHeader = defineBlock(
  z.object({
    showCover: z.enum(["yes", "no"]).default("yes"),
    watermark: str(),
  }),
  {
    fields: [
      { key: "watermark", kind: "text", label: "Texto grande ao fundo" },
      {
        key: "showCover",
        kind: "select",
        label: "Mostrar imagem, categoria e data aqui",
        options: SHOW_OPTIONS,
      },
    ],
    group: "blog",
    label: "Cabeçalho do post",
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      return (
        <div className="sb-container sb-post-header sb-heading">
          {p.watermark ? (
            <span aria-hidden="true" className="sb-watermark">
              {p.watermark}
            </span>
          ) : null}
          <h1>{post.title}</h1>
          {p.showCover === "yes" ? <PostMeta ctx={ctx} /> : null}
        </div>
      );
    },
    type: "postHeader",
  }
);

function PostMeta({ ctx }: { ctx: RenderContext }) {
  const post = ctx.current.post;
  if (!post) return null;
  const cat = categoryOf(ctx.site, post);
  return (
    <>
      <Img src={post.coverImage} />
      {cat ? <span className="sb-tag">{cat.name}</span> : null}
      <time>{formatDate(post.publishedAt)}</time>
    </>
  );
}

const postContent = defineBlock(
  z.object({ showMeta: z.enum(["yes", "no"]).default("no") }),
  {
    fields: [
      {
        key: "showMeta",
        kind: "select",
        label: "Mostrar imagem, categoria e data antes do texto",
        options: SHOW_OPTIONS,
      },
    ],
    group: "blog",
    label: "Conteúdo do post",
    render: (p, ctx) => (
      <div className="sb-post-content">
        {p.showMeta === "yes" ? (
          <div className="sb-post-meta">
            <PostMeta ctx={ctx} />
          </div>
        ) : null}
        {ctx.current.post ? ctx.renderBlocks(ctx.current.post.blocks) : null}
      </div>
    ),
    type: "postContent",
  }
);

const sidebarBanner = defineBlock(z.object({ image: str(), url: str("#") }), {
  fields: [
    { key: "image", kind: "image", label: "Banner" },
    { key: "url", kind: "url", label: "Link" },
  ],
  group: "blog",
  label: "Barra lateral (busca + categorias + banner)",
  render: (p, ctx) => (
    <aside className="sb-sidebar">
      <form action={href(ctx, "/pesquisa/")} className="sb-filter" method="get">
        <input name="q" placeholder="Digite aqui..." type="search" />
        <button className="sb-btn sb-btn-primary" type="submit">
          Pesquisar
        </button>
      </form>
      <h4>Categorias</h4>
      <form action={href(ctx, "/pesquisa/")} method="get">
        <select className="sb-select" name="category">
          <option value="">Selecionar categoria</option>
          {ctx.site.categories.map(c => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </form>
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
        {p.title ? <h2>{p.title}</h2> : null}
        <div className="sb-link-cards">
          {p.items.map(i => (
            <a
              className="sb-card sb-link-card"
              href={safeUrl(i.url)}
              key={i.name}
            >
              <Img src={i.image} />
              <span className="sb-cat-head">
                <span>{i.name}</span>
                <b aria-hidden="true">↗</b>
              </span>
            </a>
          ))}
        </div>
      </section>
    ),
    type: "linkCards",
  }
);

const socialIcons = defineBlock(
  z.object({
    items: z.array(z.object({ label: str(), url: str("#") })).default([]),
  }),
  {
    fields: [
      {
        itemFields: [
          {
            key: "label",
            kind: "text",
            label: "Rede (Instagram, YouTube, X…)",
          },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "items",
        kind: "list",
        label: "Redes",
      },
    ],
    group: "content",
    label: "Ícones de redes sociais",
    render: p => (
      <div className="sb-container sb-social-row">
        {p.items.map(i => (
          <a
            aria-label={i.label}
            href={safeUrl(i.url)}
            key={i.label + i.url}
            title={i.label}
          >
            <SocialIcon label={i.label} />
          </a>
        ))}
      </div>
    ),
    type: "socialIcons",
  }
);

export const blockDefinitions: BlockDefinition[] = [
  socialIcons,
  header,
  footer,
  whatsappFloat,
  hero,
  heading,
  text,
  image,
  button,
  videoGrid,
  channelVideos,
  categoryGrid,
  stats,
  cardGrid,
  featuredPost,
  testimonials,
  splitSection,
  postExplorer,
  postList,
  categoryHeader,
  categorySearch,
  postHeader,
  postContent,
  sidebarBanner,
  twoColumns,
  linkCards,
];
