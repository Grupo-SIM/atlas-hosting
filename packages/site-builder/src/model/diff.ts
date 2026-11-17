import { getBlockDefinition } from "../blocks/registry.js";
import type { Block, Site } from "./index.js";

export interface SiteChange {
  /** Onde: "Site", "Tema", "Menu", "Cabeçalho", "Rodapé", "Página: Início", "Post: …", "Categorias"… */
  area: string;
  /** O que mudou, em português. */
  text: string;
  type: "added" | "changed" | "removed";
}

const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);

const labelOf = (block: Block) =>
  getBlockDefinition(block.type)?.label ?? block.type;

/** Campos de texto curtos do bloco, para dizer "o título foi de X para Y" em vez de só "mudou". */
const preview = (value: unknown): string => {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
};

function propChanges(before: Block, after: Block): string[] {
  const out: string[] = [];
  const keys = new Set([
    ...Object.keys(before.props),
    ...Object.keys(after.props),
  ]);
  for (const key of [...keys].sort()) {
    if (same(before.props[key], after.props[key])) continue;
    const a = before.props[key];
    const b = after.props[key];
    if (typeof a === "string" && typeof b === "string") {
      out.push(`${key}: "${preview(a)}" → "${preview(b)}"`);
    } else if (Array.isArray(a) && Array.isArray(b)) {
      out.push(`${key}: ${a.length} → ${b.length} itens`);
    } else {
      out.push(`${key} alterado`);
    }
  }
  if (!same(before.style, after.style)) out.push("estilo alterado");
  if (!same(before.elStyles, after.elStyles)) out.push("estilo dos elementos");
  if (!same(before.fx, after.fx)) out.push("efeitos");
  if (Boolean(before.hidden) !== Boolean(after.hidden)) {
    out.push(after.hidden ? "ocultado" : "voltou a aparecer");
  }
  return out;
}

/** Compara listas de blocos por id (inclui os filhos). */
function diffBlocks(
  area: string,
  before: Block[],
  after: Block[],
  out: SiteChange[]
) {
  const flat = (blocks: Block[], into: Map<string, Block>) => {
    for (const b of blocks) {
      into.set(b.id, b);
      if (b.children) flat(b.children, into);
    }
    return into;
  };
  const a = flat(before, new Map());
  const b = flat(after, new Map());
  for (const [id, block] of b) {
    const old = a.get(id);
    if (!old) {
      out.push({
        area,
        text: `Bloco "${labelOf(block)}" adicionado`,
        type: "added",
      });
      continue;
    }
    const details = propChanges(old, block);
    if (details.length > 0) {
      out.push({
        area,
        text: `Bloco "${labelOf(block)}": ${details.slice(0, 4).join("; ")}${
          details.length > 4 ? `; +${details.length - 4}` : ""
        }`,
        type: "changed",
      });
    }
  }
  for (const [id, block] of a) {
    if (!b.has(id)) {
      out.push({
        area,
        text: `Bloco "${labelOf(block)}" removido`,
        type: "removed",
      });
    }
  }
  // Mesma coleção, ordem diferente (só no nível de cima, sem blocos novos nem removidos).
  const idsA = before.map(x => x.id).filter(id => b.has(id));
  const idsB = after.map(x => x.id).filter(id => a.has(id));
  if (!same(idsA, idsB)) {
    out.push({ area, text: "Ordem dos blocos alterada", type: "changed" });
  }
}

/** O que mudou entre o site atual e o proposto, em linguagem de gente (para a revisão). */
export function diffSites(before: Site, after: Site): SiteChange[] {
  const out: SiteChange[] = [];

  if (before.name !== after.name) {
    out.push({
      area: "Site",
      text: `Nome: "${before.name}" → "${after.name}"`,
      type: "changed",
    });
  }

  const themeKeys = new Set([
    ...Object.keys(before.theme),
    ...Object.keys(after.theme),
  ]);
  const theme = [...themeKeys]
    .sort()
    .filter(k => before.theme[k] !== after.theme[k]);
  if (theme.length > 0) {
    out.push({
      area: "Tema",
      text: `${theme.length} ${theme.length === 1 ? "configuração alterada" : "configurações alteradas"} (${theme.slice(0, 6).join(", ")}${theme.length > 6 ? ", …" : ""})`,
      type: "changed",
    });
  }

  if (!same(before.menu, after.menu)) {
    out.push({
      area: "Menu",
      text: "Itens do menu alterados",
      type: "changed",
    });
  }

  diffBlocks("Cabeçalho", before.header, after.header, out);
  diffBlocks("Rodapé", before.footer, after.footer, out);
  diffBlocks("Layout dos posts", before.postLayout, after.postLayout, out);
  diffBlocks(
    "Layout das categorias",
    before.categoryLayout,
    after.categoryLayout,
    out
  );

  const pagesBefore = new Map(before.pages.map(p => [p.id, p]));
  const pagesAfter = new Map(after.pages.map(p => [p.id, p]));
  for (const [id, page] of pagesAfter) {
    const old = pagesBefore.get(id);
    const area = `Página: ${page.title}`;
    if (!old) {
      out.push({ area, text: "Página criada", type: "added" });
      continue;
    }
    if (old.title !== page.title) {
      out.push({
        area,
        text: `Título: "${old.title}" → "${page.title}"`,
        type: "changed",
      });
    }
    if (old.slug !== page.slug) {
      out.push({
        area,
        text: `Endereço: /${old.slug} → /${page.slug}`,
        type: "changed",
      });
    }
    if (old.status !== page.status) {
      out.push({
        area,
        text: page.status === "published" ? "Publicada" : "Voltou a rascunho",
        type: "changed",
      });
    }
    diffBlocks(area, old.blocks, page.blocks, out);
  }
  for (const [id, page] of pagesBefore) {
    if (!pagesAfter.has(id)) {
      out.push({
        area: `Página: ${page.title}`,
        text: "Página removida",
        type: "removed",
      });
    }
  }

  const postsBefore = new Map(before.posts.map(p => [p.id, p]));
  const postsAfter = new Map(after.posts.map(p => [p.id, p]));
  for (const [id, post] of postsAfter) {
    const old = postsBefore.get(id);
    const area = `Post: ${post.title}`;
    if (!old) {
      out.push({ area, text: "Post criado", type: "added" });
      continue;
    }
    const fields: string[] = [];
    if (old.title !== post.title)
      fields.push(`título "${old.title}" → "${post.title}"`);
    if (old.slug !== post.slug) fields.push("endereço");
    if (old.excerpt !== post.excerpt) fields.push("resumo");
    if (old.coverImage !== post.coverImage) fields.push("imagem de capa");
    if (old.categoryId !== post.categoryId) fields.push("categoria");
    if (old.status !== post.status)
      fields.push(
        post.status === "published" ? "publicado" : "voltou a rascunho"
      );
    if (fields.length > 0) {
      out.push({
        area,
        text: `Alterado: ${fields.join("; ")}`,
        type: "changed",
      });
    }
    diffBlocks(area, old.blocks, post.blocks, out);
  }
  for (const [id, post] of postsBefore) {
    if (!postsAfter.has(id)) {
      out.push({
        area: `Post: ${post.title}`,
        text: "Post removido",
        type: "removed",
      });
    }
  }

  const catsBefore = new Map(before.categories.map(c => [c.id, c]));
  const catsAfter = new Map(after.categories.map(c => [c.id, c]));
  for (const [id, c] of catsAfter) {
    const old = catsBefore.get(id);
    if (!old)
      out.push({
        area: "Categorias",
        text: `Categoria "${c.name}" criada`,
        type: "added",
      });
    else if (old.name !== c.name || old.slug !== c.slug) {
      out.push({
        area: "Categorias",
        text: `Categoria "${old.name}" → "${c.name}"`,
        type: "changed",
      });
    }
  }
  for (const [id, c] of catsBefore) {
    if (!catsAfter.has(id)) {
      out.push({
        area: "Categorias",
        text: `Categoria "${c.name}" removida`,
        type: "removed",
      });
    }
  }

  return out;
}
