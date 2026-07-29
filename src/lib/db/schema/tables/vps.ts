import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgUser } from "./user";

export const vpsProvider = pgEnum("VpsProvider", ["contabo"]);

/**
 * Tabela que vincula uma VM de um fornecedor (Ex: Contabo) a um usuário do Atlas.
 */
export const pgVpsServers = pgTable("vps_nodes", {
  createdAt: timestamp("created_at").defaultNow(),
  externalId: text("external_id"),
  forceRefresh: boolean("force_refresh").default(false),
  id: uuid("id").primaryKey().defaultRandom(),
  ip: text("ip").notNull(),
  isBotInstalled: boolean("is_bot_installed").default(false),
  lastHeartbeat: timestamp("last_heartbeat"), // Última vez que o bot enviou dados
  metadata: jsonb("metadata").$type<any>().default({}), // Novos dados (Cores, RAM Detalhada, Discos)
  name: text("name").notNull(), // Ex: "Servidor Contabo 01"
  os: text("os"), // Ex: "Ubuntu 22.04"
  provider: vpsProvider("provider").default("contabo"),
  status: text("status").default("pending"), // pending, active, suspended
  token: text("token").notNull().unique(), // Token que o bot usará para se autenticar
  topProcesses:
    jsonb("top_processes").$type<
      {
        name: string;
        cpu: number;
        mem_abs: string;
        pid: number;
        ram?: number;
        user?: string;
        threads?: number;
      }[]
    >(),
  updatedAt: timestamp("updated_at").defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id, { onDelete: "cascade" }),
});

/**
 * Tabela para armazenar o histórico de performance (métrica) de cada VPS.
 */
export const pgVpsMetrics = pgTable("vps_node_metrics", {
  cpuUsage: real("cpu_usage").notNull(), // Em porcentagem
  diskUsage: real("disk_usage").notNull(), // Em porcentagem
  id: uuid("id").primaryKey().defaultRandom(),
  metadata: jsonb("metadata").$type<any>(), // Histórico de dados ricos
  processCount: real("process_count"),
  ramUsage: real("ram_usage").notNull(), // Em porcentagem ou MB (a definir no bot)
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  uptime: text("uptime"),
  vpsId: uuid("vps_id")
    .notNull()
    .references(() => pgVpsServers.id, { onDelete: "cascade" }),
});

import { relations } from "drizzle-orm";

export const vpsServersRelations = relations(pgVpsServers, ({ one, many }) => ({
  metrics: many(pgVpsMetrics),
  user: one(pgUser, {
    fields: [pgVpsServers.userId],
    references: [pgUser.id],
  }),
}));

export const vpsMetricsRelations = relations(pgVpsMetrics, ({ one }) => ({
  server: one(pgVpsServers, {
    fields: [pgVpsMetrics.vpsId],
    references: [pgVpsServers.id],
  }),
}));
