# Frappe Framework Knowledge Base

**Purpose:** Reference for AI agents working on the SANGAM desktop app (Tauri + React) that talks to Frappe v16 backend via REST API.

---

## 1. Bench / Site / App Relationship

```
frappe-bench/                 ← the "bench" — one installation
  apps/
    frappe/                   ← the framework (always present)
    samanvay_sangam_backend/  ← our custom app
  sites/
    samanvay-sangam/          ← our site (has its own DB)
      site_config.json        ← DB credentials, site settings
```

- **Bench** = directory + CLI tool. One machine can have multiple benches.
- **App** = Python package with DocTypes, hooks, business logic. Shared across sites.
- **Site** = isolated deployment with its own database. Apps are installed per-site.

### Key Bench Commands

```bash
bench start                                    # start dev server
bench --site samanvay-sangam migrate           # sync schema + run patches + import fixtures
bench --site samanvay-sangam console           # Python REPL with frappe context
bench --site samanvay-sangam export-fixtures   # export fixture data to JSON
bench --site samanvay-sangam list-apps         # list installed apps
bench --site samanvay-sangam clear-cache       # clear redis cache
bench build                                    # compile JS/CSS assets
```

### What `bench migrate` Does (in order)

1. Runs pre-migration hooks
2. Applies patches (from `patches.txt`)
3. Syncs DB schema — adds/removes columns, creates/drops tables to match DocType JSON
4. Syncs fixtures (imports fixture JSON files)
5. Rebuilds search indexes
6. Runs post-migration hooks

---

## 2. DocTypes

### What is a DocType

A DocType = a data model + auto-generated UI + database table + REST API endpoint. Creating a DocType gives you all four automatically.

### Creating DocTypes

**From Frappe UI:** Desk → search "DocType" → New → fill fields → Save. Frappe generates the DB table and files on disk.

**Files generated:**

```
apps/samanvay_sangam_backend/samanvay_sangam_backend/
  {module_name}/
    doctype/
      {doctype_name}/          ← snake_case of DocType name
        __init__.py
        {doctype_name}.json    ← full definition (fields, permissions, naming)
        {doctype_name}.py      ← Python controller (server-side logic)
        {doctype_name}.js      ← Client-side JS controller
```

### Field Types

| Field Type | Description | DB Storage |
|---|---|---|
| `Data` | Single-line text | VARCHAR |
| `Text` | Multi-line plain text | TEXT |
| `Text Editor` | Rich text (HTML) | LONGTEXT |
| `Select` | Dropdown — options are newline-separated | VARCHAR |
| `Int` | Integer | INT |
| `Float` | Decimal | DECIMAL |
| `Currency` | Formatted as money | DECIMAL |
| `Date` | Date only | DATE |
| `Datetime` | Date + time | DATETIME |
| `Check` | Boolean (0/1) | INT(1) |
| `Link` | Foreign key to another DocType | VARCHAR (stores `name`) |
| `Dynamic Link` | Link where target DocType is determined by another field | VARCHAR |
| `Table` | Embeds a child DocType as rows | Separate DB table |
| `Attach` | File upload (stores file URL/path) | TEXT |
| `Section Break` | Layout only — starts a new section | n/a |
| `Column Break` | Layout only — splits into columns | n/a |

### Naming Rules (`autoname`)

| Value | Behavior | Example |
|---|---|---|
| *(empty)* | User types name manually | |
| `hash` | Random 10-char hash | `a4f3b2c1d9` |
| `field:{fieldname}` | Uses that field's value as name | `field:project_name` |
| `{PREFIX}-.#####` | Naming series with counter | `BATCH-.#####` → `BATCH-00001` |
| `format:{prefix}-{field}-{##}` | Format string | |

### Link Fields (Foreign Key)

```json
{
  "fieldname": "project",
  "fieldtype": "Link",
  "label": "Project",
  "options": "Project",
  "reqd": 1
}
```

- Stores the `name` (primary key) of the linked document.
- Frappe validates the referenced document exists on save.
- In the UI, renders as a searchable dropdown.

### Child Tables

- A DocType with **"Is Child Table"** checked.
- Has no standalone list view or API endpoint.
- Linked to parent via a `Table` field on the parent DocType.
- Each row has: `parent`, `parenttype`, `parentfield`, `idx`.
- Inherits permissions from parent — no separate permissions needed.

### Controller Hooks

```python
class Project(Document):
    def autoname(self): ...        # set self.name before insert
    def before_insert(self): ...   # runs before INSERT
    def validate(self): ...        # throw frappe.ValidationError to block save
    def after_insert(self): ...    # runs after INSERT
    def before_save(self): ...     # before UPDATE
    def on_update(self): ...       # after UPDATE
    def on_trash(self): ...        # before DELETE
```

### Whitelisted Methods on DocType

```python
class Support(Document):
    @frappe.whitelist()
    def submit_work(self):
        self.status = "Submitted"
        self.submitted_at = frappe.utils.now()
        self.save()
```

Called via API: `POST /api/v2/document/Support/SP-001/method/submit_work`

---

## 3. Frappe REST API

### API Versions

| Version | Prefix | Response Key |
|---|---|---|
| v1 (legacy) | `/api/resource/` | `message` |
| v2 (current) | `/api/v2/document/` | `data` |

**ALWAYS use v2 for data operations.** Auth endpoints (`/api/method/login`) are v1-only — that's expected.

### v2 Document CRUD

```
GET    /api/v2/document/{DocType}               # List
POST   /api/v2/document/{DocType}               # Create
GET    /api/v2/document/{DocType}/{name}         # Read
PATCH  /api/v2/document/{DocType}/{name}         # Update (partial)
DELETE /api/v2/document/{DocType}/{name}         # Delete
```

### v2 Document Methods

```
POST /api/v2/document/{DocType}/{name}/method/{method_name}
```

### Whitelisted Python Methods

```
GET/POST /api/method/{dotted.module.path.function_name}
```

Response: `{ "message": <return_value> }`

### List Query Parameters

```
GET /api/v2/document/Support?
  fields=["name","support_tag_id","status"]
  &filters=[["status","=","Assigned"]]
  &order_by=creation desc
  &limit_start=0
  &limit_page_length=20
```

**Filter format:** Always use array syntax `[["fieldname","operator","value"]]`. Object syntax `{"key":"value"}` also works but we use array syntax across all applications for consistency.

**Filter operators:** `=`, `!=`, `>`, `<`, `>=`, `<=`, `like`, `not like`, `in`, `not in`, `between`, `is` (`"set"` or `"not set"`)

### Response Formats

**List success:**
```json
{
  "data": [
    {"name": "SP-001", "support_tag_id": "SP-001", "status": "Assigned"}
  ]
}
```

**Single doc success:**
```json
{
  "data": {
    "name": "SP-001",
    "support_tag_id": "SP-001",
    "status": "Assigned",
    "items": [...]
  }
}
```

**Error:**
```json
{
  "exc_type": "ValidationError",
  "exc": "Traceback...",
  "_server_messages": "[\"...\"]"
}
```

### Create Document

```
POST /api/v2/document/Project
Content-Type: application/json

{
  "project_name": "ProjectA",
  "client": "ACME Corp",
  "status": "Active"
}
```

### Update Document

```
PATCH /api/v2/document/Support/SP-001
Content-Type: application/json

{
  "status": "Submitted",
  "submitted_at": "2026-04-15 10:30:00"
}
```

---

## 4. Authentication

### Method 1: Token Auth (Recommended for Desktop Apps)

**Setup:** Admin opens User → Settings → API Access → Generate Keys. Save the API Secret (shown only once).

**Usage:**
```
Authorization: token <api_key>:<api_secret>
```

**Why token auth for desktop apps:**
- No cookie/CORS complexity
- Stateless — no session to maintain
- Works directly in fetch without `credentials: "include"`
- Survives server restarts (sessions don't)
- API key/secret can be stored in app config

### Method 2: Session/Cookie Auth

**Login:**
```
POST /api/method/login
Content-Type: application/json
Body: { "usr": "email@example.com", "pwd": "password" }
```

**Response:**
```json
{ "message": "Logged In", "full_name": "Abhishek Bankar" }
```
Sets `sid` cookie. Session expires in **3 days**, refreshes on each request.

**For cross-origin (Tauri/desktop):**
- Frappe server must have `allow_cors` set: `bench --site {site} set-config allow_cors "*"`
- Use `credentials: "include"` in fetch
- `Set-Cookie` header is NOT accessible from JavaScript — browser handles cookies automatically

**Logout:** `GET /api/method/logout`

**Get current user:** `GET /api/method/frappe.auth.get_logged_user`

**Get user roles:** `GET /api/method/frappe.utils.user.get_roles` → `{ "message": ["Role1", "Role2"] }`

### SANGAM Auth Flow (Current Implementation)

1. User enters email + password on login screen
2. App calls `POST /api/method/login` with `credentials: "include"`
3. Browser stores `sid` cookie automatically
4. All subsequent API calls use `credentials: "include"` — browser sends cookie
5. App calls `GET /api/method/frappe.utils.user.get_roles` to get roles
6. Auth context populated, user redirected to app shell

---

## 5. Permissions

### DocType-Level Permissions

Set in DocType definition → Permissions section. Each row: Role + permission flags.

```json
"permissions": [
  {
    "role": "SANGAM PM",
    "read": 1, "write": 1, "create": 1, "delete": 1
  },
  {
    "role": "SANGAM Actionee",
    "read": 1
  }
]
```

**Permission flags:** `read`, `write`, `create`, `delete`, `submit`, `cancel`, `amend`, `report`, `export`, `import`, `share`, `print`, `email`

### How Permissions Affect API

- No `read` permission → API returns **403 Forbidden**
- Has `read` but not `write` → **GET** works, **PATCH/DELETE** returns 403
- User Permissions filter list results automatically (WHERE clause modified server-side)
- Child DocTypes inherit parent permissions
- `@frappe.whitelist()` methods still check permissions on `frappe.get_doc()` calls internally
- `Administrator` role bypasses all permissions

### User Permissions (Record-Level)

Restrict which *records* a user can see based on Link field values.

Example: User can only see records where `project = "ProjectA"`:
- User Permissions → New → User: email, Allow: Project, For Value: ProjectA

### System Roles

- `Guest` — unauthenticated
- `All` — all logged-in users
- `Administrator` — bypasses all permissions
- `System Manager` — admin-level access

---

## 6. Fixtures

### Purpose

Export database records to JSON files so they're version-controlled and auto-imported on `bench migrate` or app install.

### Define in hooks.py

```python
fixtures = [
    "Category",                                                    # all records
    {"dt": "Role", "filters": [["role_name", "like", "SANGAM%"]]}  # filtered
]
```

**Key:** Use `"dt"` not `"doctype"` in hooks.py fixture definitions.

### Export

```bash
bench --site samanvay-sangam export-fixtures
```

Creates `{app}/fixtures/{doctype_name}.json` with full Frappe format (all fields including `name`, `modified`, etc.).

### Import

Happens automatically on:
- `bench migrate`
- `bench --site {site} install-app {app}`

**Important:** The records must exist in the database BEFORE exporting. Fixtures export existing data — they don't create records from scratch. Create records first (via UI or console), then export.

### Fixture JSON Format

Must include `name` field. Full exported format:
```json
[
  {
    "doctype": "Role",
    "name": "SANGAM PM",
    "role_name": "SANGAM PM",
    "desk_access": 0,
    "disabled": 0,
    "modified": "2026-04-15 00:25:03.809845"
  }
]
```

---

## 7. SANGAM-Specific Conventions

### DocType Names

Use simple names without "SANGAM" prefix — the app context is enough:
- `Project` (not "SANGAM Project")
- `Batch` (not "SANGAM Batch")
- `Support` (not "SANGAM Support")

### Role Names

DO use "SANGAM" prefix — roles are global across all Frappe apps:
- `SANGAM PM`, `SANGAM SME`, `SANGAM QC`, `SANGAM Actionee`

### API Field Convention

- Frappe uses `snake_case` for all field names
- Desktop app (TypeScript) uses `camelCase`
- Conversion happens only in `frappe-client.ts` boundary layer

### Backend App Location

```
\\wsl.localhost\Ubuntu-24.04\home\abhishekraje30\frappe-bench\apps\samanvay_sangam_backend
```

### Frappe Site URL

```
http://samanvay-sangam:8000
```

### CORS Configuration

```bash
bench --site samanvay-sangam set-config allow_cors "*"
```

---

## 8. Common Pitfalls for AI Agents

1. **Don't use v1 API** (`/api/resource/`) — always use `/api/v2/document/` for data operations
2. **Auth endpoints ARE v1** — `/api/method/login`, `/api/method/frappe.utils.user.get_roles` — this is correct, not a mistake
3. **Don't use `"doctype"` in hooks.py fixtures** — use `"dt"`
4. **Fixture JSON must have `name` field** — Frappe uses it to look up existing records
5. **Create records before exporting fixtures** — fixtures export existing data, they don't create from scratch
6. **`generate_keys` requires System Manager role** — regular users can't generate their own API keys
7. **`Set-Cookie` header is NOT accessible from JavaScript fetch** — don't try to extract `sid` manually
8. **DocType permissions cascade to API** — if a role doesn't have `read` on a DocType, the API returns 403
9. **Child DocTypes inherit parent permissions** — don't set separate permissions on child tables
10. **`bench migrate` must run after DocType changes** — even if you edit via UI, run migrate to sync
