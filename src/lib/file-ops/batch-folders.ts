import { mkdir } from "@tauri-apps/plugin-fs";

const BATCH_SUBFOLDERS = [
  "01_input",
  "02_extracted",
  "03_cleaned",
  "04_assigned",
  "04a_rejected_pool",
  "05_submitted",
  "06_sme_review",
  "07_approved",
  "08_client_review",
  "09_client_final",
] as const;

function generateBatchFolderName(batchName: string): string {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).slice(2, 6);
  const safeName = batchName.replaceAll(/[^\dA-Za-z-]/g, "-");
  return `${date}_${safeName}_${suffix}`;
}

export async function createBatchFolders(projectFolderPath: string, batchName: string): Promise<string> {
  const folderName = generateBatchFolderName(batchName);
  const batchPath = `${projectFolderPath}\\${folderName}`;

  await mkdir(batchPath, { recursive: true });

  for (const subfolder of BATCH_SUBFOLDERS) {
    await mkdir(`${batchPath}\\${subfolder}`, { recursive: true });
  }

  return batchPath;
}

export { BATCH_SUBFOLDERS };
