import type { Site } from "@repo/site-builder";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";
import { pgVpsServers } from "./vps";

/**
 * Site do Criador de Sites. Páginas, posts, categorias, menu e tema vivem juntos em
 * `content` (formato `Site` do @repo/site-builder) — o editor salva o site inteiro.
 */
export const pgBuilderSite = pgTable(
  "builder_sites",
  {
    content: jsonb("content").$type<Site>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    templateId: text("template_id").notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
  },
  table => [index("builder_sites_user_id_idx").on(table.userId)]
);

export const builderSiteRelations = relations(pgBuilderSite, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgBuilderSite.userId],
    references: [pgUser.id],
  }),
}));

export type BuilderSite = typeof pgBuilderSite.$inferSelect;
export type BuilderSiteInsert = typeof pgBuilderSite.$inferInsert;

/** Onde cada site está no ar. Um site tem no máximo uma publicação ativa. */
export const pgBuilderPublication = pgTable(
  "builder_publications",
  {
    domain: text("domain").notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    /** `subdomain` = subdomínio grátis do Atlas; `domain` = domínio da conta do usuário. */
    kind: text("kind", { enum: ["domain", "subdomain"] }).notNull(),
    lastError: text("last_error"),
    publishedAt: timestamp("published_at", { mode: "date" }),
    serverIp: text("server_ip").notNull(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => pgBuilderSite.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["failed", "published"] }).notNull(),
    /** `atlas_vm` = servidor do Atlas; `user_vps` = VPS do próprio usuário. */
    target: text("target", { enum: ["atlas_vm", "user_vps"] }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    vpsNodeId: uuid("vps_node_id").references(() => pgVpsServers.id, {
      onDelete: "set null",
    }),
  },
  table => [
    uniqueIndex("builder_publications_site_id_unique").on(table.siteId),
    uniqueIndex("builder_publications_domain_unique").on(table.domain),
  ]
);

export type BuilderPublication = typeof pgBuilderPublication.$inferSelect;
