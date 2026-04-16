# Story 4.1: My Work Page, Open DWG & Submit

Status: done

## Story

As an **Actionee (or QC)**,
I want to see my assigned supports, open DWG files in AutoCAD, and submit completed work,
so that my submissions are tracked with timestamps and moved to the review queue.

## Acceptance Criteria

1. "My Work" page (`/my-work`) shows only the logged-in user's assigned supports across all batches for the selected project
2. Table shows: Support Tag ID, Batch Name, Drawing No, Status, Revision (R0, R1...), Assigned At
3. File path is clickable — opens DWG in AutoCAD via OS default handler
4. "Submit" button appears on each support row with status "In Progress"
5. On submit, system moves DWG from `04_assigned\<actionee>\` to `05_submitted\<actionee>\` in the batch folder
6. On submit, system creates the actionee subfolder under `05_submitted\` if it doesn't exist
7. On submit, Support record is updated: status → `Under Review`, `submitted_at` → current datetime, `tat_hours` → hours between `assigned_at` and `submitted_at`, `file_path` → new path
8. On first submission (revision_number === 0), `revision_type` is set to `IFR`
9. On rework submission (revision_number > 0), `revision_type` stays `RIFR` (already set by rejection flow)
10. After submit, the support list refreshes and the submitted support moves out of the actionable list
11. Toast notification shows success or failure with actual error message

## Tasks / Subtasks

- [ ] Task 1: Backend — Whitelisted method `get_my_supports` (AC: #1)
  - [ ] Add `get_my_supports(project_id)` to `samanvay_sangam_backend/api.py`
  - [ ] Returns supports where `assigned_to` = current user, across all batches for the project
  - [ ] Attaches `batch_name` and `batch_folder_path` to each support

- [ ] Task 2: Submit utility + file move (AC: #5, #6, #7, #8, #9)
  - [ ] Create `src/features/my-work/utils/submit-support.ts` — moves DWG to `05_submitted\<actionee>\`, updates Frappe record
  - [ ] Create `src/lib/file-ops/submit-support.ts` — file move from `04_assigned` to `05_submitted` (similar to `move-support.ts` but different target folder)
  - [ ] TAT calculation: `(submittedAt - assignedAt) / 3_600_000` hours
  - [ ] Revision type logic: IFR if revision_number === 0, else leave unchanged

- [ ] Task 3: My Work feature module — hooks (AC: #1, #10)
  - [ ] Create `src/features/my-work/hooks/useMySupports.ts` — calls `get_my_supports` whitelisted method
  - [ ] Create `src/features/my-work/index.ts` — public exports

- [ ] Task 4: My Work page (AC: #1, #2, #3, #4, #10, #11)
  - [ ] Create `src/features/my-work/components/MyWorkPage.tsx` — table with supports
  - [ ] File path clickable via `openPath` from `@tauri-apps/plugin-opener`
  - [ ] Submit button per row (In Progress only)
  - [ ] Toast on success/failure

- [ ] Task 5: Routing (AC: #1)
  - [ ] Replace `/my-work` placeholder in `src/app/router.tsx` with `MyWorkPage`

## Dev Notes

### Backend — `get_my_supports` Method

Add to `samanvay_sangam_backend/api.py`:

```python
@frappe.whitelist()
def get_my_supports(project_id: str) -> list[dict]:
    """Return supports assigned to the current user for a project."""
    batches = frappe.get_all(
        "Batch",
        filters={"project_id": project_id},
        fields=["name", "batch_name", "folder_path"],
    )
    if not batches:
        return []

    batch_names = [b["name"] for b in batches]
    supports = frappe.get_all(
        "Support",
        filters={
            "batch_id": ["in", batch_names],
            "assigned_to": frappe.session.user,
        },
        fields=[
            "name", "support_tag_id", "batch_id", "drawing_no", "revision",
            "level", "present_status", "remarks", "status", "assigned_to",
            "revision_number", "revision_type", "file_path", "markup_pdf_path",
            "assigned_at", "submitted_at", "reviewed_at", "tat_hours",
        ],
        limit_page_length=0,
    )

    batch_map = {b["name"]: b for b in batches}
    for s in supports:
        batch = batch_map.get(s["batch_id"], {})
        s["batch_name"] = batch.get("batch_name", "")
        s["batch_folder_path"] = batch.get("folder_path", "")

    return supports
```

Key: Uses `frappe.session.user` to get current user — no need to pass user from frontend.

### Frontend — Fetching My Supports

```typescript
const response = await frappe.call<MySupport[]>(
  "samanvay_sangam_backend.api.get_my_supports",
  { projectId: selectedProject.name },
);
```

### MySupport Type

Extends Support with batch context:

```typescript
interface MySupport extends Support {
  batchName: string;
  batchFolderPath: string;
}
```

### File Move — Submit

Similar to `moveSupportFile` but target is `05_submitted\<actionee>\`:

```typescript
async function submitSupportFile(
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
```

### Submit Logic

```typescript
async function submitSupport(support: MySupport, userFullName: string): Promise<void> {
  // 1. Move file to 05_submitted/<actionee>/
  const newFilePath = await submitSupportFile(
    support.filePath, support.batchFolderPath, userFullName,
  );

  // 2. Calculate TAT
  const assignedAt = new Date(support.assignedAt);
  const submittedAt = new Date();
  const tatHours = (submittedAt.getTime() - assignedAt.getTime()) / 3_600_000;

  // 3. Determine revision type
  const revisionType = support.revisionNumber === 0 ? "IFR" : support.revisionType;

  // 4. Update Frappe
  await frappe.updateDoc("Support", support.name, {
    status: SUPPORT_STATUS.UNDER_REVIEW,
    submittedAt: toFrappeDatetime(submittedAt),
    tatHours: Math.round(tatHours * 100) / 100,
    filePath: newFilePath,
    revisionType,
  });
}
```

### Open DWG in AutoCAD

```typescript
import { openPath } from "@tauri-apps/plugin-opener";

// Opens file with OS default handler (AutoCAD for .dwg)
await openPath(support.filePath);
```

### Existing Patterns to Follow

- `useAuth()` from `src/features/auth/auth-context.tsx` — gives `user` (email) and `fullName`
- `useProject()` from `src/features/projects/project-context.tsx` — gives `selectedProject`
- `frappe.call` / `frappe.updateDoc` from `src/lib/api/frappe-client.ts`
- `SUPPORT_STATUS` constants from `src/features/batches/types.ts`
- `toFrappeDatetime()` from `src/lib/utils.ts`
- `toFolderName()` from `src/lib/file-ops/move-support.ts` — reuse for folder name sanitization
- Toast notifications via `sonner`
- Table pattern from `SupportTable.tsx` — but simpler (no checkboxes needed)

### Anti-Patterns (DO NOT)

- Do NOT upload files to Frappe — files stay on shared drive
- Do NOT use `useEffect` + `fetch` — use TanStack Query hooks
- Do NOT hardcode status strings — use `SUPPORT_STATUS` constants
- Do NOT use v1 API or object syntax for filters
- Do NOT move files before API update — move file first, then API update (for submit, file move is the primary action)
- Do NOT use `copyFile` + delete for moves — use `rename`

### Wait — Submit Order is Different!

For assignment: API first → file move (if API fails, no orphan files).
For submission: File move first → API update. Why? The actionee has been working on the file — it's in `04_assigned/`. If we update API first and file move fails, Frappe says "Under Review" but file is still in assigned folder. Better to move first, then update API. If API fails after move, the file is in submitted folder which is closer to the correct state — user can retry the API update.

Actually, let's keep it consistent: **API first, then file move.** If API update fails, no file move happens. If file move fails after API update, show error — the status in Frappe will be wrong but at least the user sees the error and can act on it (usually a file lock issue). This matches the existing pattern in assign-supports.ts.

### References

- [PRD](_bmad-output/planning-artifacts/Samanvay_SANGAM_MVP_PRD.md) — Section 6.5 (Submission)
- [Epics](_bmad-output/planning-artifacts/epics.md) — FR6, FR17
- [Architecture](_bmad-output/planning-artifacts/architecture.md) — File Operations
- [Story 3.1](_bmad-output/implementation-artifacts/3-1-support-list-assignment.md) — File move utility, patterns
- [Story 2.1](_bmad-output/implementation-artifacts/2-1-doctypes-project-creation.md) — Support DocType fields

## Dev Notes — Adhoc Changes (Not in Original Story)

### My Work Lives Inside Batch Detail, Not Sidebar
Removed `/my-work` sidebar item and route. My Work is now a tab inside batch detail page — actionees navigate: Batches → Click batch → My Work tab.

### Role-Aware Status Tabs
`getTabsForRole()` returns different tabs per role: PM gets 10, SME gets 5, Actionee/QC gets 2 (My Work + Submitted).

### Split BatchSupportsView by Role
`BatchSupportsView` delegates to `PmSmeSupportsView` (checkboxes, assign, reassign) or `ActioneeSupportsView` (My Work table with Open + Submit).

### ROLE Constants
Created `ROLE` constant object in `auth/types.ts` — `ROLE.PM`, `ROLE.SME`, `ROLE.QC`, `ROLE.ACTIONEE`. Used across sidebar, batch list, batch detail. No more hardcoded role strings.

### PM-Only Actions in Batch List
New Batch button, Sync Cleaned, Delete, and Actions column hidden for non-PM roles. Extracted `DeleteBatchDialog` and `BatchRow` components.

### Submit Confirmation Dialog
AlertDialog with message: "This will move the DWG file to the submitted folder and send it for SME review. You will not be able to edit the file after submission."

### File Lock Detection
Submit catches OS errors about locked files and shows user-friendly message: "File is open in another application. Please close it and try again."

### Contextual Timestamp Column
My Work tab shows "Assigned: {time}", Submitted tab shows "Submitted: {time}".

### formatDateTime Utility
Created `formatDateTime()` in `utils.ts` with explicit `Asia/Kolkata` timezone. Replaced all inline `Intl.DateTimeFormat` calls.

### Opener Plugin Permission
Added `opener:allow-open-path` with `{ "path": "**" }` scope to Tauri capabilities.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- ESLint complexity: Split BatchSupportsView into PmSmeSupportsView + ActioneeSupportsView
- ESLint complexity: Extracted DeleteBatchDialog + BatchRow from BatchListPage
- ESLint complexity: Extracted RelevantTimestamp + MyWorkActions from MyWorkTable
- Tauri opener permission: `opener:allow-open-path` needs path scope

### Completion Notes List
- Task 1: Backend get_my_supports whitelisted method
- Task 2: Submit utility — file move to 05_submitted, TAT calc, revision type
- Task 3: My Work hooks (useMySupports — removed, replaced by role-aware tabs)
- Task 4: My Work as tab in batch detail with Open DWG + Submit
- Task 5: Role-aware tabs, PM-only actions, ROLE constants
- UX: Submit confirmation dialog, file lock detection, formatDateTime utility

### File List
- samanvay_sangam_backend/api.py (modified) — get_my_supports
- src-tauri/capabilities/default.json (modified) — opener:allow-open-path
- src/app/router.tsx (modified) — removed /my-work route
- src/app/sidebar-menu.ts (modified) — removed My Work item, use ROLE constants
- src/app/Header.tsx (modified) — show user roles
- src/lib/utils.ts (modified) — formatDateTime utility
- src/lib/file-ops/submit-support.ts (new) — file move to 05_submitted
- src/knip.json (modified) — removed opener from ignoreDependencies
- src/features/auth/types.ts (modified) — ROLE constants
- src/features/batches/components/BatchListPage.tsx (modified) — PM-only actions, extracted BatchRow
- src/features/batches/components/BatchDetailPage.tsx (modified) — PM-only Sync Cleaned
- src/features/batches/components/BatchSupportsView.tsx (modified) — role-aware split
- src/features/batches/components/PmSmeSupportsView.tsx (new) — PM/SME view
- src/features/batches/components/ActioneeSupportsView.tsx (new) — Actionee/QC view
- src/features/batches/components/DeleteBatchDialog.tsx (new) — extracted delete dialog
- src/features/assignment/components/StatusTabs.tsx (modified) — role-aware tabs, ROLE constants
- src/features/my-work/components/MyWorkTable.tsx (new) — Open DWG + Submit with confirmation