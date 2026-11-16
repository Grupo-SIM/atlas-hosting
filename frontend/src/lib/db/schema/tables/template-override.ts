import type { Site } from "@repo/site-builder";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

/**
 * Versão do template editada à mão (modo Dev). Os templates vivem em código (`@repo/site-builder`).
 *
 * - `content` é a versão **publicada**: quando existe, é ela que a galeria mostra e que os sites novos copiam
 *   ("Usar este template"). Nula = ainda não há versão publicada (vale a do código).
 * - `draftContent` é o **rascunho** do modo Dev: o editor salva aqui sozinho e **ninguém além de quem edita o vê**.
 *   Só "Publicar no template" copia o rascunho para `content`.
 *
 * Apagar a linha volta ao template do código. Sites já criados não mudam (cada um tem a própria cópia em
 * `builder_sites`).
 */
export const pgBuilderTemplateOverride = pgTable("builder_template_overrides", {
  content: jsonb("content").$type<Site>(),
  draftContent: jsonb("draft_content").$type<Site>(),
  draftUpdatedAt: timestamp("draft_updated_at", { mode: "date" }),
  draftUpdatedBy: uuid("draft_updated_by").references(() => pgUser.id, {
    onDelete: "set null",
  }),
  templateId: text("template_id").primaryKey(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => pgUser.id, {
    onDelete: "set null",
  }),
});

export type BuilderTemplateOverride =
  typeof pgBuilderTemplateOverride.$inferSelect;
