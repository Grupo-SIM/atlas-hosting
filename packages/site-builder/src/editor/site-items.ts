import { categoryPath, postPath } from "../blocks/helpers.js";
import type { Category, Post, Site } from "../model/index.js";

/** Conteúdo do site (post ou categoria) que o item clicado no canvas mostra. */
export interface SiteItem {
  category?: Category;
  post?: Post;
}

const DATE =
  /\b(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b.*\b\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/;

/** Endereço sem barra final, `?` e `#` — para comparar `/post/` com `/post`. */
const clean = (href: string) =>
  href.split(/[?#]/)[0]?.replace(/\/+$/, "").toLowerCase() ?? "";

/**
 * Acha o post/categoria de um item de um bloco que lista conteúdo do site (cards, destaques, listas).
 * Esses textos e imagens não estão nas props do bloco: vêm do post, e o painel os edita direto.
 *
 * `href` é o link em que o clique caiu; `levels` são os endereços dos links de cada contêiner acima do
 * item, do mais próximo ao mais distante. Um contêiner que liga para mais de um post é uma lista inteira
 * (não o item), então a busca para nele.
 */
export function resolveSiteItem(
  site: Site,
  hint: { href?: string; levels?: string[][]; value?: string } | undefined,
  byValue = false,
  currentPost?: Post
): SiteItem {
  if (!hint) return {};
  const posts = new Map(site.posts.map(p => [clean(postPath(p)), p]));
  const cats = new Map(site.categories.map(c => [clean(categoryPath(c)), c]));
  const pick = (hrefs: string[]) => {
    const p = new Set<Post>();
    const c = new Set<Category>();
    for (const h of hrefs) {
      const key = clean(h);
      const post = posts.get(key);
      const cat = cats.get(key);
      if (post) p.add(post);
      if (cat) c.add(cat);
    }
    return { c: [...c], p: [...p] };
  };
  if (hint.href) {
    const own = pick([hint.href]);
    if (own.p[0]) return { post: own.p[0] };
    if (own.c[0]) return { category: own.c[0] };
  }
  for (const level of hint.levels ?? []) {
    const { c, p } = pick(level);
    if (p.length > 1 || c.length > 1) return {};
    if (p[0]) return { category: c[0], post: p[0] };
    if (c[0]) return { category: c[0] };
  }
  // Último recurso (sem link ao redor): o texto é o nome da categoria, o título (ou o começo dele, quando
  // o bloco corta com "…"), a capa ou a data do post aberto.
  const text = hint.value?.replace(/\s+/g, " ").trim().toLowerCase();
  if (byValue && text) {
    const cat = site.categories.filter(
      c => c.name.trim().toLowerCase() === text
    );
    if (cat.length === 1) return { category: cat[0] };
    const cut = text.replace(/[….]+$/, "").trim();
    const post = site.posts.filter(p => {
      const title = p.title.trim().toLowerCase();
      return (
        title === text ||
        (cut !== text && cut.length > 8 && title.startsWith(cut))
      );
    });
    if (post.length === 1) return { post: post[0] };
    // Imagem de capa do post aberto (o cabeçalho do post não tem link para ele mesmo).
    const base = (u: string) => u.split("?")[0]?.trim().toLowerCase() ?? "";
    if (currentPost?.coverImage && base(currentPost.coverImage) === base(text))
      return { post: currentPost };
    const cover = site.posts.filter(
      p => p.coverImage && base(p.coverImage) === base(text)
    );
    if (cover.length === 1) return { post: cover[0] };
    // Data do post aberto ("novembro 9, 2026", "9 de novembro de 2026"…).
    if (currentPost && DATE.test(text)) return { post: currentPost };
  }
  return {};
}
