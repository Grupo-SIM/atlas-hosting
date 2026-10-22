import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

async function migrate() {
  console.log("Adicionando coluna 'metadata' à tabela vps_servers...");
  try {
    await db.execute(
      sql`ALTER TABLE vps_servers ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`
    );
    console.log("✅ Coluna adicionada com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao adicionar coluna:", error);
  }
}

migrate();
