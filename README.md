# claude-code-boilerplate

Monorepo boilerplate for shipping web + mobile apps with Claude Code.

- **apps/web** — Next.js 15 (App Router, next-intl, Supabase SSR, Sentry, PostHog)
- **apps/mobile** — Expo SDK 52 + Expo Router (NativeWind, push notifications, Sentry, PostHog)
- **packages/** — shared `api-client`, `analytics`, `validation` (Zod), `i18n`, `tailwind-config`, `database-types`, ESLint / TypeScript configs
- **supabase/** — migrations (profiles, items, push_tokens, push_logs, avatars bucket) + edge functions (send-push)

## Stack

pnpm workspaces · Turborepo 2 · React 18.3 · TanStack Query 5 · Supabase · next-intl · NativeWind 4 · Vitest · Playwright · ESLint 9 · Prettier 3 · Husky · Commitlint · GitHub Actions · Dependabot

## Quick start

```bash
pnpm install
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

pnpm dlx supabase start           # local Postgres + auth + storage
pnpm dlx supabase db reset        # applies migrations + seeds

pnpm dev                          # runs web + mobile + any watch tasks
```

## Common tasks

```bash
pnpm typecheck         # tsc across every workspace
pnpm lint              # eslint + per-app lint
pnpm test              # vitest (turbo-cached)
pnpm build             # turbo build (web + mobile bundle steps)
pnpm format            # prettier --write
pnpm format:check      # prettier --check (CI gate)
```

## Deployment

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for Vercel, EAS, and Supabase deployment walkthroughs.

## Phases

The repo was built phase-by-phase; each phase is a tagged commit on `main`
(`phase-1-complete` → `phase-13-complete`). Plans live in
[`docs/superpowers/plans/`](docs/superpowers/plans/).
