import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  json,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgInvoice } from "./invoice";
import { pgOrganization } from "./organization";
import { pgBuilderSite } from "./site-builder";
import { pgUser } from "./user";

/**
 * Hospedagem paga de um site do Criador de Sites na VM do Atlas: uma assinatura
 * mensal por site. Publicar na VPS do próprio usuário não gera assinatura — ele
 * já paga a máquina.
 *
 * `past_due` = cobrança falhou e o site segue no ar até `grace_until`;
 * `suspended` = passou a carência e o Caddy já serve a página de suspensão
 * (os arquivos do site e o DNS continuam intactos).
 */
export const pgBuilderHostingSubscription = pgTable(
  "builder_hosting_subscriptions",
  {
    amountBrl: doublePrecision("amount_brl").notNull(),
    cancelledAt: timestamp("cancelled_at", { mode: "date" }),
    /** Igual ao `config` das assinaturas de VPS: guarda `cardToken` para a recorrência. */
    config: json("config").$type<BuilderHostingConfig>().notNull().default({}),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    failureCount: integer("failure_count").notNull().default(0),
    /** Até quando o site fica no ar depois de uma cobrança falhar. */
    graceUntil: timestamp("grace_until", { mode: "date" }),
    id: uuid("id").primaryKey().defaultRandom(),
    initialInvoiceId: uuid("initial_invoice_id").references(() => pgInvoice.id),
    lastInvoiceId: uuid("last_invoice_id").references(() => pgInvoice.id),
    nextChargeDate: timestamp("next_charge_date", { mode: "date" }).notNull(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => pgOrganization.id),
    siteId: uuid("site_id")
      .notNull()
      .references(() => pgBuilderSite.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["active", "past_due", "suspended", "cancelled"],
    })
      .notNull()
      .default("active"),
    suspendedAt: timestamp("suspended_at", { mode: "date" }),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id),
  },
  table => [
    uniqueIndex("builder_hosting_subscriptions_site_id_unique").on(
      table.siteId
    ),
  ]
);

export interface BuilderHostingConfig {
  cardToken?: string;
  /** Ciclo da última fatura emitida: evita cobrar duas vezes o mesmo mês. */
  lastRenewalCycle?: string;
  /** Mensagem da última falha de cobrança, para o painel. */
  lastFailure?: string;
}

export const builderHostingSubscriptionRelations = relations(
  pgBuilderHostingSubscription,
  ({ one }) => ({
    lastInvoice: one(pgInvoice, {
      fields: [pgBuilderHostingSubscription.lastInvoiceId],
      references: [pgInvoice.id],
    }),
    organization: one(pgOrganization, {
      fields: [pgBuilderHostingSubscription.orgId],
      references: [pgOrganization.id],
    }),
    site: one(pgBuilderSite, {
      fields: [pgBuilderHostingSubscription.siteId],
      references: [pgBuilderSite.id],
    }),
    user: one(pgUser, {
      fields: [pgBuilderHostingSubscription.userId],
      references: [pgUser.id],
    }),
  })
);

export type BuilderHostingSubscription =
  typeof pgBuilderHostingSubscription.$inferSelect;
export type BuilderHostingSubscriptionInsert =
  typeof pgBuilderHostingSubscription.$inferInsert;

/**
 * Reserva durável da publicação paga, no mesmo padrão de `vps_provisioning_jobs`:
 * a unicidade por fatura garante que webhook, polling e `after()` concorrentes
 * publiquem o site uma única vez.
 */
export const pgBuilderPublishJob = pgTable(
  "builder_publish_jobs",
  {
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    error: text("error"),
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => pgInvoice.id, { onDelete: "cascade" }),
    /** O que publicar quando o pagamento for confirmado. */
    payload: jsonb("payload").$type<BuilderPublishJobPayload>().notNull(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => pgBuilderSite.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["pending", "running", "done", "failed"],
    })
      .notNull()
      .default("pending"),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  table => [
    uniqueIndex("builder_publish_jobs_invoice_id_unique").on(table.invoiceId),
  ]
);

export interface BuilderPublishJobPayload {
  /** Domínio comprado agora ou já pertencente à conta (`kind: "domain"`). */
  domain?: string;
  /** Preço mensal da hospedagem na VM do Atlas, fixado quando a fatura foi criada. */
  hostingAmountBrl?: number;
  kind: "domain" | "subdomain";
  /** Parte antes do domínio base do Atlas (`kind: "subdomain"`). */
  label?: string;
  target: "atlas_vm" | "user_vps";
  vpsNodeId?: string;
}

export const builderPublishJobRelations = relations(
  pgBuilderPublishJob,
  ({ one }) => ({
    invoice: one(pgInvoice, {
      fields: [pgBuilderPublishJob.invoiceId],
      references: [pgInvoice.id],
    }),
    site: one(pgBuilderSite, {
      fields: [pgBuilderPublishJob.siteId],
      references: [pgBuilderSite.id],
    }),
  })
);

export type BuilderPublishJob = typeof pgBuilderPublishJob.$inferSelect;
export type BuilderPublishJobInsert = typeof pgBuilderPublishJob.$inferInsert;
