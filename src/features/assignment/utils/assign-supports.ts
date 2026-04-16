import { frappe } from "@/lib/api/frappe-client";
import { moveSupportFile } from "@/lib/file-ops/move-support";
import { toFrappeDatetime } from "@/lib/utils";
import { SUPPORT_STATUS } from "@/features/batches/types";
import type { Support } from "@/features/batches/types";
import type { Actionee } from "@/features/assignment/types";

interface AssignResult {
  succeeded: string[];
  failed: { supportTagId: string; error: string }[];
}

/** Assign one or more supports to a single actionee. Updates Frappe + moves files. */
export async function assignSupports(
  supports: Support[],
  actionee: Actionee,
  batchFolderPath: string,
): Promise<AssignResult> {
  const succeeded: string[] = [];
  const failed: AssignResult["failed"] = [];

  for (const support of supports) {
    try {
      const newFilePath = await moveSupportFile(
        support.filePath,
        batchFolderPath,
        actionee.fullName,
      );

      await frappe.updateDoc("Support", support.name, {
        status: SUPPORT_STATUS.IN_PROGRESS,
        assignedTo: actionee.name,
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
