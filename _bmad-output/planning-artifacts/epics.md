---
stepsCompleted: [1, 2]
inputDocuments:
  - '_bmad-output/planning-artifacts/Samanvay_SANGAM_MVP_PRD.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/Samanvay_SANGAM_PRD.md (reference only)'
  - '_bmad-output/implementation-artifacts/spec-sangam-prototype.md (reference only)'
---

# Samanvay SANGAM MVP - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Samanvay SANGAM MVP, decomposing the requirements from the PRD, Architecture, and prototype refinements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR-ROLES: System uses Frappe's built-in role system. Five SANGAM roles: `SANGAM PM`, `SANGAM SME`, `SANGAM Actionee`, `SANGAM QC`, `SANGAM Client`. Users can have multiple roles. Admin assigns via Frappe. Desktop app reads logged-in user's roles and shows combined permissions. Role hierarchy: PM > SME > QC > Actionee. PM can do everything SME can plus client-facing actions. SME can do everything QC can plus assignment and review. QC can see rejected pool but cannot assign or review. Actionee can only see and work on their assignments.

FR1: PM creates a new project in SANGAM (project name + basic details). System creates the root project folder on shared drive. All subsequent navigation is project-scoped — users enter a project first, then see project-specific data.

FR2: PM creates a new batch under an existing project. PM uploads Navisworks model file + Support Excel via desktop app file picker. Desktop app copies files to `01_input\` on shared drive. Desktop app parses Excel — scans sheets for matching column format (SL.NO, SUPPORT No., DRAWING No., REVISION, LEVEL, PRESENT STATUS, REMARKS). If match found, parses that sheet. If no match, shows dropdown of all sheet names for PM to pick. Parsed data + file metadata (name, size, path, uploader, timestamp) sent to Frappe. Each Excel row becomes a Support record in Frappe with all columns stored (Support No. = Support Tag ID, Drawing No., Revision, Level, Present Status, Remarks). System creates batch folder structure with all 9 subfolders on shared drive.

FR3: Support Tag IDs are unique within a batch. If the Excel has duplicate IDs within the same batch, show error to PM. Cross-batch duplicates are allowed — handled at reporting level later, not at creation time.

FR4: PM clicks "Sync Cleaned" — system scans `03_cleaned\` folder on shared drive, matches DWG filenames (without extension) to Support Tag IDs stored in Frappe for that batch. Matched supports get status updated to `Ready to Assign`. Unmatched files are flagged to PM.

FR5: SME or PM assigns individual or multiple supports to an Actionee (selected from users with `SANGAM Actionee` role). System moves DWG files from `03_cleaned\` to `04_assigned\<actionee>\`. Records assigned timestamp. Status becomes `In Progress`.

FR6: Actionee sees assigned supports with file paths. Clicks file path to open DWG in AutoCAD over LAN. Clicks "Submit" — system moves DWG from `04_assigned\<actionee>\` to `05_submitted\<actionee>\`. Records submitted timestamp. TAT auto-calculated. Status becomes `Under Review`. First submission revision type is IFR.

FR7: SME approves submitted support. System moves DWG from `05_submitted\<actionee>\` to `07_approved\`. Status becomes `Approved`.

FR8: SME rejects + assigns immediately. Default assignee is QC, but SME can override and pick any user. Markup PDF lives alongside the DWG in `05_submitted\<actionee>\`. System verifies PDF exists next to DWG, moves all files (DWG + PDFs) to assignee's folder (`04_assigned\<chosen-user>\`), records PDF path in Frappe, increments revision (type RIFR). Status becomes `In Progress`.

FR9: SME rejects only (no immediate assignment). System moves all files (DWG + PDFs) to `04a_rejected_pool\`. Records PDF path, increments revision (type RIFR). Status becomes `Needs Rework`. Support sits in pool until PM/SME assigns later.

FR10: Rejected pool — central queue of all unassigned rejected work (both SME and Client rejections). PM or SME can assign from pool: single, bulk select, or auto-assign with checkboxes (equal distribution, QC users pre-selected). System moves all files from `04a_rejected_pool\` to `04_assigned\<chosen-user>\`. Status becomes `In Progress`.

FR11: PM clicks "Send to Client" on approved supports. Default is entire batch, with option to bulk select individual supports. PM's queue shows two separate sections: fresh approvals (from SME, IFR type) and QC rework (from QC submissions, RIFR type). System moves DWGs from `07_approved\` to `08_client_review\<support-id>\`. Status becomes `With Client`.

FR12: PM records client decision. "Client Approved" → moves DWG to `09_client_final\`, revision type becomes IFC, status becomes `Completed`. "Client Rejected" → moves all files (DWG + client markup PDF) to `04a_rejected_pool\`, records PDF path, increments revision (type RIFR), status becomes `Client Returned`.

FR13: Markup PDFs live alongside the DWG in the same folder. When SME/Client rejects, system verifies a PDF exists next to the DWG. On any file move (rejection, reassignment), all files for that support (DWG + PDFs) move together as a unit. SME/Actionee/QC can click to open markup PDF directly from the desktop app. PDF path recorded in Frappe for each rejection. No text comment system in MVP.

FR14: Each support tracks revision number (Rev A, B, C…) and revision type (IFR = Issued For Review, RIFR = Re-Issued For Review, IFC = Issued For Construction). First submission is IFR. Each rejection increments revision with type RIFR. Final client approval marks IFC. Each revision links to the markup PDF that triggered it.

FR15: PM Dashboard (project-scoped) — new batches needing extraction, supports ready to assign, all supports status overview with status tabs, rejected pool (Needs Rework + Client Returned), fresh approvals waiting to send to client, QC rework waiting to send to client (separate section), supports with client.

FR16: SME Dashboard (project-scoped) — supports ready to assign, submitted supports under review, rejected pool.

FR17: Actionee/QC Dashboard (project-scoped, shared view) — "My Assignments" list with status badges, file path link to open DWG, markup PDF link (if rework), revision number and type. Revision type (IFR vs RIFR) differentiates fresh work from rework.

FR18: QC submission flow — when QC submits reworked drawing, it goes directly to PM's "Send to Client" queue (QC rework section), skipping SME re-review. Status becomes `Approved`. Revision type remains RIFR.

FR19: Basic analytics (project-scoped) — count of supports per status (per batch and overall), average TAT per Actionee, rejection rate per Actionee.

FR20: Auto-assign — PM/SME clicks "Auto Assign", all Actionees pre-selected with checkboxes. PM can uncheck anyone to exclude (e.g., someone on leave). System distributes unassigned supports equally among checked Actionees. Moves files accordingly.

FR21: Reassignment (3 modes) — Single: reassign one support. Bulk select: pick multiple supports, reassign to one user. All-at-once: reassign ALL of one Actionee's supports to another (leave scenario). System moves all files (DWG + PDFs) from old folder to new folder.

### Support Statuses (9)

| Status | Color | Meaning | Who acts next |
|--------|-------|---------|---------------|
| New | Gray | Imported from Excel, no DWG yet | PM (run extraction/cleaning) |
| Ready to Assign | Purple | DWG cleaned, needs assignment | SME |
| In Progress | Blue | Assigned to Actionee/QC, being worked on | Actionee/QC |
| Under Review | Indigo | Submitted, awaiting SME check | SME |
| Approved | Emerald | SME approved, ready for client | PM |
| Needs Rework | Red | Rejected by SME internally | SME/PM (assign from pool) |
| Client Returned | Rose | Rejected by client | SME/PM (assign from pool) |
| With Client | Cyan | Sent to client, awaiting response | PM (captures decision) |
| Completed | Green | Client approved, final (IFC) | Done |

### Role Hierarchy & Permissions

| Action | Actionee | QC | SME | PM |
|--------|:--------:|:--:|:---:|:--:|
| View own assignments | Yes | Yes | Yes | Yes |
| Submit work | Yes | Yes | Yes | Yes |
| Open DWG / markup PDF | Yes | Yes | Yes | Yes |
| View rejected pool | No | Yes | Yes | Yes |
| Review (approve/reject) | No | No | Yes | Yes |
| Assign / reassign | No | No | Yes | Yes |
| Auto-assign | No | No | Yes | Yes |
| Create project/batch | No | No | No | Yes |
| Upload Excel / Sync | No | No | No | Yes |
| Send to client | No | No | No | Yes |
| Client decisions | No | No | No | Yes |
| Analytics | No | No | Yes | Yes |

### NonFunctional Requirements

NFR1: Internal-only application — no public internet exposure, LAN access only.
NFR2: ~10-20 concurrent users. Single Frappe instance sufficient.
NFR3: Audit trail — every action logged with user + timestamp (Frappe built-in).
NFR4: Data integrity — Support Tag ID uniqueness within batch enforced, no orphan records.
NFR5: File-state consistency — folder location must match DB status. Two-phase operations: API first, file move second, confirmation.
NFR6: Windows-only desktop application (Tauri v2).
NFR7: LAN shared drive — direct `\\server\path` UNC access from desktop app.
NFR8: Error handling — show actual errors directly to user. No offline mode, no cached data, no retry queues, no fallbacks.

### Additional Requirements (from Architecture)

- Starter template: `npm create tauri-app@latest sangam-desktop -- --template react-ts` with React 19, shadcn/ui, TanStack Query v5, React Router v7
- Frappe v2 API only (`/api/v2/document/`, `/api/v2/method/`, `/api/v2/doctype/`) — never v1
- Token-based auth: `Authorization: token api_key:api_secret`
- Thin typed Frappe API wrapper (`frappe-client.ts`) with snake_case ↔ camelCase conversion
- File operations via Tauri plugins (`@tauri-apps/plugin-fs`, `@tauri-apps/plugin-shell`) — single `file-ops/` module
- React 19 patterns: useActionState, useTransition, React Compiler, no forwardRef, no manual useMemo/useCallback
- TanStack Query for all data fetching — never useEffect + fetch
- Feature-based module structure with enforced boundaries
- React Compiler requires Vite plugin setup during scaffold
- UNC path support via Tauri FS needs verification in first story
- All files for a support (DWG + markup PDFs) always move together as a unit
- Excel parsing client-side in desktop app (read .xlsx, scan for column format match)
- Project-scoped navigation — user enters project first, all views filtered to that project
- Collapsible sidebar with icons

### UX Design Requirements

No UX Design document found. MVP prototype at `mvp-prototype/` used as visual reference. Key UX decisions from prototype:
- Project-scoped navigation (enter project → see project workspace)
- Collapsible sidebar with role-based menu items and count badges
- Status tabs on tables instead of dropdown filters
- Reusable DataTable component with search, filters, sortable columns, bulk select
- Separate sections for fresh approvals vs QC rework in PM's Send to Client view
- Breadcrumb navigation showing project context

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR-ROLES | Epic 1 | Role system (5 roles, hierarchy, Frappe built-in) |
| FR1 | Epic 2 | Project creation |
| FR2 | Epic 2 | Batch creation + Excel upload + parsing |
| FR3 | Epic 2 | Duplicate detection within batch |
| FR4 | Epic 2 | Sync Cleaned |
| FR5 | Epic 3 | Assignment (individual + bulk) |
| FR6 | Epic 4 | Actionee submission |
| FR7 | Epic 5 | SME Approve |
| FR8 | Epic 5 | SME Reject + Assign (default QC) |
| FR9 | Epic 5 | SME Reject Only (to pool) |
| FR10 | Epic 5 | Rejected Pool management |
| FR11 | Epic 6 | Send to Client |
| FR12 | Epic 6 | Client decision (Approve/Reject) |
| FR13 | Epic 5 | Markup PDFs (move with DWG, open from app) |
| FR14 | Epic 5 | Revision tracking (IFR/RIFR/IFC) |
| FR15 | Epic 7 | PM Dashboard |
| FR16 | Epic 7 | SME Dashboard |
| FR17 | Epic 4 | Actionee/QC Dashboard |
| FR18 | Epic 6 | QC submission flow (skip SME re-review) |
| FR19 | Epic 7 | Basic Analytics |
| FR20 | Epic 3 | Auto-assign |
| FR21 | Epic 3 | Reassignment (3 modes) |

## Epic List

### Epic 1: Project Foundation & Auth
PM, SME, QC, and Actionees can log into the SANGAM desktop app, see their role-appropriate shell with collapsible sidebar, select a project, and verify connectivity to Frappe and shared drive.
**FRs covered:** FR-ROLES + Architecture requirements (scaffold, auth, role detection, project-scoped navigation)

## Epic 1: Project Foundation & Auth

### Story 1.1: Scaffold Tauri + React Desktop App

As a **developer**,
I want a working Tauri v2 + React 19 desktop app scaffold with all dependencies installed,
So that I have a verified foundation to build features on.

**Acceptance Criteria:**

**Given** a fresh project directory
**When** the scaffold command is run and dependencies installed
**Then** `npm run tauri dev` launches a desktop window with a React app rendered inside
**And** TypeScript strict mode is enabled
**And** shadcn/ui is initialized with Tailwind CSS v4
**And** TanStack Query v5, React Router v7 are installed
**And** Tauri plugins `@tauri-apps/plugin-fs` and `@tauri-apps/plugin-shell` are installed
**And** Tauri capabilities config grants fs and shell permissions
**And** `npm run tauri build` produces a Windows MSI installer
**And** React Compiler Vite plugin is configured
**And** `SANGAM_DRIVE_ROOT` is configurable (env/config), defaults to local folder for development, replaceable with UNC shared drive path later

**Given** the desktop app running on a Windows machine
**When** the app attempts to read/write files in the configured drive root (`SANGAM_DRIVE_ROOT`)
**Then** file operations work correctly via Tauri FS plugin

### Epic 2: Project & Batch Management
PM can create projects, create batches with Excel upload and parsing, sync cleaned DWGs — resulting in a populated support register with status tabs.
**FRs covered:** FR1, FR2, FR3, FR4

### Epic 3: Work Assignment & Distribution
SME/PM can assign supports to Actionees — individually, bulk, or auto-assign with equal distribution and exclude checkboxes. Supports can be reassigned (single, bulk, all-at-once).
**FRs covered:** FR5, FR20, FR21

### Epic 4: Drawing Work & Submission
Actionees/QC can see their assignments in "My Work" view, open DWGs in AutoCAD, and submit completed work. TAT is tracked. Revision type set to IFR on first submit.
**FRs covered:** FR6, FR17

### Epic 5: SME Review & Rejection Management
SME can review submissions — approve, reject+assign (default QC), or reject to pool. Markup PDFs tracked and move with DWG. Revisions auto-increment with RIFR type. Rejected pool with assignment options.
**FRs covered:** FR7, FR8, FR9, FR10, FR13, FR14

### Epic 6: Client Review & Final Delivery
PM can send approved work to client (batch default/bulk select) with fresh vs QC rework separated. PM records client decisions — approve (IFC/Completed) or reject (Client Returned to pool). QC rework submissions skip SME re-review.
**FRs covered:** FR11, FR12, FR18

### Epic 7: Dashboards & Analytics
Role-based dashboards for PM and SME with project-scoped data. Basic analytics — status counts, TAT per Actionee, rejection rates.
**FRs covered:** FR15, FR16, FR19
