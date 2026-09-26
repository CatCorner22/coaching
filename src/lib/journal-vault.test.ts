import assert from "node:assert/strict";
import { test } from "node:test";
import {
  backupFilename,
  parseJournalBackup,
  serializeJournalBackup,
  summarizeImport,
} from "./journal-backup.ts";
import {
  decryptVault,
  encryptVault,
  parseVault,
  passphraseWarning,
  VAULT_FORMAT,
  VAULT_ITERATIONS,
  VaultError,
  vaultErrorMessage,
} from "./journal-vault.ts";

// 600k PBKDF2 rounds is ~1s per derivation by design, so the round-trip tests
// use a small shared vault rather than encrypting in every case.
const SECRET = "correct horse battery staple";
const PLAINTEXT = JSON.stringify({ notes: "a private note about a named partner" });

test("a vault round-trips and reveals nothing without the passphrase", async () => {
  const vault = await encryptVault(PLAINTEXT, SECRET);
  assert.equal(await decryptVault(vault, SECRET), PLAINTEXT);

  // The serialized file must not leak the plaintext in any field.
  const onDisk = JSON.stringify(vault);
  assert.doesNotMatch(onDisk, /named partner/);
  assert.doesNotMatch(onDisk, /private note/);
  assert.ok(!onDisk.includes(SECRET), "the passphrase must never be written to the file");
  assert.equal(vault.format, VAULT_FORMAT);
  assert.equal(vault.iterations, VAULT_ITERATIONS);
  // Round-trips through JSON, which is how it actually travels.
  assert.equal(await decryptVault(onDisk, SECRET), PLAINTEXT);
});

test("passphrase normalization makes canonically equivalent forms interchangeable", async () => {
  const composed = "café rope";
  const decomposed = "cafe\u0301 rope";
  const vault = await encryptVault(PLAINTEXT, composed);
  assert.equal(await decryptVault(vault, decomposed), PLAINTEXT);
});

test("decrypt accepts legacy exports derived from raw passphrase bytes", async () => {
  const passphrase = "ﬂower rope";
  const iterations = 100_000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const header = {
    format: VAULT_FORMAT,
    v: 1,
    kdf: "PBKDF2-SHA256" as const,
    iterations,
  };
  const headerBytes = new TextEncoder().encode(
    `${header.format}|${header.v}|${header.kdf}|${header.iterations}`,
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: headerBytes },
    key,
    new TextEncoder().encode(PLAINTEXT),
  );
  const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
  assert.equal(
    await decryptVault(
      {
        ...header,
        salt: encode(salt),
        iv: encode(iv),
        ciphertext: encode(new Uint8Array(ciphertext)),
      },
      passphrase,
    ),
    PLAINTEXT,
  );
});

test("a wrong passphrase fails closed rather than returning garbage", async () => {
  const vault = await encryptVault(PLAINTEXT, SECRET);
  for (const wrong of ["", "wrong", SECRET + " ", SECRET.toUpperCase(), " " + SECRET]) {
    await assert.rejects(
      () => decryptVault(vault, wrong),
      (e) => e instanceof VaultError && ["wrong_passphrase", "empty_passphrase"].includes(e.kind),
      `accepted: ${JSON.stringify(wrong)}`,
    );
  }
});

test("two exports of the same journal are not byte-identical", async () => {
  // A fixed salt would let someone with two backups tell they hold the same
  // notes, and a reused IV under one key breaks AES-GCM outright.
  const [a, b] = await Promise.all([
    encryptVault(PLAINTEXT, SECRET),
    encryptVault(PLAINTEXT, SECRET),
  ]);
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.ciphertext, b.ciphertext);
});

test("altering the file anywhere fails decryption", async () => {
  const vault = await encryptVault(PLAINTEXT, SECRET);

  // The iteration count sits outside the ciphertext, so it is bound in as
  // additional authenticated data. Without that, anyone holding the file could
  // rewrite 600000 down to 100000 and cheapen an offline guess.
  await assert.rejects(
    () => decryptVault({ ...vault, iterations: 100_000 }, SECRET),
    (e) => e instanceof VaultError && e.kind === "wrong_passphrase",
  );

  // Flipping a ciphertext byte is caught by the GCM tag.
  const bytes = atob(vault.ciphertext);
  const flipped = String.fromCharCode(bytes.charCodeAt(0) ^ 0xff) + bytes.slice(1);
  await assert.rejects(
    () => decryptVault({ ...vault, ciphertext: btoa(flipped) }, SECRET),
    (e) => e instanceof VaultError && e.kind === "wrong_passphrase",
  );

  // A swapped salt or IV likewise.
  const other = await encryptVault("something else", SECRET);
  await assert.rejects(() => decryptVault({ ...vault, salt: other.salt }, SECRET), VaultError);
  await assert.rejects(() => decryptVault({ ...vault, iv: other.iv }, SECRET), VaultError);
});

test("a non-vault file is rejected as malformed, not as a wrong passphrase", () => {
  // The distinction is the whole point: "wrong passphrase" on a holiday photo
  // sends someone hunting for a passphrase that never existed.
  for (const bad of [
    "",
    "not json",
    "[]",
    "null",
    "42",
    '{"format":"something-else"}',
    {},
    [],
    null,
  ]) {
    assert.throws(
      () => parseVault(bad),
      (e) => e instanceof VaultError && e.kind === "malformed",
      JSON.stringify(bad),
    );
  }
  // Structurally a vault, but missing a field.
  assert.throws(
    () =>
      parseVault({
        format: VAULT_FORMAT,
        v: 1,
        kdf: "PBKDF2-SHA256",
        iterations: 600_000,
        salt: "a",
        iv: "b",
      }),
    (e) => e instanceof VaultError && e.kind === "malformed",
  );
});

test("a newer or hostile vault header is refused before any work is done", () => {
  const base = {
    format: VAULT_FORMAT,
    v: 1,
    kdf: "PBKDF2-SHA256",
    iterations: VAULT_ITERATIONS,
    salt: "AAAA",
    iv: "AAAA",
    ciphertext: "AAAA",
  };
  assert.doesNotThrow(() => parseVault(base));
  assert.throws(
    () => parseVault({ ...base, v: 99 }),
    (e) => e instanceof VaultError && e.kind === "unsupported",
  );
  assert.throws(
    () => parseVault({ ...base, kdf: "MD5" }),
    (e) => e instanceof VaultError && e.kind === "unsupported",
  );
  // A downgrade, and a denial-of-service on the importing device.
  for (const iterations of [1, 1_000, 99_999, 50_000_000, 1.5, Number.NaN, "600000"]) {
    assert.throws(
      () => parseVault({ ...base, iterations }),
      (e) => e instanceof VaultError && e.kind === "unsupported",
      String(iterations),
    );
  }
});

test("a context without WebCrypto says so instead of failing obscurely", async () => {
  // The shape that actually occurs: on an insecure origin `crypto` exists and
  // `crypto.subtle` is undefined. Passing `undefined` here would select the
  // default parameter — i.e. the real one — so it cannot express this case.
  const noCrypto = [
    {},
    { getRandomValues: <T>(a: T) => a },
    { subtle: {} as SubtleCrypto },
    { subtle: {} as SubtleCrypto, getRandomValues: <T>(a: T) => a },
  ];
  for (const host of noCrypto) {
    await assert.rejects(
      () => encryptVault(PLAINTEXT, SECRET, host),
      (e) => e instanceof VaultError && e.kind === "unavailable",
      JSON.stringify(Object.keys(host)),
    );
    await assert.rejects(
      () =>
        decryptVault(
          {
            format: VAULT_FORMAT,
            v: 1,
            kdf: "PBKDF2-SHA256",
            iterations: VAULT_ITERATIONS,
            salt: "AAAA",
            iv: "AAAA",
            ciphertext: "AAAA",
          },
          SECRET,
          host,
        ),
      (e) => e instanceof VaultError && e.kind === "unavailable",
    );
  }
  assert.match(
    vaultErrorMessage(new VaultError("unavailable", "x")),
    /secure context \(HTTPS, or localhost\)/,
  );
});

test("every failure has wording that tells the reader what to do", () => {
  const kinds = [
    "malformed",
    "unsupported",
    "wrong_passphrase",
    "unavailable",
    "empty_passphrase",
  ] as const;
  const seen = new Set<string>();
  for (const kind of kinds) {
    const message = vaultErrorMessage(new VaultError(kind, "internal"));
    assert.ok(message.length > 20, kind);
    assert.ok(!message.includes("internal"), `${kind} leaks the internal message`);
    seen.add(message);
  }
  assert.equal(seen.size, kinds.length, "two failures share wording");
  assert.equal(vaultErrorMessage(new Error("boom")), "The backup could not be read.");
});

test("the passphrase hint warns without ever blocking", () => {
  assert.equal(passphraseWarning(""), null);
  assert.equal(passphraseWarning("correct horse battery staple"), null);
  assert.match(passphraseWarning("short") ?? "", /guessable offline/);
  assert.match(passphraseWarning("1234567890123456") ?? "", /Digits only/);
});

test("a backup carries tombstones so deletions are not undone by a restore", () => {
  const now = 1_700_000_000_000;
  const entries = [{ id: "a", at: now, minutes: 1, notes: "kept" }] as never;
  const text = serializeJournalBackup(entries, ["gone"], now);
  const parsed = parseJournalBackup(text);
  assert.ok(parsed);
  assert.equal(parsed.entries.length, 1);
  assert.deepEqual(parsed.removedIds, ["gone"]);
  assert.equal(parsed.exportedAt, now);
});

test("a payload that is not a backup is null rather than a partial restore", () => {
  for (const bad of [
    "",
    "not json",
    "[]",
    "null",
    '{"format":"other"}',
    '{"format":"knotty-journal","v":9,"entries":[]}',
    '{"format":"knotty-journal","v":1}',
  ]) {
    assert.equal(parseJournalBackup(bad), null, bad);
  }
});

test("an import reports what it actually changed, and never resurrects a deletion", () => {
  const incoming = [{ id: "new" }, { id: "have" }, { id: "deleted" }, { id: "new" }, {}];
  const existing = [{ id: "have" }];
  const merged = [{ id: "have" }, { id: "new" }];
  const summary = summarizeImport(merged, incoming, existing, ["deleted"], []);
  // "new" counted once despite appearing twice; the id-less row is ignored.
  assert.deepEqual(summary, {
    added: 1,
    alreadyPresent: 1,
    skippedDeleted: 1,
    notKept: 0,
    displaced: 0,
    deletedByFile: 0,
  });

  // A tombstone from the *file* also applies, so restoring an old backup on top
  // of a newer one cannot bring back what the newer one deleted.
  assert.deepEqual(summarizeImport([], [{ id: "x" }], [], [], ["x"]), {
    added: 0,
    alreadyPresent: 0,
    skippedDeleted: 1,
    notKept: 0,
    displaced: 0,
    deletedByFile: 0,
  });

  // A file that records a local entry as deleted removes it, and the summary
  // says so instead of reporting only what it added.
  assert.deepEqual(
    summarizeImport([{ id: "new" }], [{ id: "new" }], [{ id: "shared" }], [], ["shared"]),
    {
      added: 1,
      alreadyPresent: 0,
      skippedDeleted: 0,
      notKept: 0,
      displaced: 0,
      deletedByFile: 1,
    },
  );
});

test("the import report reflects the cap: dropped imports and displaced entries are named", () => {
  // A full journal (the cap keeps newest-first) restores a backup of two old
  // entries: one fits, one does not, and one existing entry is pushed out.
  // The old pre-merge summary reported both as "added" and the displacement
  // not at all.
  const existing = [{ id: "e1" }, { id: "e2" }, { id: "e3" }];
  const incoming = [{ id: "b1" }, { id: "b2" }];
  const merged = [{ id: "e1" }, { id: "e2" }, { id: "b1" }];
  const summary = summarizeImport(merged, incoming, existing, [], []);
  assert.deepEqual(summary, {
    added: 1,
    alreadyPresent: 0,
    skippedDeleted: 0,
    notKept: 1,
    displaced: 1,
    deletedByFile: 0,
  });
});

test("the filename dates the backup and says nothing else about it", () => {
  assert.equal(backupFilename(Date.UTC(2026, 7, 23, 12)), "knotty-journal-2026-08-23.knotty");
  // A file sitting in a shared downloads folder must not describe its contents.
  assert.doesNotMatch(backupFilename(Date.now()), /rope|scene|journal-entry|bdsm/i);
  for (const bad of [0, -1, Number.NaN, Infinity]) {
    assert.match(backupFilename(bad), /^knotty-journal-[\d-]+\.knotty$|unknown/, String(bad));
  }
});
