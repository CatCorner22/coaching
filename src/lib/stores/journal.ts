import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isCameraDataUrl } from "@/lib/ml/sanitize";

export type JournalEntry = {
  id: string;
  at: number;
  tieSlug?: string;
  minutes: number;
  notes: string;
  rating: number;
  flags: string[];
  photoCount: number;
};

type JournalState = {
  entries: JournalEntry[];
  nerveHits: number;
  add: (e: Omit<JournalEntry, "id" | "at">) => string;
  remove: (id: string) => void;
};

export const useJournal = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      nerveHits: 0,
      add: (e) => {
        const id = crypto.randomUUID();
        const nerve = e.flags.some((f) => /nerve|radial|numb/i.test(f)) ? 1 : 0;
        set({
          entries: [{ id, at: Date.now(), ...e, notes: String(e.notes ?? "").slice(0, 400) }, ...get().entries].slice(0, 80),
          nerveHits: get().nerveHits + nerve,
        });
        return id;
      },
      remove: (id) => {
        void deleteStill(id);
        set({ entries: get().entries.filter((x) => x.id !== id) });
      },
    }),
    { name: "musubi-journal" },
  ),
);

const PHOTO_DB = "musubi-photos";

function openPhotos() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(PHOTO_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("stills");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveStill(entryId: string, dataUrl: string) {
  if (!isCameraDataUrl(dataUrl)) return;
  const db = await openPhotos();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("stills", "readwrite");
    tx.objectStore("stills").put(dataUrl, entryId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadStill(entryId: string): Promise<string | null> {
  const db = await openPhotos();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("stills", "readonly");
    const req = tx.objectStore("stills").get(entryId);
    req.onsuccess = () => {
      const v = req.result;
      resolve(typeof v === "string" && isCameraDataUrl(v) ? v : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteStill(entryId: string) {
  const db = await openPhotos();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("stills", "readwrite");
    tx.objectStore("stills").delete(entryId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
