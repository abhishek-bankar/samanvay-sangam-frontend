# Story 3.2: Reassignment (Single, Bulk, All-at-Once)

Status: done

## Story

As a **PM or SME**,
I want to reassign supports that are already "In Progress" to a different Actionee — individually, in bulk, or all-at-once for leave scenarios,
so that work continues uninterrupted when team availability changes.

## Acceptance Criteria

1. On the "In Progress" tab, checkboxes appear on each support row (same pattern as "Ready to Assign" tab)
2. When supports are selected, a "Reassign" button appears in the toolbar showing the count
3. Clicking "Reassign" opens a dialog to pick a new Actionee — the current assignee is excluded from the dropdown
4. On reassignment, system moves DWG files from `04_assigned\<old_actionee>\` to `04_assigned\<new_actionee>\`
5. On reassignment, Support record is updated: `assigned_to` → new user, `assigned_at` → current datetime, `file_path` → new path. Status stays `In Progress`
6. A "Reassign All" button appears when the assignee filter is set to a specific actionee (not "All Assignees")
7. "Reassign All" opens a dialog to pick a target Actionee — moves ALL supports from the selected source actionee to the target
8. After reassignment, the support list and assignee filter refresh
9. Toast notification shows success/failure count

## Tasks / Subtasks

- [ ] Task 1: Create reassign utility (AC: #4, #5)
  - [ ] Create `src/features/assignment/utils/reassign-supports.ts` — reuses `moveSupportFile`, updates `assignedTo`, `assignedAt`, `filePath` (status stays `In Progress`)

- [ ] Task 2: Create ReassignDialog (AC: #2, #3, #8, #9)
  - [ ] Create `src/features/assignment/components/ReassignDialog.tsx` — actionee picker dropdown excluding current assignee(s), reassign selected supports

- [ ] Task 3: Update BatchSupportsView + SupportsToolbar for "In Progress" tab actions (AC: #1, #2, #6, #7)
  - [ ] Enable checkboxes on "In Progress" tab (currently only on "Ready to Assign")
  - [ ] Add "Reassign" button to toolbar when In Progress tab is active and supports are selected
  - [ ] Add "Reassign All" button when assignee filter is set to a specific actionee
  - [ ] Wire up ReassignDialog with proper state management

## Dev Notes

### Reassignment vs Assignment

Assignment (Story 3.1) moves files from `03_cleaned\` → `04_assigned\<actionee>\` and sets status to `In Progress`.
Reassignment (this story) moves files from `04_assigned\<old>\` → `04_assigned\<new>\` and keeps status as `In Progress`. The key difference is the source folder — file is already in an actionee's assigned folder.

### Reassign Utility

The existing `moveSupportFile` from `src/lib/file-ops/move-support.ts` already handles moving any file to `04_assigned\<actionee>\`. It works for reassignment too since:
- Input: `currentFilePath` (current location in old actionee's folder)
- Output: new path in new actionee's folder

```typescript
// Reassign is almost identical to assign, except status stays In Progress
export async function reassignSupports(
  supports: Support[],
  newActionee: Actionee,
  batchFolderPath: string,
): Promise<AssignResult> {
  // For each support:
  // 1. moveSupportFile(support.filePath, batchFolderPath, newActionee.fullName)
  // 2. frappe.updateDoc("Support", name, { assignedTo, assignedAt, filePath })
  // Status is NOT changed — remains In Progress
}
```

### ReassignDialog

Similar to `AssignDialog` but:
- Excludes current assignee(s) from the dropdown. If reassigning multiple supports from the same assignee, exclude that one. If mixed assignees, show all actionees.
- Label says "Reassign" not "Assign"

### Toolbar Changes

The `SupportsToolbar` currently has `showAssignActions` boolean. For reassignment, we need:
- `showAssignActions` — Assign + Auto Assign buttons (Ready to Assign tab)
- `showReassignActions` — Reassign button (In Progress tab, supports selected)
- `showReassignAll` — Reassign All button (In Progress tab, specific assignee filtered)

### "Reassign All" Flow

1. User is on "In Progress" tab
2. User selects a specific actionee from the assignee filter dropdown (e.g. "Ramesh Kumar")
3. "Reassign All" button appears in the toolbar
4. Click → opens ReassignDialog with ALL supports for that actionee pre-selected
5. Pick target actionee → all supports move

This is the "leave scenario" — one actionee is absent, reassign all their work.

### Existing Components to Reuse

- `moveSupportFile` from `src/lib/file-ops/move-support.ts` — same file move logic
- `useActionees` hook — fetch actionee list
- `SupportTable` with checkboxes — already supports selection
- `SupportsToolbar` — extend with reassign actions
- Toast notifications via `sonner`
- `toFrappeDatetime` for timestamp

### Existing Patterns to Follow

- `frappe.updateDoc` from `src/lib/api/frappe-client.ts`
- `SUPPORT_STATUS` constants from `src/features/batches/types.ts`
- Array syntax for Frappe filters
- ESLint complexity ≤ 10
- `useQueryClient().invalidateQueries` to refresh after mutation

### Anti-Patterns (DO NOT)

- Do NOT change status on reassignment — it stays `In Progress`
- Do NOT use `copyFile` + delete — use `rename` (atomic move)
- Do NOT move files before API update — API first, then file move
- Do NOT hardcode status strings — use `SUPPORT_STATUS` constants

### References

- [PRD](_bmad-output/planning-artifacts/Samanvay_SANGAM_MVP_PRD.md) — Section 6.4 (Assignment)
- [Epics](_bmad-output/planning-artifacts/epics.md) — FR21
- [Story 3.1](_bmad-output/implementation-artifacts/3-1-support-list-assignment.md) — Assignment components, file move utility, batch detail page

## Dev Notes — Adhoc Changes (Not in Original Story)

### ESLint Complexity — SupportsDialogs Extracted
`BatchSupportsView` exceeded complexity 10 with 4 dialog states. Extracted `SupportsDialogs` component that renders the correct dialog based on an `openDialog` union type (`"assign" | "autoAssign" | "reassign" | "reassignAll" | null`).

### Single openDialog State Instead of 4 Booleans
Replaced four separate `useState<boolean>` for each dialog with one `useState<string | null>`. Cleaner and prevents multiple dialogs from being open simultaneously.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- ESLint complexity: Extracted SupportsDialogs to reduce BatchSupportsView complexity

### Completion Notes List
- Task 1: Reassign utility — reuses moveSupportFile, keeps status In Progress
- Task 2: ReassignDialog — excludes current assignees from dropdown
- Task 3: Checkboxes on In Progress tab, Reassign + Reassign All buttons in toolbar

### File List
- src/features/assignment/utils/reassign-supports.ts (new) — reassign logic
- src/features/assignment/components/ReassignDialog.tsx (new) — actionee picker excluding current
- src/features/batches/components/BatchSupportsView.tsx (modified) — In Progress checkboxes, dialog state
- src/features/batches/components/SupportsToolbar.tsx (modified) — Reassign + Reassign All buttons
- src/features/batches/components/SupportsDialogs.tsx (new) — dialog renderer
