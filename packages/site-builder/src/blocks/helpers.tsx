import type { ReactNode } from "react";
import type { Category, Post, Site } from "../model/index.js";
import type { RenderContext } from "./types.js";
import { parseMediaSource } from "./youtube.js";

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i;

/** Bloqueia esquemas executáveis (`javascript:`, `data:`…) em links digitados pelo usuário. */
export const safeUrl = (url: string): string =>
  /^\s*(?:javascript|data|vbscript):/i.test(url) ? "#" : url;

/** Link para outro site (http/https) abre em nova aba, sem dar acesso à página de origem. */
export const newTab = (url: string) =>
  /^https?:\/\//i.test(url.trim())
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};

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

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** Data no formato do WordPress em pt-BR ("outubro 28, 2025"). */
export function wpDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Resumo cortado como no plugin de posts do WordPress: até `max` caracteres do HTML (aspas
 * e travessões tipográficos contam como a entidade, `&#8220;` = 7, e o espaço fixo como `&nbsp;`),
 * sem cortar palavra, com "...".
 */
export function excerptCut(text: string, max = 200): string {
  const clean = text.trim();
  let size = 0;
  let end = 0;
  for (const ch of clean) {
    size += "“”‘’–—…".includes(ch) ? 7 : ch === " " ? 6 : ch.length;
    if (size > max) break;
    end += ch.length;
  }
  if (end >= clean.length) return clean;
  const cut = clean.slice(0, end);
  const space = clean[end] === " " ? cut.length : cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 0 ? space : cut.length).trimEnd()}...`;
}

const BRAND_PATHS: Record<string, string> = {
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  instagram:
    "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  threads:
    "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
};

/** Ícone da rede social pelo nome (Instagram, YouTube, X…); sem ícone conhecido, a inicial. */
export function SocialIcon({ label }: { label: string }) {
  const key = label.trim().toLowerCase();
  const brand = BRAND_PATHS[key];
  if (brand)
    return (
      <svg
        aria-hidden="true"
        fill="currentColor"
        height="16"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d={brand} />
      </svg>
    );
  if (key === "video")
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height="16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="16"
      >
        <rect height="12" rx="2" width="13" x="3" y="6" />
        <path d="m16 10 5-3v10l-5-3z" />
      </svg>
    );
  return <>{label.slice(0, 1).toUpperCase()}</>;
}

/** Texto com ***negrito itálico***, **negrito**, *itálico* e [link](url); o resto é texto puro (nunca HTML). */
export function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re =
    /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let key = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined)
      parts.push(
        <strong key={key++}>
          <em>{m[1]}</em>
        </strong>
      );
    else if (m[2] !== undefined)
      parts.push(<strong key={key++}>{m[2]}</strong>);
    else if (m[3] !== undefined) parts.push(<em key={key++}>{m[3]}</em>);
    else
      parts.push(
        <a
          className="sb-inline-link"
          href={safeUrl(m[5] ?? "#")}
          key={key++}
          rel="noopener"
        >
          {/* O texto do link pode ter negrito/itálico; link dentro de link não casa aqui. */}
          <Inline text={m[4] ?? ""} />
        </a>
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
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
  const media = parseMediaSource(src);
  if (media?.kind === "file")
    return (
      <video
        autoPlay
        className={className}
        loop
        muted
        playsInline
        preload="metadata"
        src={media.src}
      />
    );
  if (media?.kind === "embed")
    return (
      <iframe
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={`sb-media-embed ${className ?? ""}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={media.src}
        style={{ aspectRatio: media.ratio }}
        title={alt || media.title}
      />
    );
  return <img alt={alt} className={className} loading="lazy" src={src} />;
}

export function LinkButton({
  ctx,
  label,
  url,
  size,
  variant = "primary",
}: {
  ctx: RenderContext;
  label: string;
  size?: "lg";
  url: string;
  variant?: "light" | "primary" | "wide";
}) {
  if (!label) return null;
  return (
    <a
      className={["sb-btn", `sb-btn-${variant}`, size ? `sb-btn-${size}` : ""]
        .filter(Boolean)
        .join(" ")}
      href={href(ctx, url)}
    >
      {label}
    </a>
  );
}

/** Texto pesquisável do post: título, resumo e o texto do corpo. */
function searchText(post: Post): string {
  const body = post.blocks
    .map(b => (typeof b.props.text === "string" ? b.props.text : ""))
    .join(" ");
  return `${post.title} ${post.excerpt} ${body}`
    .replace(/[*[\]()]/g, " ")
    .slice(0, 20000);
}

const FOLDER_ICON = (
  <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 5a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.5.7L12 5h7a2 2 0 0 1 2 2v1H3zm0 5h18.5l-1.7 8.2A2 2 0 0 1 17.9 20H5a2 2 0 0 1-2-2z" />
  </svg>
);

export function PostCard({
  compact,
  ctx,
  moreLabel = "",
  post,
  variant,
}: {
  compact?: boolean;
  ctx: RenderContext;
  /** Só `product`: texto do link abaixo do título (vazio = sem link). */
  moreLabel?: string;
  post: Post;
  /** `grid` e `archive` são os cards do tema Central, `product` o do Marketplace; sem `variant` vale `compact`. */
  variant?: "archive" | "grid" | "product";
}) {
  const category = categoryOf(ctx.site, post);
  if (variant === "product") {
    const url = href(ctx, postPath(post));
    return (
      <article
        className="sb-card sb-post-card product"
        data-category={category?.slug ?? ""}
        data-search={searchText(post)}
      >
        <a className="sb-post-thumb" href={url}>
          <Img alt={post.title} src={post.coverImage} />
        </a>
        <h3>
          <a href={url}>{post.title}</a>
        </h3>
        {moreLabel ? (
          <a className="sb-link" href={url}>
            {moreLabel}
          </a>
        ) : null}
      </article>
    );
  }
  if (variant) {
    const url = href(ctx, postPath(post));
    return (
      <article
        className={`sb-card sb-post-card ${variant}`}
        data-category={category?.slug ?? ""}
        data-search={searchText(post)}
      >
        <a className="sb-post-thumb" href={url}>
          <Img alt={post.title} src={post.coverImage} />
          {variant === "archive" && category ? (
            <span className="sb-tag">{category.name}</span>
          ) : null}
        </a>
        <div className="sb-card-body">
          <h3>
            <a href={url}>{post.title}</a>
          </h3>
          {variant === "grid" && category ? (
            <p className="sb-ct-cat">
              {FOLDER_ICON}
              <a href={href(ctx, categoryPath(category))}>{category.name}</a>
            </p>
          ) : null}
          <p className="ex">{excerptCut(post.excerpt, 200)}</p>
          {variant === "archive" ? (
            <a className="sb-link" href={url}>
              Leia mais »
            </a>
          ) : null}
        </div>
      </article>
    );
  }
  return (
    <article
      className={
        compact ? "sb-card sb-post-card compact" : "sb-card sb-post-card"
      }
      data-category={category?.slug ?? ""}
      data-search={searchText(post)}
    >
      <a className="sb-post-thumb" href={href(ctx, postPath(post))}>
        <Img alt={post.title} src={post.coverImage} />
        {compact && category ? (
          <span className="sb-tag">{category.name}</span>
        ) : null}
      </a>
      <div className="sb-card-body">
        {!compact && category ? (
          <span className="sb-tag">{category.name}</span>
        ) : null}
        <h3>
          <a href={href(ctx, postPath(post))}>{post.title}</a>
        </h3>
        {compact ? null : <p>{post.excerpt}</p>}
        <a className="sb-link" href={href(ctx, postPath(post))}>
          {compact ? "LER MAIS »" : "Ler mais »"}
        </a>
      </div>
    </article>
  );
}

/** Card de "posts relacionados": imagem, título, começo do resumo e botão. */
export function ExcerptCard({
  buttonLabel,
  ctx,
  post,
}: {
  buttonLabel: string;
  ctx: RenderContext;
  post: Post;
}) {
  const category = categoryOf(ctx.site, post);
  const url = href(ctx, postPath(post));
  return (
    <article
      className="sb-post-card sb-excerpt-card"
      data-category={category?.slug ?? ""}
      data-search={searchText(post)}
    >
      <a className="sb-post-thumb" href={url}>
        <Img alt={post.title} src={post.coverImage} />
      </a>
      <h3>
        <a href={url}>{post.title}</a>
      </h3>
      <p>{excerptCut(post.excerpt)}</p>
      {buttonLabel ? (
        <a className="sb-excerpt-btn" href={url}>
          {buttonLabel}
        </a>
      ) : null}
    </article>
  );
}
