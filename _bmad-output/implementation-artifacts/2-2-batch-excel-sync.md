# Story 2.2: Batch Creation, Excel Parsing & Sync Cleaned

Status: done

## Story

As a **PM**,
I want to create batches under a project, upload Support Excel to parse support records, and sync cleaned DWG files,
so that I have a populated support register ready for assignment.

## Acceptance Criteria

1. PM can create a new batch under the selected project (batch name required)
2. On batch creation, system creates the batch folder with all 9 subfolders on shared drive
3. Batch folder name format: `YYYY-MM-DD_BATCH-XXX_{unique-id}` (e.g. `2026-04-15_BATCH-001_a4f2`)
4. PM can pick a Navisworks model file (.nwd/.nwf) and Support Excel (.xlsx) via native file picker
5. Desktop app copies selected files to `01_input\` in the batch folder
6. Desktop app parses Excel — auto-detects sheet with matching columns (SL.NO, SUPPORT No., DRAWING No., REVISION, LEVEL, PRESENT STATUS, REMARKS). If no match, shows dropdown of sheet names for PM to pick
7. Each parsed Excel row creates a Support record in Frappe with status `New`, linked to the batch
8. Duplicate Support Tag IDs within the same batch show error and are not created
9. After parsing, batch `support_count` is updated and batch status becomes `Synced`
10. PM can click "Sync Cleaned" on a batch — app scans `03_cleaned\` folder, matches DWG filenames (without extension) to Support Tag IDs
11. Matched supports get status updated to `Ready to Assign` and `file_path` set to the DWG path
12. Unmatched files (DWG exists but no Support record) are shown as warnings to PM
13. Batch list page shows all batches for the selected project with name, status, support count

## Tasks / Subtasks

- [x] Task 1: Install dependencies (AC: #4, #6)
  - [x] Install Tauri dialog plugin + Rust dep + register in lib.rs
  - [x] Install xlsx library
  - [x] Add dialog and fs:allow-copy-file permissions to Tauri capabilities

- [x] Task 2: Batch feature module — types, hooks (AC: #1, #13)
  - [x] Create `src/features/batches/types.ts` with Batch, Support interfaces and status constants (BATCH_STATUS, SUPPORT_STATUS)
  - [x] Create `src/features/batches/hooks/useBatches.ts` — TanStack Query hooks for batch CRUD
  - [x] Create `src/features/batches/index.ts` — public exports
  - [x] YAGNI: Skipped useSupports hooks — not needed in this story

- [x] Task 3: Batch folder creation utility (AC: #2, #3)
  - [x] Create `src/lib/file-ops/batch-folders.ts` — 9 subfolders, local date (not UTC)

- [x] Task 4: Excel parsing utility (AC: #6, #7, #8)
  - [x] Create `src/features/batches/utils/excel-parser.ts` — fixed format, validates headers, detects duplicates
  - [x] Validates immediately on file pick (before submit), shows preview table

- [x] Task 5: Batch creation page (AC: #1, #2, #3, #4, #5, #6, #7, #8, #9)
  - [x] Split into components: BatchFormView, BatchProcessingView, BatchDoneView, ExcelPreviewTable
  - [x] Both model and Excel files mandatory
  - [x] Preview table shows parsed supports before submit
  - [x] Progress steps during creation

- [x] Task 6: Sync Cleaned feature (AC: #10, #11, #12)
  - [x] Create `src/features/batches/utils/sync-cleaned.ts` — scan, match, update supports + batch counts
  - [x] SyncCleanedButton — toast notification, auto-refreshes batch table
  - [x] Updates batch status to Synced/Partially Synced, synced_count, unsynced_count, last_synced_at

- [x] Task 7: Batch list page and routing (AC: #13)
  - [x] BatchListPage with status colors, synced counts, last synced time, delete with folder cleanup
  - [x] Routes: `/batches` (list), `/batches/new` (create)

## Dev Notes

### Batch Folder Structure

```
{SANGAM_DRIVE_ROOT}\{project_name}\{batch_folder}\
  ├── 01_input\
  ├── 02_extracted\
  ├── 03_cleaned\
  ├── 04_assigned\
  ├── 04a_rejected_pool\
  ├── 05_submitted\
  ├── 06_sme_review\
  ├── 07_approved\
  ├── 08_client_review\
  └── 09_client_final\
```

Batch folder name example: `2026-04-15_BATCH-001_a4f2`

### Tauri Dialog Plugin — File Picker

```typescript
import { open } from "@tauri-apps/plugin-dialog";

// Pick Excel file
const excelPath = await open({
  title: "Select Support Excel",
  filters: [{ name: "Excel", extensions: ["xlsx", "xls"] }],
});

// Pick model file
const modelPath = await open({
  title: "Select Navisworks Model",
  filters: [{ name: "Navisworks", extensions: ["nwd", "nwf"] }],
});
```

### Tauri FS — Copy File

```typescript
import { copyFile, readDir } from "@tauri-apps/plugin-fs";

// Copy file to 01_input
await copyFile(sourcePath, `${batchFolderPath}\\01_input\\${fileName}`);
```

### Excel Parsing with xlsx

```typescript
import * as XLSX from "xlsx";
import { readFile } from "@tauri-apps/plugin-fs";

// Read file as binary
const fileData = await readFile(excelPath);
const workbook = XLSX.read(fileData, { type: "array" });

// Scan sheets for matching columns
const TARGET_COLUMNS = ["SL.NO", "SUPPORT No.", "DRAWING No.", "REVISION", "LEVEL", "PRESENT STATUS", "REMARKS"];
```

### Column Matching Logic

- Read header row of each sheet
- Normalize: trim whitespace, uppercase
- Check if all TARGET_COLUMNS exist (case-insensitive, flexible matching)
- If exactly one sheet matches → use it automatically
- If zero match → show dropdown of all sheet names for PM to pick
- If multiple match → show dropdown with matched sheets highlighted

### Support Record Creation (Frappe API)

```typescript
// Create support record
await frappe.createDoc("Support", {
  supportTagId: row.supportNo,
  batchId: batchName,
  drawingNo: row.drawingNo,
  revision: row.revision,
  level: row.level,
  presentStatus: row.presentStatus,
  remarks: row.remarks,
  status: "New",
});
```

### Duplicate Detection

- Before creating records, check parsed data for duplicate Support Tag IDs within the batch
- Also check Frappe: `GET /api/v2/document/Support?filters=[["batch_id","=","{batch}"],["support_tag_id","=","{id}"]]`
- Show all duplicates to PM with option to skip them

### Sync Cleaned Logic

```typescript
import { readDir } from "@tauri-apps/plugin-fs";

// 1. Read 03_cleaned directory
const entries = await readDir(`${batchFolderPath}\\03_cleaned`);

// 2. Filter to DWG files, extract names without extension
const dwgFiles = entries
  .filter(e => e.name?.endsWith(".dwg"))
  .map(e => ({ name: e.name!.replace(".dwg", ""), path: `${cleanedPath}\\${e.name}` }));

// 3. For each DWG, find matching Support by support_tag_id
// 4. Update matched: status → "Ready to Assign", file_path → DWG path
// 5. Collect unmatched for display
```

### Existing Patterns to Follow

- `frappe.createDoc` / `frappe.updateDoc` / `frappe.getList` from `src/lib/api/frappe-client.ts`
- `config.driveRoot` from `src/lib/config.ts`
- `useProject()` context gives `selectedProject` with `projectName` and `folderPath`
- DataTable pattern from `ProjectListPage.tsx` — Table + search + actions
- TanStack Query `useMutation` for all create/update operations
- Array syntax for filters: `[["field","=","value"]]`
- All Frappe field names in camelCase in TypeScript — `keysToSnake` conversion happens in frappe-client

### Batch DocType Fields (as created in Frappe)

| Field | Frappe Name | TS Name | Type |
|---|---|---|---|
| Batch Name | batch_name | batchName | Data (required) |
| Project | project_id | projectId | Link to Project (required) |
| Model File Path | model_file_path | modelFilePath | Data |
| Excel File Path | excel_file_path | excelFilePath | Data |
| Folder Path | folder_path | folderPath | Data (read-only) |
| Support Count | support_count | supportCount | Int (read-only) |
| Status | status | status | Select: New/Partially Synced/Synced/In Progress/Completed |
| Synced Count | synced_count | syncedCount | Int (read-only) |
| Unsynced Count | unsynced_count | unsyncedCount | Int (read-only) |
| Last Synced At | last_synced_at | lastSyncedAt | Datetime (read-only) |

### Anti-Patterns (DO NOT)

- Do NOT upload files to Frappe — files stay on shared drive, only paths stored in Frappe
- Do NOT use `useEffect` + `fetch` — use TanStack Query hooks
- Do NOT parse Excel on the server — parse client-side with xlsx library
- Do NOT create Support records for duplicate Tag IDs — show error
- Do NOT hardcode folder paths — use `config.driveRoot` + project folder + batch folder
- Do NOT use v1 API
- Do NOT use object syntax for filters

### References

- [PRD](_bmad-output/planning-artifacts/Samanvay_SANGAM_MVP_PRD.md) — Section 5 (Folder Strategy), Section 6.1 (Batch Management)
- [Epics](_bmad-output/planning-artifacts/epics.md) — FR2, FR3, FR4
- [Architecture](_bmad-output/planning-artifacts/architecture.md) — File Operations Architecture
- [Story 2.1](_bmad-output/implementation-artifacts/2-1-doctypes-project-creation.md) — DocType fields, project context, DataTable pattern
- [Frappe Knowledge Base](docs/frappe-knowledge-base.md) — API patterns, auth
- [Tauri FS Plugin](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/fs) — readDir, copyFile, mkdir
- [Tauri Dialog Plugin](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/dialog) — open file picker
- [SheetJS (xlsx)](https://docs.sheetjs.com/) — Excel parsing

## Dev Notes — Adhoc Changes (Not in Original Story)

### Status Constants
Created `BATCH_STATUS` and `SUPPORT_STATUS` constant objects instead of hardcoded strings. Used across all files that reference statuses.

### Partially Synced Status
Added "Partially Synced" batch status — when some but not all supports are matched to DWG files. Batch DocType updated with `synced_count`, `unsynced_count`, `last_synced_at` fields.

### Sync Results — Toast Instead of Dialog
Replaced results dialog with toast notification. Batch table auto-refreshes after sync showing updated counts and status.

### Excel Validation on File Pick
Excel is parsed and validated immediately when user picks the file (before submit). Preview table shows parsed supports. Invalid files show error inline.

### Navisworks Model Made Mandatory
Changed from optional to required — both files needed to create a batch.

### Project Cascade Delete
Added `on_trash` hooks to Project and Batch controllers in backend — deleting a project cascades to batches and supports. Frontend deletes shared drive folders before Frappe records. Delete confirmation requires typing project name.

### Toast Notifications
Added Sonner toast globally via `<Toaster>` in App.tsx. Used for delete success/error and sync results.

### Sidebar — Global vs Project-Scoped
Split menu items into GLOBAL_MENU_ITEMS (Projects only) and PROJECT_MENU_ITEMS (all others). Sidebar only shows project items after selecting a project, with project name as section header.

### toFrappeDatetime Utility
Created `toFrappeDatetime()` in `src/lib/utils.ts` — formats Date as "YYYY-MM-DD HH:MM:SS" in local timezone (Asia/Kolkata) matching Frappe. Used instead of `toISOString()` which gives UTC.

### Batch Folder Date — Local Not UTC
`generateBatchFolderName()` uses local date components, not `toISOString().slice()`.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- YAGNI: Removed pre-created useSupports hooks — not needed in this story
- ESLint complexity: Split CreateBatchPage into BatchFormView, BatchProcessingView, BatchDoneView, ExcelPreviewTable
- UTC vs local timezone: Fixed batch folder date and last_synced_at to use local time

### Completion Notes List
- Task 1: Tauri dialog plugin + xlsx installed, capabilities updated
- Task 2: Batch/Support types with BATCH_STATUS/SUPPORT_STATUS constants, batch hooks
- Task 3: Batch folder creation with 9 subfolders, local date naming
- Task 4: Excel parser with header validation, duplicate detection, immediate validation on pick
- Task 5: Batch creation with file pickers, preview table, progress steps
- Task 6: Sync cleaned — matches DWGs, updates supports + batch counts/status, toast notification
- Task 7: Batch list with status colors, sync counts, last synced time, delete with folder cleanup

### File List
- src-tauri/Cargo.toml (modified) — tauri-plugin-dialog
- src-tauri/src/lib.rs (modified) — registered dialog plugin
- src-tauri/capabilities/default.json (modified) — dialog + fs:allow-copy-file permissions
- src/App.tsx (modified) — Toaster added
- src/app/router.tsx (modified) — batch routes
- src/app/sidebar-menu.ts (modified) — split global vs project menus
- src/app/Sidebar.tsx (modified) — conditional project menu items
- src/app/Header.tsx (modified) — project display, switch project
- src/lib/utils.ts (modified) — toFrappeDatetime utility
- src/lib/file-ops/batch-folders.ts (new) — batch folder creation
- src/features/batches/types.ts (new) — Batch, Support interfaces, status constants
- src/features/batches/hooks/useBatches.ts (new) — CRUD hooks
- src/features/batches/utils/excel-parser.ts (new) — Excel parsing
- src/features/batches/utils/sync-cleaned.ts (new) — DWG sync logic
- src/features/batches/components/CreateBatchPage.tsx (new) — batch creation orchestrator
- src/features/batches/components/BatchFormView.tsx (new) — form UI
- src/features/batches/components/BatchProcessingView.tsx (new) — progress UI
- src/features/batches/components/BatchDoneView.tsx (new) — success UI
- src/features/batches/components/ExcelPreviewTable.tsx (new) — parsed data preview
- src/features/batches/components/SyncCleanedButton.tsx (new) — sync with toast
- src/features/batches/components/BatchListPage.tsx (new) — batch table with CRUD
- src/features/batches/index.ts (new) — public exports
- src/features/projects/components/ProjectListPage.tsx (modified) — extracted delete dialog
- src/features/projects/components/DeleteProjectDialog.tsx (new) — type-to-confirm delete
- src/components/ui/sonner.tsx (new) — shadcn toast
- src/components/ui/table.tsx (new) — shadcn table
- src/components/ui/dialog.tsx (new) — shadcn dialog
- src/components/ui/alert-dialog.tsx (new) — shadcn alert dialog
- src/components/ui/select.tsx (new) — shadcn select
- samanvay_sangam_backend/doctype/project/project.py (modified) — on_trash cascade
- samanvay_sangam_backend/doctype/batch/batch.py (modified) — on_trash cascade + new fields
- samanvay_sangam_backend/doctype/batch/batch.json (modified) — added synced_count, unsynced_count, last_synced_at, Partially Synced status
