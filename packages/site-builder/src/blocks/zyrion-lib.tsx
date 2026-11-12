import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import {
  categoryOf,
  categoryPath,
  href,
  Img,
  newTab,
  postPath,
  SocialIcon,
  visiblePosts,
  wpDate,
} from "./helpers.js";
import type { FieldDef, RenderContext } from "./types.js";

/** Peças compartilhadas pelos blocos do tema Zyrion (props, listas de posts, cartões, ícones). */
export const str = (d = "") => z.string().default(d);
export const int = (min: number, max: number, d: number) =>
  z.coerce.number().int().min(min).max(max).default(d).catch(d);
export const flag = (d: "yes" | "no") =>
  z.enum(["yes", "no"]).default(d).catch(d);

export const linkItem = z.object({ label: str(), url: str("#") });
export const linkList = z.array(linkItem).default([]);
export const LINK_FIELDS: FieldDef[] = [
  { key: "label", kind: "text", label: "Texto" },
  { key: "url", kind: "url", label: "Link" },
];

/** Posts publicados (mais novos primeiro), filtrados pela categoria (vazio = todas), com offset e limite. */
export function zyPosts(
  ctx: RenderContext,
  categorySlug: string,
  offset: number,
  limit: number,
  /** Seções curadas completam a lista voltando ao começo; arquivo, rodapé etc. mostram só o que existe. */
  wrap = false
) {
  const all = visiblePosts(ctx.site, ctx.mode);
  const cat = categorySlug
    ? ctx.site.categories.find(c => c.slug === categorySlug)
    : undefined;
  const list = categorySlug
    ? all.filter(p => (cat ? p.categoryId === cat.id : false))
    : all;
  if (wrap && list.length > 0)
    return Array.from(
      { length: Math.min(limit, list.length) },
      (_, i) => list[(offset + i) % list.length] as (typeof list)[number]
    );
  return list.slice(offset, offset + limit);
}

export const SearchIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </svg>
);

export const CalendarIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect height="16" rx="1" width="18" x="3" y="5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const Socials = ({
  ctx,
  items,
}: {
  ctx: RenderContext;
  items: z.infer<typeof linkItem>[];
}) => (
  <div className="zy-social">
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
  itemFields: LINK_FIELDS,
  key: "socials",
  kind: "list",
  label: "Redes sociais (Instagram, Facebook, X, Threads, TikTok, YouTube)",
};

export const YES_NO = [
  { label: "Sim", value: "yes" },
  { label: "Não", value: "no" },
];

/** Autor único do portal (como no original): nome e foto vêm do tema (`zyAuthor`, `zyAvatar`). */
export const zyAuthor = (ctx: RenderContext) =>
  ctx.site.theme.zyAuthor || "Redação";
export const zyAvatar = (ctx: RenderContext) => ctx.site.theme.zyAvatar || "";

const MONTHS3 = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
/** "24 out" — a caixa de data do slider. */
export function shortDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS3[d.getUTCMonth()]}`;
}

type Post = ReturnType<typeof visiblePosts>[number];

/** Cartão de notícia do Elementor: `large`, `small`, `plain` (só imagem/título/meta) e `archive`. */
export function ZyCard({
  ctx,
  hidden,
  post,
  readMore = "Ler mais »",
  variant,
}: {
  ctx: RenderContext;
  hidden?: boolean;
  post: Post;
  /** Texto do link "ler mais" dos cartões com resumo. */
  readMore?: string;
  variant: "archive" | "large" | "plain" | "small";
}) {
  const cat = categoryOf(ctx.site, post);
  const link = href(ctx, postPath(post));
  const full = variant === "large" || variant === "archive";
  const badge =
    variant !== "plain" && cat ? (
      <span className="zy-badge">{cat.name}</span>
    ) : null;
  const avatar = variant === "large" || variant === "small";
  const meta =
    variant !== "small" ? (
      <div className="zy-card-meta">
        {zyAuthor(ctx)} <i>|</i> {wpDate(post.publishedAt)}
      </div>
    ) : null;
  return (
    <article className={`zy-card v-${variant}`} hidden={hidden || undefined}>
      <a className="zy-card-img" href={link}>
        <Img alt="" src={post.coverImage} />
        {badge}
      </a>
      {avatar ? (
        <span className="zy-avatar">
          <Img alt="" src={zyAvatar(ctx)} />
        </span>
      ) : null}
      <div className="zy-card-text">
        {variant === "small" ? (
          <h5>
            <a href={link}>{post.title}</a>
          </h5>
        ) : (
          <h3>
            <a href={link}>{post.title}</a>
          </h3>
        )}
        {full ? <p>{post.excerpt}</p> : null}
        {full ? (
          <a className="zy-more-link" href={link}>
            {readMore}
          </a>
        ) : null}
      </div>
      {meta}
    </article>
  );
}

export type { CSSProperties, ReactNode };
export { categoryPath, href, Img, newTab, postPath, wpDate };

export interface ZyListOpts {
  cols: number;
  colsMobile: number;
  colsTablet: number;
  dark: "no" | "yes";
  gap: number;
  mediaGap: number;
  ratio: number;
  showAuthor: "no" | "yes";
  showDate: "no" | "yes";
  thumb: number;
  thumbMobile: number;
  thumbTablet: number;
}

/** Lista "miniatura à esquerda + título + meta" (hero, caixas por categoria, sidebar, rodapé). */
export function ZyList({
  ctx,
  opts: o,
  posts,
}: {
  ctx: RenderContext;
  opts: ZyListOpts;
  posts: Post[];
}) {
  return (
    <div
      className={o.dark === "yes" ? "zy-pl dark" : "zy-pl"}
      style={
        {
          "--zy-cols": o.cols,
          "--zy-cols-m": o.colsMobile,
          "--zy-cols-t": o.colsTablet,
          "--zy-gap": `${o.gap}px`,
          "--zy-mgap": `${o.mediaGap}px`,
          "--zy-ratio": o.ratio,
          "--zy-thumb": `${o.thumb}%`,
          "--zy-thumb-m": `${o.thumbMobile}%`,
          "--zy-thumb-t": `${o.thumbTablet}%`,
        } as CSSProperties
      }
    >
      {posts.map(post => (
        <article className="zy-pl-item" key={post.id}>
          <a href={href(ctx, postPath(post))}>
            <Img alt="" src={post.coverImage} />
          </a>
          <div>
            <h4>
              <a href={href(ctx, postPath(post))}>{post.title}</a>
            </h4>
            <div className="zy-pl-meta">
              {[
                o.showAuthor === "yes" ? zyAuthor(ctx) : "",
                o.showDate === "yes" ? wpDate(post.publishedAt) : "",
              ]
                .filter(Boolean)
                .join(" | ")}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export const LIST_DEFAULTS: ZyListOpts = {
  cols: 1,
  colsMobile: 1,
  colsTablet: 1,
  dark: "no",
  gap: 20,
  mediaGap: 12,
  ratio: 1,
  showAuthor: "yes",
  showDate: "yes",
  thumb: 24,
  thumbMobile: 32,
  thumbTablet: 28,
};
