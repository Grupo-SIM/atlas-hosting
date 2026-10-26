import { z } from "zod";

/** Nó da árvore de blocos de uma página. `props` é validado pelo schema do tipo. */
export const blockSchema: z.ZodType<Block> = z.lazy(() =>
  z.object({
    children: z.array(blockSchema).optional(),
    id: z.string(),
    props: z.record(z.unknown()),
    type: z.string(),
  })
);

export interface Block {
  children?: Block[];
  id: string;
  props: Record<string, unknown>;
  type: string;
}

export type PublishStatus = "draft" | "published";

export interface Page {
  blocks: Block[];
  id: string;
  slug: string;
  status: PublishStatus;
  title: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  blocks: Block[];
  categoryId: string | null;
  coverImage: string | null;
  excerpt: string;
  id: string;
  publishedAt: string | null;
  slug: string;
  status: PublishStatus;
  title: string;
}

export interface MenuItem {
  href: string;
  label: string;
}

export interface Site {
  categories: Category[];
  /** Layout de cada arquivo de categoria (`/category/:slug`). */
  categoryLayout: Block[];
  footer: Block[];
  header: Block[];
  menu: MenuItem[];
  name: string;
  pages: Page[];
  /** Layout de cada post (`/:slug`). */
  postLayout: Block[];
  posts: Post[];
  /** Tokens de tema: `bg`, `fg`, `accent`, `card`, `muted`, `fontHeading`, `fontBody`. */
  theme: Record<string, string>;
}

export interface TemplateMeta {
  description: string;
  id: string;
  name: string;
  preview: string;
}

export interface SiteTemplate extends TemplateMeta {
  site: Site;
}
