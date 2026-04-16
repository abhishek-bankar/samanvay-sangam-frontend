import { frappe } from "@/lib/api/frappe-client";
import { moveSupportFile } from "@/lib/file-ops/move-support";
import { toFrappeDatetime } from "@/lib/utils";
import type { Support } from "@/features/batches/types";
import type { Actionee } from "@/features/assignment/types";

interface ReassignResult {
  succeeded: string[];
  failed: { supportTagId: string; error: string }[];
}

/** Reassign supports to a different actionee. Status stays In Progress. */
export async function reassignSupports(
  supports: Support[],
  newActionee: Actionee,
  batchFolderPath: string,
): Promise<ReassignResult> {
  const succeeded: string[] = [];
  const failed: ReassignResult["failed"] = [];

  for (const support of supports) {
    try {
      const newFilePath = await moveSupportFile(
        support.filePath,
        batchFolderPath,
        newActionee.fullName,
      );

      await frappe.updateDoc("Support", support.name, {
        assignedTo: newActionee.name,
        assignedAt: toFrappeDatetime(new Date()),
        filePath: newFilePath,
      });

      succeeded.push(support.supportTagId);
    } catch (err) {
      failed.push({
        supportTagId: support.supportTagId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { succeeded, failed };
}
