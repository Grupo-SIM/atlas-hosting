import { readFileSync } from "node:fs";
import "./load-env.mjs";
import pg from "pg";

/**
 * Aplica um arquivo .sql no banco do DATABASE_URL, uma statement por vez.
 * Existe porque `drizzle-kit push` quer derrubar tabelas/colunas fora do schema
 * (drift antigo) — aqui roda só o que está no arquivo, dentro de transação.
 *
 * Uso: node scripts/apply-sql.mjs frontend/drizzle/0002_add-manual-subscriptions.sql
 */
const file = process.argv[2];
if (!file) {
  console.error("Informe o arquivo .sql. Ex: node scripts/apply-sql.mjs frontend/drizzle/0002_add-manual-subscriptions.sql");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não encontrada no .env");
  process.exit(1);
}

const statements = readFileSync(file, "utf8")
  .split("--> statement-breakpoint")
  .map(s => s.trim())
  .filter(Boolean);

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  await client.query("BEGIN");
  for (const statement of statements) {
    console.log(`> ${statement.split("\n")[0]}`);
    await client.query(statement);
  }
  await client.query("COMMIT");
  console.log(`OK — ${statements.length} statement(s) aplicada(s).`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Falhou, nada foi aplicado:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
