# Setup Guide

Step-by-step first-time setup for the `claude-code-boilerplate` monorepo. Follow in order — nothing is auto-magic.

Target audience: a solo dev on a fresh machine who just cloned the repo.

---

## 0. Prerequisites

Install these once, globally:

| Tool           | Version            | Install                                                            |
| -------------- | ------------------ | ------------------------------------------------------------------ |
| Node.js        | `>=22.0.0 <23.0.0` | [nodejs.org](https://nodejs.org) or `nvm install 22`               |
| pnpm           | `>=9.0.0`          | `npm i -g pnpm@9`                                                  |
| Git            | any recent         | [git-scm.com](https://git-scm.com)                                 |
| Supabase CLI   | `>=1.200`          | `npm i -g supabase` or `brew install supabase/tap/supabase`        |
| Docker Desktop | any                | [docker.com](https://www.docker.com) — required for local Supabase |
| Expo CLI       | via `npx`          | comes via `npx expo …`, no global install needed                   |
| EAS CLI        | latest             | `npm i -g eas-cli` (only if you'll deploy mobile)                  |

Verify:

```bash
node -v        # v22.x.x
pnpm -v        # 9.x.x
supabase -v    # 1.x.x
docker info    # must succeed
```

---

## 1. Clone + install

```bash
git clone git@github.com:<your-org>/<your-repo>.git
cd <your-repo>
pnpm install
```

Husky hooks install automatically via the `prepare` script.

---

## 2. Environment files

Copy every `.env.example` to `.env.local`. Each of these is git-ignored.

```bash
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
```

You now have three env files. Fill them as you enable each integration (below). Required vs optional is documented inline in each `.env.example`.

---

## 3. Local Supabase (required)

```bash
pnpm dlx supabase start
```

First run pulls Docker images (~2 min). When it finishes, note the output:

- **API URL** → `NEXT_PUBLIC_SUPABASE_URL` in `apps/web/.env.local` and `apps/mobile/.env.local`
- **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (server-only, web app only — never ship to mobile)

Apply migrations + seed:

```bash
pnpm dlx supabase db reset
```

This runs every file in `supabase/migrations/` in order, then `scripts/seed.mjs` via `pnpm db:seed` (safe to re-run).

Studio (local admin UI): open the **Studio URL** printed by `supabase start` (usually http://127.0.0.1:54323).

---

## 4. First dev boot

```bash
pnpm dev
```

Turbo launches `next dev` (web) and `expo start` (mobile) in parallel.

- Web: http://localhost:3000 (defaults to `/en`)
- Mobile: scan the QR in Expo Go, or press `i` / `a` for simulator

If the web app redirects to `/maintenance`, unset `NEXT_PUBLIC_MAINTENANCE_MODE` (or set it to `false`).

---

## 5. Sign up a first user

1. Go to http://localhost:3000/en/sign-up.
2. Create an account with any email/password.
3. Local Supabase prints emails to the **Inbucket URL** from `supabase start` (usually http://127.0.0.1:54324). Click the confirmation link there.
4. Sign in.

The signup trigger in `20260418000000_initial_schema.sql` automatically creates a `profiles` row.

---

## 6. Optional integrations

Each integration is **off by default**. The app runs fine without any of them. Enable only what your side project needs.

### 6a. Stripe (billing)

Enables the `/billing` page + checkout + customer portal.

1. Create a Stripe account → https://dashboard.stripe.com
2. Create a Product + recurring Price. Copy the Price ID.
3. Dashboard → Developers → API keys → copy the secret key.
4. Dashboard → Developers → Webhooks → add endpoint `http://localhost:3000/api/stripe/webhook` (for local: use `stripe listen --forward-to localhost:3000/api/stripe/webhook` and copy the whsec).
5. Fill `apps/web/.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PRICE_ID=price_...
   ```
6. Restart `pnpm dev`. The `/billing` link appears once all three vars are set.

### 6b. Resend (transactional email)

Replaces local Inbucket emails with real outbound delivery.

1. Sign up at https://resend.com, verify a sending domain.
2. Create an API key.
3. Fill:
   ```
   RESEND_API_KEY=re_...
   EMAIL_FROM=no-reply@yourdomain.com
   ```
4. Restart. Templates live in `apps/web/src/lib/emails/`.

### 6c. Sentry (error tracking)

1. Create a project at https://sentry.io.
2. Copy DSN.
3. Fill:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
   NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
   ```
4. (Prod only) For source map uploads at build time, also set `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`.

Mobile: set the same DSN in `apps/mobile/.env.local` as `EXPO_PUBLIC_SENTRY_DSN`.

### 6d. PostHog (product analytics)

```
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

Mobile: `EXPO_PUBLIC_POSTHOG_KEY` / `EXPO_PUBLIC_POSTHOG_HOST`.

### 6e. Upstash Redis (rate limiting)

Used to rate-limit `/auth/*` endpoints. Without it, rate limiting is a no-op.

1. Create a Redis DB at https://console.upstash.com.
2. Copy REST URL + REST token.
3. Fill:
   ```
   UPSTASH_REDIS_REST_URL=https://....upstash.io
   UPSTASH_REDIS_REST_TOKEN=...
   ```

### 6f. Cron jobs

Any route under `apps/web/src/app/api/cron/*` is gated by a shared secret.

```
CRON_SECRET=<generate: openssl rand -hex 32>
```

On Vercel: add the same value as an env var, then schedule via `vercel.json` `crons` field. Vercel sends the secret as a bearer token automatically.

### 6g. OAuth providers (Google, GitHub, …)

Configure in **Supabase Studio → Authentication → Providers**. No env vars needed in the app — Supabase handles the callback. Just ensure `NEXT_PUBLIC_SITE_URL` matches your local/prod origin.

### 6h. Feature flags

Simple JSON map — no third-party service needed:

```
NEXT_PUBLIC_FEATURE_FLAGS={"newCheckout":true,"betaUI":false}
```

Read with `isEnabled("newCheckout")` from `apps/web/src/lib/flags.ts`.

### 6i. Mobile push notifications

Requires EAS. See [DEPLOY.md §Mobile](./DEPLOY.md#mobile--eas-build--expo).

---

## 7. Link to a hosted Supabase project (when you're ready to deploy)

```bash
supabase login
supabase link --project-ref <your-project-ref>
pnpm db:push                # push local migrations to hosted DB
pnpm db:types               # regenerate types/ from remote schema
pnpm db:types:check         # guard: types must match migrations
```

Copy hosted project's URL + anon key + service_role key into your prod env (Vercel dashboard + EAS secrets).

---

## 8. Running the gate locally

The same gate CI runs:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && SKIP_ENV_VALIDATION=true pnpm build
```

If all five pass, you're green. Use `SKIP_ENV_VALIDATION=true` for builds when optional integrations aren't configured — env validation is strict by design.

---

## 9. Doctor

```bash
pnpm doctor
```

Prints a report of which env vars are set, which integrations are active, and which tools are installed. Good first command when something's weird.

---

## 10. Troubleshooting

| Symptom                                    | Likely cause                        | Fix                                                  |
| ------------------------------------------ | ----------------------------------- | ---------------------------------------------------- |
| `supabase start` hangs                     | Docker not running                  | Start Docker Desktop                                 |
| `pnpm build` fails on env validation       | Optional var missing                | `SKIP_ENV_VALIDATION=true pnpm build` OR set the var |
| `pnpm db:types:check` fails                | Remote schema drifted               | `pnpm db:push` then `pnpm db:types`                  |
| Web app always redirects to `/maintenance` | `NEXT_PUBLIC_MAINTENANCE_MODE=true` | Unset it                                             |
| `/billing` route 404s                      | Stripe vars incomplete              | All 3 Stripe vars must be set                        |
| Emails not arriving locally                | Using local Supabase                | Check Inbucket at http://127.0.0.1:54324             |
| Husky hooks not running                    | Fresh clone, `prepare` didn't run   | `pnpm install` (or `pnpm prepare`)                   |
| `eas build` fails: no project              | `eas init` not run                  | Run `eas init` inside `apps/mobile`                  |

---

Next: **[DEPLOY.md](./DEPLOY.md)** for shipping to prod.
