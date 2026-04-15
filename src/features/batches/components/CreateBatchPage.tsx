import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { copyFile } from "@tauri-apps/plugin-fs";
import { config } from "@/lib/config";
import { frappe } from "@/lib/api/frappe-client";
import { useProject } from "@/features/projects/project-context";
import { useCreateBatch, useUpdateBatch } from "@/features/batches/hooks/useBatches";
import { createBatchFolders } from "@/lib/file-ops/batch-folders";
import { parseSupportExcel } from "@/features/batches/utils/excel-parser";
import { BatchFormView } from "@/features/batches/components/BatchFormView";
import { BatchDoneView } from "@/features/batches/components/BatchDoneView";
import { BatchProcessingView } from "@/features/batches/components/BatchProcessingView";
import { BATCH_STATUS, SUPPORT_STATUS } from "@/features/batches/types";
import type { ParsedSupportRow } from "@/features/batches/types";

type Step = "form" | "processing" | "done";

function getFileName(filePath: string): string {
  return filePath.split("\\").pop() ?? filePath.split("/").pop() ?? filePath;
}

async function createSupportRecord(batchId: string, row: ParsedSupportRow) {
  await frappe.createDoc("Support", {
    supportTagId: row.supportTagId,
    batchId,
    drawingNo: row.drawingNo,
    revision: row.revision,
    level: row.level,
    presentStatus: row.presentStatus,
    remarks: row.remarks,
    status: SUPPORT_STATUS.NEW,
    revisionNumber: 0,
  });
}

export function CreateBatchPage() {
  const [batchName, setBatchName] = useState("");
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [excelPath, setExcelPath] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedSupportRow[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>("form");
  const [progressStep, setProgressStep] = useState("");
  const [progressDetail, setProgressDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [createdCount, setCreatedCount] = useState(0);

  const { selectedProject } = useProject();
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();

  async function pickModelFile() {
    const path = await open({
      title: "Select Navisworks Model",
      filters: [{ name: "Navisworks", extensions: ["nwd", "nwf"] }],
    });
    if (path) setModelPath(path);
  }

  async function pickAndValidateExcel() {
    const path = await open({
      title: "Select Support Excel",
      filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }],
    });
    if (!path) return;

    setExcelPath(path);
    setExcelError(null);
    setParsedRows([]);
    setDuplicates([]);

    try {
      const result = await parseSupportExcel(path);
      setParsedRows(result.rows);
      if (result.duplicates.length > 0) {
        setDuplicates(result.duplicates);
      }
    } catch (err) {
      setExcelError(err instanceof Error ? err.message : String(err));
      setExcelPath(null);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProject || !excelPath || !modelPath) return;

    setError(null);
    setCurrentStep("processing");

    try {
      await processBatchCreation(excelPath, modelPath);
      setCurrentStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setCurrentStep("form");
    }
  }

  async function processBatchCreation(excel: string, model: string) {
    if (!selectedProject) return;

    setProgressStep("Creating batch");
    setProgressDetail("Saving to Frappe...");
    const batchDoc = (await createBatch.mutateAsync({
      batchName,
      projectId: selectedProject.name,
    })).data;

    setProgressStep("Creating folders");
    setProgressDetail("Creating subfolders...");
    const projectFolder = selectedProject.folderPath || `${config.driveRoot}\\${selectedProject.projectName}`;
    const batchFolderPath = await createBatchFolders(projectFolder, batchName);

    setProgressStep("Copying files");
    setProgressDetail("Copying to 01_input...");
    await copyFile(model, `${batchFolderPath}\\01_input\\${getFileName(model)}`);
    await copyFile(excel, `${batchFolderPath}\\01_input\\${getFileName(excel)}`);

    setProgressStep("Creating supports");
    let created = 0;
    for (const row of parsedRows) {
      await createSupportRecord(batchDoc.name, row);
      created++;
      setProgressDetail(`${created} / ${parsedRows.length}`);
    }
    setCreatedCount(created);

    setProgressStep("Finalizing");
    setProgressDetail("Updating batch...");
    await updateBatch.mutateAsync({
      name: batchDoc.name,
      data: {
        folderPath: batchFolderPath,
        excelFilePath: `${batchFolderPath}\\01_input\\${getFileName(excel)}`,
        modelFilePath: `${batchFolderPath}\\01_input\\${getFileName(model)}`,
        supportCount: created,
        status: BATCH_STATUS.NEW,
      },
    });
  }

  if (!selectedProject) {
    return <p className="py-8 text-center text-muted-foreground">Select a project first.</p>;
  }

  if (currentStep === "done") {
    return <BatchDoneView batchName={batchName} createdCount={createdCount} duplicates={duplicates} />;
  }

  if (currentStep === "processing") {
    return <BatchProcessingView step={progressStep} detail={progressDetail} />;
  }

  return (
    <BatchFormView
      batchName={batchName}
      onBatchNameChange={setBatchName}
      modelPath={modelPath}
      onPickModel={pickModelFile}
      excelPath={excelPath}
      onPickExcel={pickAndValidateExcel}
      excelError={excelError}
      parsedRows={parsedRows}
      duplicates={duplicates}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
