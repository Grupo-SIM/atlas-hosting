import type { CSSProperties } from "react";
import { z } from "zod";
import { cssUrl } from "../renderer/central.js";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  href,
  Img,
  newTab,
  SocialIcon,
  wpDate,
} from "./helpers.js";
import type { BlockDefinition } from "./types.js";
import {
  flag,
  int,
  str,
  YES_NO,
  ZyCard,
  zyAuthor,
  zyAvatar,
  zyPosts,
} from "./zyrion-lib.js";

/** Blocos das páginas do tema Zyrion: arquivo/busca, post, 404, comunidade e link da bio. */

/* ───────────────────────── faixa do título (arquivo / busca) ───────────────────────── */

const zyArchiveHeader = defineBlock(
  z.object({
    description: str(),
    image: str(),
    mode: z
      .enum(["category", "search", "text"])
      .default("category")
      .catch("category"),
    title: str(),
  }),
  {
    fields: [
      {
        key: "mode",
        kind: "select",
        label: "Título",
        options: [
          { label: "Nome da categoria", value: "category" },
          { label: "Resultados para: {termo da busca}", value: "search" },
          { label: "Texto fixo", value: "text" },
        ],
      },
      {
        key: "title",
        kind: "text",
        label: "Texto fixo (ou prefixo, na busca)",
      },
      { key: "description", kind: "textarea", label: "Descrição (opcional)" },
      { key: "image", kind: "image", label: "Imagem de fundo (aparece a 8%)" },
    ],
    group: "blog",
    label: "Faixa do título (arquivo e busca)",
    render: (p, ctx) => (
      <section
        className="zy-arch-head"
        data-zy="archiveHeader"
        style={{ "--zy-bg": cssUrl(p.image) } as CSSProperties}
      >
        <div className="zy-arch-in">
          {p.mode === "search" ? (
            <h1>
              {p.title || "Resultados para:"}{" "}
              <span data-zy-q>{ctx.query.q ?? ""}</span>
            </h1>
          ) : (
            <h1>
              {p.mode === "category"
                ? ctx.current.category?.name || p.title
                : p.title}
            </h1>
          )}
          {p.description ? <p>{p.description}</p> : null}
        </div>
      </section>
    ),
    type: "zyArchiveHeader",
  }
);

/* ───────────────────────── grade de arquivo ───────────────────────── */

const zyArchive = defineBlock(
  z.object({
    buttonLabel: str("Carregar mais"),
    categorySlug: str(),
    cols: int(1, 4, 3),
    limit: int(1, 200, 100),
    step: int(0, 60, 9),
  }),
  {
    fields: [
      {
        key: "categorySlug",
        kind: "text",
        label: "Categoria (vazio = a da página; sem página, todas)",
      },
      {
        key: "cols",
        kind: "number",
        label: "Colunas no desktop (tablet 2, celular 1)",
      },
      {
        key: "step",
        kind: "number",
        label: "Cartões por vez (0 = mostrar todos, sem botão)",
      },
      { key: "limit", kind: "number", label: "Máximo de posts" },
      { key: "buttonLabel", kind: "text", label: "Texto do botão" },
    ],
    group: "blog",
    label: "Grade de arquivo com 'carregar mais'",
    render: (p, ctx) => {
      const slug = p.categorySlug || ctx.current.category?.slug || "";
      const q = (ctx.query.q ?? "").trim().toLowerCase();
      const list = zyPosts(ctx, slug, 0, p.limit).filter(
        post => !q || `${post.title} ${post.excerpt}`.toLowerCase().includes(q)
      );
      const step = p.step;
      return (
        <section
          className="zy-sec zy-archive"
          data-zy="archive"
          data-zy-archive
        >
          <div className="zy-in zy-pad">
            <div
              className="zy-grid zy-arch-grid"
              style={{ "--zy-cols-d": p.cols } as CSSProperties}
            >
              {list.map((post, i) => (
                <ZyCard
                  ctx={ctx}
                  hidden={step > 0 && i >= step}
                  key={post.id}
                  post={post}
                  variant="archive"
                />
              ))}
            </div>
            {step > 0 && list.length > step ? (
              <button className="zy-more" data-step={step} type="button">
                {p.buttonLabel}
              </button>
            ) : null}
          </div>
        </section>
      );
    },
    type: "zyArchive",
  }
);

/* ───────────────────────── busca ───────────────────────── */

const SearchSvg = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    width="16"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

const zySearch = defineBlock(z.object({ placeholder: str("Pesquisar...") }), {
  fields: [{ key: "placeholder", kind: "text", label: "Texto do campo" }],
  group: "blog",
  label: "Formulário de busca (Zyrion)",
  render: (p, ctx) => (
    <div className="zy-sec zy-search" data-zy="search">
      <form
        action={href(ctx, "/pesquisa/")}
        className="sb-filter zy-sform"
        method="get"
      >
        <input
          aria-label={p.placeholder}
          defaultValue={ctx.query.q ?? ""}
          name="q"
          placeholder={p.placeholder}
          type="search"
        />
        <button aria-label="Buscar" type="submit">
          <SearchSvg />
        </button>
      </form>
    </div>
  ),
  type: "zySearch",
});

/* ───────────────────────── post ───────────────────────── */

const CalSvg = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="13"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="13"
  >
    <rect height="16" rx="1" width="18" x="3" y="5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
const ChatSvg = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="13"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="13"
  >
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.5A8 8 0 1 1 21 12z" />
  </svg>
);

const zyPostHead = defineBlock(
  z.object({ noComments: str("Sem comentários"), showImage: flag("yes") }),
  {
    fields: [
      {
        key: "noComments",
        kind: "text",
        label: "Texto dos comentários (vazio = oculto)",
      },
      {
        key: "showImage",
        kind: "select",
        label: "Mostrar imagem destacada",
        options: YES_NO,
      },
    ],
    group: "blog",
    label: "Cabeçalho do post (Zyrion)",
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      const cat = categoryOf(ctx.site, post);
      return (
        <header className="zy-post-head" data-zy="postHead">
          {cat ? (
            <a className="zy-post-cat" href={href(ctx, categoryPath(cat))}>
              <svg
                aria-hidden="true"
                fill="currentColor"
                height="13"
                viewBox="0 0 24 24"
                width="13"
              >
                <path d="M3 5h7l2 2h9v12H3z" />
              </svg>
              {cat.name}
            </a>
          ) : (
            <span />
          )}
          <h1>{post.title}</h1>
          <div className="zy-post-meta">
            <span className="zy-post-author">
              <span className="zy-avatar sm">
                <Img alt="" src={zyAvatar(ctx)} />
              </span>
              <u>{zyAuthor(ctx)}</u>
            </span>
            <span>
              <CalSvg /> {wpDate(post.publishedAt)}
            </span>
            {p.noComments ? (
              <span>
                <ChatSvg /> {p.noComments}
              </span>
            ) : null}
          </div>
          <hr />
          {p.showImage === "yes" && post.coverImage ? (
            <Img alt="" className="zy-post-img" src={post.coverImage} />
          ) : null}
        </header>
      );
    },
    type: "zyPostHead",
  }
);

const WaSvg = () => (
  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z" />
  </svg>
);
const TgSvg = () => (
  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
  </svg>
);
const InSvg = () => (
  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4z" />
  </svg>
);

const NETWORKS = [
  { icon: <SocialIcon label="facebook" />, id: "facebook", label: "Facebook" },
  { icon: <SocialIcon label="x" />, id: "twitter", label: "X" },
  { icon: <WaSvg />, id: "whatsapp", label: "WhatsApp" },
  { icon: <TgSvg />, id: "telegram", label: "Telegram" },
  { icon: <InSvg />, id: "linkedin", label: "LinkedIn" },
];

const zyShare = defineBlock(
  z.object({ label: str("Compartilhe esta notícia") }),
  {
    fields: [{ key: "label", kind: "text", label: "Texto" }],
    group: "blog",
    label: "Compartilhar (Zyrion)",
    // O endereço de cada rede é montado no clique (`nav-runtime`), com a URL da página aberta.
    render: (p, ctx) =>
      ctx.current.post ? (
        <div className="zy-share" data-zy="share">
          <span>{p.label}</span>
          <div>
            {NETWORKS.map(n => (
              <button
                aria-label={`Compartilhar no ${n.label}`}
                data-share={n.id}
                key={n.id}
                type="button"
              >
                {n.icon}
              </button>
            ))}
          </div>
        </div>
      ) : null,
    type: "zyShare",
  }
);

const zyBrand = defineBlock(
  z.object({
    logo: str(),
    slogan: str("Notícias • Negócios • Entretenimento"),
  }),
  {
    fields: [
      { key: "logo", kind: "image", label: "Logo" },
      { key: "slogan", kind: "text", label: "Slogan" },
    ],
    group: "content",
    label: "Marca (logo + slogan)",
    render: (p, ctx) => (
      <div className="zy-brandbox" data-zy="brand">
        <a href={href(ctx, "/")}>
          <Img alt={ctx.site.name} src={p.logo} />
        </a>
        <strong>{p.slogan}</strong>
      </div>
    ),
    type: "zyBrand",
  }
);

const zyMore = defineBlock(
  z.object({ count: int(2, 12, 8), title: str("Mais novidades") }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "count",
        kind: "number",
        label: "Quantidade de posts (4 por linha)",
      },
    ],
    group: "blog",
    label: "Mais novidades (grade de 4)",
    render: (p, ctx) => {
      const cur = ctx.current.post?.id;
      const list = zyPosts(ctx, "", 0, p.count + 1)
        .filter(post => post.id !== cur)
        .slice(0, p.count);
      return (
        <section className="zy-more-sec" data-zy="moreNews">
          <div className="zy-div center big">
            <h2>{p.title}</h2>
          </div>
          <div className="zy-grid zy-more-grid">
            {list.map(post => (
              <ZyCard ctx={ctx} key={post.id} post={post} variant="plain" />
            ))}
          </div>
        </section>
      );
    },
    type: "zyMore",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const zyNotFound = defineBlock(
  z.object({
    backLabel: str("voltar para o início"),
    backUrl: str("/"),
    count: int(2, 8, 4),
    latestTitle: str("últimas notícias"),
    searchPlaceholder: str("Pesquisar..."),
    text: str(
      "Opss... Parece que você não encontrou o que procura por aqui, mas não se preocupe: use a busca ou veja as últimas notícias."
    ),
    title: str("página não encontrada"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título pequeno" },
      { key: "text", kind: "textarea", label: "Texto" },
      {
        key: "searchPlaceholder",
        kind: "text",
        label: "Texto do campo de busca",
      },
      {
        key: "latestTitle",
        kind: "text",
        label: "Divisor das últimas notícias",
      },
      { key: "count", kind: "number", label: "Quantidade de posts" },
      { key: "backLabel", kind: "text", label: "Botão — texto" },
      { key: "backUrl", kind: "url", label: "Botão — link" },
    ],
    group: "content",
    label: "Página não encontrada (Zyrion)",
    render: (p, ctx) => (
      <section className="zy-nf" data-zy="notFound">
        <div className="zy-nf-in">
          <div className="zy-nf-title">{p.title}</div>
          <h1>404</h1>
          <p>{p.text}</p>
          <form
            action={href(ctx, "/pesquisa/")}
            className="zy-sform"
            method="get"
          >
            <input
              aria-label={p.searchPlaceholder}
              name="q"
              placeholder={p.searchPlaceholder}
              type="search"
            />
            <button aria-label="Buscar" type="submit">
              <SearchSvg />
            </button>
          </form>
          <div className="zy-div center">
            <h2>{p.latestTitle}</h2>
          </div>
          <div className="zy-grid zy-nf-grid">
            {zyPosts(ctx, "", 0, p.count).map(post => (
              <ZyCard ctx={ctx} key={post.id} post={post} variant="plain" />
            ))}
          </div>
          <a className="zy-btn" href={href(ctx, p.backUrl)}>
            {p.backLabel}
          </a>
        </div>
      </section>
    ),
    type: "zyNotFound",
  }
);

/* ───────────────────────── comunidade ───────────────────────── */

const benefit = z.object({ text: str(), title: str() });
const feature = z.object({ label: str() });
const otherCommunity = z.object({ image: str(), title: str(), url: str("#") });

const zyCommunity = defineBlock(
  z.object({
    banner: str(),
    benefits: z.array(benefit).default([]),
    benefitsTitle: str("Ao entrar, você terá acesso a:"),
    brand: str("Zyrion"),
    buttonLabel: str("Fazer parte"),
    buttonUrl: str("#"),
    currency: str("R$"),
    features: z.array(feature).default([]),
    intro: str(),
    joinTitle: str("Entre para a Comunidade"),
    others: z.array(otherCommunity).default([]),
    othersTitle: str("Outras Comunidades:"),
    period: str("/ Mês"),
    planName: str("Member"),
    price: str("2,00"),
    tallBanner: str(),
    title: str("Você não está apenas por dentro. Você faz parte."),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      {
        key: "intro",
        kind: "textarea",
        label: "Parágrafo de abertura (**negrito** permitido)",
      },
      { key: "benefitsTitle", kind: "text", label: "Título da lista" },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Rótulo em negrito" },
          { key: "text", kind: "text", label: "Descrição" },
        ],
        key: "benefits",
        kind: "list",
        label: "Benefícios",
      },
      { key: "joinTitle", kind: "text", label: "Título da tabela de preço" },
      { key: "brand", kind: "text", label: "Marca (cabeçalho da tabela)" },
      { key: "planName", kind: "text", label: "Nome do plano" },
      { key: "currency", kind: "text", label: "Moeda" },
      { key: "price", kind: "text", label: "Preço" },
      { key: "period", kind: "text", label: "Período" },
      {
        itemFields: [{ key: "label", kind: "text", label: "Recurso" }],
        key: "features",
        kind: "list",
        label: "Recursos do plano",
      },
      { key: "buttonLabel", kind: "text", label: "Botão — texto" },
      { key: "buttonUrl", kind: "url", label: "Botão — link de checkout" },
      {
        key: "banner",
        kind: "image",
        label: "Banner (só no celular, no topo)",
      },
      {
        key: "tallBanner",
        kind: "image",
        label: "Banner alto (coluna direita)",
      },
      {
        key: "othersTitle",
        kind: "text",
        label: "Título das outras comunidades",
      },
      {
        itemFields: [
          { key: "title", kind: "text", label: "Título" },
          { key: "url", kind: "url", label: "Link" },
          { key: "image", kind: "image", label: "Imagem" },
        ],
        key: "others",
        kind: "list",
        label: "Outras comunidades",
      },
    ],
    group: "content",
    label: "Página da Comunidade (Zyrion)",
    render: (p, ctx) => {
      const price = (
        <div className="zy-price">
          <div className="zy-price-head">
            {p.brand} {p.planName}
          </div>
          <div className="zy-price-val">
            <sup>{p.currency}</sup>
            <b>{p.price}</b>
            <span>{p.period}</span>
          </div>
          <ul>
            {p.features.map(f => (
              <li key={f.label}>{f.label}</li>
            ))}
          </ul>
          <a
            className="zy-btn"
            href={href(ctx, p.buttonUrl)}
            {...newTab(p.buttonUrl)}
          >
            {p.buttonLabel}
          </a>
        </div>
      );
      return (
        <section className="zy-comm" data-zy="community">
          {p.banner ? (
            <Img alt="" className="zy-comm-mobile" src={p.banner} />
          ) : null}
          <div className="zy-comm-row">
            <div className="zy-comm-l">
              <h2>{p.title}</h2>
              {p.intro ? <p>{p.intro}</p> : null}
              <h3>{p.benefitsTitle}</h3>
              <ol className="zy-comm-list">
                {p.benefits.map(b => (
                  <li key={b.title}>
                    <strong>{b.title}</strong> {b.text}
                  </li>
                ))}
              </ol>
              <h3 className="zy-comm-join">
                {`${p.joinTitle} ${p.brand}`.trim()}
              </h3>
              {price}
            </div>
            <div className="zy-comm-r">
              <Img alt="" src={p.tallBanner} />
            </div>
          </div>
          <div className="zy-price-t">
            <h3 className="zy-comm-join">
              {`${p.joinTitle} ${p.brand}`.trim()}
            </h3>
            {price}
          </div>
          {p.others.length ? (
            <div className="zy-comm-others">
              <h3>{p.othersTitle}</h3>
              <div>
                {p.others.map(o => (
                  <a
                    href={href(ctx, o.url)}
                    key={o.title + o.url}
                    {...newTab(o.url)}
                  >
                    <Img alt="" src={o.image} />
                    <span>{o.title}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      );
    },
    type: "zyCommunity",
  }
);

/* ───────────────────────── link da bio ───────────────────────── */

const bioLink = z.object({ label: str(), url: str("#") });
const bgItem = z.object({ src: str() });

/** Fade entre `n` imagens (5 s cada, 0,5 s de transição), em CSS puro: funciona sem JS. */
export const bioKeyframes = (n: number) => {
  const total = n * 5;
  const pct = (s: number) => ((s / total) * 100).toFixed(3);
  return `@keyframes zy-bio-${n}{0%{opacity:0}${pct(0.5)}%{opacity:1}${pct(5)}%{opacity:1}${pct(5.5)}%{opacity:0}100%{opacity:0}}`;
};

const zyLinkBio = defineBlock(
  z.object({
    background: z.array(bgItem).default([]),
    bio: str(),
    links: z.array(bioLink).default([]),
    name: str("Portal Zyrion"),
    profile: str(),
  }),
  {
    fields: [
      {
        itemFields: [{ key: "src", kind: "image", label: "Imagem" }],
        key: "background",
        kind: "list",
        label: "Fundo (slideshow em fade, 5 s por imagem)",
      },
      { key: "profile", kind: "image", label: "Foto de perfil" },
      { key: "name", kind: "text", label: "Nome" },
      { key: "bio", kind: "textarea", label: "Bio (uma linha por linha)" },
      {
        itemFields: [
          { key: "label", kind: "text", label: "Texto (pode ter emoji)" },
          { key: "url", kind: "url", label: "Link" },
        ],
        key: "links",
        kind: "list",
        label: "Botões",
      },
    ],
    group: "content",
    label: "Link da bio (Zyrion)",
    render: (p, ctx) => {
      const n = p.background.length;
      return (
        <section className="zy-bio" data-zy="linkBio">
          {n > 1 ? <style>{bioKeyframes(n)}</style> : null}
          <div aria-hidden="true" className="zy-bio-bg">
            {p.background.map((b, i) => (
              <span
                className={n > 1 ? "zy-bio-slide fade" : "zy-bio-slide"}
                key={b.src + i}
                style={{
                  animation:
                    n > 1
                      ? `zy-bio-${n} ${n * 5}s linear ${i * 5}s infinite`
                      : undefined,
                  backgroundImage: cssUrl(b.src),
                }}
              />
            ))}
          </div>
          <div className="zy-bio-card">
            <Img alt={p.name} className="zy-bio-pic" src={p.profile} />
            <h1>{p.name}</h1>
            <p>
              {p.bio.split("\n").map((l, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: linhas da bio sem id próprio
                <span key={i}>
                  {l}
                  <br />
                </span>
              ))}
            </p>
            {p.links.map(l => (
              <a
                className="zy-bio-btn"
                href={href(ctx, l.url)}
                key={l.label + l.url}
                {...newTab(l.url)}
              >
                {l.label}
              </a>
            ))}
          </div>
        </section>
      );
    },
    type: "zyLinkBio",
  }
);

export const zyrionPageBlocks: BlockDefinition[] = [
  zyArchiveHeader,
  zyArchive,
  zySearch,
  zyPostHead,
  zyShare,
  zyBrand,
  zyMore,
  zyNotFound,
  zyCommunity,
  zyLinkBio,
];
