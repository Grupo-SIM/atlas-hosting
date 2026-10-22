import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgSystemConfig = pgTable("system_config", {
  // Off by default: boleto não é oferecido como forma de pagamento. Quando ligado
  // pelo admin, boleto fica disponível pra qualquer compra de VPS/VDS/Storage VPS.
  boletoEnabled: boolean("boleto_enabled").notNull().default(false),
  domainFee: doublePrecision("domain_fee").notNull().default(5.0),
  minWithdrawalAmount: doublePrecision("min_withdrawal_amount")
    .notNull()
    .default(100.0),
  // Off by default: PIX só é aceito no plano de 24 meses. Quando ligado, o admin
  // libera PIX pra qualquer duração (1/12/24 meses) de VPS/VDS/Storage VPS.
  pixAllowAllDurations: boolean("pix_allow_all_durations")
    .notNull()
    .default(false),
  referrerCommission: doublePrecision("referrer_commission")
    .notNull()
    .default(0.1),
  withdrawalFee: doublePrecision("withdrawal_fee").notNull().default(2.0),
});

export const pgWithdrawalRequests = pgTable("withdraw_requests", {
  amount: doublePrecision("amount").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  fee: doublePrecision("fee").default(2.0),
  id: uuid("id").primaryKey(),
  pixKey: text("pix_key"),
  rejectionReason: text("rejection_reason"),
  simpayWithdrawalId: text("simpay_withdrawal_id"),
  status: text("status", {
    enum: ["pending", "approved", "rejected"],
  }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  userId: uuid("user_id").notNull(),
});

export const pgWithdrawalRequestsRelations = relations(
  pgWithdrawalRequests,
  ({ one }) => ({
    user: one(pgUser, {
      fields: [pgWithdrawalRequests.userId],
      references: [pgUser.id],
    }),
  })
);

export type SystemConfig = typeof pgSystemConfig.$inferSelect;
export type SystemConfigInsert = typeof pgSystemConfig.$inferInsert;
export type WithdrawalRequest = typeof pgWithdrawalRequests.$inferSelect;
export type WithdrawalRequestInsert = typeof pgWithdrawalRequests.$inferInsert;
export type WithdrawalRequestSelect = typeof pgWithdrawalRequests.$inferSelect;
