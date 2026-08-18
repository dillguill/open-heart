/**
 * SQLCipher schema + migrations for a single profile's database.
 * Mirrors specs/001-personal-health-vault/data-model.md.
 */
import type { DB } from "@op-engineering/op-sqlite";

const MIGRATIONS: string[] = [
  // 1: initial schema
  `
  CREATE TABLE IF NOT EXISTS health_records (
    id TEXT PRIMARY KEY NOT NULL,
    category TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    value_number REAL,
    value_text TEXT,
    unit TEXT,
    recorded_at TEXT NOT NULL,
    notes TEXT,
    source TEXT NOT NULL,
    related_document_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_health_records_metric_type
    ON health_records(metric_type, recorded_at);

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    file_uri TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    imported_at TEXT NOT NULL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS ai_interpretations (
    id TEXT PRIMARY KEY NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    ai_source TEXT NOT NULL,
    external_provider_name TEXT,
    requested_at TEXT NOT NULL,
    response_text TEXT NOT NULL,
    disclosure_acknowledged INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL
  );
  `,
];

/**
 * Profiles themselves live in src/db/profilesRegistry.ts, not inside each profile's own
 * encrypted database — a profile has to be listed before it can be opened. This module only
 * manages the per-profile health-data schema.
 */
export async function runMigrations(db: DB): Promise<void> {
  await db.execute(
    "CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)",
  );
  const { rows } = await db.execute("SELECT value FROM schema_meta WHERE key = 'version'");
  const currentVersion = rows.length > 0 ? Number(rows[0].value) : 0;

  for (let version = currentVersion; version < MIGRATIONS.length; version += 1) {
    const statements = MIGRATIONS[version]
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);
    await db.transaction(async (tx) => {
      for (const statement of statements) {
        await tx.execute(statement);
      }
      await tx.execute(
        "INSERT INTO schema_meta (key, value) VALUES ('version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [String(version + 1)],
      );
    });
  }
}
