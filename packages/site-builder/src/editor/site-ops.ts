import { createBlock, newBlockId } from "../blocks/registry.js";
import type { Page, Post, Site } from "../model/index.js";
import { isSlugTaken, slugify } from "../renderer/routes.js";

const clone = (site: Site): Site => structuredClone(site);

/** `meu-slug`, `meu-slug-2`… até achar um livre (páginas, posts e `category` dividem as URLs). */
export function uniqueSlug(
  site: Site,
  base: string,
  ignoreId?: string
): string {
  const root = slugify(base) || "nova-pagina";
  let slug = root;
  for (let n = 2; isSlugTaken(site, slug, ignoreId); n++) slug = `${root}-${n}`;
  return slug;
}

export function addPage(site: Site, title: string): { page: Page; site: Site } {
  const next = clone(site);
  const heading = createBlock("heading");
  heading.props = { ...heading.props, level: "h1", text: title };
  const page: Page = {
    blocks: [heading, createBlock("text")],
    id: `page-${newBlockId()}`,
    slug: uniqueSlug(next, title),
    status: "draft",
    title,
  };
  next.pages.push(page);
  return { page, site: next };
}

export function updatePage(site: Site, id: string, patch: Partial<Page>): Site {
  const next = clone(site);
  const page = next.pages.find(p => p.id === id);
  if (!page) return site;
  Object.assign(page, patch);
  if (patch.slug !== undefined && page.id !== "page-home") {
    page.slug = uniqueSlug(next, patch.slug || page.title, id);
  }
  return next;
}

export function removePage(site: Site, id: string): Site {
  const next = clone(site);
  const page = next.pages.find(p => p.id === id);
  // A home (slug vazio) não pode ser excluída.
  if (!page || page.slug === "") return site;
  next.pages = next.pages.filter(p => p.id !== id);
  next.menu = next.menu.filter(m => m.href !== `/${page.slug}/`);
  return next;
}

export function addPost(
  site: Site,
  title: string,
  categoryId: string | null
): { post: Post; site: Site } {
  const next = clone(site);
  const post: Post = {
    blocks: [createBlock("text")],
    categoryId,
    coverImage: null,
    excerpt: "",
    id: `post-${newBlockId()}`,
    publishedAt: new Date().toISOString().slice(0, 10),
    slug: uniqueSlug(next, title, undefined),
    status: "draft",
    title,
  };
  next.posts.push(post);
  return { post, site: next };
}

export function updatePost(site: Site, id: string, patch: Partial<Post>): Site {
  const next = clone(site);
  const post = next.posts.find(p => p.id === id);
  if (!post) return site;
  Object.assign(post, patch);
  if (patch.slug !== undefined) {
    post.slug = uniqueSlug(next, patch.slug || post.title, id);
  }
  return next;
}

export function removePost(site: Site, id: string): Site {
  const next = clone(site);
  next.posts = next.posts.filter(p => p.id !== id);
  return next;
}

export function addCategory(site: Site, name: string): Site {
  const next = clone(site);
  let slug = slugify(name) || "categoria";
  for (let n = 2; next.categories.some(c => c.slug === slug); n++) {
    slug = `${slugify(name) || "categoria"}-${n}`;
  }
  next.categories.push({ id: `cat-${newBlockId()}`, name, slug });
  return next;
}

export function renameCategory(site: Site, id: string, name: string): Site {
  const next = clone(site);
  const category = next.categories.find(c => c.id === id);
  if (category) category.name = name;
  return next;
}

export function removeCategory(site: Site, id: string): Site {
  const next = clone(site);
  next.categories = next.categories.filter(c => c.id !== id);
  for (const post of next.posts) {
    if (post.categoryId === id) post.categoryId = null;
  }
  return next;
}

export function setMenu(site: Site, menu: Site["menu"]): Site {
  return { ...clone(site), menu };
}

export function setTheme(site: Site, patch: Record<string, string>): Site {
  const next = clone(site);
  next.theme = { ...next.theme, ...patch };
  return next;
}
