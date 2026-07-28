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
  active: boolean("active").notNull().default(true),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  currentUses: integer("current_uses").notNull().default(0),
  discountType: text("discount_type", {
    enum: ["fixed", "percentage"],
  }).notNull(),
  discountValue: doublePrecision("discount_value").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  id: uuid("id").primaryKey().defaultRandom(),
  maxUses: integer("max_uses").notNull().default(1),
  /** Se vinculado a um usuário específico, apenas ele pode usar */
  userId: uuid("user_id").references(() => pgUser.id),
});

export const voucherRelations = relations(pgVoucher, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgVoucher.userId],
    references: [pgUser.id],
  }),
}));

export type Voucher = typeof pgVoucher.$inferSelect;
export type VoucherInsert = typeof pgVoucher.$inferInsert;
