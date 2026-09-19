/**
 * Passphrase-encrypted journal backups.
 *
 * The journal itself stays where it is — unencrypted in this browser's site
 * storage, which the Journal screen says plainly. This module is about the
 * *file*: an export lands in a downloads folder, and a downloads folder is
 * routinely synced to iCloud, Google Drive or a backup disk. Session notes
 * about a named partner should not travel as plaintext.
 *
 * What this protects: the exported file, against someone who has the file but
 * not the passphrase.
 *
 * What it does not protect: anything still in the browser, anything already
 * copied elsewhere, or a file whose passphrase is guessable. There is no
 * recovery — a lost passphrase is a lost backup, by design.
 */

export const VAULT_FORMAT = "knotty-journal-vault";
export const VAULT_VERSION = 1;
export const VAULT_KDF = "PBKDF2-SHA256";
/**
 * OWASP's PBKDF2-SHA256 floor. Roughly a second on a phone, which is a price
 * paid once per export or import and multiplies the cost of guessing.
 */
export const VAULT_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export type EncryptedVault = {
  format: typeof VAULT_FORMAT;
  v: number;
  kdf: typeof VAULT_KDF;
  iterations: number;
  /** Base64. Fresh per export, so two exports of the same journal differ. */
  salt: string;
  /** Base64. Fresh per export; reusing one with the same key breaks AES-GCM. */
  iv: string;
  ciphertext: string;
};

export type VaultErrorKind =
  /** Not a vault file at all, or structurally broken. */
  | "malformed"
  /** A vault from a newer version, or using parameters this build cannot honour. */
  | "unsupported"
  /** The passphrase is wrong, or the file was altered after it was written. */
  | "wrong_passphrase"
  /** No WebCrypto in this context — an insecure origin, or a stripped runtime. */
  | "unavailable"
  /** Refused before doing any work. */
  | "empty_passphrase";

export class VaultError extends Error {
  readonly kind: VaultErrorKind;
  constructor(kind: VaultErrorKind, message: string) {
    super(message);
    this.name = "VaultError";
    this.kind = kind;
  }
}

/** Human-facing wording for each failure, so the UI never invents its own. */
export function vaultErrorMessage(error: unknown): string {
  if (error instanceof VaultError) {
    switch (error.kind) {
      case "wrong_passphrase":
        return "That passphrase does not open this backup, or the file has been altered since it was written.";
      case "malformed":
        return "That file is not a Knotty journal backup.";
      case "unsupported":
        return "That backup was written by a newer version of the app than this one.";
      case "unavailable":
        return "This browser will not provide encryption here. Backups need a secure context (HTTPS, or localhost).";
      case "empty_passphrase":
        return "Enter a passphrase first. There is no recovery if you lose it.";
    }
  }
  return "The backup could not be read.";
}

type SubtleHost = { subtle?: SubtleCrypto; getRandomValues?: <T extends ArrayBufferView>(a: T) => T };

function requireCrypto(host: SubtleHost | undefined): Required<SubtleHost> {
  if (typeof host?.subtle?.importKey !== "function" || typeof host?.getRandomValues !== "function") {
    throw new VaultError("unavailable", "WebCrypto is not available in this context.");
  }
  return host as Required<SubtleHost>;
}

function toBase64(bytes: Uint8Array): string {
  // Chunked: String.fromCharCode(...bytes) blows the argument limit on a large
  // journal and throws RangeError rather than producing a wrong answer.
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  let binary: string;
  try {
    binary = atob(value);
  } catch {
    throw new VaultError("malformed", "A vault field is not valid base64.");
  }
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

/**
 * The header, bound into the ciphertext as additional authenticated data.
 *
 * Without this, the iteration count sits outside the authentication tag and can
 * be rewritten down to 1 by anyone holding the file — turning an expensive
 * offline guess into a cheap one. Tampering with it now fails decryption
 * outright.
 */
function headerBytes(vault: Pick<EncryptedVault, "format" | "v" | "kdf" | "iterations">): Uint8Array {
  return new TextEncoder().encode(
    `${vault.format}|${vault.v}|${vault.kdf}|${vault.iterations}`,
  );
}

async function deriveKey(
  crypto: Required<SubtleHost>,
  passphrase: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Encrypt UTF-8 text under a passphrase. */
export async function encryptVault(
  plaintext: string,
  passphrase: string,
  host: SubtleHost | undefined = globalThis.crypto as SubtleHost | undefined,
): Promise<EncryptedVault> {
  if (!passphrase) throw new VaultError("empty_passphrase", "A passphrase is required.");
  const crypto = requireCrypto(host);
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const header = {
    format: VAULT_FORMAT,
    v: VAULT_VERSION,
    kdf: VAULT_KDF,
    iterations: VAULT_ITERATIONS,
  } as const;
  const key = await deriveKey(crypto, passphrase, salt, header.iterations);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as unknown as BufferSource,
      additionalData: headerBytes(header) as unknown as BufferSource,
    },
    key,
    new TextEncoder().encode(plaintext),
  );
  return {
    ...header,
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertext)),
  };
}

/** Validate an untrusted value as a vault without attempting to decrypt it. */
export function parseVault(value: unknown): EncryptedVault {
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      throw new VaultError("malformed", "The file is not JSON.");
    }
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new VaultError("malformed", "The file is not an object.");
  }
  const v = raw as Partial<EncryptedVault>;
  if (v.format !== VAULT_FORMAT) {
    throw new VaultError("malformed", "Missing the Knotty journal backup marker.");
  }
  for (const field of ["salt", "iv", "ciphertext"] as const) {
    if (typeof v[field] !== "string" || v[field] === "") {
      throw new VaultError("malformed", `Missing ${field}.`);
    }
  }
  if (typeof v.v !== "number" || v.v > VAULT_VERSION) {
    throw new VaultError("unsupported", "Written by a newer version.");
  }
  if (v.kdf !== VAULT_KDF) throw new VaultError("unsupported", "Unknown key derivation.");
  // An absurd iteration count is a denial-of-service on the importing device,
  // and a tiny one is a downgrade attempt. Both are refused before deriving.
  if (
    typeof v.iterations !== "number" ||
    !Number.isInteger(v.iterations) ||
    v.iterations < 100_000 ||
    v.iterations > 5_000_000
  ) {
    throw new VaultError("unsupported", "Key-derivation cost is outside the supported range.");
  }
  return {
    format: VAULT_FORMAT,
    v: v.v,
    kdf: VAULT_KDF,
    iterations: v.iterations,
    salt: v.salt!,
    iv: v.iv!,
    ciphertext: v.ciphertext!,
  };
}

/** Decrypt a vault, or throw a `VaultError` explaining which way it failed. */
export async function decryptVault(
  value: unknown,
  passphrase: string,
  host: SubtleHost | undefined = globalThis.crypto as SubtleHost | undefined,
): Promise<string> {
  if (!passphrase) throw new VaultError("empty_passphrase", "A passphrase is required.");
  const vault = parseVault(value);
  const crypto = requireCrypto(host);
  // Decoded before the catch below, which speaks only for a failed
  // authentication tag: a file damaged in transit used to be reported as a
  // wrong passphrase, sending people hunting for a passphrase that was right.
  const iv = fromBase64(vault.iv);
  const ciphertext = fromBase64(vault.ciphertext);
  const key = await deriveKey(crypto, passphrase, fromBase64(vault.salt), vault.iterations);
  let plaintext: ArrayBuffer;
  try {
    plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as unknown as BufferSource,
        additionalData: headerBytes(vault) as unknown as BufferSource,
      },
      key,
      ciphertext as unknown as BufferSource,
    );
  } catch {
    // AES-GCM cannot tell a wrong key from an altered file: both are a failed
    // authentication tag, and the message says so rather than picking one.
    throw new VaultError("wrong_passphrase", "Authentication failed.");
  }
  return new TextDecoder().decode(plaintext);
}

/**
 * Advisory only — never blocks an export.
 *
 * A refused passphrase gets replaced with a memorable weak one, so this warns
 * and gets out of the way.
 */
export function passphraseWarning(passphrase: string): string | null {
  if (passphrase.length === 0) return null;
  if (passphrase.length < 12) {
    return "Short passphrases are guessable offline once someone has the file. Four unrelated words beat one clever substitution.";
  }
  if (/^\d+$/.test(passphrase)) {
    return "Digits only. Four unrelated words are far harder to guess than any number of this length.";
  }
  return null;
}
