import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { backupFilename, parseJournalBackup, serializeJournalBackup } from "@/lib/journal-backup";
import {
  decryptVault,
  encryptVault,
  passphraseWarning,
  vaultErrorMessage,
} from "@/lib/journal-vault";
import { useJournal } from "@/lib/stores/journal";

type Status = { tone: "ok" | "error"; message: string } | null;

/**
 * Encrypted export and restore for the journal.
 *
 * The journal stays unencrypted in site storage — that is stated on this
 * screen and is a separate question. This is about the *file*: an export lands
 * in a downloads folder, and downloads folders are routinely synced to cloud
 * storage. Session notes about a named partner should not travel as plaintext.
 *
 * There is no recovery. A lost passphrase is a lost backup, and the copy says
 * so before the first export rather than after.
 */
export function JournalBackupPanel() {
  const entries = useJournal((s) => s.entries);
  const removedIds = useJournal((s) => s.removedIds);
  const importEntries = useJournal((s) => s.importEntries);

  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const passphraseId = useId();
  const warning = passphraseWarning(passphrase);

  async function runExport() {
    setStatus(null);
    setBusy("export");
    try {
      const now = Date.now();
      const vault = await encryptVault(
        serializeJournalBackup(entries, removedIds, now),
        passphrase,
      );
      const blob = new Blob([JSON.stringify(vault)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backupFilename(now);
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus({
        tone: "ok",
        message: `Saved ${entries.length} ${entries.length === 1 ? "entry" : "entries"} to ${a.download}. Without that passphrase the file cannot be opened, by you or anyone else.`,
      });
    } catch (error) {
      setStatus({ tone: "error", message: vaultErrorMessage(error) });
    } finally {
      setBusy(null);
    }
  }

  async function runImport(file: File) {
    setStatus(null);
    setBusy("import");
    try {
      const text = await decryptVault(await file.text(), passphrase);
      const backup = parseJournalBackup(text);
      if (!backup) {
        setStatus({
          tone: "error",
          message: "That file decrypted, but it is not a journal backup.",
        });
        return;
      }
      const { added, alreadyPresent, skippedDeleted, notKept, displaced } = importEntries(
        backup.entries,
        backup.removedIds,
      );
      const parts = [`Added ${added}.`];
      if (alreadyPresent > 0) parts.push(`${alreadyPresent} already here.`);
      if (skippedDeleted > 0) parts.push(`${skippedDeleted} left deleted.`);
      if (notKept > 0) parts.push(`${notKept} did not fit the 80-entry journal.`);
      if (displaced > 0) parts.push(`${displaced} oldest made room.`);
      setStatus({ tone: "ok", message: parts.join(" ") });
    } catch (error) {
      setStatus({ tone: "error", message: vaultErrorMessage(error) });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-border bg-surface p-4">
      <h2 className="text-sm font-medium text-fg">Encrypted backup</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Exports the journal as a single passphrase-encrypted file, so a backup sitting in a
        downloads folder or synced to cloud storage is not readable plaintext. Restoring merges
        into what is already here and never deletes anything; entries you have deleted stay
        deleted. This does not encrypt the journal inside this browser, which stays as described
        above. <strong className="text-fg">There is no recovery.</strong> Lose the passphrase and
        the file is gone.
      </p>

      <label htmlFor={passphraseId} className="mt-4 block text-xs uppercase tracking-wide text-subtle">
        Passphrase
      </label>
      <input
        id={passphraseId}
        type="password"
        autoComplete="off"
        spellCheck={false}
        className="mt-1 h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm"
        placeholder="Four unrelated words work well"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
      />
      {warning && (
        <p className="mt-2 text-xs text-warn" role="status">
          {warning}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={busy !== null || passphrase === "" || entries.length === 0}
          onClick={() => void runExport()}
        >
          {busy === "export" ? "Encrypting…" : "Export encrypted backup"}
        </Button>
        <Button
          variant="outline"
          disabled={busy !== null || passphrase === ""}
          onClick={() => fileRef.current?.click()}
        >
          {busy === "import" ? "Decrypting…" : "Restore from backup"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".knotty,application/json"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void runImport(file);
          }}
        />
      </div>
      {entries.length === 0 && (
        <p className="mt-2 text-xs text-subtle">Nothing to export yet. Restore still works.</p>
      )}
      {passphrase === "" && (
        <p className="mt-2 text-xs text-subtle">Enter a passphrase to enable both.</p>
      )}

      {/* Always mounted so the live region exists before its content changes:
          announcing from a region inserted at the same moment is unreliable. */}
      <div role="status" aria-live="polite" className="mt-2 empty:hidden">
        {status && (
          <p className={status.tone === "error" ? "text-xs text-danger-text" : "text-xs text-ok"}>
            {status.message}
          </p>
        )}
      </div>
    </section>
  );
}
