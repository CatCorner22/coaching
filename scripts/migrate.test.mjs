import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MIGRATION_LOCK_CLASS_ID,
  MIGRATION_LOCK_OBJECT_ID,
  MIGRATION_POOL_OPTIONS,
  runMigrations,
} from "./migrate.mjs";

function harness({ applied = [], failOn = null } = {}) {
  const queries = [];
  const poolState = { connected: false, ended: false, released: false };
  let poolOptions;
  const client = {
    async query(text, params = []) {
      queries.push({ text, params });
      if (text === failOn) throw new Error("injected migration failure");
      if (text === "SELECT name FROM _migrations") {
        return { rows: applied.map((name) => ({ name })) };
      }
      return { rows: [] };
    },
    release() {
      poolState.released = true;
    },
  };
  const createPool = async (options) => {
    poolOptions = options;
    return {
      async connect() {
        poolState.connected = true;
        return client;
      },
      async end() {
        poolState.ended = true;
      },
    };
  };
  return {
    createPool,
    poolState,
    queries,
    poolOptions: () => poolOptions,
  };
}

const quietLogger = { log() {}, error() {} };

test("migrator holds a transaction-scoped lock through bookkeeping and commit", async () => {
  const h = harness();
  const files = new Map([
    ["/migrations/0001_first.sql", "create table first_table(id int)"],
    ["/migrations/0002_second.sql", "create table second_table(id int)"],
  ]);

  const count = await runMigrations({
    databaseUrl: " postgres://example/test ",
    migrationsDir: "/migrations",
    createPool: h.createPool,
    readDirectory: async () => ["0002_second.sql", "README.md", "0001_first.sql"],
    readMigration: async (path) => files.get(path),
    logger: quietLogger,
  });

  assert.equal(count, 2);
  assert.deepEqual(h.poolOptions(), {
    connectionString: "postgres://example/test",
    ...MIGRATION_POOL_OPTIONS,
  });
  const statements = h.queries.map(({ text }) => text);
  assert.equal(statements[0], "BEGIN");
  assert.ok(
    statements.indexOf("SELECT pg_advisory_xact_lock($1, $2)") <
      statements.indexOf("SELECT name FROM _migrations"),
  );
  assert.equal(statements.at(-1), "COMMIT");
  assert.deepEqual(h.queries[1].params, [
    MIGRATION_LOCK_CLASS_ID,
    MIGRATION_LOCK_OBJECT_ID,
  ]);
  assert.ok(!statements.some((text) => text.includes("pg_advisory_unlock")));
  assert.ok(!statements.some((text) => text === "SELECT pg_advisory_lock($1, $2)"));
  assert.deepEqual(h.poolState, {
    connected: true,
    ended: true,
    released: true,
  });
});

test("a migration failure rolls back the transaction-scoped lock and closes the pool", async () => {
  const sql = "select broken";
  const h = harness({ failOn: sql });

  await assert.rejects(
    runMigrations({
      databaseUrl: "postgres://example/test",
      migrationsDir: "/migrations",
      createPool: h.createPool,
      readDirectory: async () => ["0001_broken.sql"],
      readMigration: async () => sql,
      logger: quietLogger,
    }),
    /injected migration failure/,
  );

  const statements = h.queries.map(({ text }) => text);
  assert.ok(statements.includes("ROLLBACK"));
  assert.ok(statements.includes("SELECT pg_advisory_xact_lock($1, $2)"));
  assert.ok(!statements.some((text) => text.includes("pg_advisory_unlock")));
  assert.equal(h.poolState.released, true);
  assert.equal(h.poolState.ended, true);
});

test("two concurrent deploy runners apply a pending file only once", async () => {
  const applied = new Set();
  const waiters = [];
  let held = false;
  let migrationExecutions = 0;

  const acquire = async () => {
    if (!held) {
      held = true;
      return;
    }
    await new Promise((resolve) => waiters.push(resolve));
  };
  const release = () => {
    const next = waiters.shift();
    if (next) next();
    else held = false;
  };
  const createPool = async () => ({
    async connect() {
      let ownsLock = false;
      return {
        async query(text, params = []) {
          if (text === "SELECT pg_advisory_xact_lock($1, $2)") {
            await acquire();
            ownsLock = true;
          } else if ((text === "COMMIT" || text === "ROLLBACK") && ownsLock) {
            release();
            ownsLock = false;
          }
          else if (text === "SELECT name FROM _migrations") {
            return { rows: [...applied].map((name) => ({ name })) };
          } else if (text === "select migration_body") {
            migrationExecutions += 1;
          } else if (text === "INSERT INTO _migrations (name) VALUES ($1)") {
            applied.add(params[0]);
          }
          return { rows: [] };
        },
        release() {},
      };
    },
    async end() {},
  });
  const options = {
    databaseUrl: "postgres://example/test",
    migrationsDir: "/migrations",
    createPool,
    readDirectory: async () => ["0001_once.sql"],
    readMigration: async () => "select migration_body",
    logger: quietLogger,
  };

  const counts = await Promise.all([runMigrations(options), runMigrations(options)]);
  assert.deepEqual(counts.sort(), [0, 1]);
  assert.equal(migrationExecutions, 1);
  assert.deepEqual([...applied], ["0001_once.sql"]);
});

test("empty migration directories avoid opening a database pool", async () => {
  let poolCreated = false;
  const count = await runMigrations({
    databaseUrl: "postgres://example/test",
    migrationsDir: "/migrations",
    createPool: async () => {
      poolCreated = true;
      throw new Error("pool must not be created");
    },
    readDirectory: async () => ["README.md", "auth"],
    logger: quietLogger,
  });
  assert.equal(count, 0);
  assert.equal(poolCreated, false);
});

test("a connection failure still shuts down the pool", async () => {
  let ended = false;
  await assert.rejects(
    runMigrations({
      databaseUrl: "postgres://example/test",
      migrationsDir: "/migrations",
      createPool: async () => ({
        async connect() {
          throw new Error("database unavailable");
        },
        async end() {
          ended = true;
        },
      }),
      readDirectory: async () => ["0001_first.sql"],
      logger: quietLogger,
    }),
    /database unavailable/,
  );
  assert.equal(ended, true);
});

test("only an actually missing migration directory is treated as empty", async () => {
  const permissionError = Object.assign(new Error("permission denied"), {
    code: "EACCES",
  });
  await assert.rejects(
    runMigrations({
      databaseUrl: "postgres://example/test",
      migrationsDir: "/migrations",
      readDirectory: async () => {
        throw permissionError;
      },
      logger: quietLogger,
    }),
    permissionError,
  );

  const missingError = Object.assign(new Error("missing"), { code: "ENOENT" });
  assert.equal(
    await runMigrations({
      databaseUrl: "postgres://example/test",
      migrationsDir: "/migrations",
      readDirectory: async () => {
        throw missingError;
      },
      logger: quietLogger,
    }),
    0,
  );
});

test("a release without DATABASE_URL fails unless the skip is asked for", async () => {
  const { missingDatabaseUrlDisposition } = await import("./migrate.mjs");
  // Release steps often run with a different environment than the deployed
  // function; a silent exit-0 skip deployed an unmigrated auth schema whose
  // failures only surfaced as runtime 500s. Inferring the skip from NODE_ENV
  // meant forgetting NODE_ENV=production was enough to get the silent version.
  assert.equal(missingDatabaseUrlDisposition({ NODE_ENV: "production" }), "fail");
  assert.equal(missingDatabaseUrlDisposition({}), "fail");
  assert.equal(missingDatabaseUrlDisposition({ NODE_ENV: "development" }), "fail");
  // The two quiet shapes stay quiet, but both are now explicit: the no-auth
  // build has no DB (and the app-env wrapper supplies that flag locally), and
  // --allow-skip says the operator meant it.
  assert.equal(missingDatabaseUrlDisposition({ VITE_AUTH_ENABLED: "false" }), "skip");
  assert.equal(missingDatabaseUrlDisposition({ NODE_ENV: "production" }, ["--allow-skip"]), "skip");
  // …but the wrapper's own standalone default is not an operator choice: a
  // release that only forgot DATABASE_URL must not inherit a silent skip.
  assert.equal(
    missingDatabaseUrlDisposition({ VITE_AUTH_ENABLED: "false", APP_ENV_AUTH_DEFAULTED: "1" }),
    "fail",
  );
  assert.equal(
    missingDatabaseUrlDisposition(
      { VITE_AUTH_ENABLED: "false", APP_ENV_AUTH_DEFAULTED: "1" },
      ["--allow-skip"],
    ),
    "skip",
  );
});
