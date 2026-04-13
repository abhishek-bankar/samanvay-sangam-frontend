# Samanvay SANGAM — MVP Product Requirements Document

**Version:** 1.0 (MVP)  
**Date:** 09 April 2026  
**Author:** Abhishek / Inventive Biz Sol  
**Status:** Draft  
**Companion document:** Samanvay_SANGAM_PRD.md (full vision)

---

## 1. Purpose of This Document

This is the MVP scope of Samanvay SANGAM — a deliberately stripped-down version of the full PRD designed to be built and deployed in the shortest time possible. The goal is to get a working system in the hands of the team within weeks, prove the workflow, then expand toward the full PRD vision.

The full PRD captures the long-term product vision. This MVP document captures only what is necessary to start tracking work, enforcing accountability, and managing comments today.

---

## 2. MVP Philosophy

**Core principle:** SANGAM is a status tracker. The shared drive is the file system. The two work together but never overlap responsibilities.

- **SANGAM tracks** who is doing what, current status, assignments, comments, timestamps, and revision history.
- **The shared drive holds** every file (DWGs, markup PDFs, client inputs, final outputs).
- **Users open and save files directly** from the shared drive over LAN — never through SANGAM.
- **SANGAM moves files** between folders programmatically when status changes.

This split eliminates the most time-consuming parts of building a typical workflow tool: file uploads, downloads, previews, streaming, and AutoCAD plugin integration. None of those are needed for MVP.

---

## 3. What's In and Out of MVP Scope

### In Scope

- Support register — central tracker for every support drawing
- SME assignment to Actionees (individual or bulk)
- Status tracking with timestamps (assigned, submitted, reviewed, approved, rejected)
- Internal review loop (SME ↔ Actionee) with comments and PDF markup attachments
- External review tracking (Client decisions captured by PM, with PDF markup attachments)
- Rejected pool — central reassignment queue for all rejected work
- PM and SME both have authority to reassign rejected work
- Comment management per support (text + PDF markup file references)
- Revision tracking (Rev A, Rev B, Rev C…)
- Folder-based file management on shared drive
- Auto-folder operations on status changes (move files between stage folders)
- Role-based dashboards for PM, SME, Actionee
- Basic duplicate detection (flag if Support Tag ID already exists)
- Single-project support
- Basic turnaround time calculation per support and per Actionee

### Out of Scope (Deferred to Full PRD)

- AutoCAD WPF panel (engineers and SME work via shared drive directly)
- Navisworks plugin API integration (existing folder-based plugin continues to work)
- Client portal (clients continue to send batches and review via email; PM is the bridge)
- Multi-project support (start with single project, expand later)
- Advanced analytics dashboards (only basic counts and TAT for MVP)
- File previews inside the web app
- Client-facing UI of any kind
- Notifications (email/Slack alerts)
- Time-based SLA enforcement and escalation rules

---

## 4. User Roles (MVP)

| Role | Description | Access |
|------|-------------|--------|
| **Project Manager** | Manages overall workflow, client communication via email, full oversight | Full visibility, can assign, reassign, and update status on any support |
| **SME** | Distributes work, reviews submissions, manages rejections | Visibility into all supports, assignment and review capabilities |
| **Actionee** | Performs manual cleaning of support drawings | Sees only their assigned supports |

**Client is NOT a user in MVP.** Client communication continues via email. PM acts as the bridge — uploads client-sent files into the system, captures client decisions back into the system manually.

---

## 5. Folder Strategy

### Root Structure

All files live on a shared drive accessible over LAN. Either a physical intranet server or a network share — both work the same way.

```
\\sangam-server\projects\
└── ProjectA\
    └── 2026-03-30_BATCH-001_a4f2\
        ├── 01_input\
        ├── 02_extracted\
        ├── 03_cleaned\
        ├── 04_assigned\
        │   ├── ramesh\
        │   ├── priya\
        │   └── amit\
        ├── 04a_rejected_pool\
        ├── 05_submitted\
        │   ├── ramesh\
        │   ├── priya\
        │   └── amit\
        ├── 06_sme_review\
        │   ├── SP-1001\
        │   └── SP-1003\
        ├── 07_approved\
        ├── 08_client_review\
        │   ├── SP-1001\
        │   └── SP-1003\
        └── 09_client_final\
```

### Naming Convention

- **Project folders:** project name (e.g., `ProjectA`)
- **Batch folders:** `YYYY-MM-DD_BATCH-XXX_<unique-id>` — date prefix for chronological sorting, batch number for human reference, short unique suffix to guarantee no collisions
- **Stage folders:** numbered prefix to enforce visual order in Explorer

### Folder = Status Mapping

| Folder | Meaning |
|--------|---------|
| `01_input` | Client's original files (model + Excel) |
| `02_extracted` | Navisworks plugin output (raw DWGs) |
| `03_cleaned` | AutoCAD plugin output (programmatically cleaned) |
| `04_assigned/<actionee>/` | Currently assigned to a specific Actionee |
| `04a_rejected_pool/` | Rejected, awaiting PM/SME reassignment |
| `05_submitted/<actionee>/` | Submitted by Actionee, awaiting SME review |
| `06_sme_review/<support-id>/` | Holds SME's markup PDFs for the support |
| `07_approved` | SME-approved, ready for client |
| `08_client_review/<support-id>/` | Holds client's markup PDFs for the support |
| `09_client_final` | Client-approved final files |

A file's folder location = its current status. This is enforced by SANGAM moving files automatically on status changes.

---

## 6. Functional Requirements

### 6.1 Batch Management

- PM creates a new batch in SANGAM by entering: project, batch name, support count.
- SANGAM auto-generates the batch folder: `YYYY-MM-DD_BATCH-XXX_<unique-id>` and creates all subfolder stages.
- PM drops the client-sent model and Excel into `01_input\` via Windows Explorer.
- PM runs the existing Navisworks plugin pointed at `01_input\` → `02_extracted\` (no API integration; plugin uses folders as before).
- PM (or designer) runs the existing AutoCAD cleaning plugin pointed at `02_extracted\` → `03_cleaned\` on individual machines.
- PM clicks "Sync Cleaned" in SANGAM → system scans `03_cleaned\`, creates a Support record for each DWG file found with status `Cleaned`.

### 6.2 Support Register

- Every support is identified by its unique Support Tag ID (primary key).
- Each record tracks: Support Tag ID, Batch, current status, assigned Actionee, revision (Rev A/B/C…), assigned timestamp, submitted timestamp, current file path on shared drive, comment count.
- Statuses: `Cleaned`, `Assigned`, `Submitted`, `Under SME Review`, `Rejected (Pool)`, `Approved`, `Sent to Client`, `Client Rejected`, `Client Approved (Final)`.

### 6.3 Duplicate Detection (Basic)

- When PM clicks "Sync Cleaned" or creates a support manually, SANGAM checks if the Support Tag ID already exists.
- If duplicate found, SANGAM flags it with a warning showing which batch the original belongs to and its current status.
- PM decides whether to skip, override, or treat it as a new revision.

### 6.4 Assignment

- SME (or PM) opens the list of `Cleaned` or `Rejected (Pool)` supports.
- Selects one or multiple supports → assigns to an Actionee.
- **System action:** moves DWG files from current folder (`03_cleaned\` or `04a_rejected_pool\`) to `04_assigned\<actionee>\`.
- Records assigned timestamp.

### 6.5 Submission by Actionee

- Actionee opens SANGAM, sees their assigned supports with file paths.
- Clicks the file path link → opens DWG directly in AutoCAD over LAN.
- Performs manual cleaning, saves (Ctrl+S writes to shared drive in place).
- Returns to SANGAM, clicks "Submit" on the support.
- **System action:** moves the DWG from `04_assigned\<actionee>\` to `05_submitted\<actionee>\`.
- Records submitted timestamp. Status becomes `Submitted`. Turnaround time is auto-calculated.

### 6.6 SME Review (with Three Decision Paths)

When SME reviews a submitted support:

**Path A — Approve:**
- SME opens the DWG over LAN, does QC.
- Clicks "Approve" in SANGAM.
- **System action:** moves DWG from `05_submitted\<actionee>\` to `07_approved\`.
- Status becomes `Approved`.

**Path B — Reject + Reassign Immediately:**
- SME exports the drawing as PDF, marks it up in Bluebeam/Adobe.
- Clicks "Start Review" in SANGAM → SANGAM creates `06_sme_review\<support-id>\` and opens it in Windows Explorer.
- SME drops the markup PDF into the open folder.
- Returns to SANGAM, clicks "Reject + Reassign," picks an Actionee (any Actionee, not necessarily the original), optionally types a short text note.
- **System action:** verifies a PDF exists in `06_sme_review\<support-id>\`, moves DWG from `05_submitted\<actionee>\` to `04_assigned\<chosen-actionee>\`, records comment with PDF reference, increments revision, updates status to `Assigned`.

**Path C — Reject Only (no immediate reassignment):**
- Same markup process as Path B.
- SME clicks "Reject Only" — no Actionee picked.
- **System action:** moves DWG from `05_submitted\<actionee>\` to `04a_rejected_pool\`, records comment, increments revision, updates status to `Rejected (Pool)`.

### 6.7 Rejected Pool

- A central queue containing all rejected work — both SME rejections (Path C) and Client rejections.
- Visible to both PM and SME on their dashboards.
- Each rejected item shows: Support Tag ID, who rejected (SME or Client), original Actionee, current revision, comment, link to markup PDF.
- PM or SME can:
  - Pick a single support and assign to an Actionee.
  - Bulk select multiple supports and assign all to one Actionee in one action.
- **System action on assignment:** moves DWG from `04a_rejected_pool\` to `04_assigned\<chosen-actionee>\`, updates status, records new assigned timestamp.

### 6.8 Client Review (Captured by PM)

- After supports are approved by SME, PM emails the client with files from `07_approved\` (manual export — zip and email, or shared link).
- **System action when PM clicks "Send to Client":** moves DWGs from `07_approved\` to `08_client_review\<support-id>\`, status becomes `Sent to Client`.
- Client reviews offline, marks up PDFs, sends them back via email.
- PM drops client's markup PDFs into the corresponding `08_client_review\<support-id>\` folder.
- PM goes to SANGAM and either:
  - Marks `Client Approved` → **System action:** moves DWG to `09_client_final\`.
  - Marks `Client Rejected` with optional text note → **System action:** moves DWG to `04a_rejected_pool\`, records comment with PDF reference, increments revision.

### 6.9 Comment Management

- Comments are attached to individual Support Tag IDs.
- Each comment record stores: author, role, timestamp, text content, optional PDF file reference (path on shared drive), revision number, internal/external flag.
- Comments are not uploaded to SANGAM — only the file path is stored. The actual PDF lives on the shared drive in the appropriate review folder.
- Both internal (SME) and external (Client) comments are tracked the same way for MVP. Visibility separation is not needed since clients don't access SANGAM in MVP.

### 6.10 Revision History

- Each support tracks its current revision number (Rev A, Rev B, Rev C…).
- Revision auto-increments on every rejection (SME or Client).
- Each comment record is tagged with the revision it belongs to, so the history is reconstructable.
- No dedicated revision history UI in MVP — the comment thread on the support page serves as the history.

### 6.11 Role-Based Dashboards

**PM Dashboard:**
- New batches needing extraction
- Cleaned supports waiting for assignment
- All supports in progress (status overview)
- Rejected pool (with bulk action)
- Approved supports waiting to be sent to client
- Client-rejected supports needing reassignment (also shown in rejected pool)

**SME Dashboard:**
- Cleaned supports waiting for assignment
- Submitted supports awaiting review (grouped by Actionee)
- Rejected pool (with bulk action)

**Actionee Dashboard:**
- "My Assignments" list showing only their assigned supports with status badges (Assigned, Reassigned after rejection)
- For each support: file path link, comment thread, revision number

### 6.12 Basic Analytics (MVP-level)

For MVP, only the essentials:

- Count of supports per status (per batch and overall)
- Average turnaround time per Actionee
- Rejection rate per Actionee (rough percentage)

No charts, no exports — just simple counts visible on the PM dashboard. Full analytics dashboards are deferred to the full PRD.

---

## 7. System Behavior on Status Changes

This is the heart of the MVP. Every status change in SANGAM triggers a folder operation on the shared drive.

| Action | From folder | To folder |
|--------|-------------|-----------|
| SME assigns support | `03_cleaned\` | `04_assigned\<actionee>\` |
| Actionee submits | `04_assigned\<actionee>\` | `05_submitted\<actionee>\` |
| SME approves | `05_submitted\<actionee>\` | `07_approved\` |
| SME rejects + reassigns | `05_submitted\<actionee>\` | `04_assigned\<chosen>\` |
| SME rejects only | `05_submitted\<actionee>\` | `04a_rejected_pool\` |
| PM/SME reassigns from pool | `04a_rejected_pool\` | `04_assigned\<chosen>\` |
| PM sends to client | `07_approved\` | `08_client_review\<support-id>\` |
| Client approves | `08_client_review\<support-id>\` | `09_client_final\` |
| Client rejects | `08_client_review\<support-id>\` | `04a_rejected_pool\` |

**Sanity checks:**
- Before rejection, SANGAM verifies that a markup PDF exists in the relevant review folder. If not, it warns the user.
- File operations are atomic where possible — if a move fails (file locked by AutoCAD, permission issue), the status change is also rolled back and the user gets an error.

---

## 8. Tech Stack (MVP)

- **Backend / Framework:** Frappe (existing template and team expertise)
- **Frontend:** Frappe's built-in list views, form views, dashboards (no separate Next.js for MVP — minimize moving parts)
- **Database:** MariaDB (Frappe default)
- **File operations:** Python `shutil` and `os` modules — folder creation, file moves, existence checks
- **Hosting:** AWS EC2 (single instance)
- **Shared drive:** Mounted on the EC2 server via SMB/CIFS, OR co-located on intranet if file size requires LAN access (decision pending — see Open Questions in full PRD)

**Why Frappe is the right choice for MVP:**

Frappe provides out of the box: user/role management, permissions, list views, form views, comments (built-in!), file attachments, audit trail, REST API, dashboards. The MVP scope is essentially a set of DocTypes (Project, Batch, Support, Comment, Assignment) with a workflow on top — exactly what Frappe is built for. Most of the development effort goes into the folder operations and the rejection flow, not the UI.

---

## 9. Build Effort Estimate (Rough)

| Component | Effort |
|-----------|--------|
| DocType definitions (Project, Batch, Support, Comment, Assignment) | 2-3 days |
| Folder operation utilities (create, move, sanity checks) | 2-3 days |
| Status workflow + buttons (Submit, Approve, Reject paths) | 3-4 days |
| Rejected pool dashboard + bulk reassignment | 2 days |
| PM, SME, Actionee dashboards | 3-4 days |
| Basic analytics counts | 1-2 days |
| Testing + bug fixes | 1 week |
| **Total** | **3-4 weeks** for a working MVP |

This assumes one developer with Frappe expertise. With your existing template and team, it could be even faster.

---

## 10. Migration Path to Full PRD

Once the MVP is running and the team is comfortable, the path to the full PRD is:

1. **Add AutoCAD WPF panel** — biggest UX improvement, eliminates browser switching for Actionees and SME.
2. **Add Navisworks plugin API integration** — eliminates manual extraction triggering.
3. **Add Client Portal** — direct client batch submission and review, removes PM as the email bridge.
4. **Add Multi-project support** — switch user model and folder strategy to handle multiple projects.
5. **Build full analytics dashboards** — productivity, TAT trends, rejection rates with charts.
6. **Add notifications** — email alerts on status changes.
7. **Move to Next.js frontend** (optional) — only if Frappe's built-in UI becomes a constraint.

The MVP is designed so that none of these later additions require throwing away or rewriting MVP code. The data model and folder strategy are already aligned with the full vision.

---

## 11. MVP Success Criteria

- All support drawings tracked from `03_cleaned\` to `09_client_final\` — zero supports lost in email.
- Every comment captured with author, timestamp, revision, and PDF reference.
- Rejected pool gives PM/SME full visibility and control over reassignment.
- Turnaround time measurable per Actionee.
- Workflow runs end-to-end without anyone resorting to email for handoffs (except for client communication, which stays on email by design in MVP).
- The team uses SANGAM as their daily source of truth within 2 weeks of launch.

---

## 12. Out of Scope Reminders (Things People Will Ask For)

- "Can I see a preview of the DWG in the browser?" — No. Open it from the shared drive in AutoCAD.
- "Can clients log in?" — No, not in MVP. Continue email.
- "Can I see fancy charts?" — No, basic counts only.
- "Can I get an email when something is assigned to me?" — No, not in MVP.
- "Can we have multiple projects?" — One project for MVP. Multi-project later.
- "Can I edit drawings inside the browser?" — No. Browser is for status only.

These are all valid asks and they all live in the full PRD. The MVP is intentionally narrow to ship fast.

---

*This MVP PRD is paired with the full Samanvay SANGAM PRD. Read the full PRD for the long-term product vision; read this document for what gets built first.*
