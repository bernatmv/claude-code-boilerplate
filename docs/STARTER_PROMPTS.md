# Starter Prompts

Ready-to-paste prompts to kickstart a **new side project** on top of this boilerplate. Use with Claude Code (or any capable coding agent).

The intended flow is:

1. **Brainstorm** the idea → a design spec (markdown doc).
2. **Plan** the spec → a step-by-step implementation plan.
3. **Build** the plan → working code, phase by phase, commits per phase.

Each prompt below is self-contained. Fill the `<<< … >>>` placeholders before pasting.

---

## 1. Bootstrap a fresh repo from the boilerplate

Use this once, right after cloning the boilerplate into a new repo directory.

> I just cloned the `claude-code-boilerplate` into a new repo for a side project called **<<< APP NAME >>>**. Before I describe the app, please:
>
> 1. Read `README.md`, `docs/SETUP.md`, and `docs/HANDOFF.md` so you understand the conventions.
> 2. Run `pnpm doctor` and tell me what's missing.
> 3. Rename all references to `claude-code-boilerplate` to `<<< app-slug >>>` (package.json name, README title, any docs that reference the boilerplate name).
> 4. Update the web app's `NEXT_PUBLIC_SITE_URL` default, `site.ts` site name, `llms.txt` description, and the favicon/OG image placeholders so they reflect the new app name.
> 5. Delete `docs/superpowers/plans/*` (those are the boilerplate's phase plans; we'll write our own).
> 6. Commit: `chore: rebrand from boilerplate to <<< app-slug >>>`.
>
> Then stop and wait for me to describe the app.

---

## 2. Brainstorm the app into a design

Once rebranded, describe the app and ask for a design spec.

> I want to build **<<< APP NAME >>>**. Here's the pitch:
>
> <<< 2–4 sentences: what it does, who it's for, why it matters >>>
>
> Core features (MVP):
>
> - <<< feature 1 >>>
> - <<< feature 2 >>>
> - <<< feature 3 >>>
>
> Non-goals for the MVP:
>
> - <<< thing we're explicitly not building yet >>>
>
> Please use the `superpowers:brainstorming` skill to turn this into a full design spec. Work with me interactively — ask clarifying questions one at a time, propose 2–3 architectural approaches with tradeoffs, and only start writing once I've approved the shape.
>
> Context on the boilerplate you're building on:
>
> - Next.js 15 App Router with `[locale]` routing, Supabase SSR, TanStack Query, Tailwind, shadcn-style UI.
> - Expo mobile app already wired to the same Supabase backend.
> - Reusable helpers under `apps/web/src/lib/` (see `docs/HANDOFF.md` for the index — prefer composing existing helpers over adding new ones).
> - Every optional integration (Stripe, Resend, Sentry, PostHog, Upstash) no-ops when env vars are absent — keep that pattern.
> - Lean philosophy: if a solo dev shipping a weekend side project wouldn't reach for it, we don't add it.
>
> Save the final spec to `docs/specs/<<< yyyy-mm-dd >>>-<<< app-slug >>>-design.md` and commit.

---

## 3. Design → implementation plan

Once the design is written and you've read it:

> The design is approved. Please use the `superpowers:writing-plans` skill to produce a phase-by-phase implementation plan for `<<< path to design spec >>>`.
>
> Constraints:
>
> - One plan phase = one tagged commit on `main` (protocol: worktree → gate → Conventional Commit → tag `phase-N-complete` → `merge --no-ff` to main → push + tags → cleanup worktree).
> - Each phase must leave the repo in a working, shippable state (gate passes).
> - TDD: every phase includes tests first where it makes sense.
> - DRY + YAGNI: prefer composing existing helpers over new abstractions.
> - Keep phases bite-sized (a few hours of work each, not a full day).
>
> Save the plan to `docs/plans/<<< yyyy-mm-dd >>>-<<< app-slug >>>-plan.md` and commit.

---

## 4. Execute the plan (auto mode)

When you're ready to build:

> Execute `docs/plans/<<< plan filename >>>.md` phase by phase using the `superpowers:subagent-driven-development` skill. After each phase: run the gate (`pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && SKIP_ENV_VALIDATION=true pnpm build`), commit with the Conventional Commit style from the plan, tag `phase-N-complete`, merge `--no-ff` to main, push with `--tags`, and clean up the worktree. Then start the next phase.
>
> If gate fails, fix before moving on. If a phase reveals the plan is wrong, pause and tell me so we can update the plan together.
>
> Continue until all phases are complete.

---

## 5. Add a single feature to an existing project

When the MVP is shipped and you want to add one thing:

> I want to add a new feature to <<< APP NAME >>>: **<<< feature name >>>**.
>
> What it does: <<< 1–2 sentences >>>
>
> Please:
>
> 1. Read `docs/HANDOFF.md` to refresh on conventions.
> 2. Scan `apps/web/src/lib/` — is there an existing helper I should compose? Tell me before adding anything new.
> 3. Create a worktree branch `feat/<<< feature-slug >>>`.
> 4. Write the failing test(s) first.
> 5. Implement. Run the gate. Commit with Conventional Commit style.
> 6. Merge `--no-ff` to main and push.
>
> Keep the change tight — side-project scope. No new packages unless truly needed. No new env vars unless the feature can't work without them (and if so, make it a no-op when absent, following the existing pattern).

---

## 6. Fix a bug

> Bug: <<< short description and reproduction >>>
>
> Please use the `superpowers:debugging` skill if available. First reproduce the bug with a failing test, then fix it, then verify the test passes. Keep the fix narrow — no drive-by refactors unless clearly related. Commit with `fix(<<< scope >>>): <<< summary >>>`.

---

## 7. Ship it

> Time to ship <<< APP NAME >>>. Please walk me through:
>
> 1. Creating the hosted Supabase project (I'll run the commands, you tell me what to paste).
> 2. `supabase link`, `pnpm db:push`, `pnpm db:types:check`.
> 3. Setting up the Vercel project (root dir `apps/web`, env vars from `apps/web/.env.example`).
> 4. First Vercel deploy + DNS pointing.
> 5. If mobile applies: `eas init`, secrets, `eas build --profile preview`, TestFlight/Play internal.
>
> Reference: `docs/DEPLOY.md`. Ask me before running anything that modifies a hosted system — I want to confirm each step.

---

## Tips for prompt reuse

- **Be specific.** The more concrete the pitch, features, and non-goals, the better the design.
- **Declare non-goals loudly.** They prevent scope creep during plan generation.
- **Let the agent ask.** Don't over-describe up front; the brainstorming skill is interactive on purpose.
- **Keep phases small.** If a plan has fewer than 5 phases, it's too coarse. More than 20, too fine.
- **After every merge to main, verify the app still boots** (`pnpm dev` + a manual smoke). The gate catches most things, but UI feel is not in the gate.
