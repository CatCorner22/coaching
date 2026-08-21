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
