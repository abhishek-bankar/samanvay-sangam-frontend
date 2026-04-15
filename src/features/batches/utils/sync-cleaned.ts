import { readDir } from "@tauri-apps/plugin-fs";
import { frappe } from "@/lib/api/frappe-client";
import { toFrappeDatetime } from "@/lib/utils";
import { BATCH_STATUS, SUPPORT_STATUS } from "@/features/batches/types";
import type { Support } from "@/features/batches/types";

interface SyncResult {
  matched: { supportTagId: string; filePath: string }[];
  unmatched: string[];
}

export async function syncCleaned(batchFolderPath: string, batchId: string): Promise<SyncResult> {
  const cleanedPath = `${batchFolderPath}\\03_cleaned`;

  const entries = await readDir(cleanedPath);
  const dwgFiles = entries
    .filter((e) => e.name?.toLowerCase().endsWith(".dwg"))
    .map((e) => ({
      nameWithoutExt: (e.name ?? "").replace(/\.dwg$/i, ""),
      fullPath: `${cleanedPath}\\${e.name}`,
    }));

  if (dwgFiles.length === 0) {
    throw new Error("No DWG files found in 03_cleaned folder");
  }

  const supportsResponse = await frappe.getList<Support>("Support", {
    fields: ["name", "support_tag_id", "status"],
    filters: [["batch_id", "=", batchId]],
    limit: 500,
  });

  const supportMap = new Map(
    supportsResponse.data.map((s) => [s.supportTagId, s.name]),
  );

  const matched: SyncResult["matched"] = [];
  const unmatched: string[] = [];

  for (const dwg of dwgFiles) {
    const supportName = supportMap.get(dwg.nameWithoutExt);
    if (supportName) {
      matched.push({ supportTagId: dwg.nameWithoutExt, filePath: dwg.fullPath });
    } else {
      unmatched.push(dwg.nameWithoutExt);
    }
  }

  // Update matched supports
  for (const match of matched) {
    const supportName = supportMap.get(match.supportTagId);
    if (supportName) {
      await frappe.updateDoc("Support", supportName, {
        status: SUPPORT_STATUS.READY_TO_ASSIGN,
        filePath: match.filePath,
      });
    }
  }

  // Update batch with sync counts and status
  const totalSupports = supportsResponse.data.length;
  const syncedCount = matched.length;
  const unsyncedCount = totalSupports - syncedCount;
  const batchStatus = syncedCount === totalSupports
    ? BATCH_STATUS.SYNCED
    : BATCH_STATUS.PARTIALLY_SYNCED;

  await frappe.updateDoc("Batch", batchId, {
    syncedCount,
    unsyncedCount,
    lastSyncedAt: toFrappeDatetime(new Date()),
    status: batchStatus,
  });

  return { matched, unmatched };
}
