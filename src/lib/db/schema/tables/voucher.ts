import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const pgVoucher = pgTable("vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type", {
    enum: ["fixed", "percentage"],
  }).notNull(),
  discountValue: doublePrecision("discount_value").notNull(),
  /** Se vinculado a um usuário específico, apenas ele pode usar */
  userId: uuid("user_id").references(() => pgUser.id),
  maxUses: integer("max_uses").notNull().default(1),
  currentUses: integer("current_uses").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const voucherRelations = relations(pgVoucher, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgVoucher.userId],
    references: [pgUser.id],
  }),
}));

export type Voucher = typeof pgVoucher.$inferSelect;
export type VoucherInsert = typeof pgVoucher.$inferInsert;
