# Phase 2: Supabase Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Supabase foundation for a cloud-based boilerplate: migration SQL, seed script, `packages/database-types` package, drift detection, RLS test, and setup documentation. **No live Supabase project is created or linked** — this is a boilerplate that downstream projects will specialize.

**Architecture:** Downstream projects that fork this boilerplate will create their own Supabase cloud project, put credentials in `.env.local`, then run `supabase link`, `pnpm db:push`, `pnpm db:seed`, and `pnpm db:types`. This phase ships all the pieces they need: the migration, the seed script, the typed package, the drift-detection script, and an RLS integration test that skips cleanly when `SUPABASE_URL` is unset.

**Tech Stack:** Supabase CLI 2.x, `@supabase/supabase-js` 2.x, Vitest 2.x, Node.js 22 (native `fetch`, `--env-file` flag).

**Source spec:** [`docs/superpowers/specs/2026-04-18-monorepo-boilerplate-design.md`](../specs/2026-04-18-monorepo-boilerplate-design.md)

**Phase gate (boilerplate version):**

- All SQL / JS / TS files committed.
- `node --check` passes on `scripts/seed.mjs` and `scripts/check-db-types.mjs`.
- `pnpm lint && pnpm typecheck && pnpm format:check` all exit 0.
- `pnpm test` exits 0 (RLS test skips because no `SUPABASE_URL`).

**Platform note:** Commands below use bash/POSIX syntax. Run them in Git Bash on Windows.

---

## Status

- **Task 1 (Supabase init):** DONE — `supabase init` ran, `supabase/config.toml` committed at `1f4b372`.

---

## Prerequisites

1. **Supabase CLI installed** (for `supabase init` and downstream `db:push`/`db:types`): `supabase --version` → `2.x.x` ✓ (installed via scoop; in Git Bash: `export PATH="/c/Users/Usuario/scoop/shims:$PATH"`)
2. **Node 22 + pnpm 9:** `node --version` → `v22.x.x`, `pnpm --version` → `9.x.x`

---

## File Structure (end state for this phase)

```
claude-code-boilerplate/
├── supabase/
│   ├── config.toml                          # supabase init output (committed)
│   └── migrations/
│       └── 20260418000000_initial_schema.sql # profiles, items, push_tokens, push_logs + RLS + triggers
├── .env.example                             # committed — placeholder values for required env vars
├── packages/
│   └── database-types/
│       ├── package.json                     # @repo/database-types
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── README.md                        # per-project setup guide
│       └── src/
│           ├── index.ts                     # placeholder; downstream runs `pnpm db:types`
│           └── __tests__/
│               └── rls.test.ts              # RLS integration test (skips if SUPABASE_URL unset)
├── scripts/
│   ├── seed.mjs                             # creates demo users + items via Admin API (no psql)
│   └── check-db-types.mjs                   # drift detection: fails if types are stale
└── package.json                             # +db:push, db:seed, db:types, db:types:check
```

---

## Task 2: Initial schema migration (SQL only)

**Files:**

- Create: `supabase/migrations/20260418000000_initial_schema.sql`

No live Supabase is required. We only author the migration file. Downstream projects run `pnpm db:push` against their own linked project.

- [ ] **Step 2.1: Create the migration file**

Create `supabase/migrations/20260418000000_initial_schema.sql` with this exact content:

```sql
-- =============================================================================
-- updated_at trigger (reused on every table that needs it)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- profiles
-- Auto-populated by handle_new_user() on auth.users INSERT.
-- =============================================================================
CREATE TABLE public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create a profile row whenever a new auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- items
-- User-scoped CRUD; RLS enforces owner-only access.
-- =============================================================================
CREATE TABLE public.items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_all_own"
  ON public.items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER on_items_updated
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- push_tokens
-- Upserted on mobile sign-in; identifies per-device Expo push token.
-- =============================================================================
CREATE TABLE public.push_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  device_id   TEXT        NOT NULL,
  expo_token  TEXT        NOT NULL,
  platform    TEXT        NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_tokens_all_own"
  ON public.push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- push_logs
-- Written exclusively by the send-push Edge Function (service role).
-- No user-level RLS policies — service role bypasses RLS.
-- =============================================================================
CREATE TABLE public.push_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  expo_token  TEXT        NOT NULL,
  status      TEXT        NOT NULL,
  message_id  TEXT,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.push_logs ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT/UPDATE/DELETE policies — only the service role key accesses this table.

-- =============================================================================
-- Example: DB-trigger push on items INSERT (commented — copy/paste in downstream apps)
-- =============================================================================
-- CREATE OR REPLACE FUNCTION public.notify_on_item_insert()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   PERFORM net.http_post(
--     url  := current_setting('app.supabase_url') || '/functions/v1/send-push',
--     body := json_build_object('user_id', NEW.user_id, 'title', 'New item!', 'body', NEW.title)
--   );
--   RETURN NEW;
-- END; $$;
-- CREATE TRIGGER on_item_inserted AFTER INSERT ON public.items
--   FOR EACH ROW EXECUTE FUNCTION public.notify_on_item_insert();
```

- [ ] **Step 2.2: Verify file is valid SQL syntax (lightweight check)**

```bash
wc -l supabase/migrations/20260418000000_initial_schema.sql
grep -c "CREATE TABLE public\." supabase/migrations/20260418000000_initial_schema.sql
```

Expected: line count > 100; 4 `CREATE TABLE public.` occurrences (profiles, items, push_tokens, push_logs).

- [ ] **Step 2.3: Commit**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
git add supabase/migrations/
git commit -m "feat(db): initial schema — profiles, items, push_tokens, push_logs with RLS"
```

---

## Task 3: Seed script

**Files:**

- Create: `scripts/seed.mjs`

Downstream projects run this against their own Supabase project via `pnpm db:seed`. The script uses Node.js 22's built-in `fetch` (no npm deps needed) and is idempotent.

- [ ] **Step 3.1: Create `scripts/seed.mjs`**

Create `scripts/seed.mjs`:

```mjs
// Seed script for development.
// Run: pnpm db:seed  (requires .env.local with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
// Idempotent: safe to run multiple times.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  console.error("  Make sure .env.local exists (copy from .env.example).");
  process.exit(1);
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
};

async function listUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=100`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`listUsers: ${await res.text()}`);
  const data = await res.json();
  return data.users ?? [];
}

async function ensureUser(email, password, fullName) {
  const users = await listUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    console.log(`  ${email} already exists (${existing.id})`);
    return existing.id;
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      email,
      password,
      user_metadata: { full_name: fullName },
      email_confirm: true,
    }),
  });
  if (!res.ok) throw new Error(`createUser(${email}): ${await res.text()}`);
  const user = await res.json();
  console.log(`  Created ${email} (${user.id})`);
  return user.id;
}

async function getUserItemCount(userId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/items?user_id=eq.${userId}&select=id`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`getUserItemCount: ${await res.text()}`);
  const rows = await res.json();
  return rows.length;
}

async function insertItem(userId, title, description) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/items`, {
    method: "POST",
    headers: { ...authHeaders, Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: userId, title, description }),
  });
  if (!res.ok) throw new Error(`insertItem("${title}"): ${await res.text()}`);
  console.log(`  Created item "${title}"`);
}

console.log("Seeding users...");
const aliceId = await ensureUser("alice@example.com", "password123", "Alice Example");
const bobId = await ensureUser("bob@example.com", "password123", "Bob Example");

console.log("Seeding items...");
const aliceCount = await getUserItemCount(aliceId);
if (aliceCount > 0) {
  console.log(`  Alice already has ${aliceCount} item(s) — skipping`);
} else {
  await insertItem(aliceId, "Welcome item", "Alice's first demo item — edit or delete it.");
  await insertItem(aliceId, "Second item", "Another demo item to demonstrate the list view.");
}

const bobCount = await getUserItemCount(bobId);
if (bobCount > 0) {
  console.log(`  Bob already has ${bobCount} item(s) — skipping`);
} else {
  await insertItem(bobId, "Bob's item", "Belongs to Bob — Alice cannot see this via the API.");
}

console.log("Seed complete!");
```

- [ ] **Step 3.2: Syntax check**

```bash
node --check scripts/seed.mjs
```

Expected: exits 0 with no output.

- [ ] **Step 3.3: Commit**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
git add scripts/seed.mjs
git commit -m "feat(db): seed script (alice + bob + items) via Admin API"
```

---

## Task 4: `.env.example`

**Files:**

- Create: `.env.example`

- [ ] **Step 4.1: Create `.env.example`**

Create `.env.example` in the worktree root:

```bash
# Copy this file to .env.local and fill in your Supabase project credentials.
# .env.local is gitignored. Get these values from:
#   https://supabase.com/dashboard/project/<ref>/settings/api
#   https://supabase.com/dashboard/project/<ref>/settings/database (for DATABASE_URL)

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here
DATABASE_URL=postgresql://postgres:[your-db-password]@db.your-project-ref.supabase.co:5432/postgres
```

- [ ] **Step 4.2: Verify `.env.local` is still gitignored**

```bash
grep -E "^\.env(\.local)?$" .gitignore
```

Expected: at least `.env` and `.env.local` listed. (They already are — confirmed in plan.)

- [ ] **Step 4.3: Commit**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
git add .env.example
git commit -m "chore: add .env.example documenting required Supabase credentials"
```

---

## Task 5: `packages/database-types` package scaffold

**Files:**

- Create: `packages/database-types/package.json`
- Create: `packages/database-types/tsconfig.json`
- Create: `packages/database-types/vitest.config.ts`
- Create: `packages/database-types/README.md`
- Create: `packages/database-types/src/index.ts` (placeholder — downstream runs `pnpm db:types`)

- [ ] **Step 5.1: Create `packages/database-types/package.json`**

```json
{
  "name": "@repo/database-types",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "@supabase/supabase-js": "^2.45.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 5.2: Create `packages/database-types/tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 5.3: Create `packages/database-types/vitest.config.ts`**

The `envDir: "../../"` makes Vitest load `.env.local` from the monorepo root so RLS tests pick up credentials when a developer has configured a Supabase project.

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 10000,
    include: ["src/**/*.test.ts"],
    envDir: "../../",
  },
});
```

- [ ] **Step 5.4: Create `packages/database-types/README.md`**

Create the file with this content (use real triple-backticks for all code fences):

```
# @repo/database-types

Auto-generated TypeScript types for the Supabase `public` schema.

## Per-project setup (boilerplate consumers)

This boilerplate ships with a placeholder `Database` type. To use real types:

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` (at monorepo root) to `.env.local` and fill in credentials
3. Log in and link the CLI (one-time):
   [triple-backtick]bash
   supabase login
   supabase link --project-ref <your-project-ref>
   [triple-backtick]
4. Apply the migration:
   [triple-backtick]bash
   pnpm db:push
   [triple-backtick]
5. Seed demo data (optional):
   [triple-backtick]bash
   pnpm db:seed
   [triple-backtick]
6. Generate real types:
   [triple-backtick]bash
   pnpm db:types
   [triple-backtick]
7. Commit the regenerated `packages/database-types/src/index.ts`.

## Regenerating types

[triple-backtick]bash
pnpm db:types        # regenerate from linked Supabase project
pnpm db:types:check  # fail if committed types differ from linked schema
[triple-backtick]

## Usage

[triple-backtick]ts
import type { Database } from "@repo/database-types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
[triple-backtick]

## Tables

| Table         | Purpose                                    |
| ------------- | ------------------------------------------ |
| `profiles`    | User display name + avatar; auto-created   |
| `items`       | Demo CRUD entity; user-scoped RLS          |
| `push_tokens` | Expo push token per device; user-scoped    |
| `push_logs`   | Push delivery log; service-role write only |
```

Replace each `[triple-backtick]` placeholder with three real backtick characters (` ``` `).

- [ ] **Step 5.5: Create placeholder `packages/database-types/src/index.ts`**

```ts
// Auto-generated by `pnpm db:types` — do not edit manually.
// This boilerplate ships with a placeholder. Downstream projects regenerate after linking.
// Run `pnpm db:types` after any schema change, then commit the result.
export type Database = Record<string, never>;
```

- [ ] **Step 5.6: Install and verify**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
pnpm install
pnpm --filter @repo/database-types typecheck
```

Expected: `pnpm install` resolves `@repo/database-types` as a workspace package; `typecheck` exits 0.

- [ ] **Step 5.7: Commit**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
git add packages/database-types/ pnpm-lock.yaml
git commit -m "feat: scaffold @repo/database-types package"
```

---

## Task 6: Drift-check script + db:\* scripts in root package.json

**Files:**

- Create: `scripts/check-db-types.mjs`
- Modify: `package.json` (root, add `db:push`, `db:seed`, `db:types`, `db:types:check`)

- [ ] **Step 6.1: Create `scripts/check-db-types.mjs`**

Create `scripts/check-db-types.mjs`:

```mjs
// Drift detection: fail if committed database types differ from the linked schema.
// Run via: pnpm db:types:check  (requires `supabase link` to have been run)
import { execSync } from "child_process";
import { readFileSync } from "fs";

const TYPES_FILE = "packages/database-types/src/index.ts";

let generated;
try {
  generated = execSync("supabase gen types typescript --linked --schema public", {
    encoding: "utf-8",
    stdio: ["inherit", "pipe", "inherit"],
  });
} catch {
  console.error("ERROR: Failed to generate types. Is `supabase link` configured?");
  process.exit(1);
}

const committed = readFileSync(TYPES_FILE, "utf-8");

if (generated !== committed) {
  console.error("ERROR: Database types are out of sync with the linked schema.");
  console.error("Run `pnpm db:types` to regenerate, then commit the result.");
  process.exit(1);
}

console.log("OK: Database types match the linked schema.");
```

- [ ] **Step 6.2: Syntax check**

```bash
node --check scripts/check-db-types.mjs
```

Expected: exits 0 with no output.

- [ ] **Step 6.3: Add `db:*` scripts to root `package.json`**

Open root `package.json`. Add these scripts after `"prepare"`:

```json
    "db:push": "supabase db push",
    "db:seed": "node --env-file=.env.local scripts/seed.mjs",
    "db:types": "supabase gen types typescript --linked --schema public > packages/database-types/src/index.ts",
    "db:types:check": "node scripts/check-db-types.mjs"
```

The full `scripts` block should be:

```json
  "scripts": {
    "build": "turbo run build",
    "lint": "eslint . && turbo run lint",
    "lint:root": "eslint .",
    "typecheck": "tsc --noEmit && turbo run typecheck",
    "test": "turbo run test",
    "dev": "turbo run dev",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\" --ignore-path .prettierignore",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\" --ignore-path .prettierignore",
    "prepare": "husky",
    "db:push": "supabase db push",
    "db:seed": "node --env-file=.env.local scripts/seed.mjs",
    "db:types": "supabase gen types typescript --linked --schema public > packages/database-types/src/index.ts",
    "db:types:check": "node scripts/check-db-types.mjs"
  }
```

- [ ] **Step 6.4: Commit**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
git add scripts/check-db-types.mjs package.json
git commit -m "feat(db): drift detection script + db:push/db:seed/db:types/db:types:check scripts"
```

---

## Task 7: RLS integration test (skip-cleanly pattern)

**Files:**

- Create: `packages/database-types/src/__tests__/rls.test.ts`

The test reads Supabase credentials from env vars. When `SUPABASE_URL` is unset (boilerplate case), the suite skips cleanly so `pnpm test` passes.

- [ ] **Step 7.1: Write the test**

Create `packages/database-types/src/__tests__/rls.test.ts`:

```ts
import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "../index.js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Skip the entire suite when Supabase credentials are not configured or unreachable.
const supabaseReachable =
  !!SUPABASE_URL &&
  !!ANON_KEY &&
  !!SERVICE_ROLE_KEY &&
  (await fetch(`${SUPABASE_URL}/auth/v1/health`)
    .then((r) => r.ok)
    .catch(() => false));

// Create clients unconditionally so TypeScript is happy; they're only used inside the suite.
const anon = SUPABASE_URL
  ? createClient<Database>(SUPABASE_URL, ANON_KEY)
  : (null as unknown as ReturnType<typeof createClient<Database>>);
const service = SUPABASE_URL
  ? createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : (null as unknown as ReturnType<typeof createClient<Database>>);

describe.skipIf(!supabaseReachable)(
  "RLS — skipped when SUPABASE_URL not set or unreachable",
  () => {
    const TEST_ITEM_TITLE = "__rls_test_item__";
    let testUserId: string | null = null;

    beforeAll(async () => {
      const { data, error } = await service.auth.admin.createUser({
        email: `rls-test-${Date.now()}@example.com`,
        password: "test-password-123",
        email_confirm: true,
      });
      if (error) throw error;
      testUserId = data.user.id;
      await service.from("items").insert({ user_id: testUserId, title: TEST_ITEM_TITLE });
    });

    afterAll(async () => {
      if (testUserId) {
        await service.from("items").delete().eq("title", TEST_ITEM_TITLE);
        await service.auth.admin.deleteUser(testUserId);
      }
    });

    it("anon client gets empty rows from items (RLS blocks unauthenticated SELECT)", async () => {
      const { data, error } = await anon.from("items").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("anon client gets empty rows from profiles (RLS blocks unauthenticated SELECT)", async () => {
      const { data, error } = await anon.from("profiles").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("anon client gets empty rows from push_tokens (RLS blocks unauthenticated SELECT)", async () => {
      const { data, error } = await anon.from("push_tokens").select("*");
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it("service role bypasses RLS and reads the test item", async () => {
      const { data, error } = await service
        .from("items")
        .select("id, user_id")
        .eq("title", TEST_ITEM_TITLE);
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThan(0);
      expect(data!.every((row) => row.user_id === testUserId)).toBe(true);
    });
  },
);
```

Note: the test uses the placeholder `Database` type (empty object) when no real types have been generated. With the placeholder, `service.from("items")` will be typed loosely but still compile. Downstream projects that run `pnpm db:types` will get full type-safety.

- [ ] **Step 7.2: Verify test skips cleanly (no SUPABASE_URL set)**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
pnpm --filter @repo/database-types test
```

Expected:

```
Test Files  1 skipped (1)
Tests       4 skipped (4)
```

Exit code 0.

- [ ] **Step 7.3: Verify `pnpm test` (root) picks up the package test and still exits 0**

```bash
pnpm test
```

Expected: Turborepo runs `test` across workspaces; database-types test skips cleanly; exit code 0.

- [ ] **Step 7.4: Commit**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
git add packages/database-types/src/__tests__/rls.test.ts
git commit -m "test(db): RLS integration test — skips when SUPABASE_URL unset"
```

---

## Task 8: Phase gate verification

**Files:** none (verification only)

- [ ] **Step 8.1: Syntax check all scripts**

```bash
cd /d/repos/claude-code-boilerplate/.claude/worktrees/phase2-supabase
node --check scripts/seed.mjs
node --check scripts/check-db-types.mjs
```

Expected: both exit 0 with no output.

- [ ] **Step 8.2: Run full test suite**

```bash
pnpm test
```

Expected: all packages' tests run or skip cleanly; exit 0.

- [ ] **Step 8.3: Run the other gates**

```bash
pnpm lint && pnpm typecheck && pnpm format:check
```

Expected: all three exit 0.

- [ ] **Step 8.4: Final sanity check + tag**

```bash
git status
git log --oneline -10
git tag phase-2-complete
```

Expected:

- Working tree clean.
- 7 new commits since phase-1-complete:
  - `chore: init Supabase local project`
  - `feat(db): initial schema — profiles, items, push_tokens, push_logs with RLS`
  - `feat(db): seed script (alice + bob + items) via Admin API`
  - `chore: add .env.example documenting required Supabase credentials`
  - `feat: scaffold @repo/database-types package`
  - `feat(db): drift detection script + db:push/db:seed/db:types/db:types:check scripts`
  - `test(db): RLS integration test — skips when SUPABASE_URL unset`

---

## Phase 2 Exit Criteria — Checklist

Before declaring Phase 2 done, confirm:

- [ ] `supabase/migrations/20260418000000_initial_schema.sql` exists and contains all 4 tables.
- [ ] `.env.example` is committed with placeholder values; `.env.local` is NOT committed.
- [ ] `scripts/seed.mjs` and `scripts/check-db-types.mjs` pass `node --check`.
- [ ] `packages/database-types/` package exists with placeholder `Database` type.
- [ ] `pnpm --filter @repo/database-types typecheck` exits 0.
- [ ] Root `package.json` has `db:push`, `db:seed`, `db:types`, `db:types:check` scripts.
- [ ] `pnpm test` exits 0 with RLS suite skipping cleanly.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm format:check` all exit 0.
- [ ] No secrets in git history.

---

## Notes for downstream projects (boilerplate consumers)

A project that forks this boilerplate will do the following once, as documented in `packages/database-types/README.md`:

1. Create Supabase project at supabase.com
2. Copy `.env.example` → `.env.local`, fill in credentials
3. `supabase login` + `supabase link --project-ref <ref>`
4. `pnpm db:push` — apply migration
5. `pnpm db:seed` — create demo users + items
6. `pnpm db:types` — generate real types; commit the result
7. RLS integration test will now run on `pnpm test`.

## Notes for later phases

- **Phase 3** will add `packages/api-client`, which imports `@repo/database-types` via `import type { Database } from "@repo/database-types"` and reads `SUPABASE_URL` / `SUPABASE_ANON_KEY` from env.
- **Phase 6** (Auth) will add the `signIn` / `signUp` flows; `profiles` will be populated automatically by the `handle_new_user()` trigger already in place.
- **Phase 8** (Push) will add the Edge Function at `supabase/functions/send-push/` and push delivery logging to `push_logs`.
- **Phase 10** (CI) will run `supabase link --project-ref $CI_SUPABASE_REF` in GitHub Actions using stored secrets and execute `pnpm db:types:check` to catch drift on every PR.
- The `push_logs` table has no user-level RLS policies by design. Only the Edge Function (service role) writes/reads it.
