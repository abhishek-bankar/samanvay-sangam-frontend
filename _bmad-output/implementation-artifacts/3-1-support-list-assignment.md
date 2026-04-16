# Story 3.1: Batch Detail, Support List & Assignment

Status: done

## Story

As a **PM or SME**,
I want to click into a batch to see its supports, select supports that are ready to assign, and assign them to Actionees individually, in bulk, or via auto-assign,
so that Actionees receive their work assignments with files moved to their folders.

## Acceptance Criteria

1. Clicking a batch row in the batch list navigates to batch detail page (`/batches/:batchId`)
2. Batch detail page shows batch header (name, status, support count) with back arrow to batch list
3. Batch detail page shows all supports for that batch with status tabs and count badges. Default tab: "Ready to Assign"
4. SME/PM can select one or multiple "Ready to Assign" supports via checkboxes
5. SME/PM can pick an Actionee from a list of users with `SANGAM Actionee` role and assign selected supports
6. On assignment, system moves DWG file from `03_cleaned\` to `04_assigned\<actionee>\` in the batch folder
7. On assignment, system creates the actionee subfolder under `04_assigned\` if it doesn't exist
8. On assignment, Support record is updated: status → `In Progress`, `assigned_to` → user, `assigned_at` → current datetime, `file_path` → new path
9. PM/SME can click "Auto Assign" — dialog shows all Actionees with checkboxes (all pre-selected), PM can uncheck to exclude
10. Auto-assign distributes "Ready to Assign" supports equally using round-robin among checked Actionees
11. After assignment (manual or auto), the support list refreshes
12. Assignment actions (Assign, Auto Assign) only appear on "Ready to Assign" tab
13. Supports table shows: Support Tag ID, Drawing No, Status, Assigned To
14. Search bar filters supports by Support Tag ID
15. Sync Cleaned button available on batch detail page header
16. "Support Register" and "Assignment" removed from sidebar — assignment is accessed via batch detail

## UX Flow Change

Previous: Flat sidebar navigation with separate "Assignment" and "Support Register" pages.
New: Hierarchical drill-down — **Project → Batches → Batch Detail (supports + assign + sync)**.

Sidebar items removed: "Support Register", "Assignment".
These actions now live inside batch detail, which is their natural home.

## Tasks / Subtasks

- [x] Task 1: Backend — Whitelisted methods (AC: #5, #9)
  - [x] Add `get_users_with_role(role)` in `samanvay_sangam_backend/api.py` — returns `[{ name, full_name }]` for enabled users with the given role
  - [x] Add `get_supports_for_project(project_id, status?)` — kept for future dashboard use

- [x] Task 2: Assignment feature module — types, hooks (AC: #3, #5, #13)
  - [x] Create `src/features/assignment/types.ts` — Actionee interface
  - [x] Create `src/features/assignment/hooks/useSupports.ts` — `useBatchSupports` hook fetching supports by batch_id
  - [x] Create `src/features/assignment/hooks/useActionees.ts` — calls `get_users_with_role` whitelisted method
  - [x] Create `src/features/assignment/index.ts` — public exports

- [x] Task 3: File move utility (AC: #6, #7)
  - [x] Create `src/lib/file-ops/move-support.ts` — moves DWG file using `rename` + `mkdir` for actionee subfolder
  - [x] Actionee folder name: user's `full_name` sanitized (lowercase, spaces → underscores)

- [x] Task 4: Assignment logic utilities (AC: #5, #6, #7, #8, #9, #10)
  - [x] Create `src/features/assignment/utils/assign-supports.ts` — assigns supports to actionee (API update + file move)
  - [x] Create `src/features/assignment/utils/auto-assign.ts` — round-robin distribution

- [x] Task 5: Batch detail page (AC: #1, #2, #3, #12, #13, #14, #15)
  - [x] Create `src/features/batches/components/BatchDetailPage.tsx` — batch header + supports view
  - [x] Create `src/features/batches/components/BatchSupportsView.tsx` — status tabs + table + toolbar + assignment dialogs
  - [x] Create `src/features/assignment/components/StatusTabs.tsx` — tabs with count badges
  - [x] Create `src/features/assignment/components/SupportTable.tsx` — table with checkboxes

- [x] Task 6: Assign dialog + Auto-assign dialog (AC: #4, #5, #8, #9, #10, #11)
  - [x] Create `src/features/assignment/components/AssignDialog.tsx` — actionee picker dropdown
  - [x] Create `src/features/assignment/components/AutoAssignDialog.tsx` — actionee checkboxes, round-robin
  - [x] Create `src/features/assignment/components/ActioneeCheckboxList.tsx` — reusable checkbox list

- [x] Task 7: Routing and UX cleanup (AC: #1, #16)
  - [x] Add `/batches/:batchId` route for `BatchDetailPage`
  - [x] Make batch rows clickable in `BatchListPage` — navigate to detail
  - [x] Remove "Support Register" and "Assignment" from sidebar menu
  - [x] Remove `/supports` and `/assignment` routes

## Dev Notes

### UX Architecture — Drill-Down Not Sidebar

The app follows a hierarchical navigation pattern:
- **Project → Batches → Batch Detail** for PM's primary workflow
- **Sidebar** is reserved for cross-batch views: Dashboard, My Work, Review Queue, Rejected Pool, Send to Client, Analytics
- Assignment is not a standalone page — it's an action within batch detail

### Backend — Whitelisted Method to Fetch Users by Role

In `samanvay_sangam_backend/api.py`:

```python
@frappe.whitelist()
def get_users_with_role(role: str) -> list[dict]:
    users = frappe.get_all("Has Role", filters={"role": role, "parenttype": "User"}, fields=["parent"], distinct=True)
    emails = [u["parent"] for u in users]
    if not emails:
        return []
    return frappe.get_all("User", filters={"name": ["in", emails], "enabled": 1}, fields=["name", "full_name"])
```

### Fetching Actionees (Frontend)

```typescript
const response = await frappe.call<Actionee[]>("samanvay_sangam_backend.api.get_users_with_role", {
  role: "SANGAM Actionee",
});
```

### Fetching Supports (Frontend)

Simple `getList` by batch_id — no cross-batch query needed:

```typescript
frappe.getList<Support>("Support", {
  filters: [["batch_id", "=", batchId]],
  fields: [...all fields...],
  limit: 500,
});
```

### File Move Logic

```typescript
import { rename, mkdir } from "@tauri-apps/plugin-fs";

function toFolderName(fullName: string): string {
  return fullName.toLowerCase().replaceAll(/[^\da-z]+/g, "_").replaceAll(/^_|_$/g, "");
}

async function moveSupportFile(currentFilePath, batchFolderPath, actioneeFullName): Promise<string> {
  const destDir = `${batchFolderPath}\\04_assigned\\${toFolderName(actioneeFullName)}`;
  await mkdir(destDir, { recursive: true });
  const fileName = currentFilePath.split("\\").pop()!;
  const destPath = `${destDir}\\${fileName}`;
  await rename(currentFilePath, destPath);
  return destPath;
}
```

### Auto-Assign Round-Robin

```typescript
// 5 supports, 3 actionees → [2, 2, 1]
for (const [i, support] of supports.entries()) {
  buckets[i % actionees.length].push(support);
}
```

### Existing Patterns Followed

- `frappe.getList` / `frappe.updateDoc` / `frappe.call` from `src/lib/api/frappe-client.ts`
- `SUPPORT_STATUS` constants from `src/features/batches/types.ts`
- `toFrappeDatetime()` from `src/lib/utils.ts`
- Toast notifications via `sonner`
- Array syntax for Frappe filters
- shadcn components: Tabs, Table, Dialog, Select, Checkbox, Badge, Button, Input
- ESLint complexity ≤ 10 — components split accordingly

### Anti-Patterns (DO NOT)

- Do NOT upload files to Frappe — files stay on shared drive
- Do NOT use `useEffect` + `fetch` — use TanStack Query hooks
- Do NOT hardcode status strings — use `SUPPORT_STATUS` constants
- Do NOT use v1 API or object syntax for filters
- Do NOT move files before API update — API first, then file move
- Do NOT use `copyFile` + delete for moves — use `rename`

### References

- [PRD](_bmad-output/planning-artifacts/Samanvay_SANGAM_MVP_PRD.md) — Section 6.4, Section 7
- [Epics](_bmad-output/planning-artifacts/epics.md) — FR5, FR20
- [Architecture](_bmad-output/planning-artifacts/architecture.md) — File Operations, Process Patterns
- [Story 2.1](_bmad-output/implementation-artifacts/2-1-doctypes-project-creation.md) — Support DocType fields
- [Story 2.2](_bmad-output/implementation-artifacts/2-2-batch-excel-sync.md) — Batch hooks, SUPPORT_STATUS constants

## Dev Notes — Adhoc Changes (Not in Original Story)

### UX Redesign — Drill-Down Navigation
Removed sidebar-driven "Support Register" and "Assignment" pages. Assignment now lives inside Batch Detail page. Users navigate: Project → Batches → Click batch → See supports → Assign. This is the natural workflow hierarchy.

### Batch Rows Made Clickable
BatchListPage rows now navigate to `/batches/:batchId` on click.

### Project Selection Redirects to Batches
Changed post-login and project-selection redirect from `/dashboard` to `/batches` since batches are the PM's primary workspace.

### get_supports_for_project Backend Method
Created but not used by assignment flow (kept for future dashboard). Assignment uses simple `getList` by `batch_id` instead.

### Assigned To Shows Full Name
SupportTable resolves user emails to full names via actionees data. `userNameMap` passed from `BatchSupportsView`.

### Assignee Filter on Tabs with Assigned Supports
When a status tab has assigned supports (e.g. In Progress), an "Assigned To" dropdown filter appears next to the search bar. Filters supports by assignee.

### Auto-Assign Shows Per-Actionee Counts
Auto-assign dialog shows exact support count per actionee (e.g. "Akshay Hagare (2 supports)") instead of ambiguous range.

### Path Fields Changed to Small Text
All `file_path`, `folder_path`, `markup_pdf_path`, `model_file_path`, `excel_file_path` fields changed from `Data` (VARCHAR 140) to `Small Text` (TEXT) to support long paths.

### SyncCleanedButton Invalidates Batch Detail Query
Added `queryKey: ["batch", batchId]` invalidation so batch detail page refreshes after sync.

### ESLint Complexity Splits
- `BatchSupportsView` toolbar → extracted `SupportsToolbar`
- `AutoAssignDialog` → extracted `AutoAssignBody` (inline)
- Custom `StatusTabs` using plain buttons instead of shadcn Tabs for horizontal scroll

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- ESLint complexity: Split components to stay under limit 10
- unicorn/no-for-loop: Used `.entries()` with for-of instead of index-based for loops
- unicorn/better-regex: Used `\d` instead of `0-9` in character classes
- Frappe field length error: Path fields exceeded VARCHAR(140), changed to Small Text

### Completion Notes List
- Task 1: Backend whitelisted methods (get_users_with_role, get_supports_for_project)
- Task 2: Assignment types + hooks (useBatchSupports, useActionees)
- Task 3: File move utility with folder name sanitization
- Task 4: Assign supports + auto-assign round-robin utilities
- Task 5: BatchDetailPage + BatchSupportsView with status tabs
- Task 6: AssignDialog + AutoAssignDialog with per-actionee counts
- Task 7: Routing, clickable batch rows, sidebar cleanup, assignee filter

### File List
- samanvay_sangam_backend/api.py (modified) — get_users_with_role, get_supports_for_project
- samanvay_sangam_backend/doctype/support/support.json (modified) — markup_pdf_path → Small Text
- samanvay_sangam_backend/doctype/batch/batch.json (modified) — path fields → Small Text
- samanvay_sangam_backend/doctype/project/project.json (modified) — folder_path → Small Text
- src/app/router.tsx (modified) — added /batches/:batchId, removed /supports and /assignment
- src/app/sidebar-menu.ts (modified) — removed Support Register and Assignment items
- src/app/ProjectSelector.tsx (modified) — redirect to /batches instead of /dashboard
- src/features/projects/components/ProjectListPage.tsx (modified) — navigate to /batches on select
- src/features/batches/components/BatchListPage.tsx (modified) — clickable rows
- src/features/batches/components/BatchDetailPage.tsx (new) — batch header + supports view
- src/features/batches/components/BatchSupportsView.tsx (new) — status tabs + table + assign actions
- src/features/batches/components/SupportsToolbar.tsx (new) — search + assignee filter + assign buttons
- src/features/batches/components/SyncCleanedButton.tsx (modified) — invalidate batch detail query
- src/features/assignment/types.ts (new) — Actionee interface
- src/features/assignment/hooks/useSupports.ts (new) — useBatchSupports hook
- src/features/assignment/hooks/useActionees.ts (new) — useActionees hook
- src/features/assignment/utils/assign-supports.ts (new) — assign logic
- src/features/assignment/utils/auto-assign.ts (new) — round-robin distribution
- src/features/assignment/components/StatusTabs.tsx (new) — horizontal scrollable status tabs
- src/features/assignment/components/SupportTable.tsx (new) — table with checkboxes + full name display
- src/features/assignment/components/AssignDialog.tsx (new) — actionee picker
- src/features/assignment/components/AutoAssignDialog.tsx (new) — auto-assign with per-actionee counts
- src/features/assignment/index.ts (new) — public exports
- src/lib/file-ops/move-support.ts (new) — DWG file move utility
- src/components/ui/tabs.tsx (new) — shadcn tabs
- src/components/ui/checkbox.tsx (new) — shadcn checkbox
- src/components/ui/badge.tsx (new) — shadcn badge
