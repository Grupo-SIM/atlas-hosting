import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

// Password reset tokens table
export const pgPasswordResetToken = pgTable("password_reset_tokens", {
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  used: boolean("used").default(false).notNull(),
  userId: uuid("user_id")
    .references(() => pgUser.id, { onDelete: "cascade" })
    .notNull(),
});

// Email verification tokens table
export const pgEmailVerificationToken = pgTable("email_verification_tokens", {
  code: text("code"), // 5-digit verification code (nullable for migration)
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  email: text("email").notNull(), // The email being verified
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  used: boolean("used").default(false).notNull(),
  userId: uuid("user_id")
    .references(() => pgUser.id, { onDelete: "cascade" })
    .notNull(),
});

// Relations
export const passwordResetTokenRelations = relations(
  pgPasswordResetToken,
  ({ one }) => ({
    user: one(pgUser, {
      fields: [pgPasswordResetToken.userId],
      references: [pgUser.id],
    }),
  })
);

export const emailVerificationTokenRelations = relations(
  pgEmailVerificationToken,
  ({ one }) => ({
    user: one(pgUser, {
      fields: [pgEmailVerificationToken.userId],
      references: [pgUser.id],
    }),
  })
);

// Types
export type PasswordResetToken = typeof pgPasswordResetToken.$inferSelect;
export type PasswordResetTokenInsert = typeof pgPasswordResetToken.$inferInsert;
export type EmailVerificationToken =
  typeof pgEmailVerificationToken.$inferSelect;
export type EmailVerificationTokenInsert =
  typeof pgEmailVerificationToken.$inferInsert;
