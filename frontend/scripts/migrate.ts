import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Applies the versioned SQL files in frontend/drizzle in filename order. drizzle-kit migrate is not
// used because these files are hand-written and have no drizzle journal. Applied files are recorded
// in schema_migrations; each file runs in its own transaction.
const directory =
  process.env.MIGRATIONS_DIR ?? join(import.meta.dir, "..", "drizzle");
const table = "schema_migrations";

// Migrations need a direct connection (no pgbouncer): they take a session advisory lock.
const url = new URL(process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "");
for (const param of ["pgbouncer", "pool_timeout"])
  url.searchParams.delete(param);

const sql = new Bun.SQL({ max: 1, url: url.toString() });
const files = (await readdir(directory))
  .filter(file => file.endsWith(".sql"))
  .sort();

try {
  await sql`SELECT pg_advisory_lock(hashtext('atlas-hosting:migrate'))`;

  const [{ exists }] =
    await sql`SELECT to_regclass(${`public.${table}`}) IS NOT NULL AS exists`;
  if (!exists) {
    // Databases that predate this runner already had some files applied by hand. Never guess:
    // the operator names the last applied file ("none" for an empty database).
    const baseline = process.env.MIGRATE_BASELINE;
    if (!baseline) {
      throw new Error(
        `${table} does not exist. Set MIGRATE_BASELINE to the last migration file already applied ` +
          `to this database (or "none" for an empty database), then run again.`
      );
    }
    if (baseline !== "none" && !files.includes(baseline)) {
      throw new Error(
        `MIGRATE_BASELINE ${baseline} is not a file in ${directory}.`
      );
    }
    await sql.unsafe(
      `CREATE TABLE ${table} (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`
    );
    const applied =
      baseline === "none" ? [] : files.filter(file => file <= baseline);
    for (const name of applied)
      await sql`INSERT INTO schema_migrations (name) VALUES (${name})`;
    console.log(`Baseline recorded ${applied.length} existing migration(s).`);
  }

  const done = new Set(
    (await sql`SELECT name FROM schema_migrations`).map(row => row.name)
  );
  const pending = files.filter(file => !done.has(file));
  for (const name of pending) {
    const content = await readFile(join(directory, name), "utf8");
    await sql.begin(async tx => {
      await tx.unsafe(content);
      await tx`INSERT INTO schema_migrations (name) VALUES (${name})`;
    });
    console.log(`Applied ${name}`);
  }
  console.log(
    pending.length
      ? `Applied ${pending.length} migration(s).`
      : "No pending migrations."
  );
} finally {
  await sql.close();
}
