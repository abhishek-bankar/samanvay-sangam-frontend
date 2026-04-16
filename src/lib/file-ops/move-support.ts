import { mkdir, rename } from "@tauri-apps/plugin-fs";

/** Convert a full name to a safe folder name: lowercase, special chars → underscores. */
export function toFolderName(fullName: string): string {
  return fullName
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, "_")
    .replaceAll(/^_|_$/g, "");
}

/** Move a DWG file to the actionee's assigned folder. Creates the folder if needed. */
export async function moveSupportFile(
  currentFilePath: string,
  batchFolderPath: string,
  actioneeFullName: string,
): Promise<string> {
  const actioneeFolder = toFolderName(actioneeFullName);
  const destDir = `${batchFolderPath}\\04_assigned\\${actioneeFolder}`;
  await mkdir(destDir, { recursive: true });

  const fileName = currentFilePath.split("\\").pop()!;
  const destPath = `${destDir}\\${fileName}`;
  await rename(currentFilePath, destPath);

  return destPath;
}
