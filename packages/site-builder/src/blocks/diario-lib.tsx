import type { CSSProperties } from "react";
import {
  categoryOf,
  formatDate,
  href,
  Img,
  newTab,
  postPath,
  SocialIcon,
} from "./helpers.js";
import type { FieldDef, RenderContext } from "./types.js";
import { zyPosts } from "./zyrion-lib.js";

/** Peças comuns dos blocos do tema Diário Aberto (`dd*`): cartões, compartilhar, tempo de leitura, ícones. */
export {
  flag,
  int,
  LINK_FIELDS,
  linkItem,
  linkList,
  str,
  YES_NO,
} from "./zyrion-lib.js";
export { zyPosts as ddPosts };

export type Post = ReturnType<typeof zyPosts>[number];

export const styleVars = (v: Record<string, string | number>) =>
  v as unknown as CSSProperties;

/** Junta classes sem depender de espaço em template literal (o Biome come o espaço inicial). */
export const cls = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/** Minutos de leitura, calculados do texto dos blocos do post (200 palavras por minuto). */
export function readMinutes(post: Post): number {
  const words = post.blocks
    .map(b => (typeof b.props.text === "string" ? b.props.text : ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const readLabel = (post: Post) => `${readMinutes(post)} min de leitura`;

/** Tags derivadas (o modelo não tem tags): a categoria e palavras longas do título. */
export function postTags(ctx: RenderContext, post: Post): string[] {
  const cat = categoryOf(ctx.site, post);
  const words = [
    ...new Set(
      post.title
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(w => w.length >= 6)
        .map(w => w.toLowerCase())
    ),
  ].slice(0, 3);
  return [...(cat ? [cat.name.toLowerCase()] : []), ...words];
}

export const DdSocials = ({
  ctx,
  items,
  withText,
}: {
  ctx: RenderContext;
  items: { label: string; url: string }[];
  withText?: boolean;
}) => (
  <div className={cls("dd-soc", withText && "dd-soc-text")}>
    {items.map(s => (
      <a
        aria-label={s.label}
        href={href(ctx, s.url)}
        key={s.label + s.url}
        {...newTab(s.url)}
      >
        {withText ? (
          s.label
        ) : s.label.trim().toLowerCase() === "linkedin" ? (
          <svg
            aria-hidden="true"
            fill="currentColor"
            height="16"
            viewBox="0 0 24 24"
            width="16"
          >
            <path d={NET_PATHS.linkedin} />
          </svg>
        ) : (
          <SocialIcon label={s.label} />
        )}
      </a>
    ))}
  </div>
);

export const SOCIAL_FIELD: FieldDef = {
  itemFields: [
    {
      key: "label",
      kind: "text",
      label: "Rede (Facebook, Instagram, X, LinkedIn, YouTube…)",
    },
    { key: "url", kind: "url", label: "Link" },
  ],
  key: "socials",
  kind: "list",
  label: "Redes sociais",
};

export const SearchIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

export const Chevron = () => (
  <svg
    aria-hidden="true"
    className="dd-chev"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2.4"
    viewBox="0 0 24 24"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const NET_PATHS = {
  facebook:
    "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07",
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  twitter:
    "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z",
  whatsapp:
    "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z",
};

const NET_NAMES: Record<keyof typeof NET_PATHS, string> = {
  facebook: "Facebook",
  linkedin: "LinkedIn",
  twitter: "X",
  whatsapp: "WhatsApp",
};

/**
 * Links de compartilhar (Facebook, LinkedIn, X, WhatsApp) de um post. O endereço absoluto só existe no navegador:
 * o `fx-runtime` troca o `href` de `[data-dd-net]` ao passar o mouse/focar; sem JS o link aponta para o próprio post.
 */
export function ShareNets({
  ctx,
  post,
  round,
}: {
  ctx: RenderContext;
  post: Post;
  /** Botões redondos coloridos (rodapé do post) em vez do balão escuro dos cartões. */
  round?: boolean;
}) {
  const url = href(ctx, postPath(post));
  return (
    <>
      {(Object.keys(NET_PATHS) as (keyof typeof NET_PATHS)[]).map(net => (
        <a
          aria-label={`Compartilhar no ${NET_NAMES[net]}`}
          className={round ? `dd-net dd-net-${net}` : undefined}
          data-dd-net={net}
          href={url}
          key={net}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d={NET_PATHS[net]} />
          </svg>
          <i className="dd-sr">{NET_NAMES[net]}</i>
        </a>
      ))}
    </>
  );
}

/** Rodapé do cartão claro: tempo de leitura à esquerda e "Compartilhar" (com balão no hover) à direita. */
export const ShareBar = ({
  ctx,
  label = "Compartilhar",
  post,
}: {
  ctx: RenderContext;
  label?: string;
  post: Post;
}) => (
  <div className="dd-cfoot">
    <span className="dd-read">{readLabel(post)}</span>
    <div
      className="dd-share"
      data-title={post.title}
      data-url={href(ctx, postPath(post))}
    >
      <button className="dd-share-label" type="button">
        {label}
      </button>
      <span className="dd-balloon">
        <ShareNets ctx={ctx} post={post} />
      </span>
    </div>
  </div>
);

const when = (post: Post) => formatDate(post.publishedAt);

/** Cartão claro da grade: imagem, "Categoria em data", título com primeira letra destacada e rodapé. */
export function DdLightCard({
  ctx,
  hidden,
  post,
}: {
  ctx: RenderContext;
  hidden?: boolean;
  post: Post;
}) {
  const link = href(ctx, postPath(post));
  const cat = categoryOf(ctx.site, post);
  return (
    <article
      className="dd-card dd-light sb-post-card"
      data-category={cat?.slug ?? ""}
      data-search={`${post.title} ${post.excerpt}`.slice(0, 4000)}
      data-sg-hide={hidden ? "" : undefined}
    >
      <a className="dd-cimg" href={link}>
        <Img alt="" src={post.coverImage} />
      </a>
      <p className="dd-cline">
        {cat ? (
          <a className="dd-cat" href={href(ctx, `/category/${cat.slug}/`)}>
            {cat.name}
          </a>
        ) : null}
        {cat ? <span> em </span> : null}
        <time dateTime={post.publishedAt ?? undefined}>{when(post)}</time>
      </p>
      <h3 className="dd-ctitle dd-fl">
        <a href={link}>{post.title}</a>
      </h3>
      <ShareBar ctx={ctx} post={post} />
    </article>
  );
}

/** Cartão sobre foto: véu, etiqueta da categoria, título e linha de data + tempo de leitura. */
export function DdPhotoCard({
  center,
  ctx,
  hidden,
  post,
  title = "h3",
}: {
  center?: boolean;
  ctx: RenderContext;
  hidden?: boolean;
  post: Post;
  title?: "h2" | "h3";
}) {
  const link = href(ctx, postPath(post));
  const cat = categoryOf(ctx.site, post);
  const Title = title;
  return (
    <article
      className={cls("dd-card dd-ov sb-post-card", center && "dd-ov-center")}
      data-category={cat?.slug ?? ""}
      data-search={`${post.title} ${post.excerpt}`.slice(0, 4000)}
      data-sg-hide={hidden ? "" : undefined}
    >
      <Img alt="" src={post.coverImage} />
      <span aria-hidden="true" className="dd-veil" />
      <div className="dd-ov-body">
        {cat ? <span className="dd-label">{cat.name}</span> : null}
        <Title className="dd-otitle">
          <a className="dd-ov-link" href={link}>
            <span>{post.title}</span>
          </a>
        </Title>
        <p className="dd-ometa">
          <time dateTime={post.publishedAt ?? undefined}>{when(post)}</time>
          <i aria-hidden="true">|</i>
          <span>{readLabel(post)}</span>
        </p>
      </div>
    </article>
  );
}

/** Texto do post em mini-markdown: `## subtítulo`, linhas `- item`, `> citação — autor`; o resto é parágrafo. */
export type PostPiece =
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "quote"; text: string; credit: string }
  | { kind: "p"; text: string };

export function parsePiece(text: string): PostPiece {
  const t = text.trim();
  if (t.startsWith("## ")) return { kind: "h", text: t.slice(3).trim() };
  const lines = t.split("\n").map(l => l.trim());
  if (lines.length > 0 && lines.every(l => l.startsWith("- ")))
    return { items: lines.map(l => l.slice(2).trim()), kind: "ul" };
  if (t.startsWith("> ")) {
    const body = t.slice(2).trim();
    const i = body.lastIndexOf(" — ");
    return i > 0
      ? {
          credit: body.slice(i + 3).trim(),
          kind: "quote",
          text: body.slice(0, i).trim(),
        }
      : { credit: "", kind: "quote", text: body };
  }
  return { kind: "p", text: t };
}
