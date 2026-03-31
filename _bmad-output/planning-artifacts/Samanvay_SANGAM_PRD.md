# Samanvay SANGAM — Product Requirements Document

**Version:** 1.1  
**Date:** 30 March 2026  
**Author:** Abhishek / Inventive Biz Sol  
**Status:** Draft

---

## 1. Overview

Samanvay SANGAM is a workflow management platform for piping support drawing projects. It replaces the current email-driven process with a centralized system that tracks every support drawing from extraction to final client approval — providing full visibility, accountability, comment management, and batch-level tracking. The system is accessed through three interfaces: a web application (browser), an AutoCAD panel (WPF plugin for engineers and SME), and plugin APIs (automated integration with Navisworks and AutoCAD extraction/cleaning tools).

---

## 2. Problem Statement

The current support extraction workflow operates almost entirely over email. Once support drawings are distributed to engineers for manual cleaning, there is:

- **No activity tracking or accountability** — no visibility into who is working on what, current status, turnaround time, or individual productivity.
- **No duplicate detection across batches** — the same Support Tag ID can arrive in multiple batches via email with no system to flag it, leading to potential rework or version conflicts.
- **No structured comment management** — internal review comments (SME ↔ Actionee) and external review comments (Client) are buried in email threads with no way to track what was said, what action was taken, or whether it was resolved.

---

## 3. Current Workflow (As-Is)

1. **Client** sends a Navisworks model and support name list (Excel) via email.
2. **Project Manager** downloads and uploads files to a virtual server's predefined input folder.
3. **Navisworks plugin** (on the virtual server) extracts supports per the input list → outputs DWG files to a predefined output folder.
4. **Project Manager** collects DWG files from the server and transfers them to individual designer machines.
5. **AutoCAD plugin** runs on individual machines for programmatic cleaning (requires manual popup click — cannot be fully automated on server).
6. Cleaned DWG files are handed to the **SME**.
7. **SME** distributes files among **Actionees** for remaining manual cleaning work.
8. **Actionees** complete manual cleaning and send files back to **SME** via email.
9. **SME** reviews — either approves or rejects. Rejected files go back to the Actionee. (Internal review loop, all via email.)
10. **Project Manager** collects all SME-approved files (via email) and sends to the **Client** for final approval.
11. **Client** reviews — either accepts or rejects. Rejected files route back through the Project Manager → SME → Actionee chain. (External review loop, all via email.)
12. Cycle repeats until Client accepts.

---

## 4. Scope of This Release

This PRD covers the **post-extraction workflow** — everything that happens after the Navisworks plugin produces DWG files. Specifically:

- Batch and support tracking (multi-project from day one)
- Work assignment and distribution
- Status tracking and turnaround time measurement
- Internal review loop (SME ↔ Actionee)
- External review loop (Client ↔ Project Manager ↔ SME)
- Comment management (internal and external)
- Duplicate support detection across batches
- Client-facing portal for batch submission (Navisworks model + support list), progress tracking, and review
- Revision history tracking
- Plugin API integration (Navisworks and AutoCAD plugins push/pull files via API)
- AutoCAD panel for Actionees and SME to interact with the system without leaving AutoCAD
- DWG file storage and management within the system

**Out of scope for this release:** Automated notifications, time-based SLA enforcement and escalation rules.

---

## 5. User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Project Manager** | Manages overall project, client communication, full oversight | Full visibility across all batches, supports, assignments, comments, and analytics |
| **SME** (Subject Matter Expert) | Distributes work, reviews Actionee output, resolves client comments | Visibility into all supports under their project, assignment and review capabilities |
| **Actionee** | Performs manual cleaning of support drawings | Visibility limited to their own assigned supports, can submit work and respond to SME comments |
| **Client** | Submits batches, reviews final output, provides comments | Limited access — can only see batches/supports sent to them, submit new batches, comment, approve/reject |

---

## 6. Functional Requirements

### 6.1 Batch Management

- Client can submit a new batch directly through the system by uploading the support name list (Excel) and any accompanying files.
- Each batch gets a unique Batch ID with a timestamp of submission.
- Project Manager can also create batches on behalf of the client (for backward compatibility with email submissions).
- System displays all batches with their status: New, In Progress, Under Review, Completed.

### 6.2 Support Register (Central Tracker)

- Every support is identified by its unique **Support Tag ID** — this is the primary key across the entire system.
- Each support record tracks: Support Tag ID, Batch No., assigned Actionee, current status, revision (Rev A, B, C...), assigned date, submitted date, turnaround time (auto-calculated).
- Support statuses: Unassigned, Assigned, In Progress, Submitted, Under SME Review, SME Rejected, SME Approved, Sent to Client, Client Approved, Client Rejected, Rework In Progress.

### 6.3 Duplicate Detection

- When a new batch is uploaded, the system checks each Support Tag ID against all existing records.
- If a duplicate is found, the system flags it and shows: which batch it originally appeared in, its current status, and its revision history.
- Project Manager / SME decides how to handle — create a new revision or skip.

### 6.4 Work Assignment & Distribution

- SME assigns individual supports or bulk-assigns supports to Actionees.
- On assignment, the system records the Assigned At timestamp.
- Actionee sees only their assigned supports in their dashboard.
- SME can reassign supports to a different Actionee if needed.

### 6.5 Status Tracking & Time Measurement

- Every status change is logged with a timestamp and the user who triggered it.
- Turnaround time is calculated as the difference between Assigned At and Submitted At.
- Dashboard views show: supports per status, supports per Actionee, average turnaround time, overdue items (configurable threshold).

### 6.6 Internal Review Loop (SME ↔ Actionee)

- Actionee submits completed work → status moves to "Under SME Review."
- SME reviews and either approves or rejects with a comment.
- Rejected supports go back to the Actionee with the rejection comment visible. Status moves to "SME Rejected."
- Actionee reworks and resubmits. Revision increments (Rev A → Rev B, etc.).
- Full cycle repeats until SME approves.

### 6.7 External Review Loop (Client)

- Once SME approves, Project Manager sends supports to the Client for final review (can be done in bulk per batch).
- Client reviews each support — approves or rejects with comments.
- Rejected supports route back to SME for resolution. Status moves to "Client Rejected."
- Fixed supports go back to Client via Project Manager. Revision increments.
- Cycle repeats until Client accepts.

### 6.8 Comment Management

- Comments are attached to individual Support Tag IDs (file-level, not drawing annotations).
- Two separate comment threads per support: **Internal** (SME ↔ Actionee) and **External** (Client ↔ Project Manager / SME).
- Each comment records: author, role, timestamp, and content.
- Replies and actions taken are tracked as threaded responses.
- Internal comments are never visible to the Client.
- External comments are visible to Project Manager, SME, and Client.

### 6.9 Client Portal

- Client can log in and see: all their submitted batches, batch-level progress (e.g., 45/100 supports completed), individual support statuses.
- Client can submit new batches (upload support list + files).
- Client can review supports sent for their approval — approve or reject with comments.
- Client cannot see internal comments, Actionee names, or internal review history.

### 6.10 Revision History

- Every support maintains a revision trail: Rev A (original), Rev B (after first rework), Rev C, etc.
- Each revision links to: what triggered it (SME rejection or Client rejection), the associated comments, and the before/after timestamps.

### 6.11 Multi-Project Support

- System supports multiple projects from day one.
- Each project has its own batches, supports, assignments, comments, and analytics.
- One Client can have multiple projects but only sees their own projects.
- Internal users (Project Manager, SME, Actionee) can be assigned to multiple projects and switch between them.
- All dashboards and reports are filterable by project.

### 6.12 Plugin API Integration

- The system exposes RESTful API endpoints for external tool integration.
- **Navisworks plugin** pushes extracted DWG files to the system against specific Support Tag IDs and Batch IDs.
- **AutoCAD plugin** pulls assigned DWG files from the system and pushes cleaned files back after processing.
- **AutoCAD panel for Actionees and SME:** A WPF-based panel inside AutoCAD that connects to the system API, allowing users to view assignments, open files directly into AutoCAD, submit completed work, perform reviews, and add comments — all without leaving AutoCAD.
- Client uploads (Navisworks model + support list) are handled via the web portal.

---

## 7. System Interfaces

The system is accessed through three distinct interfaces, each serving different roles and contexts.

### 7.1 Web Application (Browser)

The primary interface for management, oversight, and client interaction. Hosted on AWS EC2, accessible via browser.

**Used by:** Project Manager, SME, Actionee (overview), Client.

### 7.2 AutoCAD Panel (WPF Plugin)

A dockable panel inside AutoCAD that connects to the SANGAM API. This is the primary working interface for Actionees and SME — they never need to open a browser or manually transfer files.

**Used by:** Actionee, SME.

### 7.3 Plugin APIs (Automated)

RESTful API endpoints consumed by the Navisworks extraction plugin and AutoCAD programmatic cleaning plugin. No human interaction — fully automated file push/pull.

**Used by:** Navisworks plugin (server), AutoCAD cleaning plugin (individual machines).

---

## 8. User Flows

### 8.1 Overall System Flow

The end-to-end lifecycle of a batch from client submission to final approval:

1. **Client submits batch** — uploads Navisworks model + support list via web portal.
2. **Project Manager receives batch** — system runs duplicate check against existing supports.
3. **Navisworks extraction (automated)** — plugin reads model + list from SANGAM, extracts supports, pushes DWG files back via API.
4. **AutoCAD programmatic cleaning (automated)** — plugin pulls extracted DWGs, runs cleaning, pushes cleaned DWGs back via API (manual popup click required on individual machines).
5. **SME assigns work** — distributes cleaned supports to Actionees via the system (bulk or individual assignment).
6. **Actionee manual cleaning** — opens DWG via AutoCAD panel, performs manual cleaning, clicks Submit. File pushed to server, timestamp recorded.
7. **SME internal review** — opens submitted DWG via AutoCAD panel or browser. Either approves or rejects with comment. Rejected supports loop back to Actionee with comment visible. Revision increments on resubmission.
8. **Project Manager sends to Client** — collects SME-approved supports, sends to Client for final review (bulk or individual).
9. **Client external review** — Client reviews via web portal. Either approves or rejects with comment. Rejected supports route back to SME → Actionee chain. Revision increments on resubmission.
10. Cycle repeats until Client accepts all supports in the batch.

```
  [CLIENT]                [PM]              [NAVISWORKS]         [AUTOCAD]            [SME]              [ACTIONEE]          [CLIENT]
     |                     |                    |                    |                   |                    |                   |
     | Submit batch        |                    |                    |                   |                    |                   |
     | (model + list)      |                    |                    |                   |                    |                   |
     |-------------------->|                    |                    |                   |                    |                   |
     |                     | Duplicate check    |                    |                   |                    |                   |
     |                     |---->               |                    |                   |                    |                   |
     |                     |                    |                    |                   |                    |                   |
     |                     | Trigger extraction |                    |                   |                    |                   |
     |                     |------------------->|                    |                   |                    |                   |
     |                     |                    | Extract supports   |                   |                    |                   |
     |                     |                    | Push DWGs via API  |                   |                    |                   |
     |                     |                    |------------------->|                   |                    |                   |
     |                     |                    |                    | Clean DWGs        |                    |                   |
     |                     |                    |                    | Push back via API |                    |                   |
     |                     |                    |                    |------------------>|                    |                   |
     |                     |                    |                    |                   | Assign to          |                   |
     |                     |                    |                    |                   | actionees          |                   |
     |                     |                    |                    |                   |------------------>|                   |
     |                     |                    |                    |                   |                    | Manual clean      |
     |                     |                    |                    |                   |                    | Submit            |
     |                     |                    |                    |                   |<-------------------|                   |
     |                     |                    |                    |                   |                    |                   |
     |                     |                    |                    |                   | Review             |                   |
     |                     |                    |                    |                   |----+               |                   |
     |                     |                    |                    |                   |    |               |                   |
     |                     |                    |                    |                   |<---+               |                   |
     |                     |                    |                    |                   |                    |                   |
     |                     |                    |                    |         +---------| REJECT + comment   |                   |
     |                     |                    |                    |         |         |------------------>|                   |
     |                     |                    |                    |         |         |                    | Rework & resubmit |
     |                     |                    |                    |         |         |<-------------------|                   |
     |                     |                    |                    |         +---------| (loop until OK)    |                   |
     |                     |                    |                    |                   |                    |                   |
     |                     |                    |                    |                   | APPROVE            |                   |
     |                     |<------------------------------------------------|          |                    |                   |
     |                     | Send to client     |                    |                   |                    |                   |
     |                     |----------------------------------------------------------------------------------->|               |
     |                     |                    |                    |                   |                    |                   |
     |                     |                    |                    |                   |                    |   Review          |
     |                     |                    |                    |                   |                    |   APPROVE/REJECT  |
     |                     |<-----------------------------------------------------------------------------------|               |
     |                     |                    |                    |                   |                    |                   |
     |                     | If REJECT          |                    |                   |                    |                   |
     |                     |------------------------------------------------>|          |                    |                   |
     |                     |                    |                    |                   | Resolve & resubmit |                   |
     |                     |                    |                    |                   |                    |                   |
```

### 8.2 Client Flow

The Client's experience is intentionally narrow and focused.

1. **Login** → sees only their own projects.
2. **Project dashboard** → list of projects, each showing batch count and overall progress.
3. **Two primary actions:**
   - **Submit new batch** — upload Navisworks model + support name list (Excel). System assigns Batch ID and triggers the extraction pipeline.
   - **Review supports** — view supports sent for their approval. For each support: approve or reject with a file-level comment.
4. **Track progress** — batch-level dashboard showing how many supports are done, in progress, or pending (e.g., 45/100 completed).
5. **View external comments** — see comment history on supports they reviewed. Internal comments (SME ↔ Actionee) are never visible.

```
                              +-------------------+
                              |      LOGIN        |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              | Project Dashboard |
                              | (their projects)  |
                              +--------+----------+
                                       |
                       +---------------+---------------+
                       |                               |
                       v                               v
              +-----------------+             +-----------------+
              | Submit New      |             | Review Supports |
              | Batch           |             | (pending their  |
              | (model + list)  |             |  approval)      |
              +--------+--------+             +--------+--------+
                       |                               |
                       v                       +-------+-------+
              +-----------------+              |               |
              | Track Progress  |              v               v
              | (45/100 done)   |       +----------+    +-----------+
              +-----------------+       | APPROVE  |    | REJECT +  |
                                        +----------+    | comment   |
                                                        +-----------+
```

### 8.3 Project Manager Flow

The Project Manager has full visibility and three main action paths.

1. **Login** → sees all projects, all batches, full analytics.
2. **PM dashboard** → overview of all projects with batch statuses, progress percentages, and key metrics.
3. **Three primary actions:**
   - **Receive and process new batch** — when Client submits a batch, PM reviews it. Duplicate check runs automatically. PM triggers the Navisworks extraction pipeline.
   - **Send to Client** — once SME approves supports, PM sends them to Client for final review (bulk or individual). Tracks Client response status (approved/rejected).
   - **Analytics and reports** — access productivity metrics, turnaround times, rejection rates, support register (full status of all supports), and duplicate report (cross-batch duplicates).

```
                              +-------------------+
                              |      LOGIN        |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              |   PM Dashboard    |
                              | (all projects,    |
                              |  all batches)     |
                              +--------+----------+
                                       |
               +-----------------------+-----------------------+
               |                       |                       |
               v                       v                       v
      +-----------------+     +-----------------+     +-----------------+
      | Receive Batch   |     | Send to Client  |     | Analytics &     |
      | (new from       |     | (SME-approved   |     | Reports         |
      |  client)        |     |  supports)      |     |                 |
      +--------+--------+     +--------+--------+     +--------+--------+
               |                       |                       |
               v                       v                       v
      +-----------------+     +-----------------+     +-----------------+
      | Duplicate Check |     | Track Client    |     | - Productivity  |
      | Trigger         |     | Response        |     | - TAT           |
      | Extraction      |     | (approve/reject)|     | - Rejection %   |
      +-----------------+     +-----------------+     | - Duplicates    |
                                                      +-----------------+
```

### 8.4 SME Flow

The SME is the busiest role with three action paths, accessible via both web app and AutoCAD panel.

1. **Login** → sees all supports under their assigned projects.
2. **SME dashboard** → pending actions at a glance: unassigned supports, submissions awaiting review, client rejections to resolve.
3. **Three primary actions:**
   - **Assign work (new batch arrived)** — view unassigned supports from a new batch. Select Actionee(s), assign individually or in bulk. Timestamp recorded on assignment.
   - **Review submissions (Actionee submitted)** — open submitted DWG in AutoCAD panel for QC. Approve (status moves to SME Approved) or reject with comment (status moves to SME Rejected, support loops back to Actionee).
   - **Handle client rejections** — view Client's rejection comments. Resolve by fixing directly or reassigning to Actionee. Resubmit to PM for Client review.

```
                              +-------------------+
                              |      LOGIN        |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              |  SME Dashboard    |
                              | (pending actions) |
                              +--------+----------+
                                       |
               +-----------------------+-----------------------+
               |                       |                       |
          New batch arrived     Actionee submitted      Client rejected
               |                       |                       |
               v                       v                       v
      +-----------------+     +-----------------+     +-----------------+
      | Assign Work     |     | Review          |     | View Client     |
      | (bulk or        |     | Submissions     |     | Comments        |
      |  individual)    |     | (open DWG, QC)  |     |                 |
      +--------+--------+     +--------+--------+     +--------+--------+
               |                       |                       |
               v               +-------+-------+              v
      +-----------------+      |               |      +-----------------+
      | Select Actionee |      v               v      | Resolve &       |
      | Timestamp       | +----------+  +-----------+ | Reassign        |
      | Recorded        | | APPROVE  |  | REJECT +  | +--------+--------+
      +-----------------+ +----------+  | comment   |          |
                                        +-----+-----+          v
                                              |       +-----------------+
                                              v       | Resubmit to PM  |
                                        +----------+  +-----------------+
                                        | Back to  |
                                        | Actionee |
                                        +----------+
```

### 8.5 Actionee Flow

The Actionee has the simplest and most focused experience, primarily through the AutoCAD panel.

1. **Login** (via AutoCAD panel) → sees only their assigned supports.
2. **My assignments** → list of assigned supports with status badges (Assigned, Rejected — needs rework, etc.).
3. **Work cycle:**
   - Click a support → DWG opens directly in AutoCAD from the server.
   - Perform manual cleaning work.
   - Click "Submit" in the panel → file pushed to server, status updated to "Under SME Review," submitted timestamp recorded.
4. **If rejected** → support reappears in assignments with SME's rejection comment visible. Actionee reworks and resubmits. Revision increments automatically.
5. **View comments** → can see all internal comments (SME feedback) on their assigned supports.

```
                              +-------------------+
                              | LOGIN (AutoCAD    |
                              |  panel)           |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              | My Assignments    |
                              | (only theirs)     |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              | Click Support     |
                              | DWG opens in      |
                              | AutoCAD           |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              | Manual Cleaning   |
                              | Work              |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              | Click "Submit"    |
                              | File pushed,      |
                              | timestamp logged  |
                              +--------+----------+
                                       |
                                       v
                              +-------------------+
                              | Under SME Review  |
                              +--------+----------+
                                       |
                               +-------+-------+
                               |               |
                               v               v
                        +----------+    +-----------+
                        | APPROVED |    | REJECTED  |
                        | (done)   |    | + comment |
                        +----------+    +-----+-----+
                                              |
                                              | Rework
                                              | (Rev increments)
                                              |
                                              +-----> back to
                                                     "My Assignments"
```

### 8.6 AutoCAD Panel Flow (Actionee + SME)

The AutoCAD panel is a WPF-based dockable panel inside AutoCAD that eliminates all browser interaction, file download, and file upload for daily work.

**Actionee panel:**
1. Login to SANGAM from within AutoCAD.
2. See list of assigned supports with status badges.
3. Click a support → DWG fetched from server and opened in AutoCAD.
4. Do manual cleaning work.
5. Click "Submit" → file pushed back to server, status updated, timestamp recorded.
6. If SME rejects → rejection comment shown in panel, support available for rework.

**SME panel:**
1. Login to SANGAM from within AutoCAD.
2. See list of supports pending review (submitted by Actionees).
3. Click a support → DWG fetched from server and opened for QC.
4. Perform quality check.
5. Click "Approve" or "Reject." If rejecting, add a comment explaining the reason.
6. Status updates automatically in the system.

**Key principle:** No browser, no download, no upload — everything happens inside AutoCAD.

```
+----------------------------------------------+  +----------------------------------------------+
|            ACTIONEE PANEL                    |  |              SME PANEL                       |
|          (inside AutoCAD)                    |  |          (inside AutoCAD)                    |
+----------------------------------------------+  +----------------------------------------------+
|                                              |  |                                              |
|  +----------------------------------------+  |  |  +----------------------------------------+  |
|  | 1. Login to SANGAM                     |  |  |  | 1. Login to SANGAM                     |  |
|  +-------------------+--------------------+  |  |  +-------------------+--------------------+  |
|                      |                       |  |                      |                       |
|                      v                       |  |                      v                       |
|  +----------------------------------------+  |  |  +----------------------------------------+  |
|  | 2. My Assigned Supports                |  |  |  | 2. Pending Reviews                     |  |
|  |    [SP-1001] Assigned                  |  |  |  |    [SP-1001] Submitted                 |  |
|  |    [SP-1002] Rejected - rework         |  |  |  |    [SP-1005] Submitted                 |  |
|  |    [SP-1003] Assigned                  |  |  |  |    [SP-1008] Submitted                 |  |
|  +-------------------+--------------------+  |  |  +-------------------+--------------------+  |
|                      |                       |  |                      |                       |
|                      v                       |  |                      v                       |
|  +----------------------------------------+  |  |  +----------------------------------------+  |
|  | 3. Click → DWG opens in AutoCAD        |  |  |  | 3. Click → DWG opens for QC            |  |
|  +-------------------+--------------------+  |  |  +-------------------+--------------------+  |
|                      |                       |  |                      |                       |
|                      v                       |  |                      v                       |
|  +----------------------------------------+  |  |  +----------------------------------------+  |
|  | 4. Do manual cleaning                  |  |  |  | 4. Quality check                       |  |
|  +-------------------+--------------------+  |  |  +-------------------+--------------------+  |
|                      |                       |  |                      |                       |
|                      v                       |  |              +-------+-------+               |
|  +----------------------------------------+  |  |              |               |               |
|  | 5. Click [SUBMIT]                      |  |  |              v               v               |
|  |    → File pushed to server             |  |  |  +----------------+  +-----------------+    |
|  |    → Status updated                    |  |  |  | 5a. [APPROVE]  |  | 5b. [REJECT]    |    |
|  |    → Timestamp recorded                |  |  |  |                |  |  + add comment   |    |
|  +-------------------+--------------------+  |  |  +----------------+  +-----------------+    |
|                      |                       |  |                                              |
|                      v                       |  |                                              |
|  +----------------------------------------+  |  |                                              |
|  | 6. If rejected → comment visible       |  |  |                                              |
|  |    → Rework and resubmit               |  |  |                                              |
|  +----------------------------------------+  |  |                                              |
|                                              |  |                                              |
+----------------------------------------------+  +----------------------------------------------+

            *** No browser. No download. No upload. Everything inside AutoCAD. ***
```

### 8.7 Navisworks Plugin Flow (Automated)

The Navisworks plugin runs on the virtual server and communicates with SANGAM via API. No human interaction beyond the initial trigger.

1. Client uploads batch (model + support list) via web portal → stored in SANGAM.
2. Plugin fetches the batch from SANGAM via API (model file + support list).
3. Plugin extracts supports from the Navisworks model — one DWG per Support Tag ID.
4. Plugin pushes extracted DWG files back to SANGAM via API, each linked to its Support Tag ID and Batch ID.
5. Files are now available in SANGAM for the next stage (AutoCAD programmatic cleaning).

```
+-------------------+          +---------------------------+          +-------------------+
|   SANGAM SYSTEM   |          |   NAVISWORKS PLUGIN       |          |   SANGAM SYSTEM   |
|                   |  API:    |   (virtual server)        |  API:    |                   |
| Client uploaded   | fetch    |                           | push     | Files stored,     |
| batch (model +   |--------->| 1. Read model + list      |--------->| linked to         |
| support list)     |          | 2. Extract supports       |          | Support Tag IDs   |
|                   |          | 3. One DWG per tag        |          | + Batch ID        |
+-------------------+          +---------------------------+          +---------+---------+
                                                                                |
                                                                                v
                                                                      +-------------------+
                                                                      | AutoCAD plugin    |
                                                                      | picks up for      |
                                                                      | programmatic      |
                                                                      | cleaning          |
                                                                      +-------------------+

                        *** No manual file transfer needed ***
```

---

## 9. Analytics & Reporting

The system should provide the following metrics, accessible to Project Manager and SME:

- **Productivity:** Supports completed per Actionee per day/week/month.
- **Turnaround Time:** Average, minimum, maximum per Actionee and per batch.
- **Rejection Rate:** Percentage of supports rejected at SME level and Client level, per Actionee.
- **Batch Progress:** Percentage completion per batch, projected completion date.
- **Rework Frequency:** How many supports required more than one revision cycle.
- **Duplicate Report:** List of supports that appeared across multiple batches.

---

## 10. Non-Functional Requirements

- **Web-based** — accessible via browser, no desktop installation required. Hosted on AWS EC2.
- **Role-based access control** — each role sees only what they need.
- **Audit trail** — every action (assignment, status change, comment, approval, rejection) is logged with user + timestamp.
- **Data integrity** — Support Tag ID uniqueness enforced, no orphan records.
- **Responsive** — usable on both desktop and tablet screens.
- **Capacity** — designed for 50 concurrent users.

---

## 11. Out of Scope (Future Phases)

- Automated notifications (email/Slack alerts on status changes).
- Time-based SLA enforcement and escalation rules.

---

## 12. Resolved Decisions

1. **File management** — The system manages actual DWG files, not just metadata. Navisworks and AutoCAD plugins push files to the system via API. Engineers and SME interact with files through an AutoCAD plugin panel (Option A) — no manual download/upload.
2. **Multi-project** — Supported from day one. Each project has its own batches, supports, assignments, and comments. Internal users can work across multiple projects. One Client can have multiple projects but sees only their own.
3. **Notifications** — Not in first release. Future phase.
4. **Concurrent users** — 50 users.
5. **Client batch submission** — Client uploads both the Navisworks model and support list through the system.
6. **Plugin integration** — Navisworks plugin and AutoCAD plugin will integrate via API to push/pull files directly. AutoCAD plugin will include a panel for Actionees and SME to view assignments, open files, submit work, and do reviews — all without leaving AutoCAD.

## 13. Open Questions (Pending Stakeholder Input)

1. **Physical server vs AWS-only:** If internet speed and reliability are sufficient for engineers to open/save DWG files directly from AWS, a physical intranet server is not needed — the AutoCAD plugin communicates directly with AWS. If internet is unreliable or DWG files are too large for smooth transfer, a physical server is required as a local shared drive for file access. Decision depends on stakeholder input on internet infrastructure.

---

## 14. Success Metrics

- 100% of support drawings tracked from assignment to client approval — zero email-only handoffs.
- Complete comment history for every support — both internal and external.
- Duplicate supports flagged before work begins.
- Measurable turnaround time and productivity data available per Actionee and per batch.

---

*This is a living document. To be updated as requirements are refined through stakeholder review.*
