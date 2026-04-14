# Story 1.2: Authentication & App Shell

Status: ready-for-dev

## Story

As a **SANGAM user** (PM, SME, QC, or Actionee),
I want to log in with my email and password and see a role-appropriate app shell,
so that I can access the features relevant to my role within a selected project.

## Acceptance Criteria

1. Login screen with email and password fields, submit button, and "Forgot password? Contact your administrator" text
2. On submit, app authenticates against Frappe using email+password, retrieves API token, stores it securely
3. All subsequent API calls use `Authorization: token api_key:api_secret` header (existing `frappe-client.ts` updated)
4. After login, app fetches user's SANGAM roles from Frappe and stores them in auth context
5. Unauthenticated users are redirected to login screen (route guard)
6. Authenticated users see the app shell with collapsible sidebar, breadcrumb nav, and header with user info + logout
7. Sidebar menu items are filtered based on user's SANGAM roles (see Role Hierarchy table in Dev Notes)
8. User can select a project from a project selector (dropdown or page) — all views become project-scoped
9. Logout clears stored token and redirects to login screen
10. Backend: 4 SANGAM roles (SANGAM PM, SANGAM SME, SANGAM QC, SANGAM Actionee) are defined as fixtures in `samanvay_sangam_backend` and auto-created on `bench migrate`
11. Invalid credentials show Frappe's actual error message (no custom error text)
12. Auth state persists across app restarts (token stored in localStorage or Tauri secure storage)

## Tasks / Subtasks

- [ ] Task 1: Backend — Define SANGAM roles as fixtures (AC: #10)
  - [ ] Create fixture JSON file with 4 SANGAM roles (`SANGAM PM`, `SANGAM SME`, `SANGAM QC`, `SANGAM Actionee`) in `samanvay_sangam_backend`
  - [ ] Add fixtures configuration in `hooks.py`
  - [ ] Run `bench --site samanvay-sangam migrate` to verify roles are created
  - [ ] Verify roles appear in Frappe User → Roles dropdown

- [ ] Task 2: Frontend — Auth types and token storage (AC: #2, #12)
  - [ ] Create `src/features/auth/types.ts` with auth-related TypeScript types (User, AuthState, LoginCredentials, SangamRole)
  - [ ] Create `src/features/auth/auth-storage.ts` — functions to save/load/clear token from localStorage
  - [ ] Add `VITE_FRAPPE_API_KEY` and `VITE_FRAPPE_API_SECRET` env vars to `.env.example` (for dev testing only)

- [ ] Task 3: Frontend — Login API integration (AC: #2, #3, #11)
  - [ ] Create `src/features/auth/hooks/useLogin.ts` — TanStack Query mutation calling Frappe login endpoint
  - [ ] Login flow: POST `/api/method/login` with email+password → on success, call `generate_keys` for user → store `api_key:api_secret`
  - [ ] Update `src/lib/api/frappe-client.ts` to read token from auth storage instead of hardcoded localStorage key
  - [ ] Handle error: show raw Frappe error message from response

- [ ] Task 4: Frontend — Auth context and role detection (AC: #4, #5, #9)
  - [ ] Create `src/features/auth/auth-context.tsx` — React context providing auth state (user, roles, isAuthenticated, logout)
  - [ ] After login, fetch user roles via `GET /api/method/frappe.utils.user.get_roles` with token auth
  - [ ] Filter to SANGAM-prefixed roles only (`SANGAM PM`, `SANGAM SME`, `SANGAM QC`, `SANGAM Actionee`)
  - [ ] Wrap app in AuthProvider in `src/main.tsx`

- [ ] Task 5: Frontend — Login page UI (AC: #1, #11)
  - [ ] Create `src/features/auth/components/LoginPage.tsx` — email input, password input, submit button
  - [ ] Use shadcn/ui Card, Input, Button, Label components
  - [ ] Show "Forgot password? Contact your administrator" text below form
  - [ ] Show loading state on submit, error message on failure
  - [ ] On success, redirect to app shell

- [ ] Task 6: Frontend — App shell with collapsible sidebar (AC: #6, #7)
  - [ ] Create `src/app/AppShell.tsx` — layout with collapsible sidebar, header, main content area
  - [ ] Create `src/app/Sidebar.tsx` — collapsible nav with role-filtered menu items and count badges
  - [ ] Create `src/app/Header.tsx` — breadcrumb nav, user name display, logout button
  - [ ] Use shadcn/ui Sidebar, Button, Avatar components
  - [ ] Menu items filtered per role (see Role Menu Map in Dev Notes)

- [ ] Task 7: Frontend — Routing with guards (AC: #5, #8)
  - [ ] Create `src/app/router.tsx` — React Router v7 setup with all routes
  - [ ] Create `src/app/ProtectedRoute.tsx` — redirects to `/login` if not authenticated
  - [ ] Create `src/app/ProjectSelector.tsx` — project selection page (placeholder list for now, actual project data in Epic 2)
  - [ ] Update `src/App.tsx` to use router with AuthProvider and QueryClientProvider
  - [ ] Update `src/main.tsx` to wrap with providers

## Dev Notes

### Auth Flow (Step by Step)

1. User enters email + password on login screen
2. App calls `POST /api/method/login` with `{ usr, pwd }` — Frappe validates and returns session
3. App calls `POST /api/method/frappe.core.doctype.user.user.generate_keys` with `{ user: email }` using session cookie
4. Frappe returns `{ message: { api_key, api_secret } }` — app stores `api_key:api_secret` in localStorage
5. All subsequent API calls use `Authorization: token api_key:api_secret` header
6. App calls `GET /api/method/frappe.utils.user.get_roles` to get user's roles
7. Auth context populated, user redirected to app shell

**IMPORTANT:** The `generate_keys` call regenerates the secret every time. For MVP, this is acceptable. If a user is logged in on two machines, the second login will invalidate the first. This is fine for 10-20 internal users.

**IMPORTANT:** The login endpoint (`/api/method/login`) is v1-style — this is correct. Frappe's auth endpoints don't have v2 equivalents. Only document/method data calls use v2.

### Frappe API Endpoints for Auth

```
# Login (session-based, sets cookie)
POST /api/method/login
Content-Type: application/json
Body: { "usr": "user@example.com", "pwd": "password123" }
Response: { "message": "Logged In", "full_name": "Abhishek Bankar" }
Error: { "message": "Incorrect password" }

# Generate API keys (requires session cookie from login)
POST /api/method/frappe.core.doctype.user.user.generate_keys
Content-Type: application/json
Body: { "user": "user@example.com" }
Response: { "message": { "api_secret": "xxx", "api_key": "yyy" } }

# Get logged-in user's roles (requires token auth)
GET /api/method/frappe.utils.user.get_roles
Authorization: token api_key:api_secret
Response: { "message": ["System Manager", "SANGAM PM", "All"] }
```

### Backend — Frappe Fixtures for Roles

In `samanvay_sangam_backend/hooks.py`:
```python
fixtures = [
    {
        "doctype": "Role",
        "filters": [["role_name", "in", [
            "SANGAM PM",
            "SANGAM SME",
            "SANGAM QC",
            "SANGAM Actionee"
        ]]]
    }
]
```

Create fixture file `samanvay_sangam_backend/fixtures/role.json`:
```json
[
  { "doctype": "Role", "role_name": "SANGAM PM", "desk_access": 1 },
  { "doctype": "Role", "role_name": "SANGAM SME", "desk_access": 1 },
  { "doctype": "Role", "role_name": "SANGAM QC", "desk_access": 1 },
  { "doctype": "Role", "role_name": "SANGAM Actionee", "desk_access": 1 }
]
```

Then run: `bench --site samanvay-sangam export-fixtures` to verify, and `bench --site samanvay-sangam migrate` to apply.

### Role Menu Map (Sidebar Items per Role)

| Menu Item | SANGAM PM | SANGAM SME | SANGAM QC | SANGAM Actionee |
|-----------|:---------:|:----------:|:---------:|:---------------:|
| Dashboard | Yes | Yes | Yes | Yes |
| My Work | Yes | Yes | Yes | Yes |
| Support Register | Yes | Yes | No | No |
| Assignment | Yes | Yes | No | No |
| Review Queue | Yes | Yes | No | No |
| Rejected Pool | Yes | Yes | Yes | No |
| Send to Client | Yes | No | No | No |
| Analytics | Yes | Yes | No | No |
| Batch Management | Yes | No | No | No |

**Implementation:** Define menu config as an array with `requiredRoles` per item. Filter at render time based on user's roles from auth context.

### Token Storage

Use `localStorage` for MVP (internal LAN app, trusted machines). Key: `sangam_auth_token`. Value: `api_key:api_secret`.

```typescript
// src/features/auth/auth-storage.ts
const AUTH_TOKEN_KEY = "sangam_auth_token";
const AUTH_USER_KEY = "sangam_auth_user";

export function saveAuth(token: string, user: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, user);
}

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): string | null {
  return localStorage.getItem(AUTH_USER_KEY);
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
```

### Project Structure (New Files in This Story)

```
src/
├── app/                          # NEW — App shell, router, providers
│   ├── AppShell.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── ProtectedRoute.tsx
│   ├── ProjectSelector.tsx
│   └── router.tsx
├── features/
│   └── auth/                     # NEW — Auth feature module
│       ├── index.ts              # Public exports
│       ├── types.ts
│       ├── auth-storage.ts
│       ├── auth-context.tsx
│       ├── components/
│       │   └── LoginPage.tsx
│       └── hooks/
│           └── useLogin.ts
├── lib/
│   └── api/
│       └── frappe-client.ts      # MODIFIED — read token from auth-storage
```

### Previous Story (1.1) Intelligence

- `frappe-client.ts` already exists with v2 API wrapper — currently reads token from `localStorage.getItem("frappe_token")`. Update to use `getStoredToken()` from auth-storage.
- `config.ts` already has `frappeUrl` from env — use this for login endpoint base URL
- shadcn/ui is initialized (radix-vega preset) — use shadcn components for login form and app shell
- TanStack Query is installed — use `useMutation` for login, `useQuery` for role fetching
- React Router is installed — set up routes in this story
- React Compiler is configured — do NOT use manual useMemo/useCallback

### Anti-Patterns (DO NOT)

- Do NOT use `useEffect` + `fetch` for login — use TanStack Query `useMutation`
- Do NOT create a custom error message — show Frappe's raw error
- Do NOT add signup/registration — admin creates users in Frappe
- Do NOT add forgot password flow — just show "Contact your administrator"
- Do NOT use Frappe v1 API patterns for data calls (auth endpoints are exception — they only exist in v1)
- Do NOT use `forwardRef` — React 19 passes ref as prop
- Do NOT store passwords — only store the API token
- Do NOT add offline mode or token refresh — fail if token invalid, redirect to login
- Do NOT pre-create feature folders not needed by this story

### References

- [Architecture Document](_bmad-output/planning-artifacts/architecture.md) — Auth decisions (section: Authentication & Security), Frontend patterns, Project structure
- [Frappe v2 API Reference](docs/frappe-api-v2-reference.md) — Token auth format
- [Epics Document](_bmad-output/planning-artifacts/epics.md) — Epic 1 requirements, role hierarchy, permissions table
- [Story 1.1](_bmad-output/implementation-artifacts/1-1-scaffold-tauri-react.md) — Previous story file list, patterns established
- [Frappe Login API](https://docs.frappe.io/framework/user/en/api/rest#1-token-based-authentication) — Login and token generation
- [Frappe Fixtures](https://docs.frappe.io/framework/user/en/basics/fixtures) — How to define fixtures in hooks.py

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
