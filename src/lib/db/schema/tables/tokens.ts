import { pgTable, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { pgUser } from "./user";

// Password reset tokens table
export const pgPasswordResetToken = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => pgUser.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Email verification tokens table
export const pgEmailVerificationToken = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => pgUser.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(), // The email being verified
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const passwordResetTokenRelations = relations(pgPasswordResetToken, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgPasswordResetToken.userId],
    references: [pgUser.id],
  }),
}));

export const emailVerificationTokenRelations = relations(pgEmailVerificationToken, ({ one }) => ({
  user: one(pgUser, {
    fields: [pgEmailVerificationToken.userId],
    references: [pgUser.id],
  }),
}));

// Types
export type PasswordResetToken = typeof pgPasswordResetToken.$inferSelect;
export type PasswordResetTokenInsert = typeof pgPasswordResetToken.$inferInsert;
export type EmailVerificationToken = typeof pgEmailVerificationToken.$inferSelect;
export type EmailVerificationTokenInsert = typeof pgEmailVerificationToken.$inferInsert;
