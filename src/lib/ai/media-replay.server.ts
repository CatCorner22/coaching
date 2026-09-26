import { createHash, randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { consumeDurableMediaBatchOnce, releaseDurableMediaBatch } from "./media-replay-core";

/** Reserve one verified user's batch across every production replica. */
export async function consumeMediaBatch(
  userId: string,
  batchId: string,
  charge: () => void,
): Promise<string> {
  const subjectHash = createHash("sha256").update(userId.trim(), "utf8").digest("hex");
  const sql = await getSql();
  return consumeDurableMediaBatchOnce(
    sql,
    { subjectHash, batchId, reservationId: randomUUID() },
    charge,
  );
}

export async function releaseMediaBatch(
  userId: string,
  batchId: string,
  reservationId: string,
): Promise<void> {
  const subjectHash = createHash("sha256").update(userId.trim(), "utf8").digest("hex");
  const sql = await getSql();
  await releaseDurableMediaBatch(sql, { subjectHash, batchId, reservationId });
}
