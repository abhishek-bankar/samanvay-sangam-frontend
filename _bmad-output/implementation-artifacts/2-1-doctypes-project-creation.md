# Story 2.1: Core DocTypes & Project Creation

Status: ready-for-dev

## Story

As a **PM**,
I want to create projects in SANGAM and have the system create the corresponding folder on the shared drive,
so that I have a place to organize batches and support drawings.

## Acceptance Criteria

1. Backend: Project DocType exists in Frappe with fields: project_name, client, folder_path, status
2. Backend: Batch DocType exists in Frappe with fields: batch_name, project (Link), model_file_path, excel_file_path, folder_path, status
3. Backend: Support DocType exists in Frappe with all fields needed for the support lifecycle (see Dev Notes for complete field list)
4. Backend: DocType permissions set per SANGAM roles (PM: full CRUD on all; SME: read+write on Support; QC/Actionee: read on Support)
5. Frontend: PM can create a new project via a form (project_name, client)
6. Frontend: On project creation, system creates the project folder on the shared drive at `{SANGAM_DRIVE_ROOT}/{project_name}`
7. Frontend: Project list page shows all projects with name, client, status
8. Frontend: ProjectSelector in app shell uses real project data from Frappe API
9. Frontend: Selected project stored in context — sidebar and all views scoped to selected project
10. Frontend: If Frappe API call succeeds but folder creation fails, show error to user (no silent failure)

## Tasks / Subtasks

- [x] Task 1: Backend — Create Project DocType in Frappe UI (AC: #1, #4)
  - [x] Create Project DocType with fields: project_name (Data, required), client (Data, required), folder_path (Data, read-only), status (Select: Active/Archived, default Active)
  - [x] Set autoname to `hash` (random hash primary key)
  - [x] Set permissions: SANGAM PM (full CRUD), SANGAM SME (read), SANGAM QC (read), SANGAM Actionee (read)

- [x] Task 2: Backend — Create Batch DocType in Frappe UI (AC: #2, #4)
  - [x] Create Batch DocType with fields: batch_name (Data, required), project_id (Link to Project, required), model_file_path (Data), excel_file_path (Data), folder_path (Data, read-only), support_count (Int, read-only), status (Select: New/Synced/In Progress/Completed, default New)
  - [x] Set autoname to `hash`
  - [x] Set permissions: SANGAM PM (full CRUD), SANGAM SME (read), SANGAM QC (read), SANGAM Actionee (read)

- [x] Task 3: Backend — Create Support DocType in Frappe UI (AC: #3, #4)
  - [x] Create Support DocType with all fields (see Dev Notes for complete list)
  - [x] Set autoname to `hash`
  - [x] revision_number is Int (default 0), displayed as R0, R1, R2 on frontend
  - [x] tat_hours is read-only
  - [x] Set permissions: SANGAM PM (full CRUD), SANGAM SME (read, write), SANGAM QC (read, write), SANGAM Actionee (read, write)

- [ ] Task 4: Frontend — Project context provider (AC: #9)
  - [ ] Create `src/features/projects/types.ts` with Project TypeScript interface
  - [ ] Create `src/features/projects/project-context.tsx` — React context for selected project (selectedProject, setProject)
  - [ ] Create `src/features/projects/hooks/useProjects.ts` — TanStack Query hook to fetch project list
  - [ ] Create `src/features/projects/index.ts` — public exports
  - [ ] Wrap app in ProjectProvider in `src/App.tsx`

- [ ] Task 5: Frontend — Project creation page (AC: #5, #6, #10)
  - [ ] Create `src/features/projects/components/CreateProjectPage.tsx` — form with project_name, client fields
  - [ ] On submit: call Frappe API to create Project doc (`POST /api/v2/document/Project`)
  - [ ] On success: create folder at `{SANGAM_DRIVE_ROOT}/{project_name}` using Tauri FS `mkdir`
  - [ ] Update project doc with `folder_path` via `PATCH /api/v2/document/Project/{name}`
  - [ ] On folder creation failure: show raw error, do NOT silently continue
  - [ ] Add route `/projects/new` to router

- [ ] Task 6: Frontend — Project list and selector (AC: #7, #8)
  - [ ] Create `src/features/projects/components/ProjectListPage.tsx` — list of all projects with name, client, status
  - [ ] Update `src/app/ProjectSelector.tsx` to fetch real projects and allow selection
  - [ ] On project selection, store in project context and navigate to dashboard
  - [ ] Add route `/projects` to router
  - [ ] Update router — root `/` shows ProjectSelector, project-scoped routes nested under selected project

## Dev Notes

### Support DocType — Complete Field List (as created)

| Field | Label | Type | Options/Notes |
|---|---|---|---|
| support_tag_id | Support Tag ID | Data | Required |
| batch_id | Batch ID | Link | Options: Batch, required |
| drawing_no | Drawing No | Data | From Excel |
| revision | Revision | Data | From Excel (original input revision) |
| level | Level | Data | From Excel |
| present_status | Present Status | Data | From Excel (original status text) |
| remarks | Remarks | Text | From Excel |
| status | Status | Select | New, Ready to Assign, In Progress, Under Review, Approved, Needs Rework, Client Returned, With Client, Completed. Default: New |
| assigned_to | Assigned To | Link | Options: User |
| revision_number | Revision Number | Int | Default: 0. Display as R0, R1, R2 on frontend |
| revision_type | Revision Type | Select | IFR, RIFR, IFC |
| file_path | File Path | Data | Current DWG path on shared drive |
| markup_pdf_path | Markup PDF Path | Data | Latest markup PDF path |
| assigned_at | Assigned At | Datetime | |
| submitted_at | Submitted At | Datetime | |
| reviewed_at | Reviewed At | Datetime | |
| tat_hours | TAT (Hours) | Float | Read-only, auto-calculated: submitted_at - assigned_at |

### Actual Frappe Field Names (for API calls)

Note: Link fields use `_id` suffix in our DocTypes:
- Batch.project → fieldname is `project_id`
- Support.batch → fieldname is `batch_id`

In TypeScript (camelCase): `projectId`, `batchId`

### Support Status Colors (for frontend reference)

| Status | Color |
|---|---|
| New | Gray |
| Ready to Assign | Purple |
| In Progress | Blue |
| Under Review | Indigo |
| Approved | Emerald |
| Needs Rework | Red |
| Client Returned | Rose |
| With Client | Cyan |
| Completed | Green |

### Folder Structure on Shared Drive

When PM creates a project, create: `{SANGAM_DRIVE_ROOT}/{project_name}/`

Batch folders (created in a later story): `{SANGAM_DRIVE_ROOT}/{project_name}/{batch_folder}/`

Batch folder name format: `YYYY-MM-DD_BATCH-XXX_{unique-id}`

### Tauri FS — Creating Folders

```typescript
import { mkdir } from "@tauri-apps/plugin-fs";

// Create project folder on shared drive
await mkdir(`${config.driveRoot}/${projectName}`, { recursive: true });
```

### Project Context Pattern

```typescript
// src/features/projects/project-context.tsx
interface ProjectContextValue {
  selectedProject: Project | null;
  setProject: (project: Project) => void;
  clearProject: () => void;
}
```

Store selected project in both React context and localStorage (so it persists across page refreshes).

### API Calls for This Story

```
# List projects
GET /api/v2/document/Project?fields=["name","project_name","client","status"]&order_by=creation desc

# Create project
POST /api/v2/document/Project
Body: { "project_name": "ProjectA", "client": "ACME Corp" }

# Update project (set folder_path after folder creation)
PATCH /api/v2/document/Project/{name}
Body: { "folder_path": "C:\\...\\ProjectA" }
```

### DocType Permissions Reference

| DocType | SANGAM PM | SANGAM SME | SANGAM QC | SANGAM Actionee |
|---|---|---|---|---|
| Project | Read, Write, Create, Delete | Read | Read | Read |
| Batch | Read, Write, Create, Delete | Read | Read | Read |
| Support | Read, Write, Create, Delete | Read, Write | Read, Write | Read, Write |

**Note:** Actionee/QC `write` on Support is needed for status updates (submit, etc.) in later stories. PM creates projects/batches, everyone else reads them.

### Project Structure (New Files in This Story)

```
src/
├── features/
│   └── projects/                    # NEW — Project feature module
│       ├── index.ts
│       ├── types.ts
│       ├── project-context.tsx
│       ├── components/
│       │   ├── CreateProjectPage.tsx
│       │   └── ProjectListPage.tsx
│       └── hooks/
│           └── useProjects.ts
├── app/
│   ├── ProjectSelector.tsx          # MODIFIED — real project data
│   └── router.tsx                   # MODIFIED — add project routes
```

### Previous Story (1.2) Intelligence

- `frappe-client.ts` uses `credentials: "include"` for session auth — all API calls go through this
- `frappe-client.ts` has `getList`, `getDoc`, `createDoc`, `updateDoc` — use these, don't write raw fetch
- Filter syntax: array format `[["field","=","value"]]`
- `config.ts` has `driveRoot` and `frappeUrl` from env
- `ProjectSelector.tsx` exists as placeholder — replace with real data
- `router.tsx` has placeholder routes — add project routes
- Auth context provides `roles` for permission checks on frontend
- shadcn/ui components available: Card, Input, Button, Label
- TanStack Query for all data fetching — `useQuery` for lists, `useMutation` for creates

### Anti-Patterns (DO NOT)

- Do NOT use `useEffect` + `fetch` — use TanStack Query hooks
- Do NOT use object syntax for filters — use array syntax `[["field","=","value"]]`
- Do NOT use v1 API (`/api/resource/`) — use `/api/v2/document/`
- Do NOT hardcode drive root path — read from `config.driveRoot`
- Do NOT silently skip folder creation errors — show raw error to user
- Do NOT create Batch or Support frontend features in this story — only Project
- Do NOT pre-create batch subfolder structure — that's a later story
- Do NOT use manual useMemo/useCallback — React Compiler handles it

### References

- [Architecture Document](_bmad-output/planning-artifacts/architecture.md) — File Operations Architecture, Project Structure, Implementation Patterns
- [PRD](_bmad-output/planning-artifacts/Samanvay_SANGAM_MVP_PRD.md) — Section 5 (Folder Strategy), Section 6.1 (Batch Management), Section 6.2 (Support Register)
- [Epics Document](_bmad-output/planning-artifacts/epics.md) — Epic 2 description, FR1-FR4, Support Statuses, Role Permissions
- [Frappe Knowledge Base](docs/frappe-knowledge-base.md) — DocType creation, REST API, permissions
- [Frappe v2 API Reference](docs/frappe-api-v2-reference.md) — CRUD endpoints, filter syntax
- [Story 1.2](_bmad-output/implementation-artifacts/1-2-auth-app-shell.md) — Auth context, app shell, router patterns
- [Tauri FS Plugin](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/fs) — mkdir, exists, readDir

## Dev Notes — Adhoc Changes (Not in Original Story)

### Token Auth via Custom Backend Endpoint
Session/cookie auth failed in Tauri webview (SameSite=Lax + HttpOnly blocks cross-origin AJAX). Created custom whitelisted method `samanvay_sangam_backend.api.login` that validates email+password and returns API token + user info + roles in one call. All API calls now use `Authorization: token api_key:api_secret`.

### Quality Tooling
Added ESLint (sonarjs, unicorn, no-relative-import-paths), Knip (dead code), and `npm run quality` script. Not in original story but needed for code quality.

### Tauri FS Scope
`allow-mkdir` and other FS permissions needed explicit `{ "path": "**" }` scope to allow creating folders at arbitrary paths (shared drive root).

### Login autocomplete
Added `name` and `autoComplete` attributes to login form inputs for browser password manager support.

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Session auth → token auth migration (cookie SameSite issue)
- Encryption key issue with generate_keys — resolved via bench execute
- Tauri FS scope for mkdir — needed `**` wildcard

### Completion Notes List
- Task 1-3: DocTypes created manually in Frappe UI (Project, Batch, Support)
- Task 4: Project context provider with localStorage persistence
- Task 5: Project creation page with Tauri FS folder creation
- Task 6: Project list and selector with real Frappe data

### File List
- .gitignore (modified)
- eslint.config.mjs (new)
- knip.json (new)
- package.json (modified)
- src-tauri/capabilities/default.json (modified)
- src/App.tsx (modified)
- src/main.tsx (modified)
- src/lib/api/frappe-client.ts (modified)
- src/features/auth/ (modified — token auth)
- src/features/projects/ (new)
- src/app/ProjectSelector.tsx (modified)
- src/app/router.tsx (modified)
- src/app/sidebar-menu.ts (modified)
- samanvay_sangam_backend/api.py (new — backend repo)
