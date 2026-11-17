import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Rank } from "./negotiate";
import { safeBrowserStorage, safeJsonStorage, syncPersistedAcrossTabs } from "./persist";

export type Side = "a" | "b";
type Field = { value: string | null; revision: number };
type Data = {
  fields: Record<string, Field>;
  names: Record<Side, string>;
  answers: Record<Side, Record<string, Rank>>;
  notes: Record<Side, { health: string; aftercare: string }>;
};
type State = Data & {
  setNote: (side: Side, key: "health" | "aftercare", text: string) => void;
  setName: (side: Side, name: string) => void;
  setAnswer: (side: Side, id: string, rank: Rank) => void;
  clearSide: (side: Side) => void;
};

const KEY = "knotty-boundaries";
const SIDES = ["a", "b"] as const;

function fieldsOf(data?: Partial<Data>): Record<string, Field> {
  if (data?.fields) return data.fields;
  const fields: Record<string, Field> = {};
  for (const side of SIDES) {
    if (typeof data?.names?.[side] === "string") fields[`${side}:name`] = { value: data.names[side], revision: 0 };
    for (const key of ["health", "aftercare"] as const) {
      const value = data?.notes?.[side]?.[key];
      if (typeof value === "string") fields[`${side}:note:${key}`] = { value, revision: 0 };
    }
    for (const [id, value] of Object.entries(data?.answers?.[side] ?? {})) {
      fields[`${side}:answer:${id}`] = { value, revision: 0 };
    }
  }
  return fields;
}

function mergeData(incoming?: Partial<Data>, stored?: Partial<Data>): Data {
  const fields = { ...fieldsOf(incoming) };
  for (const [key, field] of Object.entries(fieldsOf(stored))) {
    if (!fields[key] || field.revision >= fields[key].revision) fields[key] = field;
  }
  const data: Data = {
    fields,
    names: { a: "Partner A", b: "Partner B" },
    answers: { a: {}, b: {} },
    notes: { a: { health: "", aftercare: "" }, b: { health: "", aftercare: "" } },
  };
  for (const side of SIDES) {
    data.names[side] = fields[`${side}:name`]?.value ?? data.names[side];
    for (const key of ["health", "aftercare"] as const) data.notes[side][key] = fields[`${side}:note:${key}`]?.value ?? "";
    const clearedAt = fields[`${side}:clear`]?.revision ?? -1;
    const prefix = `${side}:answer:`;
    for (const [key, field] of Object.entries(fields)) {
      if (!key.startsWith(prefix)) continue;
      if (field.revision <= clearedAt) {
        fields[key] = { value: null, revision: clearedAt };
      } else if (field.value === "yes" || field.value === "maybe" || field.value === "no") {
        data.answers[side][key.slice(prefix.length)] = field.value;
      }
    }
  }
  return data;
}

function readStored(): Partial<Data> | undefined {
  try {
    return JSON.parse(safeBrowserStorage().getItem(KEY) ?? "null")?.state;
  } catch {
    return undefined;
  }
}

/** Each partner's private boundaries answers, kept only on this device. */
export function createBoundariesStore() {
  const base = safeJsonStorage<State>();
  let rehydrate = () => {};
  const store = create<State>()(
    persist(
      (set, get) => {
        const edit = (key: string, value: string | null) => {
          const latest = mergeData(get(), readStored());
          const revision = Math.max(Date.now(), ...Object.values(latest.fields).map((field) => field.revision + 1));
          set(mergeData({ fields: { ...latest.fields, [key]: { value, revision } } }));
        };
        return {
          ...mergeData(),
          setNote: (side, key, text) => edit(`${side}:note:${key}`, text.slice(0, 600)),
          setName: (side, name) => edit(`${side}:name`, name.slice(0, 40)),
          setAnswer: (side, id, rank) => edit(`${side}:answer:${id}`, rank),
          clearSide: (side) => edit(`${side}:clear`, null),
        };
      },
      {
        name: KEY,
        version: 1,
        migrate: (saved) => mergeData(saved as Partial<Data>) as State,
        merge: (saved, current) => ({ ...current, ...mergeData(current, saved as Partial<Data>) }),
        storage: {
          ...base,
          setItem: (key, value) => {
            const result = base.setItem(key, { ...value, state: { ...value.state, ...mergeData(value.state, readStored()) } });
            rehydrate();
            return result;
          },
        },
      },
    ),
  );
  rehydrate = () => { void store.persist.rehydrate(); };
  syncPersistedAcrossTabs(KEY, rehydrate);
  return store;
}

export const useBoundaries = createBoundariesStore();
