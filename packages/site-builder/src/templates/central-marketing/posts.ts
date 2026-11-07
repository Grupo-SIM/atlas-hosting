import type { Block, Post } from "../../model/index.js";
import { pool } from "./images.js";
import type { PostItem, PostSeed } from "./post-seed.js";
import { POSTS_A } from "./posts-a.js";
import { POSTS_B } from "./posts-b.js";

/** Categorias de exemplo (slug → nome). Textos e ícones dos cartões da home ficam em `index.ts`. */
export const categorySeeds = [
  ["estrategia", "Estratégia"],
  ["conteudo", "Marketing de Conteúdo"],
  ["anuncios", "Anúncios Pagos"],
  ["busca-organica", "SEO e Busca"],
  ["midias-sociais", "Mídias Sociais"],
  ["email", "E-mail e Automação"],
  ["dados", "Dados e Métricas"],
  ["marca", "Marca e Posicionamento"],
  ["vendas-online", "Vendas Online"],
  ["video", "Vídeo"],
  ["sites", "Sites e Experiência"],
  ["ferramentas", "Ferramentas e IA"],
] as const;

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `seed-post-${seq++}`,
  props,
  type,
});

/** Corpo compacto → blocos; cada imagem pega a próxima foto do conjunto genérico (a partir de `first`). */
function bodyOf(items: PostItem[], first: number): Block[] {
  let photo = first;
  return items.map(([kind, value]) => {
    if (kind === "t") return block("text", { text: value });
    if (kind === "i")
      return block("image", { alt: value, src: pool(photo++, 1200) });
    return block("heading", {
      align: "left",
      level: kind,
      subtitle: "",
      text: value,
    });
  });
}

/** Posts de exemplo escritos para o template (mais recente primeiro). */
const seeds: PostSeed[] = [...POSTS_A, ...POSTS_B].sort((a, b) =>
  b.date.localeCompare(a.date)
);

export const posts: Post[] = seeds.map((s, i) => ({
  blocks: bodyOf(s.body, i * 2 + 1),
  categoryId: `cat-${s.category}`,
  coverImage: pool(i, 1200),
  excerpt: s.excerpt,
  id: `post-${i + 1}`,
  publishedAt: s.date,
  slug: s.slug,
  status: "published",
  title: s.title,
}));
