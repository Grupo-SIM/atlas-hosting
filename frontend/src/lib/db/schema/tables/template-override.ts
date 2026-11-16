import type { Site } from "@repo/site-builder";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

/**
 * Versão do template editada à mão pelo admin master. Os templates vivem em código (`@repo/site-builder`);
 * quando há uma linha aqui, é ela que a galeria mostra e que os sites novos copiam. Apagar a linha volta
 * ao template do código. Sites já criados não mudam (cada um tem a própria cópia em `builder_sites`).
 */
export const pgBuilderTemplateOverride = pgTable("builder_template_overrides", {
  content: jsonb("content").$type<Site>().notNull(),
  templateId: text("template_id").primaryKey(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => pgUser.id, {
    onDelete: "set null",
  }),
});

export type BuilderTemplateOverride =
  typeof pgBuilderTemplateOverride.$inferSelect;
