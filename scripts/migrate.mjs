#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations to DATABASE_URL. The pending batch and its bookkeeping are
 * applied in one transaction, so it is atomic and safe to re-run.
 *
 * A transaction-scoped advisory lock serializes concurrent deploys before
 * either one reads `_migrations`. Keeping the lock and every statement inside
 * the same transaction is compatible with PgBouncer transaction pooling (the
 * default Neon deployment URL); session advisory locks are not.
 *
 * The read is non-recursive, so migrations/auth/ remains a source copy; auth is
 * active only when its schema is copied into the root migrations directory.
 *
 * No DATABASE_URL -> skip. Only the live Vite dev server owns an embedded
 * PGLite fallback; production and built previews require Postgres for DB use.
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pendingMigrations } from "./migration-plan.mjs";
import { isMainModule } from "./with-app-env.mjs";

const DEFAULT_MIGRATIONS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

// Two-int advisory locks have their own Postgres key space. The class id is
// ASCII "KNOT" and the object id versions this migrator's lock contract.
export const MIGRATION_LOCK_CLASS_ID = 0x4b4e4f54;
export const MIGRATION_LOCK_OBJECT_ID = 1;

/** Bounded connection/query behavior for a build-time, single-client job. */
export const MIGRATION_POOL_OPTIONS = Object.freeze({
  application_name: "knotty-migrator",
  max: 1,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 10_000,
  statement_timeout: 120_000,
  query_timeout: 125_000,
  lock_timeout: 30_000,
  idle_in_transaction_session_timeout: 60_000,
  allowExitOnIdle: true,
});

async function defaultCreatePool(options) {
  // Keep `pg` lazy so dependency-free tests can import the runner and inject a
  // fake pool without installing or connecting to Postgres.
  const pg = await import("pg");
  return new pg.default.Pool(options);
}

function missingDirectory(error) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT",
  );
}

/**
 * Apply root migrations once, serialized across concurrent deploy processes.
 * Dependencies are injectable solely to make transaction/cleanup behavior
 * testable without a live database.
 */
export async function runMigrations({
  databaseUrl,
  migrationsDir = DEFAULT_MIGRATIONS_DIR,
  createPool = defaultCreatePool,
  readDirectory = readdir,
  readMigration = readFile,
  logger = console,
}) {
  if (typeof databaseUrl !== "string" || !databaseUrl.trim()) {
    throw new TypeError("runMigrations requires a non-empty databaseUrl");
  }

  let entries;
  try {
    entries = await readDirectory(migrationsDir);
  } catch (error) {
    if (missingDirectory(error)) {
      logger.log("[migrate] no migrations/ directory — nothing to do.");
      return 0;
    }
    throw error;
  }

  // An app with no schema of its own must not pay for a database connection.
  if (pendingMigrations(entries, []).length === 0) {
    logger.log("[migrate] no migrations — nothing to do.");
    return 0;
  }

  const pool = await createPool({
    connectionString: databaseUrl.trim(),
    ...MIGRATION_POOL_OPTIONS,
  });
  let client;
  let transactionOpen = false;
  let activeMigration = null;
  try {
    client = await pool.connect();
    await client.query("BEGIN");
    transactionOpen = true;
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [
      MIGRATION_LOCK_CLASS_ID,
      MIGRATION_LOCK_OBJECT_ID,
    ]);

    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    // This read must happen after acquiring the lock. A deploy that waited for
    // another migrator then observes the rows that process just committed.
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (row) => row.name,
    );

    let count = 0;
    for (const { name } of pendingMigrations(entries, applied)) {
      activeMigration = name;
      const text = await readMigration(join(migrationsDir, name), "utf8");
      // pg's simple-query protocol runs a whole multi-statement file at once.
      // Migration files must remain transaction-compatible; a failure rolls
      // back the full pending batch and its bookkeeping.
      await client.query(text);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
      count += 1;
    }
    await client.query("COMMIT");
    transactionOpen = false;
    for (const { name } of pendingMigrations(entries, applied)) {
      logger.log(`[migrate] applied ${name}`);
    }
    logger.log(
      count
        ? `[migrate] done — ${count} migration(s) applied.`
        : "[migrate] up to date.",
    );
    return count;
  } catch (error) {
    logger.error(
      activeMigration
        ? `[migrate] error applying ${activeMigration}`
        : "[migrate] transaction failed before applying a migration",
    );
    if (client && transactionOpen) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // ROLLBACK fails when the connection died — keep the original error.
      }
      transactionOpen = false;
    }
    throw error;
  } finally {
    try {
      if (client) {
        client.release();
      }
    } finally {
      await pool.end();
    }
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.log(
      "[migrate] DATABASE_URL not set — skipping (production DB use requires Postgres; vite dev migrates PGLite itself).",
    );
    return;
  }
  await runMigrations({ databaseUrl });
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error("[migrate] failed:", error?.message || error);
    // pg errors carry the context needed to debug a bad SQL file.
    for (const key of ["code", "detail", "hint", "position", "where"]) {
      if (error?.[key] != null) console.error(`[migrate]   ${key}: ${error[key]}`);
    }
    process.exit(1);
  });
}
