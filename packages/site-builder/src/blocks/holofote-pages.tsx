import { z } from "zod";
import { defineBlock } from "./define.js";
import {
  categoryOf,
  categoryPath,
  href,
  Img,
  Inline,
  newTab,
  postPath,
  SocialIcon,
} from "./helpers.js";
import {
  brDateTime,
  CatTag,
  flag,
  HfAd,
  HfItem,
  hfPosts,
  int,
  type Post,
  pickAuthor,
  SearchIcon,
  str,
  YES_NO,
} from "./holofote-lib.js";
import type { BlockDefinition } from "./types.js";

/** Blocos das páginas do tema Holofote: post, resultados de busca/tag, formulários, títulos de página e 404. */

const Wa = () => (
  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z" />
  </svg>
);

/** "Compartilhe:" com Facebook, X e WhatsApp: abre a rede direto (sem modal), com a URL da página (`nav-runtime`). */
const ShareRow = ({ label }: { label: string }) => (
  <div className="hf-shrow">
    {label ? <span>{label}</span> : null}
    <div>
      <button
        aria-label="Compartilhar no Facebook"
        data-share="facebook"
        type="button"
      >
        <SocialIcon label="facebook" />
      </button>
      <button aria-label="Compartilhar no X" data-share="twitter" type="button">
        <SocialIcon label="x" />
      </button>
      <button
        aria-label="Compartilhar no WhatsApp"
        data-share="whatsapp"
        type="button"
      >
        <Wa />
      </button>
    </div>
  </div>
);

/* ───────────────────────── cabeçalho do post ───────────────────────── */

const hfPostHead = defineBlock(
  z.object({
    authors: str("Redação Holofote\nLetícia Prado\nMarcelo Dantas"),
    shareLabel: str("Compartilhe:"),
    showImage: flag("yes"),
    showUpdated: flag("yes"),
  }),
  {
    fields: [
      {
        key: "authors",
        kind: "textarea",
        label: "Autores (um por linha; cada post usa um deles)",
      },
      { key: "shareLabel", kind: "text", label: 'Texto "Compartilhe:"' },
      {
        key: "showUpdated",
        kind: "select",
        label: 'Mostrar "Atualizado em"',
        options: YES_NO,
      },
      {
        key: "showImage",
        kind: "select",
        label: "Mostrar imagem destacada",
        options: YES_NO,
      },
    ],
    group: "blog",
    label: "Cabeçalho do post (Holofote)",
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      const cat = categoryOf(ctx.site, post);
      const updated = post.publishedAt
        ? new Date(
            new Date(post.publishedAt).getTime() + 35 * 60 * 1000
          ).toISOString()
        : null;
      return (
        <header className="hf-phead" data-hf="postHead">
          {cat ? (
            <a className="hf-pcat" href={href(ctx, categoryPath(cat))}>
              {cat.name}
            </a>
          ) : null}
          <h1>{post.title}</h1>
          <p className="hf-pline">{post.excerpt}</p>
          <div className="hf-pmeta">
            <div>
              <strong>{pickAuthor(p.authors, post.slug)}</strong>
              <span>- Publicado em {brDateTime(post.publishedAt)}</span>
              {p.showUpdated === "yes" ? (
                <span>Atualizado em {brDateTime(updated)}</span>
              ) : null}
            </div>
            <ShareRow label={p.shareLabel} />
          </div>
          {p.showImage === "yes" && post.coverImage ? (
            <Img alt="" className="hf-pimg" src={post.coverImage} />
          ) : null}
        </header>
      );
    },
    type: "hfPostHead",
  }
);

/** Frases do resumo: o resumo do post e a 1ª frase de cada um dos próximos parágrafos. */
function summaryPoints(post: Post): string[] {
  const first = (t: string) => t.split(/(?<=[.!?])\s/)[0] ?? t;
  const paras = post.blocks
    .map(b => (typeof b.props.text === "string" ? b.props.text : ""))
    .filter(Boolean);
  return [post.excerpt, ...paras.slice(1, 4).map(first)].filter(Boolean);
}

const hfResume = defineBlock(
  z.object({ label: str("Ler resumo"), open: flag("no") }),
  {
    fields: [
      { key: "label", kind: "text", label: "Texto do botão" },
      {
        key: "open",
        kind: "select",
        label: "Começa aberto",
        options: YES_NO,
      },
    ],
    group: "blog",
    label: '"Ler resumo" que expande (Holofote)',
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      return (
        <details
          className="hf-resume"
          data-hf="resume"
          open={p.open === "yes" || ctx.mode === "edit" || undefined}
        >
          <summary>{p.label}</summary>
          <ul>
            {summaryPoints(post).map(t => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </details>
      );
    },
    type: "hfResume",
  }
);

/* ───────────────────────── corpo da matéria + anúncios ───────────────────────── */

const hfPostBody = defineBlock(
  z.object({
    adEvery: int(0, 20, 3),
    firstAd: flag("yes"),
    inlineLabel: str("Continua depois da Publicidade"),
  }),
  {
    fields: [
      {
        key: "firstAd",
        kind: "select",
        label: "Anúncio 300×250 ao lado do 1º parágrafo",
        options: YES_NO,
      },
      {
        key: "adEvery",
        kind: "number",
        label: "Anúncio no meio a cada N parágrafos (0 = nenhum)",
      },
      {
        key: "inlineLabel",
        kind: "text",
        label: "Rótulo do anúncio no meio da matéria",
      },
    ],
    group: "blog",
    label: "Corpo da matéria com anúncios (Holofote)",
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      let paragraphs = 0;
      const out = post.blocks.flatMap((b, i) => {
        const text = typeof b.props.text === "string" ? b.props.text : "";
        if (b.type !== "text")
          return [<div key={b.id}>{ctx.renderBlocks([b])}</div>];
        paragraphs += 1;
        const items = [
          <p key={b.id}>
            <Inline text={text} />
          </p>,
        ];
        if (
          p.adEvery > 0 &&
          paragraphs % p.adEvery === 0 &&
          i < post.blocks.length - 1
        )
          items.push(
            <div className="hf-midad" key={`ad-${b.id}`}>
              <span>{p.inlineLabel}</span>
              <HfAd ctx={ctx} size="square" />
            </div>
          );
        return items;
      });
      return (
        <div className="hf-body" data-hf="postBody">
          {p.firstAd === "yes" ? (
            <div className="hf-body-ad">
              <HfAd ctx={ctx} size="square" />
            </div>
          ) : null}
          {out}
        </div>
      );
    },
    type: "hfPostBody",
  }
);

/* ───────────────────────── leia também, comunidade, tags, compartilhar ───────────────────────── */

const hfReadAlso = defineBlock(
  z.object({ count: int(1, 6, 2), title: str("LEIA TAMBÉM:") }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "count", kind: "number", label: "Quantidade de links" },
    ],
    group: "blog",
    label: '"Leia também" (Holofote)',
    render: (p, ctx) => {
      const post = ctx.current.post;
      if (!post) return null;
      const all = hfPosts(ctx, "", 0, 200).filter(x => x.id !== post.id);
      const same = all.filter(x => x.categoryId === post.categoryId);
      const list = [...same, ...all.filter(x => !same.includes(x))].slice(
        0,
        p.count
      );
      return (
        <aside className="hf-also" data-hf="readAlso">
          <strong>{p.title}</strong>
          <ul>
            {list.map(x => (
              <li key={x.id}>
                <a href={href(ctx, postPath(x))}>{x.title}</a>
              </li>
            ))}
          </ul>
        </aside>
      );
    },
    type: "hfReadAlso",
  }
);

const hfFollow = defineBlock(
  z.object({
    text: str("Siga o Holofote e acompanhe nossas notícias"),
    url: str("#"),
  }),
  {
    fields: [
      { key: "text", kind: "text", label: "Texto" },
      { key: "url", kind: "url", label: "Link" },
    ],
    group: "blog",
    label: "Caixa de comunidade (Holofote)",
    render: (p, ctx) => (
      <a
        className="hf-follow"
        data-hf="follow"
        href={href(ctx, p.url)}
        {...newTab(p.url)}
      >
        {p.text}
      </a>
    ),
    type: "hfFollow",
  }
);

/** Tags da matéria: a categoria e até 3 palavras longas do título; cada uma abre a página de tag (`/tag/?q=`). */
function postTags(ctx: Parameters<typeof categoryOf>[0], post: Post): string[] {
  const cat = categoryOf(ctx, post);
  const words = [
    ...new Set(
      post.title
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(w => w.length >= 6)
    ),
  ].slice(0, 3);
  return [...(cat ? [cat.name] : []), ...words];
}

const hfTags = defineBlock(z.object({ label: str("Tags:") }), {
  fields: [{ key: "label", kind: "text", label: "Rótulo" }],
  group: "blog",
  label: "Tags da matéria (Holofote)",
  render: (p, ctx) => {
    const post = ctx.current.post;
    if (!post) return null;
    return (
      <div className="hf-tags" data-hf="tags">
        <span>{p.label}</span>
        {postTags(ctx.site, post).map(t => (
          <a href={`${href(ctx, "/tag/")}?q=${encodeURIComponent(t)}`} key={t}>
            {t}
          </a>
        ))}
      </div>
    );
  },
  type: "hfTags",
});

const hfShare = defineBlock(z.object({ label: str("Compartilhe:") }), {
  fields: [{ key: "label", kind: "text", label: "Texto" }],
  group: "blog",
  label: "Compartilhe (Holofote)",
  render: (p, ctx) =>
    ctx.current.post ? (
      <div data-hf="share">
        <ShareRow label={p.label} />
      </div>
    ) : null,
  type: "hfShare",
});

/* ───────────────────────── barra lateral do post ───────────────────────── */

const hfSidebar = defineBlock(
  z.object({
    count: int(1, 12, 6),
    sticky: flag("yes"),
    title: str("Últimas Notícias"),
    topAds: int(0, 4, 3),
  }),
  {
    fields: [
      {
        key: "topAds",
        kind: "number",
        label: "Anúncios 300×250 no topo (0 a 4)",
      },
      { key: "title", kind: "text", label: "Título da lista" },
      { key: "count", kind: "number", label: "Quantidade de notícias" },
      {
        key: "sticky",
        kind: "select",
        label: "Anúncio 300×600 fixo ao rolar",
        options: YES_NO,
      },
    ],
    group: "blog",
    label: "Barra lateral do post (Holofote)",
    render: (p, ctx) => {
      const cur = ctx.current.post?.id;
      const list = hfPosts(ctx, "", 0, p.count + 1)
        .filter(x => x.id !== cur)
        .slice(0, p.count);
      return (
        <aside className="hf-side" data-hf="sidebar">
          {["a", "b", "c", "d"].slice(0, p.topAds).map(k => (
            <HfAd ctx={ctx} key={k} size="square" />
          ))}
          <h2 className="hf-side-title">{p.title}</h2>
          <div className="hf-list">
            {list.map(post => (
              <HfItem ctx={ctx} key={post.id} post={post} share={false} />
            ))}
          </div>
          {p.sticky === "yes" ? <HfAd ctx={ctx} size="side" sticky /> : null}
        </aside>
      );
    },
    type: "hfSidebar",
  }
);

/* ───────────────────────── resultados (tag e busca) ───────────────────────── */

const hfResultsHead = defineBlock(
  z.object({
    mode: z.enum(["search", "tag"]).default("search").catch("search"),
  }),
  {
    fields: [
      {
        key: "mode",
        kind: "select",
        label: "Título",
        options: [
          { label: "Resultados para: {termo da busca}", value: "search" },
          { label: "Resultados para Tag: {tag}", value: "tag" },
        ],
      },
    ],
    group: "blog",
    label: "Título dos resultados (Holofote)",
    render: (p, ctx) => (
      <h1 className="hf-rhead" data-hf="resultsHead">
        <span>
          {p.mode === "tag" ? "Resultados para Tag:" : "Resultados para:"}
        </span>{" "}
        <b data-hf-q>{ctx.query.q ?? ""}</b>
      </h1>
    ),
    type: "hfResultsHead",
  }
);

/* ───────────────────────── formulários (sem backend) ───────────────────────── */

const hfNewsletter = defineBlock(
  z.object({
    actionUrl: str(),
    button: str("Cadastrar"),
    placeholder: str("Seu e-mail"),
    text: str(
      "Gosta das nossas notícias? Deixe seu e-mail e receba os destaques do dia na sua caixa de entrada."
    ),
    title: str("Newsletter Holofote"),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "text", kind: "textarea", label: "Texto" },
      { key: "placeholder", kind: "text", label: "Texto do campo" },
      { key: "button", kind: "text", label: "Texto do botão" },
      {
        key: "actionUrl",
        kind: "url",
        label:
          "URL que recebe o e-mail (da sua ferramenta de e-mail marketing; vazio = formulário desligado)",
      },
    ],
    group: "content",
    label: "Newsletter (Holofote)",
    render: (p, ctx) => (
      <section className="hf-news" data-hf="newsletter">
        <h3>
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
          {p.title}
        </h3>
        <p>{p.text}</p>
        <form
          action={p.actionUrl ? href(ctx, p.actionUrl) : undefined}
          method="post"
        >
          <input
            aria-label={p.placeholder}
            disabled={!p.actionUrl}
            name="email"
            placeholder={p.placeholder}
            required
            type="email"
          />
          <button disabled={!p.actionUrl} type="submit">
            {p.button}
          </button>
        </form>
        {!p.actionUrl && ctx.mode === "edit" ? (
          <small className="hf-note">
            Formulário desligado: informe a URL de envio no painel do bloco.
          </small>
        ) : null}
      </section>
    ),
    type: "hfNewsletter",
  }
);

const hfPageTitle = defineBlock(z.object({ text: str("Sobre") }), {
  fields: [{ key: "text", kind: "text", label: "Título" }],
  group: "content",
  label: "Título de página com linha (Holofote)",
  render: p => (
    <div className="hf-ptitle" data-hf="pageTitle">
      <h1>{p.text}</h1>
      <hr />
    </div>
  ),
  type: "hfPageTitle",
});

const hfContactForm = defineBlock(
  z.object({
    actionUrl: str(),
    email: str(),
    fallback: str("Caso não consiga usar o formulário, envie sua pauta para:"),
    intro: str(
      "Quer falar com a gente? Tem uma pauta, ideia ou novidade? Preencha o formulário abaixo."
    ),
  }),
  {
    fields: [
      { key: "intro", kind: "textarea", label: "Texto de abertura" },
      {
        key: "actionUrl",
        kind: "url",
        label:
          "URL que recebe o formulário (vazio = formulário desligado, só o e-mail funciona)",
      },
      { key: "fallback", kind: "text", label: "Aviso abaixo do botão" },
      { key: "email", kind: "text", label: "E-mail de contato" },
    ],
    group: "content",
    label: "Formulário de contato (Holofote)",
    render: (p, ctx) => (
      <div className="hf-contact" data-hf="contact">
        <p>{p.intro}</p>
        <form
          action={p.actionUrl ? href(ctx, p.actionUrl) : undefined}
          method="post"
        >
          <div className="hf-crow">
            <input
              aria-label="Nome completo"
              disabled={!p.actionUrl}
              name="nome"
              placeholder="Nome Completo"
              required
              type="text"
            />
            <input
              aria-label="E-mail"
              disabled={!p.actionUrl}
              name="email"
              placeholder="E-mail"
              required
              type="email"
            />
          </div>
          <textarea
            aria-label="Mensagem"
            disabled={!p.actionUrl}
            name="mensagem"
            placeholder="Mensagem"
            required
            rows={7}
          />
          <button disabled={!p.actionUrl} type="submit">
            Enviar
          </button>
        </form>
        {!p.actionUrl && ctx.mode === "edit" ? (
          <small className="hf-note">
            Formulário desligado: informe a URL de envio no painel do bloco.
          </small>
        ) : null}
        <p className="hf-cfall">
          {p.fallback} <a href={`mailto:${p.email}`}>{p.email}</a>
        </p>
      </div>
    ),
    type: "hfContactForm",
  }
);

/* ───────────────────────── 404 ───────────────────────── */

const hfNotFound = defineBlock(
  z.object({
    backLabel: str("Voltar para a home"),
    backUrl: str("/"),
    code: str("404"),
    line1: str("Esta página não está disponível."),
    line2: str("Confira sua conexão com a internet e tente novamente."),
    title: str("Ops..."),
  }),
  {
    fields: [
      { key: "title", kind: "text", label: "Título" },
      { key: "line1", kind: "text", label: "Linha 1" },
      { key: "line2", kind: "text", label: "Linha 2" },
      { key: "code", kind: "text", label: "Número grande" },
      {
        key: "backLabel",
        kind: "text",
        label: "Botão — texto (vazio = sem botão)",
      },
      { key: "backUrl", kind: "url", label: "Botão — link" },
    ],
    group: "content",
    label: "Página não encontrada (Holofote)",
    render: (p, ctx) => (
      <section className="hf-nf" data-hf="notFound">
        <div className="hf-nf-text">
          <h1>{p.title}</h1>
          <p>{p.line1}</p>
          <p>{p.line2}</p>
          {p.backLabel ? (
            <a className="hf-btn" href={href(ctx, p.backUrl)}>
              {p.backLabel}
            </a>
          ) : null}
        </div>
        <div aria-hidden="true" className="hf-nf-code">
          {p.code}
        </div>
      </section>
    ),
    type: "hfNotFound",
  }
);

export const holofotePageBlocks: BlockDefinition[] = [
  hfPostHead,
  hfResume,
  hfPostBody,
  hfReadAlso,
  hfFollow,
  hfTags,
  hfShare,
  hfSidebar,
  hfResultsHead,
  hfNewsletter,
  hfPageTitle,
  hfContactForm,
  hfNotFound,
];

export { CatTag, SearchIcon };
