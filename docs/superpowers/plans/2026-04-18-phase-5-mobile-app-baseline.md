# Phase 5 — Mobile App Baseline Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold `apps/mobile` as an Expo (SDK 52) + Expo Router app with NativeWind styling, `@repo/i18n` wired via `i18next` + `expo-localization`, system-aware light/dark theming, and a tabs layout (Home / Profile / Settings) — so later phases can layer auth, push, and demo CRUD on top.

**Architecture:**

- `apps/mobile` is a private `@apps/mobile` workspace package. ESM, TypeScript strict, extends `@repo/config-typescript/base.json`.
- Expo Router file-based routing with tabs group `app/(tabs)/{index,profile,settings}.tsx` + root `app/_layout.tsx` that composes `ThemeProvider` → `I18nProvider` → `Stack`.
- NativeWind v4 with `tailwind.config.js` that extends `@repo/tailwind-config/preset`. Global CSS vars are not available in RN; we map light/dark tokens via `useColorScheme()` hook and `dark:` utilities.
- i18next pulls strings from `@repo/i18n` (`messages.en`, `messages.es`). Device locale detected via `expo-localization`.
- Windows gate: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check`, and `pnpm --filter @apps/mobile exec expo export --platform web` (no simulator required).

**Tech Stack:** Expo SDK 52, Expo Router 4, React Native 0.76, React 18.3, NativeWind ^4.1, Tailwind 3, i18next 24 + react-i18next 15, expo-localization 16, Vitest 2.

---

## File Structure

```
apps/mobile/
├── app.config.ts             # Expo config
├── babel.config.js           # babel-preset-expo + nativewind/babel
├── metro.config.js           # nativewind + monorepo symlinks
├── tailwind.config.js        # extends @repo/tailwind-config/preset
├── global.css                # @tailwind directives (NativeWind 4)
├── nativewind-env.d.ts       # NativeWind types
├── tsconfig.json
├── package.json
├── vitest.config.ts
├── eslint.config.mjs
├── index.ts                  # expo-router/entry
└── src/
    ├── app/                  # Expo Router routes
    │   ├── _layout.tsx       # providers + Stack
    │   ├── +not-found.tsx
    │   └── (tabs)/
    │       ├── _layout.tsx   # Tabs config
    │       ├── index.tsx     # Home
    │       ├── profile.tsx
    │       └── settings.tsx
    ├── components/
    │   ├── theme-provider.tsx
    │   ├── theme-toggle.tsx
    │   ├── locale-switcher.tsx
    │   └── screen.tsx        # SafeAreaView wrapper with bg tokens
    ├── i18n/
    │   └── index.ts          # i18next init (pulls @repo/i18n)
    └── lib/
        ├── cn.ts             # clsx + tailwind-merge
        └── use-theme.ts      # light/dark helper
```

---

## Task 1 — Expo app scaffold

**Files:** Create `apps/mobile/{package.json,tsconfig.json,app.config.ts,babel.config.js,metro.config.js,index.ts,.gitignore}`, `apps/mobile/src/app/{_layout.tsx,(tabs)/_layout.tsx,(tabs)/index.tsx,+not-found.tsx}`.

- [ ] Write `package.json` with deps: `expo ^52`, `expo-router ^4`, `expo-constants`, `expo-linking`, `expo-status-bar`, `expo-system-ui`, `expo-localization ^16`, `react-native ^0.76`, `react 18.3`, `react-native-safe-area-context`, `react-native-screens`, `@react-navigation/native`. DevDeps: `typescript`, `@types/react`, `@repo/config-typescript`, `@repo/config-eslint`, `vitest`. Scripts: `dev`, `build` (= `expo export`), `typecheck`, `lint`, `test`, `ios`, `android`.
- [ ] `tsconfig.json` extends base + `jsx: "react-native"` + path alias `@/*`.
- [ ] `app.config.ts`: name, slug `claude-code-boilerplate`, scheme `boilerplate`, `newArchEnabled: true`, plugins: `expo-router`, `expo-localization`.
- [ ] `babel.config.js` with `babel-preset-expo` + `nativewind/babel`.
- [ ] `metro.config.js` using `expo/metro-config` + `nativewind/metro` + `withMonorepoPaths` that adds the monorepo root to `watchFolders` and `nodeModulesPaths`.
- [ ] `index.ts` = `import "expo-router/entry"`.
- [ ] Placeholder `app/_layout.tsx` with `<Stack />` + `SafeAreaProvider`.
- [ ] Placeholder `(tabs)/_layout.tsx` with `<Tabs />` and two screens.
- [ ] Commit: `feat(mobile): Expo Router app skeleton`.

## Task 2 — NativeWind + Tailwind config

**Files:** `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, update `_layout.tsx` to import global.css.

- [ ] Add deps `nativewind ^4.1`, `tailwindcss 3.4`, `react-native-reanimated ^3.16` to package.json (reanimated is a NativeWind peer).
- [ ] Append reanimated plugin to `babel.config.js` (MUST be last).
- [ ] `tailwind.config.js`: `content: ["./src/**/*.{ts,tsx}"]`, `presets: [require("@repo/tailwind-config/preset")]`.
- [ ] `global.css`: `@tailwind base; @tailwind components; @tailwind utilities;`.
- [ ] `nativewind-env.d.ts`: `/// <reference types="nativewind/types" />`.
- [ ] Import `../global.css` in `src/app/_layout.tsx`.
- [ ] Commit: `feat(mobile): NativeWind styling`.

## Task 3 — Tabs layout (Home / Profile / Settings)

**Files:** `src/app/(tabs)/{_layout,index,profile,settings}.tsx`, `src/components/screen.tsx`, `src/app/+not-found.tsx`.

- [ ] `screen.tsx`: SafeAreaView + View with `flex-1 bg-background dark:bg-background-dark p-4` (Tailwind tokens from preset).
- [ ] `(tabs)/_layout.tsx`: `<Tabs>` with 3 Screens, each with `options.title`.
- [ ] `index.tsx`: Home screen, Text with localized greeting placeholder.
- [ ] `profile.tsx`: placeholder.
- [ ] `settings.tsx`: placeholder with `<ThemeToggle />` and `<LocaleSwitcher />` slots (components stubbed in later tasks).
- [ ] `+not-found.tsx`: fallback screen.
- [ ] Commit: `feat(mobile): tabs layout with home/profile/settings`.

## Task 4 — i18next + expo-localization

**Files:** `src/i18n/index.ts`, `src/components/locale-switcher.tsx`, update `_layout.tsx`.

- [ ] Deps: `i18next ^24`, `react-i18next ^15`.
- [ ] `src/i18n/index.ts`: init i18next with `resources` built from `@repo/i18n` `messages` (namespace per key: common/auth/errors). Detect initial lang from `expo-localization` `getLocales()[0].languageCode`; fallback to `DEFAULT_LOCALE`.
- [ ] Call init at module import time; export `i18n` instance.
- [ ] Wrap app in `<I18nextProvider>` inside `_layout.tsx`.
- [ ] `locale-switcher.tsx`: Pressable row that cycles `en <-> es` via `i18n.changeLanguage`.
- [ ] Update home screen to use `useTranslation()` with key `common.landing.title` (or whatever exists in @repo/i18n). Fall back to a key we know exists by reading `packages/i18n/locales/en/common.json`.
- [ ] Commit: `feat(mobile): i18next wiring with expo-localization`.

## Task 5 — Theme provider

**Files:** `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`, `src/lib/use-theme.ts`, update `_layout.tsx`.

- [ ] NativeWind 4 supports `useColorScheme()` from `nativewind` + `colorScheme.set("system" | "light" | "dark")`. Use that rather than a custom context.
- [ ] `theme-provider.tsx`: thin wrapper that reads `Appearance.getColorScheme()` on mount and calls `colorScheme.set("system")` by default; persists user override in memory (AsyncStorage deferred).
- [ ] `use-theme.ts`: returns `{ theme, setTheme }` bound to NativeWind's API.
- [ ] `theme-toggle.tsx`: Pressable cycling `system → light → dark → system`.
- [ ] Add toggle + switcher into `settings.tsx`.
- [ ] Commit: `feat(mobile): theme provider with system/light/dark`.

## Task 6 — Unit tests + vitest config

**Files:** `vitest.config.ts`, `src/i18n/index.test.ts`, `src/lib/cn.test.ts`.

- [ ] `vitest.config.ts`: exclude `**/node_modules/**`, `**/.expo/**`, `**/dist/**`.
- [ ] `cn.ts`: small `cn(...inputs)` using `clsx` + `tailwind-merge` (add deps).
- [ ] `cn.test.ts`: two cases (merges conflicting utilities, handles falsy).
- [ ] `i18n/index.test.ts`: assert that the exported `i18n` instance resolves `common` + `auth` + `errors` namespaces for en and es.
- [ ] Commit: `test(mobile): cn helper and i18n init tests`.

## Task 7 — Phase 5 gate + tag + merge

- [ ] Update root ESLint ignore to include `**/apps/mobile/.expo/**`, `**/apps/mobile/android/**`, `**/apps/mobile/ios/**` if needed.
- [ ] Update `.prettierignore` for `.expo/`, `android/`, `ios/`.
- [ ] Run `pnpm install`.
- [ ] `pnpm test` → all pass.
- [ ] `pnpm typecheck` → all pass.
- [ ] `pnpm lint` → pass (warnings OK).
- [ ] `pnpm format:check` → pass.
- [ ] `pnpm --filter @apps/mobile exec expo export --platform web` → produces `dist/`.
- [ ] Commit: `chore(mobile): phase 5 gate`.
- [ ] `git tag phase-5-complete`.
- [ ] Merge to main: `chore: merge phase 5 — mobile app baseline (boilerplate)`.
- [ ] Clean up worktree.
