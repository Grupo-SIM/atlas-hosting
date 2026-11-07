/**
 * Formato compacto dos posts de exemplo do template. Corpo: "t" = texto (parágrafos separados por
 * linha em branco; aceita **negrito** e *itálico*), "h2"/"h3" = título, "i" = imagem (o valor é o
 * texto alternativo; a foto vem do conjunto genérico em `images.ts`).
 */
export type PostItem = [kind: "t" | "h2" | "h3" | "i", value: string];

export interface PostSeed {
  body: PostItem[];
  /** Slug de uma categoria de `CATEGORIES` (posts.ts). */
  category: string;
  /** AAAA-MM-DD. */
  date: string;
  excerpt: string;
  slug: string;
  title: string;
}
