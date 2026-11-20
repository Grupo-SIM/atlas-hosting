import { cleanFx } from "./fx.js";
import { BLOCK_ANCHOR } from "./index.js";
import { ELEMENT_PATH, isStyleEntry } from "./style.js";

/**
 * Conserta o que o editor mandou antes de validar o site. Um valor inválido num canto (um estilo com `;`, um número
 * que virou `NaN`, uma página sem título) fazia o servidor recusar o site inteiro, e a pessoa perdia tudo o que
 * tinha feito depois. Aqui o que não serve é descartado ou trocado por um valor seguro, e o resto é salvo.
 *
 * Só mexe no que a validação (`siteSchema`) recusaria; conteúdo válido passa igual. Devolve também a lista do que
 * foi consertado, em português, para o editor avisar.
 */
export function repairSite(input: unknown): {
  content: unknown;
  fixes: string[];
} {
  // Só conserta detalhes de um site que já tem a forma de site. Conteúdo sem as listas principais é recusado
  // como veio: inventar um site vazio no lugar sobrescreveria o site de verdade com nada.
  if (!(isObj(input) && SITE_LISTS.every(k => Array.isArray(input[k]))))
    return { content: input, fixes: [] };
  const site = structuredClone(input) as Record<string, unknown>;
  const fixes = new Map<string, number>();
  const note = (what: string) => fixes.set(what, (fixes.get(what) ?? 0) + 1);

  if (typeof site.name !== "string" || !site.name.trim()) {
    site.name = "Meu site";
    note("nome do site vazio");
  } else if (site.name.length > 120) {
    site.name = site.name.slice(0, 120);
    note("nome do site longo demais (cortado)");
  }

  if (isObj(site.theme)) {
    for (const [k, v] of Object.entries(site.theme)) {
      if (typeof v === "string") continue;
      if (typeof v === "number" && Number.isFinite(v))
        site.theme[k] = String(v);
      else delete site.theme[k];
      note("ajuste do tema inválido");
    }
  } else {
    site.theme = {};
  }

  for (const key of ["header", "footer", "postLayout", "categoryLayout"]) {
    site[key] = repairBlocks(site[key], note);
  }

  site.pages = list(site.pages).map(raw => {
    const page = isObj(raw) ? raw : {};
    if (typeof page.title !== "string" || !page.title.trim()) {
      page.title = "Sem título";
      note("página sem título");
    }
    page.slug = fixSlug(page.slug, false, note);
    page.status = fixStatus(page.status);
    page.blocks = repairBlocks(page.blocks, note);
    return page;
  });

  site.posts = list(site.posts).map(raw => {
    const post = isObj(raw) ? raw : {};
    if (typeof post.title !== "string" || !post.title.trim()) {
      post.title = "Sem título";
      note("post sem título");
    }
    post.slug = fixSlug(post.slug, true, note) || `post-${String(post.id)}`;
    post.status = fixStatus(post.status);
    if (typeof post.excerpt !== "string") post.excerpt = "";
    for (const k of ["categoryId", "coverImage", "publishedAt"])
      if (typeof post[k] !== "string") post[k] = null;
    post.blocks = repairBlocks(post.blocks, note);
    return post;
  });

  site.categories = list(site.categories).map(raw => {
    const cat = isObj(raw) ? raw : {};
    if (typeof cat.name !== "string" || !cat.name.trim()) {
      cat.name = "Sem nome";
      note("categoria sem nome");
    }
    cat.slug =
      fixSlug(cat.slug, true, note) ||
      `categoria-${String(cat.id).slice(0, 8)}`;
    return cat;
  });

  site.menu = list(site.menu).map(raw => {
    const item = isObj(raw) ? raw : {};
    item.href = typeof item.href === "string" ? item.href : "";
    item.label = typeof item.label === "string" ? item.label : "";
    if (item.children !== undefined)
      item.children = list(item.children).map(c => {
        const child = isObj(c) ? c : {};
        return {
          href: typeof child.href === "string" ? child.href : "",
          label: typeof child.label === "string" ? child.label : "",
        };
      });
    return item;
  });

  return {
    content: site,
    fixes: [...fixes].map(([what, n]) => (n > 1 ? `${what} (${n})` : what)),
  };
}

type Obj = Record<string, unknown>;

const SITE_LISTS = [
  "categories",
  "categoryLayout",
  "footer",
  "header",
  "menu",
  "pages",
  "postLayout",
  "posts",
] as const;
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

const SLUG = /^([a-z0-9-]+(\/[a-z0-9-]+)*)?$/;

function fixSlug(
  value: unknown,
  required: boolean,
  note: (what: string) => void
): string {
  const v = typeof value === "string" ? value : "";
  if (SLUG.test(v) && (v || !required)) return v;
  const fixed = v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "/")
    .split("/")
    .map(part => part.replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("/");
  note("endereço (slug) com caracteres inválidos");
  return fixed;
}

const fixStatus = (v: unknown) => (v === "published" ? "published" : "draft");

function cleanStyleMap(
  raw: unknown,
  note: (what: string) => void
): Obj | undefined {
  if (!isObj(raw)) return undefined;
  const out: Obj = {};
  for (const [k, v] of Object.entries(raw)) {
    if (isStyleEntry(k, v)) out[k] = v;
    else note("estilo inválido ignorado");
  }
  return Object.keys(out).length ? out : undefined;
}

function repairBlocks(raw: unknown, note: (what: string) => void): Obj[] {
  return list(raw)
    .filter(isObj)
    .map(block => {
      if (typeof block.id !== "string" || typeof block.type !== "string") {
        note("bloco inválido removido");
        return null;
      }
      if (!isObj(block.props)) block.props = {};
      if (
        block.anchor !== undefined &&
        !(typeof block.anchor === "string" && BLOCK_ANCHOR.test(block.anchor))
      ) {
        delete block.anchor;
        note("âncora inválida ignorada");
      }
      if (block.hidden !== undefined && typeof block.hidden !== "boolean")
        delete block.hidden;

      const style = cleanStyleMap(block.style, note);
      if (style) block.style = style;
      else delete block.style;

      if (isObj(block.elStyles)) {
        const all: Obj = {};
        for (const [path, value] of Object.entries(block.elStyles)) {
          if (!ELEMENT_PATH.test(path)) {
            note("estilo inválido ignorado");
            continue;
          }
          const clean = cleanStyleMap(value, note);
          if (clean) all[path] = clean;
        }
        if (Object.keys(all).length) block.elStyles = all;
        else delete block.elStyles;
      } else delete block.elStyles;

      if (isObj(block.fx)) {
        const all: Obj = {};
        for (const [path, value] of Object.entries(block.fx)) {
          const fx =
            path === "" || ELEMENT_PATH.test(path)
              ? cleanFx(value as never)
              : undefined;
          if (fx) all[path] = fx;
          else if (isObj(value) && Object.keys(value).length)
            note("efeito inválido ignorado");
        }
        if (Object.keys(all).length) block.fx = all;
        else delete block.fx;
      } else delete block.fx;

      if (block.children !== undefined)
        block.children = repairBlocks(block.children, note);
      return block;
    })
    .filter((b): b is Obj => b !== null);
}

/** Onde a validação recusou o site, em português (ex.: "página 3 → bloco 2 → estilo"). */
export function describeSiteIssue(path: (string | number)[]): string {
  const names: Record<string, string> = {
    blocks: "bloco",
    categories: "categoria",
    categoryLayout: "modelo das categorias",
    children: "bloco interno",
    elStyles: "estilo",
    footer: "rodapé",
    fx: "efeito",
    header: "cabeçalho",
    menu: "menu",
    name: "nome do site",
    pages: "página",
    postLayout: "modelo dos posts",
    posts: "post",
    props: "conteúdo",
    slug: "endereço",
    style: "estilo",
    theme: "tema",
    title: "título",
  };
  const parts: string[] = [];
  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (typeof seg === "number") continue;
    const name = names[seg];
    if (!name) continue;
    const next = path[i + 1];
    parts.push(typeof next === "number" ? `${name} ${next + 1}` : name);
  }
  return parts.join(" → ") || "conteúdo";
}
