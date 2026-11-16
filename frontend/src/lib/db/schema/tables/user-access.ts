import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

/**
 * Usuário de equipe criado por um admin (ou por outro usuário de equipe com acesso a "Usuários"): quem criou,
 * o perfil escolhido (só uma conveniência da tela; o que vale são as permissões por área) e, se marcado,
 * "todas as áreas" naquele nível, inclusive as criadas depois. Fica fora da tabela `users` de propósito:
 * nenhuma consulta de usuário depende destas tabelas.
 */
export const pgUserAccess = pgTable(
  "user_access",
  {
    accessAll: text("access_all", { enum: ["view", "edit"] }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    parentUserId: uuid("parent_user_id").references(() => pgUser.id, {
      onDelete: "set null",
    }),
    profile: text("profile", { enum: ["viewer", "editor", "admin"] }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    userId: uuid("user_id")
      .primaryKey()
      .references(() => pgUser.id, { onDelete: "cascade" }),
  },
  table => [index("user_access_parent_idx").on(table.parentUserId)]
);

/** Nível por área de um usuário de equipe. Área sem linha (e sem `access_all`) = sem acesso. */
export const pgUserAreaPermission = pgTable(
  "user_area_permissions",
  {
    area: text("area").notNull(),
    level: text("level", { enum: ["view", "edit"] }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => pgUser.id, { onDelete: "cascade" }),
  },
  table => [primaryKey({ columns: [table.userId, table.area] })]
);

export type UserAccess = typeof pgUserAccess.$inferSelect;
