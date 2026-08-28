#!/usr/bin/env node
/**
 * Full schema audit for migrations/*.sql against an ephemeral PGLite instance.
 * Prints a JSON report to stdout; exits non-zero on structural failures.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pendingMigrations } from "./migration-plan.mjs";

const ROOT = join(import.meta.dirname, "..");
const MIGRATIONS_DIR = join(ROOT, "migrations");

const EXPECTED_TABLES = [
  "user",
  "session",
  "account",
  "verification",
  "media_batch_reservation",
  "_migrations",
];

const EXPECTED_INDEXES = [
  "session_userId_idx",
  "account_userId_idx",
  "verification_identifier_idx",
  "media_batch_reservation_expiry_idx",
];

/** @param {import("@electric-sql/pglite").PGlite} pg */
async function listTables(pg) {
  const rows = await pg.query(`
    select tablename
    from pg_catalog.pg_tables
    where schemaname = 'public'
    order by tablename
  `);
  return rows.rows.map((r) => r.tablename);
}

/** @param {import("@electric-sql/pglite").PGlite} pg */
async function listIndexes(pg) {
  const rows = await pg.query(`
    select indexname
    from pg_indexes
    where schemaname = 'public'
    order by indexname
  `);
  return rows.rows.map((r) => r.indexname);
}

/** @param {import("@electric-sql/pglite").PGlite} pg */
async function columnSummary(pg) {
  const rows = await pg.query(`
    select table_name, column_name, data_type, is_nullable
    from information_schema.columns
    where table_schema = 'public'
    order by table_name, ordinal_position
  `);
  /** @type {Record<string, Array<{ column: string, type: string, nullable: string }>>} */
  const out = {};
  for (const row of rows.rows) {
    const table = row.table_name;
    out[table] ??= [];
    out[table].push({
      column: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable,
    });
  }
  return out;
}

export async function runDbAudit() {
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql"));
  const pg = new PGlite();
  await pg.waitReady;
  await pg.exec(
    "create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())",
  );

  const applied = [];
  for (const { name, path } of pendingMigrations(files.map((f) => join(MIGRATIONS_DIR, f)), applied)) {
    const sql = readFileSync(path, "utf8");
    await pg.transaction(async (tx) => {
      await tx.exec(sql);
      await tx.query("insert into _migrations (name) values ($1)", [name]);
    });
    applied.push(name);
  }

  const tables = await listTables(pg);
  const indexes = await listIndexes(pg);
  const columns = await columnSummary(pg);

  const missingTables = EXPECTED_TABLES.filter((t) => !tables.includes(t));
  const missingIndexes = EXPECTED_INDEXES.filter((i) => !indexes.includes(i));

  // Reservation table must never store image bytes or filenames.
  const mediaCols = columns.media_batch_reservation?.map((c) => c.column) ?? [];
  const forbiddenMediaCols = ["image", "filename", "payload", "observation", "question"];
  const leakedCols = forbiddenMediaCols.filter((c) => mediaCols.includes(c));

  // Auth tables use camelCase quoted columns — spot-check user table.
  const userCols = columns.user?.map((c) => c.column) ?? [];
  assert.ok(userCols.includes("emailVerified"), "user.emailVerified column missing");

  // media_batch_reservation PK and check constraint smoke test.
  const badHash = await pg
    .query(
      `insert into media_batch_reservation (subject_hash, batch_id, reservation_id, expires_at)
       values ('not-a-hash', gen_random_uuid(), gen_random_uuid(), now() + interval '1 hour')`,
    )
    .then(() => "inserted")
    .catch((err) => err.message);
  assert.match(String(badHash), /check|violates|media_batch_subject_hash_format/i);

  const goodHash = "a".repeat(64);
  await pg.query(
    `insert into media_batch_reservation (subject_hash, batch_id, reservation_id, expires_at)
     values ($1, gen_random_uuid(), gen_random_uuid(), now() + interval '1 hour')`,
    [goodHash],
  );

  const report = {
    status: missingTables.length === 0 && missingIndexes.length === 0 && leakedCols.length === 0
      ? "ok"
      : "fail",
    migrationsApplied: applied,
    tables,
    indexes,
    columnCounts: Object.fromEntries(Object.entries(columns).map(([k, v]) => [k, v.length])),
    mediaBatchReservation: {
      columns: mediaCols,
      storesImages: leakedCols.length > 0,
      forbiddenColumnsFound: leakedCols,
    },
    authUserColumns: userCols,
    issues: [
      ...missingTables.map((t) => `missing table: ${t}`),
      ...missingIndexes.map((i) => `missing index: ${i}`),
      ...leakedCols.map((c) => `media_batch_reservation must not store ${c}`),
    ],
    notes: [
      "Nyx instructor stills live in public/instructor/nyx/ — not in Postgres.",
      "Knowledge-base knots/ties are TypeScript under src/lib/kb/, not SQL seed data.",
      "media_batch_reservation holds one-use camera batch leases only (hashed subject + UUID).",
    ],
  };

  if (report.status !== "ok") {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return report;
  }

  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDbAudit().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
