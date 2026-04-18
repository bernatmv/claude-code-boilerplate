# @repo/database-types

Auto-generated TypeScript types for the Supabase `public` schema.

## Per-project setup (boilerplate consumers)

This boilerplate ships with a placeholder `Database` type. To use real types:

1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` (at monorepo root) to `.env.local` and fill in credentials
3. Log in and link the CLI (one-time):
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
4. Apply the migration:
   ```bash
   pnpm db:push
   ```
5. Seed demo data (optional):
   ```bash
   pnpm db:seed
   ```
6. Generate real types:
   ```bash
   pnpm db:types
   ```
7. Commit the regenerated `packages/database-types/src/index.ts`.

## Regenerating types

```bash
pnpm db:types        # regenerate from linked Supabase project
pnpm db:types:check  # fail if committed types differ from linked schema
```

## Usage

```ts
import type { Database } from "@repo/database-types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
```

## Tables

| Table         | Purpose                                    |
| ------------- | ------------------------------------------ |
| `profiles`    | User display name + avatar; auto-created   |
| `items`       | Demo CRUD entity; user-scoped RLS          |
| `push_tokens` | Expo push token per device; user-scoped    |
| `push_logs`   | Push delivery log; service-role write only |
