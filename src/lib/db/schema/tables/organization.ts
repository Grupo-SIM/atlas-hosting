import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { pgUser } from "./user";
import { relations } from "drizzle-orm";

export const pgOrganization = pgTable("organization", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const organizationRelations = relations(
  pgOrganization,
  ({ one, many }) => ({
    owner: one(pgUser, {
      fields: [pgOrganization.ownerId],
      references: [pgUser.id],
      relationName: "owned_organizations",
    }),
    members: many(pgUser, { relationName: "organization_members" }),
  })
);

export type Organization = typeof pgOrganization.$inferSelect;
export type OrganizationInsert = typeof pgOrganization.$inferInsert;
