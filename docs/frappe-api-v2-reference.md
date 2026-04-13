# Frappe REST API v2 Reference

**Purpose:** This document ensures AI agents use Frappe v2 API endpoints, NOT v1. Always use `/api/v2/` prefix.

**CRITICAL RULE:** Never use `/api/resource/`, `/api/method/` (v1 patterns). Always use `/api/v2/document/`, `/api/v2/method/`, `/api/v2/doctype/` (v2 patterns).

---

## API Versioning

| Version | URL Prefix | Status |
|---------|-----------|--------|
| v1 | `/api/resource/`, `/api/method/` (also `/api/v1/`) | Legacy — DO NOT USE |
| v2 | `/api/v2/document/`, `/api/v2/method/`, `/api/v2/doctype/` | Current — ALWAYS USE |

Using `/api/` without version defaults to v1. **Always explicitly use `/api/v2/`.**

---

## v2 Endpoint Categories

### 1. Document Endpoints (`/api/v2/document/`)

Replaces v1's `/api/resource/`. CRUD operations on DocType records.

| Operation | Method | v2 Endpoint | v1 Equivalent (DO NOT USE) |
|-----------|--------|------------|---------------------------|
| List documents | GET | `/api/v2/document/{doctype}` | `/api/resource/{doctype}` |
| Create document | POST | `/api/v2/document/{doctype}` | `/api/resource/{doctype}` |
| Get document | GET | `/api/v2/document/{doctype}/{name}` | `/api/resource/{doctype}/{name}` |
| Update document | PUT/PATCH | `/api/v2/document/{doctype}/{name}` | `/api/resource/{doctype}/{name}` |
| Delete document | DELETE | `/api/v2/document/{doctype}/{name}` | `/api/resource/{doctype}/{name}` |
| Call document method | POST | `/api/v2/document/{doctype}/{name}/method/{method}` | `/api/resource/{doctype}/{name}?run_method={method}` |

**Note:** PATCH is preferred over PUT for partial updates (REST convention).

### 2. Method Endpoints (`/api/v2/method/`)

Replaces v1's `/api/method/`. Calls whitelisted Python functions.

| Operation | Method | v2 Endpoint | v1 Equivalent (DO NOT USE) |
|-----------|--------|------------|---------------------------|
| Call method | GET/POST | `/api/v2/method/{dotted.path}` | `/api/method/{dotted.path}` |
| Call doctype method | GET/POST | `/api/v2/method/{DocType}/{method_name}` | `/api/method/{full.dotted.path.to.method}` |

**v2 shorthand for doctype methods:**
- v1: `/api/method/erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice`
- v2: `/api/v2/method/Sales Order/make_sales_invoice`

### 3. DocType Endpoints (`/api/v2/doctype/`)

**New in v2** — no v1 equivalent. Operates at the DocType level (meta, count, list).

| Operation | Method | v2 Endpoint |
|-----------|--------|------------|
| Get DocType meta | GET | `/api/v2/doctype/{doctype}` |
| Get document count | GET | `/api/v2/doctype/{doctype}/count` |

---

## Key Differences: v2 vs v1

### Response Format

**v1 response:**
```json
{
  "message": { ... }
}
```

**v2 response:**
```json
{
  "data": { ... }
}
```

The `message` key is replaced with `data` in v2.

### Error Format

**v1 errors:**
```json
{
  "exc": "...",
  "exc_type": "..."
}
```

**v2 errors:**
```json
{
  "errors": [
    {
      "type": "...",
      "message": "...",
      "detail": "..."
    }
  ]
}
```

v2 provides nested, rich error information via the `errors` key.

### Pagination

| Parameter | v1 | v2 |
|-----------|----|----|
| Offset | `limit_start` | `start` |
| Page size | `limit_page_length` | `limit` |
| Has more? | Not provided | `has_next_page` (boolean) |

**v2 example:**
```
GET /api/v2/document/Support?start=0&limit=20
```

### Filtering

**v1 filter syntax (complex, array-based):**
```
filters=[["DocType","field","=","value"]]
```

**v2 filter syntax (simpler, object-based):**
```
filters={"status":"Open","actionee":"Ramesh"}
```

---

## Authentication: Token-Based

### Setup

1. Go to **User List** → open a user → **Settings** tab → **API Access** section
2. Click **Generate Keys**
3. Copy the **API Secret** from the popup (store securely — shown only once)
4. Note the **API Key** displayed in the section

### Usage

Add the `Authorization` header to every request:

```
Authorization: token <api_key>:<api_secret>
```

**Format:** `token` (literal word) + space + `api_key:api_secret` (colon-separated)

### Example Request

```typescript
// TypeScript example for Tauri desktop app
const FRAPPE_URL = "http://sangam.local:8000";
const API_TOKEN = "token abc123:xyz789";

// GET a list of supports
const response = await fetch(`${FRAPPE_URL}/api/v2/document/Sangam Support?limit=50&filters={"status":"Assigned"}`, {
  headers: {
    "Authorization": API_TOKEN,
    "Content-Type": "application/json"
  }
});

const { data } = await response.json();
// data = array of support documents
```

### Important Notes

- Every request is logged against the user whose API key is used
- Role-based permissions are enforced based on that user's roles
- You can create a dedicated API user for programmatic access
- Available since Frappe v11.0.3

---

## TypeScript API Client Pattern for SANGAM

This is the recommended pattern for the Tauri desktop app:

```typescript
// src/lib/api/frappe-client.ts

const BASE_URL = "http://sangam.local:8000";

interface FrappeListParams {
  fields?: string[];
  filters?: Record<string, any>;
  orderBy?: string;
  start?: number;
  limit?: number;
}

interface FrappeListResponse<T> {
  data: T[];
  has_next_page: boolean;
}

interface FrappeDocResponse<T> {
  data: T;
}

async function frappeRequest(endpoint: string, options: RequestInit = {}) {
  const token = getStoredToken(); // retrieve from secure storage

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    // v2 returns { errors: [...] }
    const errorMessage = errorBody.errors?.[0]?.message || response.statusText;
    throw new Error(errorMessage);
  }

  return response.json();
}

// List documents
async function getList<T>(doctype: string, params?: FrappeListParams): Promise<FrappeListResponse<T>> {
  const searchParams = new URLSearchParams();
  if (params?.fields) searchParams.set("fields", JSON.stringify(params.fields));
  if (params?.filters) searchParams.set("filters", JSON.stringify(params.filters));
  if (params?.orderBy) searchParams.set("order_by", params.orderBy);
  if (params?.start) searchParams.set("start", String(params.start));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return frappeRequest(`/api/v2/document/${doctype}${query ? `?${query}` : ""}`);
}

// Get single document
async function getDoc<T>(doctype: string, name: string): Promise<FrappeDocResponse<T>> {
  return frappeRequest(`/api/v2/document/${doctype}/${name}`);
}

// Create document
async function createDoc<T>(doctype: string, data: Partial<T>): Promise<FrappeDocResponse<T>> {
  return frappeRequest(`/api/v2/document/${doctype}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Update document
async function updateDoc<T>(doctype: string, name: string, data: Partial<T>): Promise<FrappeDocResponse<T>> {
  return frappeRequest(`/api/v2/document/${doctype}/${name}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Delete document
async function deleteDoc(doctype: string, name: string): Promise<void> {
  return frappeRequest(`/api/v2/document/${doctype}/${name}`, {
    method: "DELETE",
  });
}

// Call whitelisted method
async function call<T>(method: string, args?: Record<string, any>): Promise<{ data: T }> {
  return frappeRequest(`/api/v2/method/${method}`, {
    method: "POST",
    body: args ? JSON.stringify(args) : undefined,
  });
}

// Call document method
async function callDocMethod<T>(doctype: string, name: string, method: string, args?: Record<string, any>): Promise<{ data: T }> {
  return frappeRequest(`/api/v2/document/${doctype}/${name}/method/${method}`, {
    method: "POST",
    body: args ? JSON.stringify(args) : undefined,
  });
}

export const frappe = { getList, getDoc, createDoc, updateDoc, deleteDoc, call, callDocMethod };
```

---

## Quick Reference Card

```
ALWAYS USE:                         NEVER USE:
/api/v2/document/{dt}               /api/resource/{dt}
/api/v2/document/{dt}/{name}        /api/resource/{dt}/{name}
/api/v2/method/{path}               /api/method/{path}
/api/v2/doctype/{dt}                (no v1 equivalent)

Response key: "data"                NOT "message"
Pagination: start, limit            NOT limit_start, limit_page_length
Filters: {"key":"value"}            NOT [["DocType","key","=","value"]]
Errors: { errors: [...] }           NOT { exc, exc_type }
```

---

Sources:
- [Frappe REST API Docs](https://docs.frappe.io/framework/user/en/api/rest)
- [Token-Based Auth Guide](https://docs.frappe.io/framework/user/en/guides/integration/rest_api/token_based_authentication)
- [Frappe Forum: API v2 Discussion](https://discuss.frappe.io/t/frappe-rest-api-v2/128977)
- [GitHub: API v2 Stabilization Issue](https://github.com/frappe/frappe/issues/22762)
