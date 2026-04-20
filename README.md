# claude-code-boilerplate

Lean monorepo boilerplate for shipping **small web + mobile side projects** fast with Claude Code. Built for solo devs who want a working foundation — not a corporate platform.

Zero-config philosophy: every optional integration (Stripe, Resend, Sentry, PostHog, Upstash, cron, push notifications) **no-ops when its env vars are absent**. Configure what you need, ignore the rest.

## What's in the box

- **apps/web** — Next.js 15 (App Router) + next-intl (`/en`, `/es`) + Supabase SSR + TanStack Query + Tailwind + shadcn-style UI.
- **apps/mobile** — Expo SDK 52 + Expo Router + NativeWind 4 + shared api-client + Expo push notifications.
- **packages/** — `api-client`, `analytics`, `validation` (Zod), `i18n`, `tailwind-config`, `database-types`, shared ESLint + TS configs.
- **supabase/** — migrations (profiles, items, subscriptions, audit_logs, avatars bucket, push_tokens) + edge function `send-push`.
- **Gate** — `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` runs in CI on every PR.

## Features shipped (43 phases, tagged on `main`)

| Area          | What you get                                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation    | pnpm workspaces, Turborepo 2, Node 22, ESLint 9 flat, Prettier 3, Husky, Commitlint, Dependabot, GitHub Actions                                                                                                                        |
| Data          | Supabase migrations, RLS on `profiles`/`items`/`subscriptions`/`audit_logs`, typed `database-types` package, seed script, `db:types:check` drift guard                                                                                 |
| Web           | `[locale]` routing, Supabase SSR middleware, TanStack Query, server actions, route + global error boundaries, maintenance mode, `/admin/logs` page                                                                                     |
| UI            | Tailwind tokens, shadcn-style `Button`/`Card`/`Input`/`Dialog`, dark mode (`next-themes`), skeletons, empty states                                                                                                                     |
| Forms         | Zod-validated server actions via `safeAction()`, progressive-enhancement friendly, `formDataToObject()` helper                                                                                                                         |
| SEO           | `sitemap.ts`, `robots.ts`, `rss.xml`, `opengraph-image.tsx`, JSON-LD helpers, `llms.txt` + `llms-full.txt`                                                                                                                             |
| Auth          | Email/password + magic link + OAuth-ready, rate-limited via Upstash (optional), `safeRedirect()` guard                                                                                                                                 |
| Payments      | Stripe checkout + webhook + customer portal + `/billing` page (only mounts when 3 env vars set)                                                                                                                                        |
| Email         | Resend transactional emails with React Email templates (only mounts when 2 env vars set)                                                                                                                                               |
| i18n          | next-intl with per-locale messages, locale-aware formatters (`Intl.NumberFormat`, `Intl.DateTimeFormat`)                                                                                                                               |
| Security      | HMAC verify, file upload MIME/size validation, safe redirect whitelist, audit log table, CSRF via SameSite cookies                                                                                                                     |
| Observability | Sentry (web + edge + mobile), PostHog, structured `logger`, `X-Request-Id` correlation, `/admin/logs` viewer                                                                                                                           |
| Cron          | `/api/cron/*` routes gated by `CRON_SECRET`, helper to schedule via Vercel Cron                                                                                                                                                        |
| Mobile        | Expo Router, NativeWind, shared api-client, push tokens table + `send-push` edge function, EAS Build profiles                                                                                                                          |
| Lib utilities | `slugify`, `retry` w/ backoff, `debounce`/`throttle`, `hash`/`etag`, `format`, `pagination`, `safeAction`, `safeRedirect`, `logger`, `ratelimit`, `hmac`, `file-validation`, `flags`, `cron`, `request-id`, `email`, `stripe`, `audit` |
| Client hooks  | `useLocalStorage`, `useMediaQuery`, `useCopyToClipboard`                                                                                                                                                                               |

Each phase is a tagged commit (`phase-1-complete` … `phase-43-complete`). Plans live under [`docs/superpowers/plans/`](docs/superpowers/plans/).

## Quick start

```bash
pnpm install
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

pnpm dlx supabase start           # local Postgres + auth + storage
pnpm dlx supabase db reset        # applies migrations + seeds

pnpm dev                          # web on :3000, mobile via Expo Dev Server
```

Full walkthrough: **[docs/SETUP.md](docs/SETUP.md)**.

## Common scripts

```bash
pnpm typecheck         # tsc across every workspace
pnpm lint              # eslint + per-app lint
pnpm test              # vitest (turbo-cached)
pnpm build             # turbo build (env validation runs — see note)
pnpm format            # prettier --write
pnpm format:check      # prettier --check (CI gate)
pnpm doctor            # env + tool sanity check
pnpm db:push           # supabase db push (linked project)
pnpm db:types          # regenerate packages/database-types from remote schema
pnpm db:types:check    # CI guard that types match migrations
```

**Build note:** `pnpm build` runs strict env validation. For CI or local smoke builds where optional vars are absent, use `SKIP_ENV_VALIDATION=true pnpm build`.

## Deployment

- **Web → Vercel** — set root directory to `apps/web`, paste env vars from [apps/web/.env.example](apps/web/.env.example).
- **Mobile → EAS** — `eas init`, set EAS secrets, `eas build --profile preview`.
- **DB → Supabase** — `supabase link`, `supabase db push`, `supabase functions deploy send-push`.

Full walkthrough: **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Docs

- **[docs/SETUP.md](docs/SETUP.md)** — extensive step-by-step first-time setup, every manual step covered.
- **[docs/DEPLOY.md](docs/DEPLOY.md)** — Vercel + EAS + Supabase deployment.
- **[docs/HANDOFF.md](docs/HANDOFF.md)** — architecture tour + conventions + "don't do this" list for future AI agents.
- **[docs/STARTER_PROMPTS.md](docs/STARTER_PROMPTS.md)** — ready-to-paste prompts to kickstart a new project on top of this boilerplate (idea → design → plan → build).

## Philosophy

This is a **side-project boilerplate**, not an enterprise platform. It deliberately skips CSP-with-nonce, Storybook, OpenAPI generation, A/B testing frameworks, OpenTelemetry tracing, queue wrappers, multi-tenant scaffolding, etc. If a solo dev shipping a side project in a weekend wouldn't reach for it, it's not in here.

## License

MIT.
