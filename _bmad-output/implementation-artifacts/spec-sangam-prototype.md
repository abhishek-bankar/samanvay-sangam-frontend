---
title: 'Samanvay SANGAM — Full UI Prototype with Mock Data'
type: 'feature'
created: '2026-03-30'
status: 'done'
baseline_commit: 'NO_VCS'
context:
  - '_bmad-output/planning-artifacts/Samanvay_SANGAM_PRD.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Samanvay SANGAM has a complete PRD but no visual artifact for stakeholder approval. The team needs a clickable, detailed UI prototype — covering every workflow, role, status, and screen described in the PRD — before committing to full-stack development.

**Approach:** Build a Next.js 15 prototype with mock data that replicates the SETU (comment-management-frontend) architecture patterns: shadcn/ui components, TanStack Table, Recharts dashboards, role-based layouts, and status-driven workflows. Every PRD feature is represented as a working screen with realistic mock data — no backend, no API calls, no auth integration. Role switching via a global toggle lets stakeholders experience each persona (PM, SME, Actionee, Client).

## Boundaries & Constraints

**Always:**
- Mirror SETU's file structure: `src/app/(app)/`, `src/components/`, `src/lib/`, `src/types/`
- Use shadcn/ui `new-york` style, Tailwind CSS v4, TypeScript strict mode
- All mock data in `src/lib/mock-data/` — single source of truth, typed, realistic
- Every support status from PRD implemented: Unassigned, Assigned, In Progress, Submitted, Under SME Review, SME Rejected, SME Approved, Sent to Client, Client Approved, Client Rejected, Rework In Progress
- Role switcher in header — PM, SME, Actionee, Client — instantly changes what's visible
- Every table must be sortable, filterable, paginated (TanStack Table)
- Status badges with distinct colors for each of the 11 statuses
- Comment threads must show internal vs external separation (internal hidden from Client role)
- Revision history (Rev A, B, C) shown on support detail
- Duplicate detection UI shown on batch upload screen
- All PRD analytics: productivity, TAT, rejection rate, batch progress, rework frequency, duplicate report
- PM can create batches on behalf of Client (backward compatibility per PRD 6.1)
- SME can reassign supports to a different Actionee (per PRD 6.4)
- PM explicitly "Sends to Client" for SME-approved supports — this is a manual workflow step, not automatic (per PRD 6.7)
- Every status change shown in an Activity Log tab on support detail — user, action, timestamp (per PRD 6.5 + NFR audit trail)

**Ask First:**
- Any deviation from PRD feature scope
- Adding features not in the PRD
- Changing the role names or status names

**Never:**
- No real API calls, no Frappe integration, no NextAuth — pure mock
- No AutoCAD panel UI (WPF — out of scope for web prototype)
- No file upload/download of actual DWG files — mock file references only
- No automated notifications (explicitly out of scope per PRD)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Role switch to Client | Click "Client" in role switcher | Only client-visible screens shown: Project Dashboard, Batch Progress, Review Supports. Internal comments hidden. Actionee names hidden. | N/A — mock |
| Role switch to Actionee | Click "Actionee" in role switcher | Only "My Assignments" visible, filtered to assigned supports. Submit button on each. Rejection comments visible. | N/A — mock |
| Duplicate detection on batch | View batch upload screen | System flags 3 mock duplicates with original batch, current status, revision history | Visual alert + detail panel |
| Support status transition | Click "Approve" on Under SME Review support | Status updates to SME Approved in mock state, revision stays same | Toast confirmation |
| Support rejection with comment | Click "Reject" + enter comment on Under SME Review | Status moves to SME Rejected, comment appears in internal thread, revision increments | Required comment validation |
| Batch progress view (Client) | Client views batch B-2024-003 | Progress bar: 45/100 supports, status breakdown chart, per-support status list | N/A |
| PM creates batch for Client | PM clicks "New Batch" with client selector | Batch created with PM as creator, client association, duplicate check triggered | N/A |
| SME reassigns support | SME clicks "Reassign" on assigned support | Actionee dropdown appears, new Actionee selected, timestamp updated, activity log entry added | N/A |
| PM sends to Client (bulk) | PM selects SME-approved supports, clicks "Send to Client" | Status moves to "Sent to Client" for all selected supports, activity log entries created | N/A |
| Activity log on support detail | View support detail → Activity Log tab | Timeline of all status changes: user, action, old status → new status, timestamp | N/A |
| Analytics dashboard (PM) | PM views analytics | 6 chart types: productivity per Actionee, TAT distribution, rejection rate, batch progress, rework frequency, duplicate report | N/A |

</frozen-after-approval>

## Code Map

### Shared Files
- `prototype/css/styles.css` — All styles: layout, cards, tables, badges, charts, responsive
- `prototype/js/mock-data.js` — All mock data: projects, batches, 150+ supports, users, comments, activity logs, revisions
- `prototype/js/app.js` — Shared logic: role switcher (localStorage), navigation, tab rendering, badge helpers, table sort/filter/paginate, toast notifications
- `prototype/js/charts.js` — Chart rendering using Chart.js CDN for analytics

### Pages (HTML files)
- `prototype/index.html` — Projects listing (cards grid, role-filtered)
- `prototype/dashboard.html` — Project dashboard (KPI cards + charts, role-aware)
- `prototype/batches.html` — Batch listing with progress bars
- `prototype/batch-detail.html` — Batch detail: supports in batch, duplicate flags
- `prototype/batch-new.html` — New batch form with duplicate detection preview
- `prototype/supports.html` — Full support register table (sortable, filterable, paginated)
- `prototype/support-detail.html` — Support detail: tabs for Details, Internal Comments, External Comments, Revision History, Activity Log
- `prototype/assignments.html` — SME view: unassigned supports, bulk assign, reassign
- `prototype/my-work.html` — Actionee view: own assigned supports, submit, rework
- `prototype/review.html` — SME review queue + PM "Send to Client" bulk action
- `prototype/client-review.html` — Client review: approve/reject with comments
- `prototype/analytics.html` — 6 chart types with Chart.js
- `prototype/configuration.html` — Project settings, team management

## Tasks & Acceptance

**Execution:**
- [x] `prototype/css/styles.css` — Complete stylesheet: Tailwind-like utility classes via CDN, custom styles for layout, header, cards, tables, badges (11 support + 4 batch statuses), tabs, modals, forms, charts, toasts, responsive design
- [x] `prototype/js/mock-data.js` — Comprehensive mock dataset: 3 projects, 8 batches, 150+ supports with realistic status distribution, 25 users, 50+ comments (internal + external), revision histories, activity logs, 5 duplicate pairs
- [x] `prototype/js/app.js` — Shared app logic: role switcher with localStorage persistence, header/nav rendering, tab visibility by role, badge rendering helpers, table sort/filter/paginate, modal/dialog system, toast notifications, URL param handling for navigation between pages
- [x] `prototype/js/charts.js` — Chart rendering with Chart.js CDN: bar, pie, histogram, stacked bar chart helpers
- [x] `prototype/index.html` — Project cards grid: name, client, status, batch count, support count, progress percentage. Client role sees only their projects. Links to project dashboard.
- [x] `prototype/dashboard.html` — Role-aware dashboard: PM sees all KPIs + charts; SME sees pending actions + team workload; Actionee sees own stats; Client sees batch progress + approval status
- [x] `prototype/batches.html` + `batch-detail.html` + `batch-new.html` — Batch listing with progress bars, batch detail with support breakdown, new batch form with duplicate detection preview showing flagged Support Tag IDs. PM can create on behalf of Client.
- [x] `prototype/supports.html` + `support-detail.html` — Full support register table (sortable, filterable, paginated) with all PRD columns; Support detail page with tabbed view: Details, Internal Comments (hidden from Client), External Comments, Revision History timeline, Activity Log
- [x] `prototype/assignments.html` — SME view: unassigned supports list, Actionee selector dropdown, bulk assign with checkbox selection, assigned count per Actionee summary, Reassign button on already-assigned supports
- [x] `prototype/my-work.html` — Actionee view: assigned supports only, status badges, Submit button per support, rejection comments visible, rework indicator
- [x] `prototype/review.html` — SME review queue: supports in "Under SME Review", Approve/Reject buttons with comment dialog, client rejection queue with client comments visible, PM "Send to Client" bulk action on SME-approved supports
- [x] `prototype/client-review.html` — Client view: supports "Sent to Client", Approve/Reject per support with comment, batch-level progress summary
- [x] `prototype/analytics.html` — 6 analytics sections with Chart.js: (1) Productivity per Actionee bar chart, (2) TAT distribution histogram, (3) Rejection rate per Actionee + per batch, (4) Batch progress stacked bar, (5) Rework frequency pie chart, (6) Duplicate report table
- [x] `prototype/configuration.html` — Card-based config: Project Settings, Team Management (assign PM/SME/Actionees), mock settings

**Acceptance Criteria:**
- Given role is PM, when viewing projects, then all 3 projects visible with full metrics
- Given role is Client, when viewing projects, then only their assigned project(s) visible, no Actionee names anywhere, no internal comments
- Given role is Actionee, when viewing project, then only "My Work" tab shows (not Assignments or Review), filtered to own supports only
- Given role is SME, when viewing project, then Assignments tab + Review tab visible, can see all supports under their project
- Given any role, when switching roles via header toggle, then all screens immediately reflect new role's visibility rules
- Given support in "Under SME Review", when SME clicks Approve, then mock status updates to "SME Approved" with toast confirmation
- Given support in "Under SME Review", when SME clicks Reject, then comment dialog appears (required), status moves to "SME Rejected", comment appears in internal thread
- Given batch upload screen, when viewing, then 3 mock duplicates flagged with original batch reference and current status
- Given analytics page as PM, then all 6 chart types render with mock data
- Given support detail page, when viewing revision history, then timeline shows Rev A → B → C with triggering action and timestamps
- Given support detail page as Client, then internal comments tab is completely hidden
- Given support detail page as PM, then both internal and external comment threads visible
- Given support detail page, when viewing Activity Log tab, then every mock status transition shown with user, action, and timestamp
- Given role is PM on review page, when SME-approved supports exist, then "Send to Client" bulk action button visible
- Given role is SME on assignments page, when a support is already assigned, then "Reassign" button available to switch Actionee
- Given role is PM on batch creation, then can create batch on behalf of a client with client selector dropdown

## Design Notes

**Role Switcher Pattern:** A floating pill in the header (not in page content) that persists across navigation. Uses localStorage so role survives page refresh. This is prototype-only — production will use real auth.

**Mock Data Design:** Supports have a realistic status distribution: ~20% Unassigned, ~15% Assigned, ~15% In Progress, ~10% Under SME Review, ~5% SME Rejected, ~15% SME Approved, ~10% Sent to Client, ~5% Client Approved, ~3% Client Rejected, ~2% Rework In Progress. This gives stakeholders a feel for what a live system looks like at any point in time.

**Tab Visibility by Role:**
| Tab | PM | SME | Actionee | Client |
|-----|:--:|:---:|:--------:|:------:|
| Dashboard | Yes | Yes | Yes | Yes |
| Batches | Yes | Yes | No | Yes (limited) |
| Support Register | Yes | Yes | No | No |
| Assignments | Yes | Yes (primary) | No | No |
| My Work | No | No | Yes (primary) | No |
| Review | No | Yes | No | No |
| Client Review | No | No | No | Yes (primary) |
| Analytics | Yes | Yes | No | No |
| Configuration | Yes | No | No | No |

**Status Badge Color Scheme:**
| Status | Color | Hex |
|--------|-------|-----|
| Unassigned | Gray | #6b7280 |
| Assigned | Blue | #3b82f6 |
| In Progress | Amber | #f59e0b |
| Submitted | Indigo | #6366f1 |
| Under SME Review | Purple | #8b5cf6 |
| SME Rejected | Red | #ef4444 |
| SME Approved | Emerald | #10b981 |
| Sent to Client | Cyan | #06b6d4 |
| Client Approved | Green | #22c55e |
| Client Rejected | Rose | #f43f5e |
| Rework In Progress | Orange | #f97316 |

## Verification

**Manual checks:**
- Open `prototype/index.html` directly in browser — no server needed
- Navigate all pages via links — every page renders without blank screens
- Switch between all 4 roles — each role sees only their permitted tabs and data
- Click through a complete support lifecycle: Unassigned → Assigned → In Progress → Under SME Review → SME Approved → Sent to Client → Client Approved
- Verify Client role cannot see internal comments or Actionee names
- Verify duplicate detection shows flagged supports on batch screen
- Verify all 6 analytics charts render with mock data
- Verify tables are sortable, filterable, and paginated

## Suggested Review Order

**Data layer — understand what drives the prototype**

- All entity types, status constants, role visibility rules, and mock data generation
  [`mock-data.js:1`](../../prototype/js/mock-data.js#L1)

- Shared app shell: role switcher, header, tabs, DataTable class, modal/toast system
  [`app.js:1`](../../prototype/js/app.js#L1)

**Design system**

- Full CSS design system: layout, badges (11 statuses), cards, tables, modals, timeline
  [`styles.css:1`](../../prototype/css/styles.css#L1)

**Core workflow screens — review these to understand the system**

- Projects listing with role-based filtering (Client sees only own projects)
  [`index.html:1`](../../prototype/index.html#L1)

- Role-aware dashboard: different KPIs and charts per role
  [`dashboard.html:1`](../../prototype/dashboard.html#L1)

- Support detail: 5 tabs (Details, Internal/External Comments, Revisions, Activity Log)
  [`support-detail.html:1`](../../prototype/support-detail.html#L1)

- SME review queue with Approve/Reject modals + PM "Send to Client" bulk action
  [`review.html:1`](../../prototype/review.html#L1)

**Assignment and work screens**

- SME bulk assignment + reassign capability
  [`assignments.html:1`](../../prototype/assignments.html#L1)

- Actionee's focused view: own assignments, submit, rework with rejection comments
  [`my-work.html:1`](../../prototype/my-work.html#L1)

- Client review portal: approve/reject with no Actionee visibility
  [`client-review.html:1`](../../prototype/client-review.html#L1)

**Batch management**

- Batch listing with progress bars
  [`batches.html:1`](../../prototype/batches.html#L1)

- Batch detail with duplicate detection flags
  [`batch-detail.html:1`](../../prototype/batch-detail.html#L1)

- New batch form with mock duplicate check results
  [`batch-new.html:1`](../../prototype/batch-new.html#L1)

**Analytics and configuration**

- 6 chart types: productivity, TAT, rejection rate, batch progress, rework, duplicates
  [`analytics.html:1`](../../prototype/analytics.html#L1)

- Project settings, team management, metrics summary
  [`configuration.html:1`](../../prototype/configuration.html#L1)

**Chart helpers**

- Chart.js wrapper functions (bar, pie, histogram, stacked bar)
  [`charts.js:1`](../../prototype/js/charts.js#L1)
