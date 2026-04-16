import { mkdir, rename } from "@tauri-apps/plugin-fs";
import { toFolderName } from "@/lib/file-ops/move-support";

/** Move a DWG file from 04_assigned to 05_submitted. Creates the folder if needed. */
export async function submitSupportFile(
  currentFilePath: string,
  batchFolderPath: string,
  actioneeFullName: string,
): Promise<string> {
  const actioneeFolder = toFolderName(actioneeFullName);
  const destDir = `${batchFolderPath}\\05_submitted\\${actioneeFolder}`;
  await mkdir(destDir, { recursive: true });

  const fileName = currentFilePath.split("\\").pop()!;
  const destPath = `${destDir}\\${fileName}`;
  await rename(currentFilePath, destPath);

  return destPath;
}
