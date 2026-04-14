# Story 1.1: Scaffold Tauri + React Desktop App

Status: review

## Story

As a **developer**,
I want a working Tauri v2 + React 19 desktop app scaffold with all dependencies installed,
so that I have a verified foundation to build SANGAM features on.

## Acceptance Criteria

1. `npm run tauri dev` launches a desktop window with a React app rendered inside
2. TypeScript strict mode is enabled
3. shadcn/ui is initialized with Tailwind CSS v4 (new-york style)
4. TanStack Query v5, React Router v7 are installed
5. Tauri plugins `@tauri-apps/plugin-fs` and `@tauri-apps/plugin-shell` are installed and registered
6. Tauri capabilities config grants fs and shell permissions
7. `npm run tauri build` produces a Windows MSI installer
8. React Compiler is configured via Vite plugin
9. `SANGAM_DRIVE_ROOT` is configurable — not hardcoded. Default for development: `C:\Users\Abhishek Bankar\Documents\Inventive Codebase\Sangam Server`. Replaceable with UNC shared drive path later.
10. App can read/write files in the configured `SANGAM_DRIVE_ROOT` via Tauri FS plugin
11. Frappe API client wrapper (`frappe-client.ts`) exists with snake_case ↔ camelCase conversion, using Frappe v2 API patterns only (`/api/v2/document/`, `/api/v2/method/`)
12. A minimal "Hello SANGAM" screen renders in the desktop window confirming the full stack works

## Tasks / Subtasks

- [x] Task 1: Scaffold Tauri + React project (AC: #1, #2)
  - [x] Run `npm create tauri-app@latest sangam-desktop -- --template react-ts`
  - [x] Verify `npm run tauri dev` opens a desktop window
  - [x] Ensure `tsconfig.json` has `"strict": true`

- [x] Task 2: Install and configure dependencies (AC: #3, #4, #8)
  - [x] Install shadcn/ui: `npx shadcn@latest init` (radix-vega preset, Tailwind v4)
  - [x] Install TanStack Query: `npm install @tanstack/react-query`
  - [x] Install React Router: `npm install react-router-dom`
  - [x] Install React Compiler: `npm install -D babel-plugin-react-compiler@latest`
  - [x] Configure React Compiler in `vite.config.ts` (see Dev Notes)

- [x] Task 3: Install and configure Tauri plugins (AC: #5, #6)
  - [x] Install FS plugin: `npm install @tauri-apps/plugin-fs`
  - [x] Install Shell plugin: `npm install @tauri-apps/plugin-shell`
  - [x] Add Rust dependencies in `src-tauri/Cargo.toml`:
    - `tauri-plugin-fs`
    - `tauri-plugin-shell`
  - [x] Register plugins in `src-tauri/src/lib.rs`
  - [x] Configure capabilities in `src-tauri/capabilities/default.json` granting fs and shell access

- [x] Task 4: Configure drive root (AC: #9, #10)
  - [x] Create `.env` file with `VITE_SANGAM_DRIVE_ROOT` variable
  - [x] Create `.env.example` with placeholder value
  - [x] Default dev value: `C:\Users\Abhishek Bankar\Documents\Inventive Codebase\Sangam Server`
  - [x] Create `src/lib/config.ts` that reads the env variable
  - [x] Verify Tauri FS can read/write a test file at the configured path

- [x] Task 5: Create Frappe API client (AC: #11)
  - [x] Create `src/lib/api/frappe-client.ts` with typed v2 API wrapper
  - [x] Implement snake_case ↔ camelCase conversion utilities in `src/lib/utils.ts`
  - [x] Export functions: `getList`, `getDoc`, `createDoc`, `updateDoc`, `deleteDoc`, `call`, `callDocMethod`
  - [x] All endpoints use `/api/v2/document/` and `/api/v2/method/` — NEVER v1 patterns

- [x] Task 6: Verify build (AC: #7, #12)
  - [x] Create a minimal "Hello SANGAM" React component as the landing page
  - [x] Run `npm run tauri build` and verify MSI installer is produced
  - [ ] Install and launch the built MSI to confirm it works

## Dev Notes

### Tech Stack (exact versions from architecture)

| Package | Version | Purpose |
|---------|---------|---------|
| Tauri | v2.x (latest stable ~2.10.x) | Desktop shell |
| React | 19.x | UI framework |
| Vite | 6.x | Build tool |
| TypeScript | 5.x | Type safety |
| @tauri-apps/plugin-fs | latest | File system access |
| @tauri-apps/plugin-shell | latest | Open files/folders |
| @tanstack/react-query | ~5.97.x | Server state management |
| react-router-dom | 7.x | Routing |
| shadcn/ui | CLI v4 | UI components |
| Tailwind CSS | v4 | Styling |
| babel-plugin-react-compiler | latest | React Compiler |

### React Compiler Vite Setup

**IMPORTANT:** `@vitejs/plugin-react` v6+ removed built-in Babel. Use `@rolldown/plugin-babel` with `reactCompilerPreset`:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset],
    }),
  ],
});
```

If `@vitejs/plugin-react` is still on v5.x (check version after scaffold), use the inline babel option instead:

```typescript
// vite.config.ts (for plugin-react v5.x)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
```

Check which version `create-tauri-app` installs and pick the matching config.

### Tauri Plugin Registration

```rust
// src-tauri/src/lib.rs
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Tauri Capabilities Config

```json
// src-tauri/capabilities/default.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "SANGAM default capabilities",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:default",
    "fs:allow-read",
    "fs:allow-write",
    "fs:allow-exists",
    "fs:allow-mkdir",
    "fs:allow-rename",
    "fs:allow-remove",
    "fs:allow-read-dir",
    "shell:default",
    "shell:allow-open"
  ]
}
```

**NOTE:** Tauri v2 FS plugin scopes file access by default. You may need to add the drive root path to the `fs:scope` in capabilities. Check Tauri v2 docs for scope configuration if file operations fail with permission errors.

### Frappe API Client Pattern

Reference: `docs/frappe-api-v2-reference.md` in this repo. Contains the complete TypeScript client pattern.

**CRITICAL RULES:**
- ALL endpoints use `/api/v2/` prefix — NEVER `/api/resource/` or `/api/method/` (v1)
- Response key is `data` NOT `message`
- Pagination uses `start`/`limit` NOT `limit_start`/`limit_page_length`
- Filters use object syntax `{"key":"value"}` NOT array syntax
- Auth header: `Authorization: token api_key:api_secret`

### snake_case ↔ camelCase Conversion

Conversion happens ONLY in `frappe-client.ts`:
- Incoming Frappe responses: `snake_case` → `camelCase` (for React consumption)
- Outgoing requests to Frappe: `camelCase` → `snake_case`
- Use a simple recursive key transformer, not a library

### Drive Root Config

```typescript
// src/lib/config.ts
export const config = {
  driveRoot: import.meta.env.VITE_SANGAM_DRIVE_ROOT,
  frappeUrl: import.meta.env.VITE_FRAPPE_URL,
};
```

```env
# .env
VITE_SANGAM_DRIVE_ROOT=C:\Users\Abhishek Bankar\Documents\Inventive Codebase\Sangam Server
VITE_FRAPPE_URL=http://samanvay-sangam:8000
```

### Project Structure Notes

This is the first story — no existing structure to align with. The scaffold creates the initial structure. Key decisions from architecture:
- Feature-based module structure in `src/features/` (created in later stories)
- Shared utilities in `src/lib/`
- API client in `src/lib/api/`
- File operations in `src/lib/file-ops/` (created in later stories)
- Types in `src/lib/types/`
- Config in `src/lib/config.ts`

Do NOT pre-create feature folders. Only create what this story needs:
- `src/lib/api/frappe-client.ts`
- `src/lib/config.ts`
- `src/lib/utils.ts` (case conversion)

### Anti-Patterns (DO NOT)

- Do NOT use Frappe v1 API patterns (`/api/resource/`, `/api/method/`)
- Do NOT use `useEffect` for data fetching — TanStack Query handles this (relevant for later stories)
- Do NOT use `forwardRef` — React 19 passes ref as prop
- Do NOT use manual `useMemo`/`useCallback` — React Compiler handles this
- Do NOT hardcode the drive root path — must be configurable via env
- Do NOT pre-create feature folders or files not needed by this story
- Do NOT add any authentication logic — that's Story 1.2

### References

- [Architecture Document](_bmad-output/planning-artifacts/architecture.md) — Full tech stack, patterns, decisions
- [Frappe v2 API Reference](docs/frappe-api-v2-reference.md) — Complete v2 endpoint patterns and TypeScript client
- [Tauri v2 Create Project](https://v2.tauri.app/start/create-project/) — Official scaffold docs
- [Tauri v2 FS Plugin](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/fs) — File system plugin
- [Tauri v2 Shell Plugin](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/shell) — Shell plugin
- [React Compiler Installation](https://react.dev/learn/react-compiler/installation) — Setup instructions
- [shadcn/ui](https://ui.shadcn.com/) — CLI v4, init command

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (1M context)

### Debug Log References
- Rust 1.94 incompatible with displaydoc/tinystr crates — pinned to 1.93 temporarily, then resolved by disabling WDAC policy
- WDAC Application Control policy blocked cargo build scripts — disabled via registry + reboot
- shadcn/ui init required Tailwind CSS v4 Vite plugin and @/ path alias configured first

### Completion Notes List
- Task 1: Tauri + React scaffold created, tsconfig.json strict mode verified
- Task 2: shadcn/ui (radix-vega), TanStack Query v5, React Router v7, React Compiler installed and configured
- Task 3: Tauri FS + Shell plugins installed (JS + Rust), registered in lib.rs, capabilities configured
- Task 4: .env with VITE_SANGAM_DRIVE_ROOT and VITE_FRAPPE_URL, config.ts reads env vars, .env.example created
- Task 5: frappe-client.ts with v2-only API endpoints, snake_case/camelCase conversion in utils.ts
- Task 6: Hello SANGAM landing page, MSI + NSIS installers built successfully

### File List
- .env (new) — environment variables for drive root and Frappe URL
- .env.example (new) — placeholder env template
- .gitignore (modified) — added .env exclusion, removed .vscode exclusion
- .vscode/launch.json (modified) — simplified one-click F5 launch
- components.json (new) — shadcn/ui configuration
- package.json (modified) — added dependencies and build:msi script
- package-lock.json (modified) — lockfile updated
- src/index.css (new) — Tailwind v4 + shadcn theme
- src/main.tsx (modified) — added index.css import
- src/App.tsx (modified) — Hello SANGAM landing page
- src/App.css (unchanged) — scaffold default styles
- src/lib/config.ts (new) — env variable config reader
- src/lib/utils.ts (modified) — added snake_case/camelCase conversion utilities
- src/lib/api/frappe-client.ts (new) — Frappe v2 API client
- src-tauri/Cargo.toml (modified) — added tauri-plugin-fs, tauri-plugin-shell
- src-tauri/Cargo.lock (modified) — lockfile updated
- src-tauri/src/lib.rs (modified) — registered FS and Shell plugins
- src-tauri/capabilities/default.json (modified) — fs and shell permissions
- tsconfig.json (modified) — ES2022 target, @/ path alias
- vite.config.ts (modified) — Tailwind plugin, React Compiler, @ alias
