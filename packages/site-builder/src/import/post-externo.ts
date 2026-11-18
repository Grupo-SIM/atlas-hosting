import { createBlock, newBlockId } from "../blocks/registry.js";
import { uniqueSlug } from "../editor/site-ops.js";
import type { Block, Post, Site } from "../model/index.js";
import { slugify } from "../renderer/routes.js";

/**
 * Post que chega de fora do editor (hoje: a Produção de Conteúdo / PDC).
 * O corpo vem em Markdown simples: `##`/`###`, parágrafos, listas `- `, citação `> ` e `![alt](url)`.
 */
export interface PostExterno {
  /** Nome da categoria; criada se o site ainda não tiver uma com esse nome ou slug. */
  categoria?: string | null;
  capa?: string | null;
  corpoMd: string;
  /** Id estável no sistema de origem: reenviar o mesmo id atualiza o post em vez de duplicar. */
  origemId: string;
  resumo?: string;
  slug?: string;
  titulo: string;
}

/** Prefixo dos ids dos posts que vieram do PDC (`pdc-<id>`). */
export const PDC_POST_PREFIX = "pdc-";

export const pdcPostId = (origemId: string): string =>
  `${PDC_POST_PREFIX}${slugify(origemId) || "post"}`;

type Peca =
  | { kind: "h"; level: 2 | 3; text: string }
  | { kind: "img"; alt: string; src: string }
  | { kind: "p"; text: string };

const IMG_RE = /^!\[([^\]]*)\]\((\S+?)(?:\s+"[^"]*")?\)$/;

/** Quebra o Markdown em títulos, imagens e blocos de texto (parágrafo, lista ou citação). */
export function pecasDoMarkdown(md: string): Peca[] {
  const out: Peca[] = [];
  const linhas = md.replace(/\r\n?/g, "\n").split("\n");
  let buf: string[] = [];
  const fecha = () => {
    const text = buf.join("\n").trim();
    if (text) out.push({ kind: "p", text });
    buf = [];
  };
  for (const raw of linhas) {
    const linha = raw.trim();
    if (!linha) {
      fecha();
      continue;
    }
    const h = /^(#{1,6})\s+(.+)$/.exec(linha);
    if (h) {
      fecha();
      const n = (h[1] ?? "").length;
      out.push({
        kind: "h",
        level: n >= 3 ? 3 : 2,
        text: (h[2] ?? "").replace(/\s+#+$/, "").trim(),
      });
      continue;
    }
    const img = IMG_RE.exec(linha);
    if (img) {
      fecha();
      out.push({ alt: img[1] ?? "", kind: "img", src: img[2] ?? "" });
      continue;
    }
    // Lista e parágrafo não se misturam no mesmo bloco: o corpo do Diário só lê lista "pura".
    const ehItem = /^[-*]\s+/.test(linha);
    const bufEhLista = buf.length > 0 && /^- /.test(buf[0] ?? "");
    if (buf.length > 0 && ehItem !== bufEhLista) fecha();
    buf.push(ehItem ? `- ${linha.replace(/^[-*]\s+/, "")}` : linha);
  }
  fecha();
  return out;
}

const temBloco = (blocks: Block[], type: string): boolean =>
  blocks.some(
    b => b.type === type || (b.children ? temBloco(b.children, type) : false)
  );

/** Converte o Markdown nos blocos do corpo, no formato que o layout de post do site lê. */
export function blocosDoMarkdown(site: Site, md: string): Block[] {
  // O "Corpo do post (Diário)" lê subtítulo como texto "## …" e ignora o bloco de título.
  const subtituloComoTexto = temBloco(site.postLayout, "ddPostBody");
  return pecasDoMarkdown(md).map(p => {
    if (p.kind === "img") {
      const b = createBlock("image");
      b.props = { ...b.props, alt: p.alt, src: p.src };
      return b;
    }
    if (p.kind === "h") {
      if (subtituloComoTexto) {
        const b = createBlock("text");
        b.props = { ...b.props, text: `## ${p.text}` };
        return b;
      }
      const b = createBlock("heading");
      b.props = { ...b.props, level: `h${p.level}`, text: p.text };
      return b;
    }
    const b = createBlock("text");
    b.props = { ...b.props, text: p.text };
    return b;
  });
}

function categoriaId(
  site: Site,
  nome: string | null | undefined
): string | null {
  const n = nome?.trim();
  if (!n) return null;
  const slug = slugify(n);
  const achada = site.categories.find(
    c =>
      c.name.trim().toLowerCase() === n.toLowerCase() ||
      (slug && c.slug === slug)
  );
  if (achada) return achada.id;
  let livre = slug || "categoria";
  for (let i = 2; site.categories.some(c => c.slug === livre); i++)
    livre = `${slug || "categoria"}-${i}`;
  const id = `cat-${newBlockId()}`;
  site.categories.push({ id, name: n.slice(0, 80), slug: livre });
  return id;
}

/**
 * Cria (ou atualiza, se o mesmo `origemId` já entrou antes) um post publicado.
 * Função pura: devolve uma cópia do site; quem chama valida com `siteSchema` e grava.
 */
export function inserirPostExterno(
  site: Site,
  input: PostExterno,
  agora: Date = new Date()
): { atualizado: boolean; post: Post; site: Site } {
  const next = structuredClone(site);
  const id = pdcPostId(input.origemId);
  const titulo = input.titulo.trim().slice(0, 200) || "Sem título";
  const existente = next.posts.find(p => p.id === id);
  const post: Post = {
    blocks: blocosDoMarkdown(next, input.corpoMd),
    categoryId:
      categoriaId(next, input.categoria) ?? existente?.categoryId ?? null,
    coverImage: input.capa ?? existente?.coverImage ?? null,
    excerpt: (input.resumo ?? "").trim().slice(0, 400),
    id,
    origem: { em: agora.toISOString(), pdc: input.origemId },
    publishedAt: existente?.publishedAt ?? agora.toISOString().slice(0, 10),
    // Atualização mantém o endereço já publicado (links não quebram).
    slug: existente?.slug ?? uniqueSlug(next, input.slug || titulo, id),
    status: "published",
    title: titulo,
  };
  if (existente) next.posts[next.posts.indexOf(existente)] = post;
  else next.posts.unshift(post);
  return { atualizado: !!existente, post, site: next };
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Negrito, itálico e links do texto (já escapado), no mesmo subconjunto que o bloco de texto entende. */
function inlineHtml(text: string): string {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
      (_m, label: string, href: string) => `<a href="${href}">${label}</a>`
    );
}

/** HTML do corpo para o WordPress (mesmo subconjunto de Markdown). */
export function markdownParaHtml(md: string): string {
  return pecasDoMarkdown(md)
    .map(p => {
      if (p.kind === "h")
        return `<h${p.level}>${inlineHtml(p.text)}</h${p.level}>`;
      if (p.kind === "img")
        return /^https?:\/\//.test(p.src)
          ? `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" /></figure>`
          : "";
      const linhas = p.text.split("\n");
      if (linhas.every(l => l.startsWith("- ")))
        return `<ul>${linhas.map(l => `<li>${inlineHtml(l.slice(2))}</li>`).join("")}</ul>`;
      if (p.text.startsWith("> "))
        return `<blockquote><p>${inlineHtml(p.text.slice(2))}</p></blockquote>`;
      return `<p>${linhas.map(inlineHtml).join("<br />")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}
