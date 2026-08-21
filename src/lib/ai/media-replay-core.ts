export type MediaBatchOptions = {
  userId: string;
  batchId: string;
  now: number;
  ttlMs?: number;
  maxBatches?: number;
};

export class MediaBatchReplayError extends Error {
  readonly status = 409;
  readonly code = "MEDIA_BATCH_REPLAYED";

  constructor() {
    super("This media batch was already submitted. Confirm a new batch.");
    this.name = "MediaBatchReplayError";
  }
}

export class MediaBatchReservationError extends Error {
  readonly status = 503;
  readonly code = "MEDIA_BATCH_RESERVATION_UNCERTAIN";

  constructor(message = "The media batch could not be reserved reliably.", options?: ErrorOptions) {
    super(message, options);
    this.name = "MediaBatchReservationError";
  }
}

export type MediaBatchSql = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

export type DurableMediaBatchOptions = {
  subjectHash: string;
  batchId: string;
  reservationId: string;
  ttlMs?: number;
};

const RESERVE_SQL = `
insert into media_batch_reservation (
  subject_hash, batch_id, reservation_id, expires_at
) values (
  $1, $2::uuid, $3::uuid, CURRENT_TIMESTAMP + ($4 * interval '1 millisecond')
)
on conflict (subject_hash, batch_id) do update
  set reservation_id = excluded.reservation_id,
      expires_at = excluded.expires_at,
      created_at = CURRENT_TIMESTAMP
  where media_batch_reservation.expires_at <= CURRENT_TIMESTAMP
returning reservation_id::text as reservation_id
`;

const RELEASE_SQL = `
delete from media_batch_reservation
where subject_hash = $1 and batch_id = $2::uuid and reservation_id = $3::uuid
`;

const CLEANUP_SQL = `
delete from media_batch_reservation
where expires_at <= CURRENT_TIMESTAMP and reservation_id <> $1::uuid
`;

/**
 * Atomically reserve a batch in shared storage before charging local quota.
 * A quota rejection releases only this lease; a failed release is surfaced as
 * uncertain so the client never retries a possibly consumed batch.
 */
export async function consumeDurableMediaBatchOnce(
  sql: MediaBatchSql,
  options: DurableMediaBatchOptions,
  charge: () => void,
): Promise<void> {
  const subjectHash = options.subjectHash.trim();
  const batchId = options.batchId.trim();
  const reservationId = options.reservationId.trim();
  const ttlMs = positiveInteger(options.ttlMs ?? 2 * 60 * 60_000, "ttlMs");
  if (!/^[0-9a-f]{64}$/.test(subjectHash)) throw new Error("subjectHash must be SHA-256 hex");
  if (!batchId || !reservationId) throw new Error("batchId and reservationId are required");

  let rows: Array<{ reservation_id: string }>;
  try {
    rows = await sql.query<{ reservation_id: string }>(RESERVE_SQL, [
      subjectHash,
      batchId,
      reservationId,
      ttlMs,
    ]);
  } catch (cause) {
    throw new MediaBatchReservationError(
      "The media batch could not be reserved in shared storage.",
      { cause },
    );
  }
  if (rows[0]?.reservation_id !== reservationId) throw new MediaBatchReplayError();

  try {
    charge();
  } catch (error) {
    try {
      await sql.query(RELEASE_SQL, [subjectHash, batchId, reservationId]);
    } catch (releaseError) {
      throw new MediaBatchReservationError(
        "The request quota was rejected, but the media reservation could not be released reliably.",
        { cause: releaseError },
      );
    }
    throw error;
  }

  // Keep cleanup separate from the upsert: sibling data-modifying CTEs that
  // touch the same row have undefined execution order in PostgreSQL.
  await sql.query(CLEANUP_SQL, [reservationId]).catch(() => undefined);
}

/**
 * Reserve one media batch and synchronously charge its request budget.
 *
 * The reservation is installed before `charge` runs, so a re-entrant duplicate
 * cannot pass the replay check. If the charge is rejected, only this exact
 * reservation is rolled back, allowing the user to retry after quota reset.
 * Keep `charge` synchronous: there must be no await-sized gap between the replay
 * decision and the quota decision.
 */
export function consumeMediaBatchOnce(
  batches: Map<string, number>,
  options: MediaBatchOptions,
  charge: () => void,
): void {
  const now = finiteTimestamp(options.now, "now");
  const ttlMs = positiveInteger(options.ttlMs ?? 2 * 60 * 60_000, "ttlMs");
  const maxBatches = positiveInteger(options.maxBatches ?? 2_000, "maxBatches");
  const userId = options.userId.trim();
  const batchId = options.batchId.trim();
  if (!userId || !batchId) throw new Error("userId and batchId are required");

  const key = `${userId.slice(0, 160)}:${batchId}`;
  const prior = batches.get(key);
  if (prior !== undefined && prior > now) throw new MediaBatchReplayError();
  // Map#set does not refresh insertion order for an expired existing key.
  if (prior !== undefined) batches.delete(key);

  const expiresAt = now + ttlMs;
  batches.set(key, expiresAt);
  try {
    charge();
  } catch (error) {
    // Do not remove a hypothetical newer lease for this key.
    if (batches.get(key) === expiresAt) batches.delete(key);
    throw error;
  }

  if (batches.size <= maxBatches) return;
  for (const [entry, expiry] of batches) {
    if (expiry <= now) batches.delete(entry);
  }
  while (batches.size > maxBatches) {
    const oldest = batches.keys().next().value as string | undefined;
    if (!oldest) break;
    batches.delete(oldest);
  }
}

function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`${name} must be a positive integer`);
  return value;
}

function finiteTimestamp(value: number, name: string): number {
  if (!Number.isFinite(value)) throw new Error(`${name} must be finite`);
  return value;
}
