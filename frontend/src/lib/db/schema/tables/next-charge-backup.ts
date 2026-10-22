import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Legado mantido em produção para auditoria de alterações de próxima cobrança.
 * Não possui chave primária nem colunas obrigatórias no banco existente.
 */
export const pgNextChargeBackup = pgTable("bkp_next_charge_2d", {
  backupEm: timestamp("backup_em", { mode: "date", withTimezone: true }),
  id: uuid("id"),
  nextChargeDate: timestamp("next_charge_date", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
});

export type NextChargeBackup = typeof pgNextChargeBackup.$inferSelect;
export type NextChargeBackupInsert = typeof pgNextChargeBackup.$inferInsert;
