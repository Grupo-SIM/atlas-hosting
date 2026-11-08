import { hasAdSlot } from "../blocks/ads.js";
import { createBlock, newBlockId } from "../blocks/registry.js";
import type { Page, Post, Site } from "../model/index.js";
import { isSlugTaken, slugify } from "../renderer/routes.js";
import { withNewIds } from "./tree.js";

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

/**
 * Cópia do post logo depois do original: mesma data e status, então nas listas (ordenadas por data,
 * ordenação estável) ela aparece logo abaixo dele. Slug e ids dos blocos novos.
 */
export function duplicatePost(
  site: Site,
  id: string
): { post: Post; site: Site } | undefined {
  const index = site.posts.findIndex(p => p.id === id);
  const source = site.posts[index];
  if (!source) return undefined;
  const next = clone(site);
  const post: Post = {
    ...structuredClone(source),
    blocks: source.blocks.map(withNewIds),
    id: `post-${newBlockId()}`,
    slug: uniqueSlug(next, source.slug || source.title),
  };
  next.posts.splice(index + 1, 0, post);
  return { post, site: next };
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

/**
 * Garante um bloco "Anúncio" (faixa larga) no topo de cada página, nos posts e nas categorias,
 * para que ele apareça nas camadas e possa ser arrastado. Já existindo algum, não mexe.
 * Sem mudança, devolve o mesmo `site`.
 */
export function withAdBlocks(site: Site): Site {
  const next = clone(site);
  let changed = false;
  const lists = [
    next.postLayout,
    next.categoryLayout,
    ...next.pages.filter(p => p.slug !== "404" && !p.bare).map(p => p.blocks),
  ];
  for (const list of lists) {
    if (hasAdSlot(list)) continue;
    // Faixa colorida de seção (skinBar) tem que continuar sendo a primeira.
    const at = list[0]?.type === "skinBar" ? 1 : 0;
    list.splice(at, 0, createBlock("adSlot"));
    changed = true;
  }
  return changed ? next : site;
}
