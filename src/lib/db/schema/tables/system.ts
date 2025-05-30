import { relations } from "drizzle-orm";
import { doublePrecision, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgSystemConfig = pgTable("system_config", {
  domainFee: doublePrecision("domain_fee").notNull().default(5.0),
  referrerCommission: doublePrecision("referrer_commission")
    .notNull()
    .default(0.1),
  minWithdrawalAmount: doublePrecision("min_withdrawal_amount")
    .notNull()
    .default(10.0),
});

export const pgWithdrawalRequests = pgTable("withdraw_requests", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  status: text("status", {
    enum: ["pending", "approved", "rejected"],
  }).notNull(),
  amount: doublePrecision("amount").notNull(),
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
