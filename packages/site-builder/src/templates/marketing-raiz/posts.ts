import type { Block, Category, Post } from "../../model/index.js";
import { RAW_POSTS } from "./posts-data.js";

/** As 4 categorias do original (slug, nome). */
export const categories: Category[] = [
  { id: "cat-estudos", name: "Estudos", slug: "estudos" },
  {
    id: "cat-funil-de-vendas",
    name: "Funil de Vendas",
    slug: "funil-de-vendas",
  },
  { id: "cat-marketing", name: "Marketing", slug: "marketing" },
  { id: "cat-vendas", name: "Vendas & Monetização", slug: "vendas" },
];

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `mr-p${seq++}`,
  props,
  type,
});

/** Posts do original (mais recente primeiro), com o corpo convertido em blocos de texto, título e imagem. */
export const posts: Post[] = RAW_POSTS.map((raw, i) => ({
  blocks: raw.body.map(item => {
    if (item[0] === "i")
      return block("image", { alt: item[1], src: item[2], url: "" });
    if (item[0] === "t") return block("text", { text: item[1] });
    return block("heading", {
      align: "left",
      level: item[0],
      subtitle: "",
      text: item[1],
    });
  }),
  categoryId: `cat-${raw.category}`,
  coverImage: raw.cover || null,
  excerpt: raw.excerpt,
  id: `post-${i + 1}`,
  publishedAt: raw.date,
  slug: raw.slug,
  status: "published",
  title: raw.title,
}));
