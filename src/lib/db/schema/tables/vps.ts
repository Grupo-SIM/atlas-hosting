import { pgTable, text, timestamp, uuid, real, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const vpsProvider = pgEnum("VpsProvider", ["contabo"]);

/**
 * Tabela que vincula uma VM de um fornecedor (Ex: Contabo) a um usuário do Atlas.
 */
export const pgVpsServers = pgTable("vps_nodes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Ex: "Servidor Contabo 01"
  ip: text("ip").notNull(),
  os: text("os"), // Ex: "Ubuntu 22.04"
  provider: vpsProvider("provider").default("contabo"),
  externalId: text("external_id"),
  token: text("token").notNull().unique(), // Token que o bot usará para se autenticar
  status: text("status").default("pending"), // pending, active, suspended
  isBotInstalled: boolean("is_bot_installed").default(false),
  topProcesses: jsonb("top_processes").$type<{ name: string, cpu: number, mem_abs: string, pid: number, ram?: number, user?: string, threads?: number }[]>(),
  metadata: jsonb("metadata").$type<any>().default({}), // Novos dados (Cores, RAM Detalhada, Discos)
  lastHeartbeat: timestamp("last_heartbeat"), // Última vez que o bot enviou dados
  forceRefresh: boolean("force_refresh").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Tabela para armazenar o histórico de performance (métrica) de cada VPS.
 */
export const pgVpsMetrics = pgTable("vps_node_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  vpsId: uuid("vps_id")
    .notNull()
    .references(() => pgVpsServers.id, { onDelete: "cascade" }),
  cpuUsage: real("cpu_usage").notNull(), // Em porcentagem
  ramUsage: real("ram_usage").notNull(), // Em porcentagem ou MB (a definir no bot)
  diskUsage: real("disk_usage").notNull(), // Em porcentagem
  uptime: text("uptime"),
  processCount: real("process_count"),
  metadata: jsonb("metadata").$type<any>(), // Histórico de dados ricos
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

import { relations } from "drizzle-orm";

export const vpsServersRelations = relations(pgVpsServers, ({ one, many }) => ({
  user: one(pgUser, {
    fields: [pgVpsServers.userId],
    references: [pgUser.id],
  }),
  metrics: many(pgVpsMetrics),
}));

export const vpsMetricsRelations = relations(pgVpsMetrics, ({ one }) => ({
  server: one(pgVpsServers, {
    fields: [pgVpsMetrics.vpsId],
    references: [pgVpsServers.id],
  }),
}));
