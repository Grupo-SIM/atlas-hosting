import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { pgInvoice } from "./invoice";

/**
 * Reserva durável para o provisionamento Contabo. A unicidade por fatura evita
 * que callbacks de pagamento repetidos comprem mais de uma instância.
 */
export const pgVpsProvisioningJob = pgTable(
  "vps_provisioning_jobs",
  {
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    error: text("error"),
    id: uuid("id").primaryKey().defaultRandom(),
    instanceId: text("instance_id"),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => pgInvoice.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["pending", "provisioning", "created", "failed"],
    })
      .notNull()
      .default("pending"),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .defaultNow()
      .notNull(),
  },
  table => [uniqueIndex("vps_provisioning_jobs_invoice_id_unique").on(table.invoiceId)]
);

export const vpsProvisioningJobRelations = relations(
  pgVpsProvisioningJob,
  ({ one }) => ({
    invoice: one(pgInvoice, {
      fields: [pgVpsProvisioningJob.invoiceId],
      references: [pgInvoice.id],
    }),
  })
);

export type VpsProvisioningJob = typeof pgVpsProvisioningJob.$inferSelect;
