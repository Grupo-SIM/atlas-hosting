import { relations } from "drizzle-orm";
import {
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

/**
 * Assinatura lançada na mão pelo admin — cliente que paga por fora da
 * plataforma (PIX combinado, contrato antigo). Não gera fatura nem cobrança
 * automática: serve só pra acompanhar vigência e vencimento.
 */
export const pgManualSubscription = pgTable("manual_subscriptions", {
  /** Opcional — nem todo acordo manual tem valor registrado. */
  amountBrl: doublePrecision("amount_brl"),
  clientName: text("client_name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  createdByAdminId: uuid("created_by_admin_id").references(() => pgUser.id),
  email: text("email"),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  paymentMethod: text("payment_method", {
    enum: ["pix", "credit_card", "boleto", "other"],
  })
    .notNull()
    .default("pix"),
  phone: text("phone"),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
});

export const manualSubscriptionRelations = relations(
  pgManualSubscription,
  ({ one }) => ({
    createdByAdmin: one(pgUser, {
      fields: [pgManualSubscription.createdByAdminId],
      references: [pgUser.id],
    }),
  })
);

export type ManualSubscription = typeof pgManualSubscription.$inferSelect;
export type ManualSubscriptionInsert = typeof pgManualSubscription.$inferInsert;
