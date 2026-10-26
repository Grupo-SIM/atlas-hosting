import { z } from "zod";
import type { Site } from "./index.js";
import { blockSchema } from "./index.js";

const status = z.enum(["draft", "published"]);
const slug = z.string().regex(/^[a-z0-9-]*$/, "Slug inválido");

/** Valida o site inteiro antes de gravar — o editor roda no navegador, então o servidor não confia nele. */
export const siteSchema: z.ZodType<Site> = z.object({
  categories: z.array(
    z.object({ id: z.string(), name: z.string().min(1), slug: slug.min(1) })
  ),
  categoryLayout: z.array(blockSchema),
  footer: z.array(blockSchema),
  header: z.array(blockSchema),
  menu: z.array(z.object({ href: z.string(), label: z.string() })),
  name: z.string().min(1).max(120),
  pages: z.array(
    z.object({
      blocks: z.array(blockSchema),
      id: z.string(),
      slug,
      status,
      title: z.string().min(1),
    })
  ),
  postLayout: z.array(blockSchema),
  posts: z.array(
    z.object({
      blocks: z.array(blockSchema),
      categoryId: z.string().nullable(),
      coverImage: z.string().nullable(),
      excerpt: z.string(),
      id: z.string(),
      publishedAt: z.string().nullable(),
      slug: slug.min(1),
      status,
      title: z.string().min(1),
    })
  ),
  theme: z.record(z.string()),
});
