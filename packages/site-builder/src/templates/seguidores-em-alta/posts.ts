import type { Block, Category, Post } from "../../model/index.js";
import { BODIES } from "./post-bodies.js";
import { SEEDS } from "./posts-data.js";

/**
 * Categorias e posts do seguidoresemalta.com (API do WordPress): título, resumo, capa, categoria, data e corpo
 * completo. O modelo tem uma categoria por post; as tags `melhores-posts` e `posts-mais-pesquisados` do original
 * viram listas de endereços nos blocos da home (`MELHORES` e `MAIS_PESQUISADOS`).
 */

/** Ordem e nomes das categorias (como em /categorias/). */
export const CATEGORIES: [slug: string, name: string][] = [
  ["monetizacao", "Monetização e Vendas"],
  ["crescimento-rapido", "Crescimento Rápido"],
  ["criacao-de-conteudo", "Criação de Conteúdo"],
  ["ferramentas", "Ferramentas"],
  ["redes-sociais", "Redes Sociais"],
  ["seguranca", "Segurança"],
  ["novidades-e-atualizacoes", "Novidades e Atualizações"],
  ["branding-e-marca", "Branding e Marca"],
];

export const categories: Category[] = CATEGORIES.map(([slug, name]) => ({
  id: `cat-${slug}`,
  name,
  slug,
}));

/** Posts com a tag do WordPress, na ordem em que aparecem na home. */
export const MELHORES = [
  "como-apagar-sugestoes-e-pesquisa-do-instagram",
  "como-vender-no-instagram-estrategias-de-venda",
  "como-fazer-uma-bio-no-instagram-passo-a-passo",
];
export const MAIS_PESQUISADOS = [
  "ganhar-seguidores-no-instagram-melhores-dicas",
  "como-aproveitar-o-modo-silencioso-desativando",
  "como-aumentar-o-alcance-dos-stories-para-20k",
  "ganhar-dinheiro-no-instagram-monetizar-perfil",
];

/** Hora fixa para a ordem dos posts do mesmo dia seguir a do original (mais novo primeiro). */
const at = (date: string, i: number) =>
  `${date}T${String(23 - (i % 24)).padStart(2, "0")}:00:00.000Z`;

export const posts: Post[] = SEEDS.map((s, i) => ({
  blocks: (
    BODIES[s.slug] ?? [{ props: { text: s.excerpt }, type: "text" }]
  ).map(
    (b, n): Block => ({ id: `sg-post-${i}-${n}`, props: b.props, type: b.type })
  ),
  categoryId: `cat-${s.category}`,
  coverImage: s.cover,
  excerpt: s.excerpt,
  id: `post-${s.slug}`,
  publishedAt: at(s.date, i),
  slug: s.slug,
  status: "published",
  title: s.title,
}));
