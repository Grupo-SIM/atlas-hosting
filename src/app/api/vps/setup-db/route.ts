import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Script de emergência para criar as tabelas de VPS na mão
 * Caso o db:push não funcione via terminal.
 */
export async function GET() {
  try {
    // Criar tabela vps_nodes
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vps_nodes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        name text NOT NULL,
        ip text NOT NULL,
        os text,
        token text NOT NULL UNIQUE,
        status text DEFAULT 'pending',
        is_bot_installed boolean DEFAULT false,
        last_heartbeat timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);

    // Criar tabela vps_node_metrics
    await db.execute(sql`
        ALTER TABLE vps_nodes ADD COLUMN IF NOT EXISTS top_processes JSONB;
        
        CREATE TABLE IF NOT EXISTS vps_node_metrics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        vps_id uuid NOT NULL REFERENCES vps_nodes(id) ON DELETE CASCADE,
        cpu_usage real NOT NULL,
        ram_usage real NOT NULL,
        disk_usage real NOT NULL,
        uptime text,
        process_count real,
        timestamp timestamp NOT NULL DEFAULT now()
      );
    `);

    return NextResponse.json({
      message:
        "Tabelas VPS criadas/verificadas com sucesso no banco de produção!",
      success: true,
    });
  } catch (error: any) {
    console.error("Erro no setup manual do banco:", error);
    return NextResponse.json(
      {
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
