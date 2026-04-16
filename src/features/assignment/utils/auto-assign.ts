import { assignSupports } from "@/features/assignment/utils/assign-supports";
import type { Support } from "@/features/batches/types";
import type { Actionee } from "@/features/assignment/types";

interface AutoAssignResult {
  assignments: { actionee: string; count: number }[];
  failed: { supportTagId: string; error: string }[];
}

/** Distribute supports equally among actionees using round-robin, then assign. */
export async function autoAssignSupports(
  supports: Support[],
  actionees: Actionee[],
  batchFolderPath: string,
): Promise<AutoAssignResult> {
  // Round-robin distribution
  const buckets: Support[][] = Array.from({ length: actionees.length }, () => []);
  for (const [i, support] of supports.entries()) {
    buckets[i % actionees.length].push(support);
  }

  const assignments: AutoAssignResult["assignments"] = [];
  const allFailed: AutoAssignResult["failed"] = [];

  for (const [i, actionee] of actionees.entries()) {
    if (buckets[i].length === 0) continue;

    const result = await assignSupports(buckets[i], actionee, batchFolderPath);
    assignments.push({ actionee: actionee.fullName, count: result.succeeded.length });
    allFailed.push(...result.failed);
  }

  return { assignments, failed: allFailed };
}
