import type { Category, Page, Post, Site } from "../model/index.js";

export type Route =
  | { kind: "category"; category: Category }
  | { kind: "notFound" }
  | { kind: "page"; page: Page }
  | { kind: "post"; post: Post };

/**
 * Resolve um caminho do site (`/`, `/blogs/`, `/category/ia/`, `/meu-post/`).
 * Mesma ordem do WordPress: categoria, página, post. A home é a página de slug "".
 * Fora do modo edição, rascunhos não existem.
 */
export function resolveRoute(
  site: Site,
  path: string,
  mode: "edit" | "view" = "view"
): Route {
  const clean = path.split(/[?#]/)[0]?.replace(/^\/+|\/+$/g, "") ?? "";
  const visible = (status: string) => mode === "edit" || status === "published";

  if (clean.startsWith("category/")) {
    const category = site.categories.find(
      c => c.slug === clean.slice("category/".length)
    );
    return category ? { category, kind: "category" } : { kind: "notFound" };
  }

  const page = site.pages.find(p => p.slug === clean && visible(p.status));
  if (page) return { kind: "page", page };

  const post = site.posts.find(p => p.slug === clean && visible(p.status));
  if (post) return { kind: "post", post };

  return { kind: "notFound" };
}

/** Slug livre? Páginas, posts e o prefixo `category` compartilham o mesmo espaço de URLs. */
export function isSlugTaken(
  site: Site,
  slug: string,
  ignoreId?: string
): boolean {
  if (slug === "category") return true;
  return (
    site.pages.some(p => p.slug === slug && p.id !== ignoreId) ||
    site.posts.some(p => p.slug === slug && p.id !== ignoreId)
  );
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
