require("dotenv").config();
const { Client } = require("pg");

async function migrate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  console.log("Adicionando colunas de metadata...");

  try {
    await client.connect();
    // Adiciona em ambas as tabelas
    await client.query(
      "ALTER TABLE vps_nodes ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb"
    );
    await client.query(
      "ALTER TABLE vps_node_metrics ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb"
    );
    console.log("✅ Colunas adicionadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao adicionar colunas:", error);
  } finally {
    await client.end();
  }
}

migrate();
