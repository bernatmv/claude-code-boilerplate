# AI Handoff Guide

For the **next AI agent** (Claude Code, Cursor, Copilot, Codex, etc.) or human picking this repo up. Read this before making changes.

---

## Mental model in 60 seconds

- **Side-project boilerplate.** Not enterprise. Keep it lean. If a feature wouldn't help a solo dev ship a side project in a weekend, don't add it.
- **Zero-config philosophy.** Every integration no-ops when its env vars are absent. Never throw at module load because a key is missing; return a stub and let callers check `isEnabled()`.
- **pnpm workspaces + Turborepo.** `apps/*` consume `packages/*` via `workspace:*`. Turbo caches per-package. Add env vars to `turbo.json#globalEnv` or cache keys break.
- **Gate.** `format:check → lint → typecheck → test → build`. Passing gate = shippable. CI runs the same five.
- **Phases.** The repo was built in 43 tagged phases (`phase-1-complete` … `phase-43-complete`). Every phase: worktree → gate → Conventional Commit → tag → `merge --no-ff` to main → push + tags → cleanup worktree.

---

## Directory map

```
apps/
  web/                 Next.js 15 App Router
    src/app/
      [locale]/        next-intl locale-scoped routes
      api/             Route handlers (stripe, cron, …)
      auth/            Supabase auth callback
      layout.tsx       Root layout (locale-agnostic)
      global-error.tsx Critical error boundary (html+body)
      llms.txt         AI-crawlable site summary
    src/lib/           ← **reusable helpers live here** (see table below)
    src/hooks/         Client-only React hooks
    src/components/ui/ shadcn-style primitives
  mobile/              Expo Router + NativeWind

packages/
  api-client/          TanStack Query wrappers around Supabase (web + mobile share)
  analytics/           PostHog thin wrapper
  validation/          Zod schemas shared across apps
  i18n/                next-intl messages
  tailwind-config/     Shared tokens + preset
  database-types/      Generated from Supabase schema (do not hand-edit)
  config-eslint/       Flat config
  config-typescript/   Base tsconfig

supabase/
  migrations/          SQL migrations in timestamp order
  functions/send-push/ Deno edge function for Expo push
  config.toml

docs/
  SETUP.md             First-time setup
  DEPLOY.md            Vercel + EAS + Supabase deploy
  HANDOFF.md           ← you are here
  STARTER_PROMPTS.md   Ready-to-paste prompts to spin up a new app
  superpowers/plans/   Phase plans (historical record)
```

---

## The `lib/` index

Every helper is small (50–150 LOC) with a co-located `.test.ts`. Pure functions where possible; side-effectful helpers are composed at the call site. Don't introduce new abstractions unless a third caller needs them.

| File                 | Purpose                                                                   |
| -------------------- | ------------------------------------------------------------------------- |
| `api.ts`             | Typed `fetch` wrapper with Zod response parsing                           |
| `articles.ts`        | Example content-loader (replace or extend for your app)                   |
| `audit.ts`           | Write to `audit_logs` table from server actions                           |
| `auth/`              | Supabase SSR client factories (`createServerClient`, `createAdminClient`) |
| `cn.ts`              | `clsx` + `tailwind-merge`                                                 |
| `cron.ts`            | Verify `Authorization: Bearer ${CRON_SECRET}` on `/api/cron/*`            |
| `debounce.ts`        | `debounce()` + `throttle()` with `.cancel()`/`.flush()`                   |
| `email.ts`           | Resend wrapper; no-op when `RESEND_API_KEY` missing                       |
| `emails/`            | React Email templates                                                     |
| `file-validation.ts` | MIME + size guard for uploads                                             |
| `flags.ts`           | `isEnabled("flagName")` reads `NEXT_PUBLIC_FEATURE_FLAGS` JSON            |
| `format.ts`          | `Intl.NumberFormat` / `Intl.DateTimeFormat` locale-aware formatters       |
| `hash.ts`            | `hashHex(input, "SHA-256")` + `etag(input)` via Web Crypto                |
| `hmac.ts`            | Constant-time HMAC verify (webhooks)                                      |
| `jsonld.ts`          | JSON-LD generators for SEO                                                |
| `logger.ts`          | Structured JSON logs; pipes to Sentry breadcrumbs if DSN set              |
| `pagination.ts`      | Offset + cursor pagination helpers                                        |
| `ratelimit.ts`       | Upstash Redis sliding-window; no-op when Redis env absent                 |
| `request-id.ts`      | `X-Request-Id` middleware + context                                       |
| `retry.ts`           | `retry(fn, {retries, shouldRetry, signal})` + `computeBackoff()`          |
| `safe-action.ts`     | `safeAction(schema, handler)` → typed server actions with field errors    |
| `safe-redirect.ts`   | Whitelist-based redirect sanitizer                                        |
| `site.ts`            | Canonical URLs, metadata                                                  |
| `slugify.ts`         | `slugify()` + `uniqueSlug()`                                              |
| `stripe.ts`          | Stripe SDK + webhook verification; no-op when keys absent                 |
| `supabase/`          | Deprecated — use `auth/` instead                                          |

## The `hooks/` index

| Hook                 | Purpose                            |
| -------------------- | ---------------------------------- |
| `useLocalStorage`    | Persistent client state, SSR-safe  |
| `useMediaQuery`      | Reactive to viewport changes       |
| `useCopyToClipboard` | `{ copied, copy }` with auto-reset |

---

## Conventions

### Code style

- **TypeScript strict.** No `any`. If you need an escape hatch, `unknown` + narrow.
- **Server vs client.** Default server. Add `"use client"` only when needed (hooks, events, browser APIs).
- **Server actions** use `safeAction(schema, handler)`. Never accept `FormData` directly in a handler — convert at the boundary via `formDataToObject()`.
- **No console.** `no-console` is enforced. Use `logger.info/warn/error` from `lib/logger`.
- **Fetch in server components.** Use native `fetch` with `{ next: { revalidate } }` or `cache: "no-store"`. Avoid React Query server-side.
- **Env vars.** Read via `@/env` (built on `@t3-oss/env-nextjs`). Adding a new var: update `env.ts` schema + `.env.example` + `turbo.json#globalEnv`.
- **Edge runtime.** Use Web Crypto (`crypto.subtle.digest`, `crypto.randomUUID`). Never import `node:crypto` on edge paths.

### Tests

- **Vitest unit tests** live next to source (`foo.ts` + `foo.test.ts`).
- **Playwright smoke** lives under `apps/web/e2e/`. Kept minimal — don't replicate unit test coverage.
- Prefer `useFakeTimers()` for time-dependent code.
- Tests run in Turbo — cached; keep them pure.

### Commits

- **Conventional Commits** enforced by Commitlint: `feat(scope): …`, `fix(scope): …`, `chore: …`, `docs: …`, `refactor: …`, `test: …`.
- One logical change per commit.
- CI runs the gate on every PR.

### Branches + worktrees

- Feature work in `.claude/worktrees/<slug>` branches.
- Merge with `git merge --no-ff` to preserve branch history.
- On Windows, `git worktree remove --force` may print "Directory not empty" — benign; the branch deletes successfully.

---

## Don't do this

Hard-learned list. Future AI agents: **read every item**.

1. **Don't add heavy/enterprise dependencies** without asking. No Storybook, no OpenTelemetry, no OpenAPI generators, no queue libraries, no bot-detection middleware, no A/B testing frameworks, no multi-tenant scaffolding, no CSP-with-nonce. Rule of thumb: "Would a solo dev shipping a side project in a weekend reach for this?" If no, skip.

2. **Don't add a new `packages/*` workspace just to share 50 LOC.** Put it in `apps/web/src/lib/` or a package that already exists.

3. **Don't add peer-dependency heavy libraries** (e.g., `sonner` with a React peer dep) without testing that pnpm resolves them cleanly across the workspace. An earlier phase tried and broke workspace resolution — details in git history.

4. **Don't throw at module load when an env var is missing.** All optional integrations must degrade gracefully. Pattern:

   ```ts
   export const stripe = process.env.STRIPE_SECRET_KEY
     ? new Stripe(process.env.STRIPE_SECRET_KEY)
     : null;
   ```

5. **Don't import server-only code into client components.** `@/lib/auth/createServerClient` and anything touching `SUPABASE_SERVICE_ROLE_KEY` is server-only.

6. **Don't hand-edit `packages/database-types/src/index.ts`.** Regenerate with `pnpm db:types` after migrations.

7. **Don't skip the gate.** `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` is the contract. Use `SKIP_ENV_VALIDATION=true` for builds without optional env vars.

8. **Don't use `async () => foo` in tests or handlers that don't `await`.** ESLint `require-await` will fail. Use `() => Promise.resolve(foo)`.

9. **Don't reject Promises with non-Error values.** ESLint `prefer-promise-reject-errors`. Always `reject(new Error(...))`.

10. **Don't over-engineer the "next 43 phases."** The boilerplate is done. New work should be **application-specific** (for the app you're building on top of it), not boilerplate expansion.

---

## Adding a feature — suggested workflow

1. Create a worktree: `git worktree add .claude/worktrees/<slug> -b feat/<slug> main`.
2. **Plan.** Read the `lib/` index — does a helper already exist? Compose before create.
3. **TDD.** Write the failing test first. Implement. Run the gate.
4. **Commit.** Conventional format.
5. **Merge.** `git merge --no-ff` to main. Push. Cleanup worktree.

For bigger features, use the `superpowers` plugin's `brainstorming → writing-plans → subagent-driven-development` flow. Save plans under `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`.

---

## Common tasks cheat sheet

| Task                  | Command                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Start everything      | `pnpm dev`                                                                                             |
| Run gate              | `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && SKIP_ENV_VALIDATION=true pnpm build` |
| Add a migration       | Create `supabase/migrations/<timestamp>_<name>.sql`, then `pnpm dlx supabase db reset` locally         |
| Regenerate DB types   | `pnpm db:types` (requires `supabase link`)                                                             |
| Verify DB types match | `pnpm db:types:check`                                                                                  |
| Seed local DB         | `pnpm db:seed`                                                                                         |
| Sanity check env      | `pnpm doctor`                                                                                          |

---

## When in doubt

- Read the phase plans under `docs/superpowers/plans/`.
- Read the git log: `git log --oneline --grep="^feat\|^fix"`.
- Read the `.test.ts` file next to the helper — shows intended usage.
