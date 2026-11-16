import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgInvoice } from "./invoice";
import { pgOrganization } from "./organization";
import { pgUser } from "./user";

/**
 * Templates que o admin liberou para exclusividade, com o preço anual. O id é o
 * mesmo do registry de `@repo/site-builder` (os templates vivem em código).
 */
export const pgTemplateExclusivitySetting = pgTable(
  "template_exclusivity_settings",
  {
    annualPriceBrl: doublePrecision("annual_price_brl").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    templateId: text("template_id").primaryKey(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  }
);

export type TemplateExclusivitySetting =
  typeof pgTemplateExclusivitySetting.$inferSelect;

/**
 * Posse de um template. Só um registro "vivo" por template (`reserved`,
 * `active` ou `past_due`), garantido pelo índice único parcial.
 *
 * - `reserved`: checkout da primeira compra em andamento (até `reserved_until`);
 * - `active`: em dia, vale até `expires_at`;
 * - `past_due`: venceu sem pagamento e está na carência até `grace_until`;
 * - `expired`: perdeu a exclusividade (template voltou a ser público);
 * - `transferred`: vendida para outro usuário numa revenda;
 * - `released`: reserva que expirou sem pagamento.
 */
export const pgTemplateExclusivity = pgTable(
  "template_exclusivities",
  {
    acquiredVia: text("acquired_via", { enum: ["purchase", "resale"] })
      .notNull()
      .default("purchase"),
    config: json("config").$type<TemplateExclusivityConfig>().notNull().default({}),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    graceUntil: timestamp("grace_until", { mode: "date" }),
    id: uuid("id").primaryKey().defaultRandom(),
    initialInvoiceId: uuid("initial_invoice_id").references(() => pgInvoice.id),
    lastInvoiceId: uuid("last_invoice_id").references(() => pgInvoice.id),
    /** Valor mínimo de venda escolhido pelo dono; nulo = piso global. */
    minAskingPriceBrl: doublePrecision("min_asking_price_brl"),
    orgId: uuid("org_id")
      .notNull()
      .references(() => pgOrganization.id),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => pgUser.id),
    /** Quanto o dono pagou para ter a exclusividade (registro). */
    paidAmountBrl: doublePrecision("paid_amount_brl").notNull(),
    reservedUntil: timestamp("reserved_until", { mode: "date" }),
    startedAt: timestamp("started_at", { mode: "date" }),
    status: text("status", {
      enum: [
        "reserved",
        "active",
        "past_due",
        "expired",
        "transferred",
        "released",
      ],
    }).notNull(),
    templateId: text("template_id").notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  table => [
    uniqueIndex("template_exclusivities_live_unique")
      .on(table.templateId)
      .where(sql`status in ('reserved', 'active', 'past_due')`),
    index("template_exclusivities_owner_idx").on(table.ownerUserId),
  ]
);

export interface TemplateExclusivityConfig {
  /** Cartão usado no pagamento, para a renovação automática. */
  cardToken?: string;
  /** Ciclo (ISO de `expires_at`) da última renovação aplicada. */
  lastRenewalCycle?: string;
  lastFailure?: string;
  /** Lembretes já enviados, no formato `<ciclo>:<dias>`. */
  remindersSent?: string[];
}

export type TemplateExclusivity = typeof pgTemplateExclusivity.$inferSelect;
export type TemplateExclusivityStatus = TemplateExclusivity["status"];

export const LIVE_EXCLUSIVITY_STATUSES = [
  "reserved",
  "active",
  "past_due",
] as const satisfies readonly TemplateExclusivityStatus[];

/** Status em que o dono tem a exclusividade de fato (bloqueia os outros). */
export const OWNED_EXCLUSIVITY_STATUSES = [
  "active",
  "past_due",
] as const satisfies readonly TemplateExclusivityStatus[];

/**
 * Negociação de revenda entre um comprador e o dono atual. `amount_brl` é o
 * valor na mesa (sem a taxa do Atlas); `turn` diz quem precisa responder.
 */
export const pgTemplateProposal = pgTable(
  "template_proposals",
  {
    acceptedAt: timestamp("accepted_at", { mode: "date" }),
    amountBrl: doublePrecision("amount_brl").notNull(),
    buyerUserId: uuid("buyer_user_id")
      .notNull()
      .references(() => pgUser.id),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    exclusivityId: uuid("exclusivity_id")
      .notNull()
      .references(() => pgTemplateExclusivity.id),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    /** Taxa do Atlas (%) congelada no aceite. */
    feePercent: doublePrecision("fee_percent"),
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id").references(() => pgInvoice.id),
    paymentDeadline: timestamp("payment_deadline", { mode: "date" }),
    sellerUserId: uuid("seller_user_id")
      .notNull()
      .references(() => pgUser.id),
    status: text("status", {
      enum: [
        "open",
        "awaiting_payment",
        "paid",
        "declined",
        "cancelled",
        "expired",
      ],
    }).notNull(),
    templateId: text("template_id").notNull(),
    turn: text("turn", { enum: ["buyer", "seller"] }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  table => [
    uniqueIndex("template_proposals_live_unique")
      .on(table.exclusivityId, table.buyerUserId)
      .where(sql`status in ('open', 'awaiting_payment')`),
    index("template_proposals_seller_idx").on(table.sellerUserId),
    index("template_proposals_buyer_idx").on(table.buyerUserId),
  ]
);

export type TemplateProposal = typeof pgTemplateProposal.$inferSelect;
export type TemplateProposalStatus = TemplateProposal["status"];
export type ProposalRole = TemplateProposal["turn"];

/** Histórico de uma negociação (lances, aceite, recusa, expiração...). */
export const pgTemplateProposalEvent = pgTable(
  "template_proposal_events",
  {
    action: text("action", {
      enum: ["offer", "counter", "accept", "decline", "cancel", "expire", "paid"],
    }).notNull(),
    actor: text("actor", { enum: ["buyer", "seller", "system"] }).notNull(),
    amountBrl: doublePrecision("amount_brl"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    note: text("note"),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => pgTemplateProposal.id, { onDelete: "cascade" }),
  },
  table => [index("template_proposal_events_proposal_idx").on(table.proposalId)]
);

export type TemplateProposalEvent = typeof pgTemplateProposalEvent.$inferSelect;

/**
 * Créditos e débitos da carteira do Atlas que não são comissão de afiliado
 * (hoje: venda de exclusividade). `reference_id` único torna o crédito idempotente.
 */
export const pgWalletEntry = pgTable(
  "wallet_entries",
  {
    amountBrl: doublePrecision("amount_brl").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    description: text("description").notNull(),
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", { enum: ["template_sale"] }).notNull(),
    referenceId: text("reference_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id),
  },
  table => [
    uniqueIndex("wallet_entries_reference_unique").on(table.referenceId),
    index("wallet_entries_user_idx").on(table.userId),
  ]
);

export type WalletEntry = typeof pgWalletEntry.$inferSelect;

export const templateExclusivityRelations = relations(
  pgTemplateExclusivity,
  ({ one }) => ({
    owner: one(pgUser, {
      fields: [pgTemplateExclusivity.ownerUserId],
      references: [pgUser.id],
    }),
  })
);

export const templateProposalRelations = relations(
  pgTemplateProposal,
  ({ many, one }) => ({
    events: many(pgTemplateProposalEvent),
    exclusivity: one(pgTemplateExclusivity, {
      fields: [pgTemplateProposal.exclusivityId],
      references: [pgTemplateExclusivity.id],
    }),
  })
);

export const templateProposalEventRelations = relations(
  pgTemplateProposalEvent,
  ({ one }) => ({
    proposal: one(pgTemplateProposal, {
      fields: [pgTemplateProposalEvent.proposalId],
      references: [pgTemplateProposal.id],
    }),
  })
);
