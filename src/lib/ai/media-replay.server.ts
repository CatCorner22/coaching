import { createHash, randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { consumeDurableMediaBatchOnce } from "./media-replay-core";

/** Reserve one verified user's batch across every production replica. */
export async function consumeMediaBatch(
  userId: string,
  batchId: string,
  charge: () => void,
): Promise<void> {
  const subjectHash = createHash("sha256").update(userId.trim(), "utf8").digest("hex");
  const sql = await getSql();
  await consumeDurableMediaBatchOnce(
    sql,
    { subjectHash, batchId, reservationId: randomUUID() },
    charge,
  );
}
