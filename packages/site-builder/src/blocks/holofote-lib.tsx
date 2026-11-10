import type { CSSProperties } from "react";
import { z } from "zod";
import { AdBox } from "./ads.js";
import {
  categoryOf,
  href,
  Img,
  newTab,
  postPath,
  SocialIcon,
} from "./helpers.js";
import type { FieldDef, RenderContext } from "./types.js";
import { zyPosts } from "./zyrion-lib.js";

/** Peças comuns dos blocos do tema Holofote (`hf*`): datas, cartões, lista compacta, anúncios, ícones. */
export {
  flag,
  int,
  LINK_FIELDS,
  linkItem,
  linkList,
  str,
  YES_NO,
} from "./zyrion-lib.js";
export { zyPosts as hfPosts };

export type Post = ReturnType<typeof zyPosts>[number];

const SP = "America/Sao_Paulo";

/** "10/11/2026" — fuso de Brasília (o mesmo no servidor e no navegador). */
export const brDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: SP,
        year: "numeric",
      })
    : "";

export const brTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: SP,
      })
    : "";

/** "dd/mm/aaaa às hh:mm". */
export const brDateTime = (iso: string | null) =>
  iso ? `${brDate(iso)} às ${brTime(iso)}` : "";

/** Data relativa ("há 10 horas"): o HTML estático leva a data absoluta e o `fx-runtime` troca no navegador. */
export const Ago = ({ iso }: { iso: string | null }) => (
  <time className="hf-ago" data-hf-ago dateTime={iso ?? undefined}>
    {brDate(iso)}
  </time>
);

export const ShareBtn = ({ ctx, post }: { ctx: RenderContext; post: Post }) => (
  <button
    aria-label="Compartilhar"
    className="hf-share"
    data-hf-share
    data-title={post.title}
    data-url={href(ctx, postPath(post))}
    type="button"
  >
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  </button>
);

export const CatTag = ({ children }: { children: string }) => (
  <span className="hf-tag">{children}</span>
);

/** Cartão da grade "Últimas Notícias": borda inferior preta, imagem, data relativa + compartilhar e título. */
export function HfCard({
  ctx,
  hidden,
  post,
}: {
  ctx: RenderContext;
  hidden?: boolean;
  post: Post;
}) {
  const link = href(ctx, postPath(post));
  return (
    <article className="hf-card" hidden={hidden || undefined}>
      <a className="hf-card-img" href={link}>
        <Img alt="" src={post.coverImage} />
      </a>
      <div className="hf-card-meta">
        <Ago iso={post.publishedAt} />
        <ShareBtn ctx={ctx} post={post} />
      </div>
      <h3 className="hf-card-title">
        <a href={link}>{post.title}</a>
      </h3>
    </article>
  );
}

/** Item da lista compacta: miniatura 90px + data/compartilhar + título com borda direita preta. */
export function HfItem({
  ctx,
  post,
  search,
  share = true,
}: {
  ctx: RenderContext;
  post: Post;
  /** Resultado de busca: ganha os atributos que o filtro do site estático lê. */
  search?: boolean;
  share?: boolean;
}) {
  const link = href(ctx, postPath(post));
  const cat = categoryOf(ctx.site, post);
  return (
    <article
      className={search ? "hf-li sb-post-card" : "hf-li"}
      data-category={search ? (cat?.slug ?? "") : undefined}
      data-search={search ? `${post.title} ${post.excerpt}` : undefined}
    >
      <a className="hf-li-img" href={link}>
        <Img alt="" src={post.coverImage} />
      </a>
      <div className="hf-li-body">
        <div className="hf-card-meta">
          <Ago iso={post.publishedAt} />
          {share ? <ShareBtn ctx={ctx} post={post} /> : null}
        </div>
        <h4>
          <a href={link}>{post.title}</a>
        </h4>
      </div>
    </article>
  );
}

/** Anúncio no tamanho do original: `banner` 728×90, `square` 300×250, `side` 300×600 (tamanhos no CSS da variante). */
export function HfAd({
  ctx,
  label = "",
  size,
  sticky,
}: {
  ctx: RenderContext;
  label?: string;
  size: "banner" | "side" | "square";
  sticky?: boolean;
}) {
  return (
    <div className={sticky ? "hf-ad hf-ad-sticky" : "hf-ad"}>
      <AdBox
        ctx={ctx}
        items={[]}
        label={label}
        link=""
        seconds={6}
        size={size}
      />
    </div>
  );
}

/** Linhas "Texto | endereço" → links. */
export function parseLinks(text: string): { label: string; url: string }[] {
  return text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(l => {
      const [label, url] = l.split("|").map(s => s.trim());
      return { label: label ?? "", url: url || "#" };
    });
}

export const Socials = ({
  ctx,
  items,
}: {
  ctx: RenderContext;
  items: { label: string; url: string }[];
}) => (
  <div className="hf-social">
    {items.map(s => (
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
);

export const SOCIAL_FIELD: FieldDef = {
  itemFields: [
    {
      key: "label",
      kind: "text",
      label: "Rede (Facebook, X, Instagram, YouTube…)",
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
    strokeWidth="2.4"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

/** Autores fictícios do portal (um por post, pelo endereço — estável entre renders). */
export function pickAuthor(authors: string, slug: string): string {
  const list = authors
    .split("\n")
    .map(a => a.trim())
    .filter(Boolean);
  if (list.length === 0) return "Redação";
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length] as string;
}

export const styleVars = (v: Record<string, string | number>) =>
  v as unknown as CSSProperties;

export { z };
