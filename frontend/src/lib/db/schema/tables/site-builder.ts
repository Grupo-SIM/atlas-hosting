import type { Site } from "@repo/site-builder";
import { relations, sql } from "drizzle-orm";
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
    /** Quando o site foi bloqueado porque outra pessoa tem a exclusividade do template. */
    exclusivityBlockedAt: timestamp("exclusivity_blocked_at", { mode: "date" }),
    /** Prazo para o site sair do ar por causa da exclusividade de outra pessoa. */
    exclusivityDeadlineAt: timestamp("exclusivity_deadline_at", {
      mode: "date",
    }),
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
    status: text("status", {
      enum: ["failed", "published", "suspended"],
    }).notNull(),
    /** Quando a hospedagem foi suspensa por falta de pagamento (arquivos e DNS ficam). */
    suspendedAt: timestamp("suspended_at", { mode: "date" }),
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

/**
 * Como as alterações de cada admin liberado pelo master em sites de clientes são validadas. Sem linha = **automática**
 * (vale na hora, é o padrão). `owner` = o dono do site revisa; `master` = o admin master revisa.
 */
export const pgBuilderAdminValidation = pgTable("builder_admin_validation", {
  mode: text("mode", { enum: ["master", "owner"] }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => pgUser.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id")
    .primaryKey()
    .references(() => pgUser.id, { onDelete: "cascade" }),
});

/**
 * Proposta de alteração de um admin num site de cliente (como um PR). Guarda o site inteiro como a pessoa o deixou;
 * o site real só muda quando o revisor aprova. Ciclo: `draft` (o admin ainda edita) → `pending` (enviada, o revisor
 * precisa olhar) → `approved`, ou `changes_requested` (o revisor comentou o que mudar; o admin ajusta e reenvia).
 * No máximo uma proposta aberta (draft, pending ou changes_requested) por site e por autor.
 */
export const pgBuilderChangeRequest = pgTable(
  "builder_change_requests",
  {
    content: jsonb("content").$type<Site>().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    decidedAt: timestamp("decided_at", { mode: "date" }),
    id: uuid("id").primaryKey().defaultRandom(),
    requestedBy: uuid("requested_by")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
    /** Quem revisa: o dono do site ou o admin master (valor do modo do admin quando a proposta foi criada). */
    reviewer: text("reviewer", { enum: ["master", "owner"] })
      .default("owner")
      .notNull(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => pgBuilderSite.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["approved", "changes_requested", "draft", "pending", "rejected"],
    })
      .default("draft")
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  table => [
    index("builder_change_requests_site_idx").on(table.siteId),
    uniqueIndex("builder_change_requests_open_unique")
      .on(table.siteId, table.requestedBy)
      .where(sql`${table.status} in ('draft', 'pending', 'changes_requested')`),
  ]
);

export type BuilderChangeRequest = typeof pgBuilderChangeRequest.$inferSelect;

/** Conversa da revisão: comentários do revisor e do admin, e os marcos (enviado, alterações pedidas, aprovado). */
export const pgBuilderChangeComment = pgTable(
  "builder_change_comments",
  {
    authorId: uuid("author_id").references(() => pgUser.id, {
      onDelete: "set null",
    }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", {
      enum: ["approved", "changes_requested", "comment", "submitted"],
    })
      .default("comment")
      .notNull(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => pgBuilderChangeRequest.id, { onDelete: "cascade" }),
  },
  table => [index("builder_change_comments_request_idx").on(table.requestId)]
);

export type BuilderChangeComment = typeof pgBuilderChangeComment.$inferSelect;
