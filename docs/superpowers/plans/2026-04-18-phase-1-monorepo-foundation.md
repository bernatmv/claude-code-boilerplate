# Phase 1: Monorepo Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an empty monorepo with pnpm workspaces, Turborepo, shared TypeScript + ESLint config packages, Prettier, Husky, lint-staged, and commitlint — all verified to work end-to-end.

**Architecture:** A pnpm workspace at the repo root, with `apps/*` and `packages/*` declared (even though those folders are empty in this phase). Turborepo orchestrates scripts across workspaces. Two shared packages (`@repo/config-typescript` and `@repo/config-eslint`) hold the base configs that every future package/app will extend. Husky enforces pre-commit lint-staged formatting and commit-msg Conventional Commits validation.

**Tech Stack:** pnpm 9, Turborepo 2, TypeScript 5, ESLint 9 (flat config), Prettier 3, Husky 9, lint-staged 15, commitlint 19, Node 22 LTS.

**Source spec:** [`docs/superpowers/specs/2026-04-18-monorepo-boilerplate-design.md`](../specs/2026-04-18-monorepo-boilerplate-design.md)

**Phase gate (from spec):** `pnpm install && pnpm lint && pnpm typecheck` all pass on an empty tree; a dummy commit via Husky blocks non-Conventional messages.

**Platform note:** Commands below use bash/POSIX syntax. On Windows, run them in Git Bash (not PowerShell) so Husky hooks work uniformly with Unix-style line endings.

---

## File Structure (end state for this phase)

```
claude-code-boilerplate/
├── .editorconfig                            # editor defaults (LF, 2 spaces, UTF-8)
├── .gitattributes                           # force LF for shell + husky hooks
├── .gitignore                               # node_modules, .env, .turbo, dist, build
├── .husky/
│   ├── pre-commit                           # runs lint-staged
│   └── commit-msg                           # runs commitlint
├── .lintstagedrc.json                       # format + lint staged files
├── .nvmrc                                   # "22"
├── .prettierignore
├── .prettierrc.json                         # Prettier rules
├── commitlint.config.mjs                    # Conventional Commits config (ESM)
├── eslint.config.mjs                        # flat ESLint, extends @repo/config-eslint (ESM)
├── package.json                             # root workspace, devDeps, scripts
├── packages/
│   ├── config-eslint/
│   │   ├── index.js                         # base flat ESLint config
│   │   ├── package.json
│   │   └── README.md
│   └── config-typescript/
│       ├── base.json                        # strict base tsconfig
│       ├── package.json
│       └── README.md
├── pnpm-workspace.yaml
├── tsconfig.json                            # root, composite references
└── turbo.json                               # pipeline
```

Each file has one responsibility. `apps/` and future `packages/*` directories are not created in this phase — those are Phase 4 / Phase 5 / Phase 3 concerns.

---

## Assumptions

- Node 22 LTS is installed (`nvm install 22`).
- pnpm 9 is installed globally (`npm install -g pnpm@9`). Verified by `pnpm --version` returning `9.x.x`.
- The worktree is already a git repo (`git status` works).
- The initial commit exists; this plan adds commits on top.

If any assumption fails, stop and resolve before proceeding.

---

## Task 1: Root workspace skeleton

**Files:**
- Create: `.nvmrc`
- Create: `.editorconfig`
- Create: `.gitattributes`
- Create: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1.1: Verify tooling versions**

Run:
```bash
node --version
pnpm --version
git --version
```

Expected:
- Node: `v22.x.x`
- pnpm: `9.x.x` (or `10.x.x`)
- git: any reasonably recent version

If Node is not 22.x, run `nvm install 22 && nvm use 22`. If pnpm is missing, `npm install -g pnpm@9`.

- [ ] **Step 1.2: Create `.nvmrc`**

Create `.nvmrc`:
```
22
```

- [ ] **Step 1.3: Create `.editorconfig`**

Create `.editorconfig`:
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 1.4: Create `.gitattributes`**

Create `.gitattributes`:
```
* text=auto eol=lf
*.sh text eol=lf
.husky/* text eol=lf
*.png binary
*.jpg binary
*.ico binary
```

- [ ] **Step 1.5: Create `.gitignore`**

Create `.gitignore`:
```
# deps
node_modules/

# build outputs
dist/
build/
.next/
out/
.expo/
.expo-shared/

# turbo
.turbo/

# env
.env
.env.local
.env.*.local

# logs
*.log
npm-debug.log*
pnpm-debug.log*

# test outputs
coverage/
test-results/
playwright-report/
.vitest/

# editor / OS
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json

# misc
*.tsbuildinfo

# husky generated (Task 6 will create .husky/_/)
.husky/_/
```

- [ ] **Step 1.6: Create `package.json`**

Create `package.json`:
```json
{
  "name": "claude-code-boilerplate",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "engines": {
    "node": ">=22.0.0 <23.0.0",
    "pnpm": ">=9.0.0"
  },
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "lint": "echo \"no lint configured yet\" && exit 1",
    "typecheck": "echo \"no typecheck configured yet\" && exit 1",
    "format": "echo \"no format configured yet\" && exit 1",
    "format:check": "echo \"no format configured yet\" && exit 1"
  }
}
```

Note: The script stubs exit with code 1 on purpose so we can prove they fail now and pass later.

- [ ] **Step 1.7: Create `pnpm-workspace.yaml`**

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 1.8: Verify install works**

Run:
```bash
pnpm install
```

Expected: creates `pnpm-lock.yaml`, exits 0, reports "Done in ..." with no warnings about missing workspaces. No errors.

- [ ] **Step 1.9: Verify lint/typecheck stubs fail (proves scripts run)**

Run:
```bash
pnpm lint
```

Expected: exits non-zero with output `no lint configured yet`.

Run:
```bash
pnpm typecheck
```

Expected: exits non-zero with output `no typecheck configured yet`.

This is the "failing test" that later tasks will make pass.

- [ ] **Step 1.10: Commit**

```bash
git add .nvmrc .editorconfig .gitattributes .gitignore package.json pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "chore: scaffold pnpm workspace skeleton"
```

Expected: commit succeeds (no hooks installed yet so no hook interference).

---

## Task 2: Turborepo pipeline

**Files:**
- Create: `turbo.json`
- Modify: `package.json` (add `turbo` devDep, update scripts)

- [ ] **Step 2.1: Verify turbo is not yet installed**

Run:
```bash
pnpm exec turbo --version
```

Expected: fails with "Command not found" or similar.

- [ ] **Step 2.2: Install turbo at the root**

Run:
```bash
pnpm add -Dw turbo@^2.3.0
```

Expected: adds `turbo` to root `devDependencies`; `pnpm-lock.yaml` updates; no errors.

- [ ] **Step 2.3: Create `turbo.json`**

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local",
    "tsconfig.json",
    ".nvmrc"
  ],
  "ui": "stream",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": ["*.tsbuildinfo"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] **Step 2.4: Update root scripts to delegate to turbo**

Modify `package.json` — replace the `"scripts"` object with:
```json
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "dev": "turbo run dev",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\" --ignore-path .prettierignore",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\" --ignore-path .prettierignore"
  }
```

(Prettier is not yet installed; those scripts will work once Task 5 completes.)

- [ ] **Step 2.5: Verify turbo runs (with zero tasks)**

Run:
```bash
pnpm lint
```

Expected: turbo runs, reports `No tasks were executed as part of this run.` because no workspace packages exist yet. Exits 0.

If turbo exits non-zero complaining about missing pipeline entries, re-check `turbo.json` syntax.

- [ ] **Step 2.6: Commit**

```bash
git add turbo.json package.json pnpm-lock.yaml
git commit -m "chore: add Turborepo pipeline"
```

---

## Task 3: Shared TypeScript config package

**Files:**
- Create: `packages/config-typescript/package.json`
- Create: `packages/config-typescript/base.json`
- Create: `packages/config-typescript/README.md`
- Create: `tsconfig.json` (root)

- [ ] **Step 3.1: Create `packages/config-typescript/package.json`**

```json
{
  "name": "@repo/config-typescript",
  "version": "0.0.0",
  "private": true,
  "files": [
    "base.json"
  ]
}
```

- [ ] **Step 3.2: Create `packages/config-typescript/base.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true
  },
  "exclude": ["node_modules", "dist", "build"]
}
```

- [ ] **Step 3.3: Create `packages/config-typescript/README.md`**

```markdown
# @repo/config-typescript

Shared TypeScript base configuration for all workspace packages.

## Usage

In any package, create `tsconfig.json`:

\`\`\`json
{
  "extends": "@repo/config-typescript/base.json",
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

Future variants (planned in later phases):
- `nextjs.json` — Next.js-specific overrides (Phase 4)
- `react-native.json` — React Native / Expo overrides (Phase 5)
- `node.json` — Node.js package overrides (Phase 3)
```

(Note: the backticks in the code block are escaped with backslashes. When creating the file, use real backticks — the escape is only for this plan document.)

- [ ] **Step 3.4: Install TypeScript at the root**

Run:
```bash
pnpm add -Dw typescript@^5.5.0
```

Expected: adds TypeScript to root devDeps.

- [ ] **Step 3.5: Add `config-typescript` as a workspace dep at the root**

Run:
```bash
pnpm add -Dw @repo/config-typescript@workspace:*
```

Expected: adds `"@repo/config-typescript": "workspace:*"` to root `devDependencies`.

- [ ] **Step 3.6: Create root `tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "files": [],
  "references": []
}
```

- [ ] **Step 3.7: Verify TypeScript can resolve the shared config**

Run:
```bash
pnpm exec tsc --showConfig
```

Expected: prints the resolved compiler options including `"strict": true` and `"target": "es2022"` (case may vary). No errors.

If it errors that `@repo/config-typescript/base.json` isn't resolvable, re-run `pnpm install` (the workspace dep was just added).

- [ ] **Step 3.8: Verify typecheck passes on empty tree**

Run:
```bash
pnpm exec tsc --noEmit
```

Expected: exits 0 with no output (nothing to typecheck).

- [ ] **Step 3.9: Commit**

```bash
git add packages/config-typescript tsconfig.json package.json pnpm-lock.yaml
git commit -m "chore: add @repo/config-typescript shared config"
```

---

## Task 4: Shared ESLint config package

**Files:**
- Create: `packages/config-eslint/package.json`
- Create: `packages/config-eslint/index.js`
- Create: `packages/config-eslint/README.md`
- Create: `eslint.config.mjs` (root, ESM because root `package.json` has no `"type": "module"`)
- Create: `lint-failure-fixture.ts` (temporary test artifact, deleted after verification)

- [ ] **Step 4.1: Create `packages/config-eslint/package.json`**

```json
{
  "name": "@repo/config-eslint",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "index.js",
  "files": [
    "index.js"
  ],
  "peerDependencies": {
    "eslint": "^9.0.0"
  }
}
```

- [ ] **Step 4.2: Install ESLint and plugins at the root**

Run:
```bash
pnpm add -Dw eslint@^9.16.0 typescript-eslint@^8.18.0 @eslint/js@^9.16.0 eslint-config-prettier@^9.1.0 globals@^15.14.0
```

Expected: all added to root devDeps.

- [ ] **Step 4.3: Install ESLint + plugins as deps of the config package**

Run:
```bash
pnpm --filter @repo/config-eslint add eslint@^9.16.0 typescript-eslint@^8.18.0 @eslint/js@^9.16.0 eslint-config-prettier@^9.1.0 globals@^15.14.0
```

Expected: dependencies added to `packages/config-eslint/package.json`. (We duplicate at package level so the config can be consumed standalone in later phases.)

- [ ] **Step 4.4: Create `packages/config-eslint/index.js`**

```js
// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.expo/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/*.min.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.ts", "*.tsx", "*.mjs", "*.cjs", "*.js"],
        },
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  prettier,
];
```

- [ ] **Step 4.5: Create `packages/config-eslint/README.md`**

```markdown
# @repo/config-eslint

Shared flat ESLint config for all workspace packages.

## Usage

In any package, create `eslint.config.js`:

\`\`\`js
import base from "@repo/config-eslint";

export default [
  ...base,
  {
    // package-specific overrides
  },
];
\`\`\`

In TypeScript projects, ensure a `tsconfig.json` exists (used by `projectService`). Files outside any project (root scripts, fixtures) are linted via the typescript-eslint default-project escape hatch (`allowDefaultProject` patterns).

Future overlays (planned in later phases):
- React + Next.js rules (Phase 4)
- React Native rules (Phase 5)
- jsx-a11y (Phase 9)
```

- [ ] **Step 4.6: Add `@repo/config-eslint` as a root devDep**

Run:
```bash
pnpm add -Dw @repo/config-eslint@workspace:*
```

- [ ] **Step 4.7: Create root `eslint.config.mjs`**

The `.mjs` extension forces ESM loading regardless of the root `package.json` `"type"` field. ESLint 9 and `@repo/config-eslint` both use ESM, so this avoids a `Cannot use import statement outside a module` error.

Note on flat-config semantics: an object with *only* `ignores` is a **global ignore**; an object with `files` + `ignores` is a per-matcher ignore. Config files (`*.config.*`) must be globally ignored, otherwise typescript-eslint's `projectService` will error on them not being in any tsconfig.

```js
import base from "@repo/config-eslint";

export default [
  {
    ignores: [
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
    ],
  },
  ...base,
];
```

- [ ] **Step 4.8: Wire the root `lint` script to actually run ESLint**

Modify `package.json` — change the `lint` script from `"turbo run lint"` to a two-step version that lints root files AND delegates to turbo for workspace packages:
```json
  "scripts": {
    "build": "turbo run build",
    "lint": "eslint . && turbo run lint",
    "lint:root": "eslint .",
    "typecheck": "tsc --noEmit && turbo run typecheck",
    "test": "turbo run test",
    "dev": "turbo run dev",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\" --ignore-path .prettierignore",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}\" --ignore-path .prettierignore"
  }
```

- [ ] **Step 4.9: Write a failing lint fixture (TDD for tooling)**

Create `lint-failure-fixture.ts` at the repo root:
```ts
const unusedVariable = 42;
export {};
```

- [ ] **Step 4.10: Verify lint catches the violation**

Run:
```bash
pnpm lint:root
```

Expected: exits non-zero with an error like:
```
lint-failure-fixture.ts
  1:7  error  'unusedVariable' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

This proves ESLint + typescript-eslint + the shared config all work together.

- [ ] **Step 4.11: Delete the fixture**

Run:
```bash
rm lint-failure-fixture.ts
```

- [ ] **Step 4.12: Verify lint passes on clean tree**

Run:
```bash
pnpm lint:root
```

Expected: exits 0, no output.

Also run:
```bash
pnpm lint
```

Expected: exits 0 (turbo runs no workspace tasks because no app lints exist yet).

- [ ] **Step 4.13: Commit**

```bash
git add packages/config-eslint eslint.config.mjs package.json pnpm-lock.yaml
git commit -m "chore: add @repo/config-eslint flat config"
```

---

## Task 5: Prettier

**Files:**
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `package.json` (install Prettier)

- [ ] **Step 5.1: Install Prettier at the root**

Run:
```bash
pnpm add -Dw prettier@^3.4.0
```

- [ ] **Step 5.2: Create `.prettierrc.json`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 5.3: Create `.prettierignore`**

```
# deps
node_modules/

# build outputs
dist/
build/
.next/
out/
.expo/

# turbo
.turbo/

# lock
pnpm-lock.yaml

# generated
coverage/
*.tsbuildinfo

# binary / images
*.png
*.jpg
*.ico
*.svg
```

- [ ] **Step 5.4: Write a failing format fixture**

Create `format-fixture.ts`:
```ts
const   x=1;
const y    =2;
export{x,y}
```

- [ ] **Step 5.5: Verify format:check fails**

Run:
```bash
pnpm format:check
```

Expected: exits non-zero, reports `format-fixture.ts` as not formatted.

- [ ] **Step 5.6: Run format to auto-fix**

Run:
```bash
pnpm format
```

Expected: exits 0. `format-fixture.ts` is now:
```ts
const x = 1;
const y = 2;
export { x, y };
```

- [ ] **Step 5.7: Verify format:check now passes**

Run:
```bash
pnpm format:check
```

Expected: exits 0, reports "All matched files use Prettier code style!"

- [ ] **Step 5.8: Delete the fixture**

```bash
rm format-fixture.ts
```

- [ ] **Step 5.9: Run Prettier on the whole repo to normalize any existing files**

Run:
```bash
pnpm format
```

Expected: exits 0. Any files it formats (e.g., JSON with different trailing newlines) are acceptable — we'll commit them.

Run `git diff` to inspect any changes. Should be minimal (newline normalization at most).

- [ ] **Step 5.10: Commit**

```bash
git add .prettierrc.json .prettierignore package.json pnpm-lock.yaml
git commit -am "chore: add Prettier with repo-wide formatting"
```

(`-a` picks up any formatting normalizations from Step 5.9.)

---

## Task 6: Husky + lint-staged

**Files:**
- Create: `.husky/pre-commit`
- Create: `.lintstagedrc.json`
- Modify: `package.json` (install husky + lint-staged, add `prepare` script)

- [ ] **Step 6.1: Install husky and lint-staged**

Run:
```bash
pnpm add -Dw husky@^9.1.0 lint-staged@^15.2.0
```

- [ ] **Step 6.2: Add `prepare` script and initialize husky**

Modify `package.json` — add a `prepare` script in the `scripts` block:
```json
    "prepare": "husky"
```

Then run:
```bash
pnpm prepare
```

Expected: creates `.husky/_/` (internal husky directory). No errors.

- [ ] **Step 6.3: Create `.lintstagedrc.json`**

```json
{
  "*.{ts,tsx,js,jsx,cjs,mjs}": [
    "prettier --write",
    "eslint --fix"
  ],
  "*.{json,md,yml,yaml,css}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 6.4: Create `.husky/pre-commit`**

Create `.husky/pre-commit`:
```sh
pnpm exec lint-staged
```

(No shebang or `husky.sh` sourcing — husky v9+ simplified this.)

- [ ] **Step 6.5: Make the hook executable**

Run:
```bash
chmod +x .husky/pre-commit
```

(On Windows Git Bash, `chmod` is a no-op but harmless — git stores the executable bit based on `.gitattributes` / config.)

- [ ] **Step 6.6: Write a failing staged file fixture**

Create `hook-fixture.ts`:
```ts
const   bad    =    1;
export { bad };
```

Stage it:
```bash
git add hook-fixture.ts
```

- [ ] **Step 6.7: Attempt to commit — lint-staged should reformat**

Run:
```bash
git commit -m "test: hook fixture"
```

Expected behavior: lint-staged runs, Prettier auto-formats the file, ESLint runs (may pass since the variable is exported), then the commit succeeds with the formatted content.

Verify:
```bash
cat hook-fixture.ts
```

Expected:
```ts
const bad = 1;
export { bad };
```

If instead the commit fails because ESLint errors are unfixable, that's also a valid outcome — the hook is working. In that case, fix the file manually and re-try.

- [ ] **Step 6.8: Clean up the fixture**

Run:
```bash
git rm hook-fixture.ts
git commit -m "test: remove hook fixture"
```

- [ ] **Step 6.9: Commit the hook infrastructure**

First, verify the Husky infra files are staged:
```bash
git status
```

You should see `.husky/pre-commit`, `.lintstagedrc.json`, and `package.json` changes. Commit:
```bash
git add .husky/pre-commit .lintstagedrc.json package.json pnpm-lock.yaml
git commit -m "chore: add Husky pre-commit with lint-staged"
```

- [ ] **Step 6.10: Optional squash cleanup**

If Task 6 produced multiple commits (including the hook-fixture test/remove commits), the history is a bit noisy. You can leave them in — they document the verification — or interactive rebase to squash them. Leave as-is by default.

---

## Task 7: Commitlint with Conventional Commits

**Files:**
- Create: `commitlint.config.mjs` (ESM — commitlint 19 requires it, and the `.mjs` extension avoids needing `"type": "module"` in root `package.json`)
- Create: `.husky/commit-msg`
- Modify: `package.json` (install commitlint)

- [ ] **Step 7.1: Install commitlint**

Run:
```bash
pnpm add -Dw @commitlint/cli@^19.6.0 @commitlint/config-conventional@^19.6.0
```

- [ ] **Step 7.2: Create `commitlint.config.mjs`**

```js
/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "header-max-length": [2, "always", 100],
  },
};
```

- [ ] **Step 7.3: Create `.husky/commit-msg`**

```sh
pnpm exec commitlint --edit "$1"
```

Make executable:
```bash
chmod +x .husky/commit-msg
```

- [ ] **Step 7.4: Write a failing commit-message test**

Stage a trivial change first (so there's something to commit):
```bash
echo "# scratch" > scratch-commit-test.md
git add scratch-commit-test.md
```

Attempt a non-Conventional commit:
```bash
git commit -m "this is not conventional"
```

Expected: commit is rejected by the `commit-msg` hook with commitlint errors like:
```
✖ subject may not be empty [subject-empty]
✖ type may not be empty [type-empty]
```

Exit code non-zero. Commit not created.

- [ ] **Step 7.5: Retry with a valid Conventional Commit**

```bash
git commit -m "chore: scratch commit test"
```

Expected: commit succeeds. commitlint passes.

- [ ] **Step 7.6: Clean up the scratch file**

```bash
git rm scratch-commit-test.md
git commit -m "chore: remove commit test scratch file"
```

- [ ] **Step 7.7: Commit the commitlint infrastructure**

```bash
git add commitlint.config.mjs .husky/commit-msg package.json pnpm-lock.yaml
git commit -m "chore: add commitlint with Conventional Commits"
```

---

## Task 8: Phase gate verification

**Files:** none (verification only)

- [ ] **Step 8.1: Clean slate re-install**

Run:
```bash
rm -rf node_modules packages/*/node_modules
pnpm install
```

Expected: full install succeeds from the committed `pnpm-lock.yaml`.

- [ ] **Step 8.2: Run the full gate commands**

Run each of the following in order. Each must exit 0:

```bash
pnpm lint
```
Expected: exits 0 (turbo runs; no workspace tasks; root ESLint clean).

```bash
pnpm typecheck
```
Expected: exits 0 (tsc passes; turbo runs; no workspace tasks).

```bash
pnpm format:check
```
Expected: exits 0, reports "All matched files use Prettier code style!"

- [ ] **Step 8.3: Verify commit-msg hook still blocks bad messages**

Run:
```bash
echo "# gate" > gate-test.md
git add gate-test.md
git commit -m "not conventional"
```

Expected: commit rejected by commitlint.

Clean up:
```bash
git restore --staged gate-test.md
rm gate-test.md
```

- [ ] **Step 8.4: Verify commit-msg hook accepts a Conventional message**

Nothing to commit, so verify via commitlint directly:
```bash
echo "chore: gate verification" | pnpm exec commitlint
```

Expected: exits 0 silently.

- [ ] **Step 8.5: Final sanity check**

Run:
```bash
git status
git log --oneline -15
```

Expected:
- Working tree clean.
- Commits from this phase present in order: workspace scaffold → turbo → config-typescript → config-eslint → Prettier → husky/lint-staged → commitlint.

- [ ] **Step 8.6: Tag the phase**

```bash
git tag phase-1-complete
```

(No push required here — tagging is a local bookmark. Push if you want: `git push origin phase-1-complete`.)

---

## Phase 1 Exit Criteria — Checklist

Before declaring Phase 1 done, confirm all of the following:

- [ ] `pnpm install` completes with no errors on a clean clone.
- [ ] `pnpm lint` exits 0.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm format:check` exits 0.
- [ ] A commit with a non-Conventional message is rejected.
- [ ] A commit with a Conventional message succeeds.
- [ ] The pre-commit hook auto-formats staged files via Prettier.
- [ ] `packages/config-typescript` and `packages/config-eslint` are both consumable via `@repo/*` workspace imports.
- [ ] `.nvmrc` exists and contains `22`.
- [ ] `.gitignore` excludes `node_modules/`, `.env*`, `.turbo/`, and build outputs.
- [ ] No fixture files (`lint-failure-fixture.ts`, `format-fixture.ts`, `hook-fixture.ts`, `scratch-commit-test.md`, `gate-test.md`) remain in the repo.

If all boxes are checked, Phase 1 is complete and ready for Phase 2 (Supabase local + schema + types).

---

## Notes for later phases

- Future packages will each depend on `@repo/config-typescript` and `@repo/config-eslint` as dev workspace deps. See `packages/config-typescript/README.md` for usage.
- The `nextjs.json` / `react-native.json` / `node.json` TypeScript variants get added in Phases 4 / 5 / 3 respectively — not here, to avoid YAGNI.
- The ESLint config will grow to add React, Next, React Native, and jsx-a11y plugins in later phases. This phase establishes the base.
- `docs/ci-secrets.md` and CI workflows come in Phase 10.
