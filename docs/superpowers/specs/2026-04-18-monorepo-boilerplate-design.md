# Monorepo Boilerplate — PRD / Design Spec

**Status:** Approved design, pending implementation plan
**Date:** 2026-04-18
**Owner:** Bernat Martinez Vidal
**Scope:** A reusable template repository for launching web + iOS + Android apps quickly, with Supabase backend, shared packages, TDD tooling, CI, and deploy automation.

---

## 1. Overview

### 1.1 Purpose

Create a single monorepo template that shortens the time-to-first-feature for new apps to under 30 minutes from `git clone` to a deployed preview with working auth, push, i18n, analytics, and SEO.

### 1.2 Goals

- **One command setup.** `pnpm install && pnpm run init && pnpm run dev` gets a new developer running.
- **Cross-platform from day one.** Web (Next.js) + mobile (iOS + Android via Expo) share types, validation, API client, i18n strings, and design tokens.
- **Production-shaped defaults.** Auth, push, analytics, SEO, i18n, a11y, testing, and CI are wired and demonstrated, not left as exercises.
- **Isolation and clarity.** Small packages with single responsibilities and enforced dependency directions.
- **TDD-friendly.** Unit (Vitest) + web E2E (Playwright) + mobile E2E (Maestro), all with MSW-based mocking of external APIs.
- **GitHub Free-tier friendly.** CI must stay within GitHub Actions Free monthly minutes for private repos (~2,000 min/month).

### 1.3 Non-goals (v1)

- Web push notifications, PWA support, offline mode.
- GDPR consent banner (structure is prepared; banner itself deferred).
- Error tracking (Sentry) — documented but not preinstalled.
- Payments, feature flags, CMS integrations.
- State managers beyond TanStack Query + React Context.
- A built documentation website (plain markdown only).
- Visual regression testing.

### 1.4 Success criteria (measurable)

1. Fresh clone → `pnpm install && pnpm run init && pnpm run dev` runs web and mobile without additional manual steps beyond the documented external account setup (Google Cloud Console, EAS, Vercel, Supabase).
2. A new project reaches "signed in (email + Google), received a push, switched language, deployed Vercel preview" in < 30 minutes of developer time following `docs/`.
3. `pnpm test` (Vitest) and `pnpm test:e2e` (Playwright) both pass on a fresh clone after `init`.
4. A trivial PR finishes CI in < 10 Linux-minutes; `mobile-e2e` label completes in < 30 total minutes.
5. Lighthouse ≥ 95 on the landing page for Performance, Accessibility, Best Practices, SEO.
6. Axe-core reports 0 serious/critical a11y violations on demo pages.

---

## 2. Tech stack

| Concern          | Choice                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------- |
| Monorepo         | pnpm workspaces + Turborepo                                                            |
| Web framework    | Next.js 15 (App Router) + React + TypeScript                                           |
| Web styling      | Tailwind CSS + shadcn/ui                                                               |
| Mobile framework | Expo (SDK 52+) + Expo Router + React Native                                            |
| Mobile styling   | NativeWind + React Native Reusables                                                    |
| Backend          | Supabase (Postgres, Auth, Storage, Edge Functions)                                     |
| Auth             | Supabase email/password + Google SSO (PKCE on web; native ID-token exchange on mobile) |
| Data fetching    | TanStack Query (React Query), wrapping `@supabase/supabase-js`                         |
| Forms            | React Hook Form + Zod resolver                                                         |
| Validation       | Zod (shared client + server + tests)                                                   |
| i18n             | `next-intl` (web) + `i18next` / `react-i18next` (mobile); shared JSON strings          |
| Analytics        | PostHog + Google Analytics 4 (no consent banner in v1; consent-ready API surface)      |
| Push             | Expo Notifications + Supabase Edge Function dispatcher (Expo Push API)                 |
| Icons            | `lucide-react` (web) + `lucide-react-native` (mobile)                                  |
| Dates            | `date-fns`                                                                             |
| Animation        | Framer Motion (web); Reanimated 3 + Moti (mobile)                                      |
| Unit tests       | Vitest                                                                                 |
| Web E2E          | Playwright (+ `@axe-core/playwright` for a11y)                                         |
| Mobile E2E       | Maestro                                                                                |
| API mocking      | MSW (shared handlers)                                                                  |
| Linting          | ESLint (flat config) + `eslint-plugin-jsx-a11y`                                        |
| Formatting       | Prettier                                                                               |
| Git hooks        | Husky + lint-staged + commitlint (Conventional Commits)                                |
| CI               | GitHub Actions (Linux runners primarily; macOS gated behind label)                     |
| Web deploy       | Vercel (GitHub App, preview-per-PR)                                                    |
| Mobile deploy    | EAS Build + EAS Submit                                                                 |
| Env validation   | `@t3-oss/env-nextjs` (web) + custom Zod loader (mobile)                                |
| Node version     | Pinned via `.nvmrc`                                                                    |
| Package manager  | pnpm, pinned via `packageManager` field                                                |

---

## 3. Repository layout

```
claude-code-boilerplate/
├── apps/
│   ├── web/                      # Next.js 15 App Router + shadcn + Tailwind
│   └── mobile/                   # Expo + Expo Router + NativeWind
├── packages/
│   ├── ui-web/                   # shadcn components (copied in)
│   ├── ui-native/                # React Native Reusables components
│   ├── tailwind-config/          # shared theme tokens + Tailwind preset
│   ├── database-types/           # `supabase gen types` output
│   ├── api-client/               # typed Supabase client + React Query hooks + MSW handlers
│   ├── validation/               # Zod schemas
│   ├── i18n/                     # locale JSON (en, es) + formatters
│   ├── analytics/                # PostHog + GA wrapper (consent-ready API)
│   ├── config-eslint/            # shared ESLint config
│   └── config-typescript/        # shared tsconfig bases
├── supabase/
│   ├── migrations/               # *.sql migrations (schema + RLS)
│   ├── seed.sql                  # demo seed data
│   ├── functions/
│   │   └── send-push/            # Edge Function dispatcher
│   └── config.toml
├── docs/
│   ├── architecture.md
│   ├── setup.md
│   ├── auth.md
│   ├── push.md
│   ├── i18n.md
│   ├── testing.md
│   ├── deploy.md
│   ├── env-vars.md
│   ├── ci-secrets.md
│   ├── a11y.md
│   ├── bootstrap.md
│   └── adr/                      # architecture decision records
├── scripts/
│   └── init.ts                   # interactive bootstrap
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── mobile-e2e.yml
│       └── release.yml
├── .husky/
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .nvmrc
├── README.md
└── CLAUDE.md                     # guidance for Claude Code in downstream apps
```

### 3.1 Dependency rules (enforced by ESLint)

- `apps/*` may depend on any `packages/*`.
- `packages/ui-*` may depend on `tailwind-config`, `i18n`.
- `packages/api-client` depends on `database-types`, `validation`.
- No `packages/*` may depend on `apps/*`.
- `ui-web` and `ui-native` are siblings; neither imports the other.

---

## 4. Architecture

### 4.1 Auth

**Web.** `@supabase/ssr` manages the session cookie. Next middleware protects `/dashboard`, `/profile`, `/settings`. Google SSO via `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, flowType: 'pkce' } })`.

**Mobile.** Native Google Sign-In via `@react-native-google-signin/google-signin` obtains an ID token; that token is exchanged with Supabase via `supabase.auth.signInWithIdToken({ provider: 'google', token })`. Email/password via `signInWithPassword`. Session persisted through a Supabase-compatible storage adapter backed by `expo-secure-store`. Deep link scheme configured in `app.config.ts`.

**Shared.** A `useSession()` hook in `packages/api-client` is the single source of truth for the current user. Auth-related strings live in `packages/i18n/locales/*/auth.json`.

**External setup required (documented in `docs/auth.md`):**

- Google Cloud Console: OAuth client IDs for Web, iOS, Android.
- Supabase Dashboard: Google provider enabled with the Web client ID + secret; authorized redirect URIs.

### 4.2 Data layer

- All reads/writes are typed hooks exported from `packages/api-client`. Hooks wrap TanStack Query. Invalidation keys are exported and reused.
- Zod schemas in `packages/validation` are the single source of truth per entity. Reused in:
  - Edge Functions (server-side parsing of request bodies).
  - React Hook Form (client validation).
  - Unit tests (fixture generation + assertion).
- Generated Supabase types go to `packages/database-types/src/index.ts`, committed to git. CI fails if a drift is detected via a `db:types:check` script.
- All tables have RLS enabled. The demo `items` table has policies `user_id = auth.uid()` for all operations. RLS policies live in migrations.

### 4.3 Push notifications

- On first sign-in on mobile, the app requests notification permission, obtains an Expo Push Token via `expo-notifications`, and upserts a row into `push_tokens (user_id, device_id, expo_token, platform, created_at)`.
- Supabase Edge Function `send-push` accepts `{ user_id, title, body, data }`, looks up all tokens for the user, batches to the Expo Push API, and records delivery results in `push_logs`.
- Authenticated via Supabase service role key + an additional shared-secret header.
- A commented DB-trigger example in migrations demonstrates auto-push on row insert (for copy/paste use in downstream apps).

### 4.4 Internationalization (i18n)

- Strings authored as JSON under `packages/i18n/locales/{en,es}/{common,auth,errors,...}.json`.
- **Web.** `next-intl` middleware auto-detects from `Accept-Language` → redirects to `/en/*` or `/es/*`. A locale cookie persists the user's explicit choice.
- **Mobile.** `i18next` + `react-i18next` with an `expo-localization`-sourced default; persisted in `expo-secure-store`.
- Both platforms consume the same JSON. A lint rule fails the build on missing keys in any locale.
- ICU message format for pluralization and number/date formatting.

### 4.5 Analytics

- `packages/analytics` exports `track(event, props)`, `identify(userId, traits)`, `page(name)` — same API on web and mobile.
- Initialized with PostHog + GA4 keys read from validated env. If keys are absent, the package becomes a no-op (safe for local dev).
- `identify` is called from the shared auth hook on sign-in with the Supabase user id.
- Standard events (`sign_up`, `sign_in`, `sign_out`, `push_registered`, `locale_changed`, `theme_changed`) are emitted by shared hooks so both apps auto-report.
- A `ConsentProvider` stub with an `enabled: true` default wraps call sites so a GDPR consent flow can be added later by flipping the default to `false` and hooking UI — without touching call sites.

### 4.6 Theming

- Design tokens in `packages/tailwind-config` (colors, spacing, typography, radii). Re-exported as a Tailwind preset.
- `apps/web` and `apps/mobile` both extend that preset (`apps/mobile` via NativeWind).
- Three modes: light, dark, system. Persisted in `localStorage` (web) / `expo-secure-store` (mobile). A `<ThemeProvider>` is present on each app.

### 4.7 SEO + LLM discoverability

- **Next.js Metadata API** used per-route with locale-aware `alternates`.
- `app/sitemap.ts` and `app/robots.ts` are dynamic and aware of i18n routes.
- `app/opengraph-image.tsx` generates OG images via `@vercel/og`.
- `public/llms.txt` + `public/llms-full.txt` are generated at build-time from article front-matter metadata in `apps/web/content/articles/` to support LLM crawlers.
- JSON-LD helpers in `apps/web/src/lib/jsonld.ts`: `organizationSchema`, `websiteSchema`, `articleSchema`, `faqSchema`, `productSchema`.
- An `/articles/[slug]` route backed by MDX files in `apps/web/content/articles/` demonstrates canonical URLs, per-article metadata, `articleSchema` JSON-LD, and content that `llms.txt` can point at. Two seed articles ship (en + es).
- RSS feed at `app/rss.xml/route.ts` aggregates published articles.

### 4.8 Error handling

- Supabase errors surface as typed discriminated results in hooks. UI shows toasts via `useToast()` (shadcn/sonner on web; custom on mobile).
- Errors thrown inside React Query mutations are mapped to i18n keys — no raw backend strings surface in UI.
- Top-level `error.tsx` (Next) and `<ErrorBoundary>` (RN) render a generic fallback with a "report" link (href configurable via env).
- No error-tracking SDK preinstalled. `docs/error-tracking.md` explains how to add Sentry or similar.

---

## 5. Demo surface (what ships)

All demo surface exists to prove features work and serve as reference for new apps.

### 5.1 Web (`apps/web`)

- Landing page (`/`) — marketing layout, SEO metadata, OG image, JSON-LD (`organizationSchema` + `websiteSchema`), i18n switcher, theme toggle. Responsive at 375 / 768 / 1280.
- Articles index (`/articles`) and detail (`/articles/[slug]`) — MDX-backed, per-article `articleSchema` JSON-LD, canonical URLs, fed into sitemap and RSS. Two seed articles (en + es) demonstrate the full SEO/LLM content pipeline.
- Auth pages: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`. Email/password + Google button.
- `/dashboard` — protected, reads user-scoped `items` from Supabase.
- `/profile` — edit display name + avatar (Supabase Storage upload).
- `/settings` — locale switch, theme toggle.
- `/404` + error boundary.

### 5.2 Mobile (`apps/mobile`)

- Tabs: Home, Profile, Settings.
- Auth stack: Sign in / Sign up / Forgot / Reset — email/password + Google SSO.
- Home: protected list of items (CRUD).
- Profile: display name + avatar upload.
- Settings: locale, theme, notifications permission toggle, "send me a test push" button.

### 5.3 Shared / backend

- Theme: light + dark + system, persisted.
- One demo `items` table with user-scoped RLS.
- `push_tokens`, `push_logs`, `profiles` tables.
- Edge Function `send-push`.

---

## 6. Testing strategy

### 6.1 Unit tests (Vitest)

- Collocated `*.test.ts(x)` files next to source.
- Targets: Zod schemas, api-client hooks, pure utils, RN components (`@testing-library/react-native`), React components (`@testing-library/react`).
- MSW handlers live in `packages/api-client/src/msw/`. Each app's `setupTests.ts` starts the MSW server.
- Coverage thresholds enforced ≥ 80% on `validation`, `api-client`, `i18n`. Apps tested through E2E.

### 6.2 Web E2E (Playwright)

- `apps/web/e2e/`: `auth.spec.ts`, `dashboard.spec.ts`, `i18n.spec.ts`, `a11y.spec.ts` (`@axe-core/playwright`).
- Two config modes: (a) MSW in-browser for network-isolated runs, (b) real local Supabase for integration confidence.
- Viewports: 375, 768, 1280.
- CI runs against Vercel preview URL; local runs against `next dev`.

### 6.3 Mobile E2E (Maestro)

- `apps/mobile/maestro/`: `auth.yaml`, `push.yaml`, `i18n.yaml`.
- Triggered only by PR label `mobile-e2e` to stay within CI budget.
- Runs against an EAS `preview` build on iOS simulator + Android emulator.

### 6.4 TDD workflow

- Documented in `docs/testing.md`: Red → Green → Refactor is the default.
- PR template checkbox: "new behavior is covered by a failing-then-green test".

### 6.5 What is NOT tested in v1

- Visual regression (Chromatic/Percy).
- Load / performance tests.

---

## 7. CI and deploy

### 7.1 GitHub Actions workflows

| Workflow         | Trigger                    | Jobs                                                                           | Runner                                      | Expected time |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- | ------------- |
| `ci.yml`         | PR opened/updated          | lint, typecheck, unit, web-build, web-e2e (against Vercel preview URL)         | ubuntu-latest                               | 6–10 min      |
| (Vercel preview) | PR opened                  | Vercel preview deploy via GitHub App                                           | — (no Actions minutes)                      | —             |
| `mobile-e2e.yml` | PR with label `mobile-e2e` | EAS preview build fetch + Maestro iOS + Maestro Android                        | macos-latest (iOS), ubuntu-latest (Android) | 20–30 min     |
| `release.yml`    | Tag `v*` on `main`         | Vercel prod promote + `eas submit` iOS/Android + GitHub release with changelog | ubuntu-latest                               | 10–15 min     |

- Turbo cache via `actions/cache` keyed on `pnpm-lock.yaml` + code hash.
- `pnpm install --frozen-lockfile`.
- Node version from `.nvmrc`.
- Secrets documented in `docs/ci-secrets.md`.
- `docs/ci-budget.md` estimates monthly minute usage so developers can track approaching the Free-tier limit.

### 7.2 Deploy

- **Web.** Vercel GitHub App auto-links the repo on first push. Preview per PR. Prod on push to `main` or on tag (configurable in `vercel.json`). Env vars set per environment in the Vercel dashboard.
- **Mobile.** `eas.json` profiles: `development`, `preview`, `production`. `eas submit` wired for iOS App Store and Google Play (stubbed credentials filled in during `init`).
- **Supabase.** Migrations applied via `supabase db push` in `release.yml` against a linked remote project.

### 7.3 Environment variables

- `@t3-oss/env-nextjs` validates `process.env` at web build-time with Zod, splitting `server` vs `client` (only `NEXT_PUBLIC_*` in client).
- Mobile `env.ts` reads from `expo-constants.expoConfig.extra`, populated in `app.config.ts` from `EXPO_PUBLIC_*` + standard envs at build time.
- Each app has `.env.example` enumerating every variable with a comment.
- Secrets live in: Vercel (web runtime), EAS (mobile build), GitHub Actions (CI), Supabase Dashboard (functions).
- `.env` globally gitignored; pre-commit hook blocks accidental commits.
- `docs/env-vars.md` has a table: variable → where set → which platforms consume it.

---

## 8. Bootstrap (`pnpm run init`)

Interactive script at `scripts/init.ts` (run via `tsx`). Uses `prompts` + `globby` + `execa`.

### 8.1 Prompts (in order)

1. App name (kebab-case; used in `package.json`).
2. Display name (human-readable).
3. iOS bundle ID (e.g., `com.yourco.yourapp`).
4. Android package name.
5. Deep link URL scheme.
6. Supabase: local or remote. If remote, prompts for project URL + anon key.
7. PostHog project key (optional).
8. GA4 measurement ID (optional).
9. Google OAuth client IDs (web, iOS, Android — optional).
10. Primary domain (for SEO/sitemap).

### 8.2 Actions

- String-replaces placeholders across `app.config.ts`, all `package.json`, `.env.example` files, `app/layout.tsx` metadata, `manifest.json`, workflow names.
- Generates `.env.local` files for web and mobile.
- Runs `pnpm install` to refresh lockfile.
- Runs `supabase init` if local chosen; `supabase link` if remote.
- Writes `BOOTSTRAP.md` with a checklist of manual follow-ups (EAS login, Vercel link, Google Cloud Console setup, Apple Developer / Google Play setup, store listing content).
- Commits result as `chore: bootstrap <app name>`.

### 8.3 Template repo mechanics

- Repo marked as a GitHub template.
- `.github/TEMPLATE_README.md` becomes the new repo's README after template cloning; the original README moves under `docs/`.
- Post-clone note tells the user to run `pnpm install && pnpm run init`.

---

## 9. Phased implementation plan

Each phase ends with a concrete "Done when" verification gate. The `writing-plans` skill will break each phase into step-level tasks. Phases are implemented sequentially without manual sign-off between them (per design-time decision); commits land at each gate.

### Phase 1 — Monorepo foundation

**Scope.** pnpm workspaces, Turborepo, shared `config-eslint` + `config-typescript`, Prettier, Husky + lint-staged + commitlint, `.nvmrc`, root scripts.

**Done when.** `pnpm install && pnpm lint && pnpm typecheck` all pass on an empty tree. A dummy commit via Husky blocks non-Conventional messages.

### Phase 2 — Supabase local + schema + types

**Scope.** `supabase init`, initial migration creating `profiles`, `items`, `push_tokens`, `push_logs`, with RLS policies and `updated_at` triggers. Seed data. `db:types` script. `packages/database-types` populated.

**Done when.** `supabase start && pnpm db:types` succeeds; generated types compile; `supabase db reset` recreates seed state; a unit test asserting RLS (via anon key) passes; `db:types:check` drift detection works.

### Phase 3 — Shared packages scaffolding

**Scope.** `packages/validation` (Zod schemas for profiles, items, auth), `packages/api-client` (Supabase client factory + first hooks + MSW handlers), `packages/i18n` (en/es JSON + formatters), `packages/analytics` (no-op-safe init), `packages/tailwind-config`.

**Done when.** Each package has at least one passing unit test; `pnpm test` runs them all via Vitest with MSW.

### Phase 4 — Web app baseline

**Scope.** `apps/web` Next.js 15 App Router; Tailwind + shadcn init; next-intl middleware with en/es + `Accept-Language` auto-detect; theme provider (light/dark/system); responsive layout shell (navbar + footer); landing page with SEO metadata + OG image + sitemap + robots + `llms.txt` + `llms-full.txt`; JSON-LD helpers in `src/lib/jsonld.ts`; `/articles` index + `/articles/[slug]` MDX pipeline with two seed articles (en + es); RSS feed at `app/rss.xml/route.ts`.

**Done when.** `pnpm dev` serves `/en` and `/es`; locale cookie persists; Lighthouse Perf/SEO/A11y ≥ 90 locally; `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/llms.txt`, `/llms-full.txt` all return valid content; seed articles render with correct `articleSchema` JSON-LD; Playwright smoke test loads landing + one article in both locales at 375/768/1280.

### Phase 5 — Mobile app baseline

**Scope.** `apps/mobile` Expo + Expo Router; NativeWind sharing `tailwind-config`; `i18next` + `expo-localization`; theme provider; tabs layout with Home/Profile/Settings placeholder screens.

**Done when.** App launches on iOS simulator + Android emulator via `expo start`; switching device language flips UI; light/dark follows system.

### Phase 6 — Auth end-to-end

**Scope.** Web: sign-in / sign-up / forgot / reset pages with email+password + Google OAuth, middleware protection, `useSession` hook. Mobile: same routes via Expo Router + native Google Sign-In + `signInWithIdToken`; session persistence via secure store.

**Done when.** Playwright `auth.spec.ts` covers all four flows (Google provider boundary mocked via MSW). Maestro `auth.yaml` runs the email flow on both platforms in a local build.

### Phase 7 — Demo CRUD surface + profile/settings

**Scope.** Web `/dashboard` + `/profile` (avatar upload to Supabase Storage) + `/settings` (locale + theme). Mobile protected tabs with items list + detail + create/edit, profile, settings. React Query hooks in `api-client` with optimistic mutation updates.

**Done when.** A user can create/read/update/delete items on both platforms; RLS prevents cross-user access (test proves it); profile and settings changes persist.

### Phase 8 — Push notifications

**Scope.** `expo-notifications` registration on mobile sign-in; `push_tokens` upsert; Edge Function `send-push` dispatching to Expo Push API; "send me a test push" button on mobile Settings.

**Done when.** Tapping the test button delivers a notification on iOS + Android within 5 s. A Vitest covers the Edge Function contract. Maestro `push.yaml` taps the button and asserts the server call succeeded.

### Phase 9 — Analytics + accessibility hardening

**Scope.** PostHog + GA4 initialized in `packages/analytics`; standard events emitted from shared hooks; `identify` on auth change. axe-core Playwright run on landing + auth + dashboard; mobile a11y label audit; `eslint-plugin-jsx-a11y` errors (not warnings) on critical rules.

**Done when.** PostHog receives a `sign_in` event on a real signup run (verified in dashboard). axe-core reports 0 serious/critical issues on demo pages. a11y checklist committed in `docs/a11y.md`.

### Phase 10 — Testing and CI

**Scope.** Full Vitest suite; Playwright suite running in CI against Vercel preview URL; Maestro workflow behind `mobile-e2e` label; Turbo cache in CI; Node pinned; workflows fit GitHub Free tier.

**Done when.** A trivial PR runs green in < 10 min on Linux; `mobile-e2e` label triggers and completes < 30 min; adding a failing test in any app fails CI.

### Phase 11 — Deploy and release automation

**Scope.** Vercel project linked; EAS profiles wired; `release.yml` runs on `v*` tag — Vercel prod promote + EAS submit + GitHub release with changelog. `vercel.json` + `eas.json` + `app.config.ts` env mapping fully documented.

**Done when.** Tag `v0.0.1` on `main` produces a Vercel prod deploy and two EAS store submissions (dry-run OK if no real store credentials yet).

### Phase 12 — Init script, docs, template polish

**Scope.** `scripts/init.ts` interactive bootstrap + placeholder replacement + lockfile refresh + first commit. `docs/` complete: architecture, setup, auth, push, i18n, testing, deploy, env-vars, ci-secrets, a11y, bootstrap, ADRs. Repo marked as GitHub template. `CLAUDE.md` written for future Claude Code sessions in downstream apps.

**Done when.** Cloning the template into a fresh directory and running `pnpm install && pnpm run init` — followed by `pnpm test`, `pnpm test:e2e`, and `pnpm dev` — all succeed following only the docs, in < 30 minutes of human time.

---

## 10. Constraints and assumptions

- **CI budget.** All workflows must fit GitHub Actions Free tier (~2,000 private-repo minutes/month). macOS runners (10× cost) only used for iOS Maestro runs, gated behind a label.
- **Consent.** No GDPR banner in v1. The analytics package API is structured so consent can be added without rewriting call sites; projects targeting EU users must add a banner before launch.
- **Error tracking.** Not preinstalled; `docs/error-tracking.md` explains how to add Sentry.
- **No state manager** beyond TanStack Query + React Context. If future apps need global UI state, adding Zustand or Jotai is a per-app decision.
- **Node version** is pinned to a single active LTS via `.nvmrc` + `package.json` `engines.node`; all tooling targets that version.
- **External account setup is manual.** Google Cloud Console, Apple Developer, Google Play Console, EAS account, Supabase project, Vercel account, PostHog — all are prerequisites documented in `BOOTSTRAP.md`.

---

## 11. Out of scope / deferred

- Web push notifications (VAPID / Service Worker).
- PWA / offline mode.
- GDPR consent banner.
- Sentry (or any error tracking).
- Payments (Stripe / RevenueCat).
- Feature flags (LaunchDarkly / PostHog flags integration).
- Visual regression testing.
- Load / performance testing.
- A built documentation website.
- CMS integration.
- Multi-tenant / org-level auth.
- Apple Sign In (easy follow-up to the existing SSO infrastructure).

---

## 12. Open questions and decisions to revisit

- **Storage quotas.** Avatar upload size/type limits — defined in migration policies. Revisit if apps need larger media.
- **Edge Function auth.** Shared-secret header is v1 protection for `send-push`. Revisit if we add more functions with different auth needs.
- **RSC vs client components.** Landing + marketing as RSC; auth-aware pages as client. Documented pattern, revisit if Next's defaults shift.
- **Monorepo boundaries.** If `ui-web` and `ui-native` grow significantly divergent, consider splitting design-token tests into a shared `packages/design-tokens-test` helper.
- **Bootstrap script testing.** `scripts/init.ts` needs its own tests that run the script against a scratch directory. Coverage target TBD after Phase 12.

---

## 13. References

- Expo: https://docs.expo.dev/
- Supabase: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com/
- React Native Reusables: https://rnr-docs.vercel.app/
- NativeWind: https://www.nativewind.dev/
- next-intl: https://next-intl.dev/
- Turborepo: https://turborepo.com/docs
- `@t3-oss/env-nextjs`: https://env.t3.gg/
- Maestro: https://maestro.mobile.dev/
- Expo Push: https://docs.expo.dev/push-notifications/overview/
