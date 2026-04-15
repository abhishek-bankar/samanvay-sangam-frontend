import * as XLSX from "xlsx";
import { readFile } from "@tauri-apps/plugin-fs";
import type { ParsedSupportRow } from "@/features/batches/types";

const EXPECTED_HEADERS = [
  "SL.NO",
  "SUPPORT No.",
  "DRAWING No.",
  "REVISION",
  "LEVEL",
  "PRESENT STATUS",
  "REMARKS",
] as const;

interface ParseResult {
  rows: ParsedSupportRow[];
  duplicates: string[];
  totalRows: number;
}

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return "";
}

function validateHeaders(headerRow: unknown[]) {
  for (const [index, expected] of EXPECTED_HEADERS.entries()) {
    const actual = cellToString(headerRow[index]);
    if (actual.toUpperCase() !== expected.toUpperCase()) {
      throw new Error(`Column ${index + 1} expected "${expected}" but found "${actual}"`);
    }
  }
}

function parseRow(row: unknown[]): ParsedSupportRow | null {
  const supportTagId = cellToString(row[1]);
  if (!supportTagId) return null;

  return {
    supportTagId,
    drawingNo: cellToString(row[2]),
    revision: cellToString(row[3]),
    level: cellToString(row[4]),
    presentStatus: cellToString(row[5]),
    remarks: cellToString(row[6]),
  };
}

function extractRows(rawData: unknown[][]): { rows: ParsedSupportRow[]; duplicates: string[] } {
  const rows: ParsedSupportRow[] = [];
  const seenIds = new Set<string>();
  const duplicates: string[] = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row) continue;

    const parsed = parseRow(row);
    if (!parsed) continue;

    if (seenIds.has(parsed.supportTagId)) {
      duplicates.push(parsed.supportTagId);
      continue;
    }

    seenIds.add(parsed.supportTagId);
    rows.push(parsed);
  }

  return { rows, duplicates };
}

export async function parseSupportExcel(filePath: string): Promise<ParseResult> {
  const fileData = await readFile(filePath);
  const workbook = XLSX.read(fileData, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Excel file has no sheets");
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }

  const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rawData.length < 2) {
    throw new Error("Excel file has no data rows (only header or empty)");
  }

  validateHeaders(rawData[0] ?? []);
  const { rows, duplicates } = extractRows(rawData);

  return { rows, duplicates, totalRows: rawData.length - 1 };
}
