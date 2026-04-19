# Deployment

This monorepo ships three deployable surfaces: the Next.js web app (Vercel),
the Expo mobile app (EAS Build / Submit), and Supabase (database migrations +
edge functions). Each is opt-in — local development works with zero external
accounts.

## Supabase (database + auth + storage + edge functions)

```bash
# Link the local project to a hosted Supabase project (one-time)
pnpm dlx supabase login
pnpm dlx supabase link --project-ref "$SUPABASE_PROJECT_REF"

# Push migrations (creates profiles, items, push_tokens, push_logs, avatars bucket)
pnpm dlx supabase db push

# Deploy edge functions
pnpm dlx supabase functions deploy send-push --no-verify-jwt

# Regenerate the typed Database from the live schema
pnpm db:types
```

Required secrets in Supabase → Project Settings → Edge Functions:

- `SUPABASE_URL` (auto-populated)
- `SERVICE_ROLE_KEY` (auto-populated)

## Web — Vercel

`apps/web/vercel.json` configures the install/build commands to respect pnpm
workspaces. Import the repo in Vercel, set the **Root Directory** to `apps/web`,
and Vercel will pick up the config automatically.

**Required environment variables** (see `.env.example`):

| Name                                                  | Scope                | Required             |
| ----------------------------------------------------- | -------------------- | -------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                            | Production + Preview | ✅                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                       | Production + Preview | ✅                   |
| `NEXT_PUBLIC_SITE_URL`                                | Production           | ✅                   |
| `SUPABASE_SERVICE_ROLE_KEY`                           | Production           | opt-in (push)        |
| `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST`                   | Production           | opt-in               |
| `NEXT_PUBLIC_SENTRY_DSN`                              | Production           | opt-in               |
| `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` | Build only           | opt-in (source maps) |

Security headers (HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy,
X-Content-Type-Options) are applied via `vercel.json` → `headers`.

## Mobile — Expo Application Services (EAS)

```bash
# One-time setup
pnpm dlx eas-cli login
pnpm dlx eas-cli init            # creates the EAS project + wires app.config.ts
pnpm dlx eas-cli build:configure # optional — eas.json already committed

# Push secrets (per-profile env vars are referenced with "$NAME" in eas.json)
pnpm dlx eas-cli secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "$EXPO_PUBLIC_SUPABASE_URL"
pnpm dlx eas-cli secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "$EXPO_PUBLIC_SUPABASE_ANON_KEY"
# …repeat for POSTHOG / SENTRY keys as needed

# Build
pnpm dlx eas-cli build --profile development --platform ios     # dev client
pnpm dlx eas-cli build --profile preview --platform all         # internal TF / Firebase
pnpm dlx eas-cli build --profile production --platform all      # store-ready
```

Before a production submit, replace the placeholders in `apps/mobile/eas.json`:

- `submit.production.ios.ascAppId` — App Store Connect app ID
- `submit.production.ios.appleTeamId` — Apple developer team ID
- `submit.production.android.serviceAccountKeyPath` — path to Play Console
  service account JSON (do **not** commit the file; upload as an EAS secret file
  instead).

## CI

`.github/workflows/ci.yml` runs the gate (`format:check`, `lint`, `typecheck`,
`test`, `build`) + Playwright e2e on every PR. Deployment steps are intentionally
out-of-scope for CI — Vercel and EAS have their own webhook / cron triggers.
