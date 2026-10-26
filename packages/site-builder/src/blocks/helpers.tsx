import type { Category, Post, Site } from "../model/index.js";
import type { RenderContext } from "./types.js";

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i;

/** Bloqueia esquemas executáveis (`javascript:`, `data:`…) em links digitados pelo usuário. */
export const safeUrl = (url: string): string =>
  /^\s*(?:javascript|data|vbscript):/i.test(url) ? "#" : url;

/** URLs internas ganham o `basePath`; externas, âncoras e `mailto:` passam direto. */
export function href(ctx: RenderContext, url: string): string {
  if (!url || EXTERNAL.test(url)) return safeUrl(url) || "#";
  return `${ctx.basePath}${url.startsWith("/") ? url : `/${url}`}`;
}

export const postPath = (post: Post) => `/${post.slug}/`;
export const categoryPath = (category: Category) =>
  `/category/${category.slug}/`;

export function categoryOf(site: Site, post: Post): Category | undefined {
  return site.categories.find(c => c.id === post.categoryId);
}

/** No modo edição rascunhos aparecem; no site publicado, não. */
export function visiblePosts(site: Site, mode: "edit" | "view"): Post[] {
  return site.posts
    .filter(p => mode === "edit" || p.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
}

export function Img({
  alt = "",
  className,
  src,
}: {
  alt?: string;
  className?: string;
  src: string | null | undefined;
}) {
  if (!src) return <div className={`sb-img-empty ${className ?? ""}`} />;
  return <img alt={alt} className={className} loading="lazy" src={src} />;
}

export function LinkButton({
  ctx,
  label,
  url,
  variant = "primary",
}: {
  ctx: RenderContext;
  label: string;
  url: string;
  variant?: "primary" | "light";
}) {
  if (!label) return null;
  return (
    <a className={`sb-btn sb-btn-${variant}`} href={href(ctx, url)}>
      {label}
    </a>
  );
}

export function PostCard({ ctx, post }: { ctx: RenderContext; post: Post }) {
  const category = categoryOf(ctx.site, post);
  return (
    <article
      className="sb-card sb-post-card"
      data-category={category?.slug ?? ""}
      data-search={`${post.title} ${post.excerpt}`}
    >
      <a href={href(ctx, postPath(post))}>
        <Img alt={post.title} src={post.coverImage} />
      </a>
      <div className="sb-card-body">
        {category ? <span className="sb-tag">{category.name}</span> : null}
        <h3>
          <a href={href(ctx, postPath(post))}>{post.title}</a>
        </h3>
        <p>{post.excerpt}</p>
        <a className="sb-link" href={href(ctx, postPath(post))}>
          Ler mais »
        </a>
      </div>
    </article>
  );
}
