# Phase 3 — Shared Packages Scaffolding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the five shared workspace packages (`validation`, `i18n`, `tailwind-config`, `analytics`, `api-client`) with real implementations, barrel exports, and at least one passing unit test each — so downstream apps can import them in later phases.

**Architecture:**
- Each package is a private `@repo/*` workspace package under `packages/` with its own `package.json`, `tsconfig.json`, `vitest.config.ts`, and `src/` tree.
- Tests live inline (`src/**/*.test.ts`) and run via `vitest run`.
- Lint and typecheck are exercised by the monorepo root (`eslint .` and each package's `tsc --noEmit`). We do NOT add per-package `lint` scripts — that matches the existing `@repo/database-types` pattern.
- Dependencies between packages use `workspace:*`. Inter-package edges (per design §3.1): `api-client` → `database-types` + `validation`; `ui-*` → `tailwind-config` + `i18n` (to be wired in later phases). No `apps/*` imports in this phase.
- All packages ship with ESM only. No build step — source is consumed directly via the `exports` map (same as `@repo/database-types`).

**Tech Stack:** TypeScript 5 (strict), Zod 3, Vitest 2, MSW 2, `@supabase/supabase-js` 2, `@tanstack/react-query` 5, `date-fns` 4, Tailwind CSS 3 preset shape. React/ReactDOM pulled in only as peer deps for api-client; we do NOT render components in tests this phase.

---

## File Structure (decomposition)

```
packages/
├── validation/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── index.ts         # barrel re-exports
│       ├── profile.ts       # profileSchema, displayNameSchema, Profile type
│       ├── profile.test.ts
│       ├── item.ts          # itemSchema, createItemSchema, updateItemSchema, Item type
│       ├── item.test.ts
│       ├── auth.ts          # signInSchema, signUpSchema, resetPasswordSchema
│       └── auth.test.ts
│
├── i18n/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── locales/
│   │   ├── en/{common,auth,errors}.json
│   │   └── es/{common,auth,errors}.json
│   └── src/
│       ├── index.ts         # LOCALES, DEFAULT_LOCALE, Locale type, messages loader
│       ├── formatters.ts    # formatDate, formatNumber (Intl-based)
│       ├── formatters.test.ts
│       └── parity.test.ts   # asserts all locales have identical keys
│
├── tailwind-config/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── tokens.ts        # colors, spacing, typography, radii — pure objects
│       ├── preset.ts        # Tailwind preset consuming tokens
│       ├── index.ts         # barrel
│       └── tokens.test.ts
│
├── analytics/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── types.ts         # AnalyticsProvider interface, EventProps type
│       ├── events.ts        # STANDARD_EVENTS const
│       ├── noop.ts          # createNoopProvider()
│       ├── analytics.ts     # createAnalytics(provider) → { track, identify, page }
│       ├── index.ts         # barrel
│       ├── noop.test.ts
│       └── analytics.test.ts
│
└── api-client/
    ├── package.json
    ├── tsconfig.json
    ├── vitest.config.ts
    └── src/
        ├── client.ts        # createSupabaseBrowserClient(url, key)
        ├── query-keys.ts    # typed queryKeys factory object
        ├── hooks/
        │   ├── use-session.ts
        │   └── use-items.ts # example scaffold — not unit-tested this phase
        ├── msw/
        │   ├── handlers.ts  # MSW handler for GET /rest/v1/items
        │   └── server.ts    # setupServer re-export (node-env)
        ├── index.ts         # barrel (client, queryKeys, hooks)
        ├── client.test.ts
        ├── query-keys.test.ts
        └── msw/handlers.test.ts
```

Each package is small and single-responsibility. Tests sit next to source. No cross-package test coupling.

---

## Task 1: `packages/validation` — Zod schemas

**Files:**
- Create: `packages/validation/package.json`
- Create: `packages/validation/tsconfig.json`
- Create: `packages/validation/vitest.config.ts`
- Create: `packages/validation/src/profile.ts`
- Create: `packages/validation/src/profile.test.ts`
- Create: `packages/validation/src/item.ts`
- Create: `packages/validation/src/item.test.ts`
- Create: `packages/validation/src/auth.ts`
- Create: `packages/validation/src/auth.test.ts`
- Create: `packages/validation/src/index.ts`

- [ ] **Step 1.1: Create `packages/validation/package.json`**

```json
{
  "name": "@repo/validation",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 1.2: Create `packages/validation/tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 1.3: Create `packages/validation/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 1.4: Write failing test `packages/validation/src/profile.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { displayNameSchema, profileSchema } from "./profile.js";

describe("displayNameSchema", () => {
  it("accepts 2–50 char strings", () => {
    expect(displayNameSchema.safeParse("Al").success).toBe(true);
    expect(displayNameSchema.safeParse("A").success).toBe(false);
    expect(displayNameSchema.safeParse("x".repeat(51)).success).toBe(false);
  });

  it("trims whitespace before validating length", () => {
    expect(displayNameSchema.safeParse("  Al  ").success).toBe(true);
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("requires a uuid id and accepts nullable fields", () => {
    const ok = profileSchema.safeParse({
      id: "00000000-0000-0000-0000-000000000001",
      display_name: null,
      avatar_url: null,
    });
    expect(ok.success).toBe(true);
  });

  it("rejects non-uuid ids", () => {
    const bad = profileSchema.safeParse({
      id: "not-a-uuid",
      display_name: null,
      avatar_url: null,
    });
    expect(bad.success).toBe(false);
  });
});
```

- [ ] **Step 1.5: Run test — expect FAIL (module not found)**

Run: `pnpm --filter @repo/validation test`
Expected: test file errors importing `./profile.js`.

- [ ] **Step 1.6: Implement `packages/validation/src/profile.ts`**

```ts
import { z } from "zod";

export const displayNameSchema = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().min(2).max(50));

export const profileSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(2).max(50).nullable(),
  avatar_url: z.string().url().nullable(),
});

export type Profile = z.infer<typeof profileSchema>;
```

- [ ] **Step 1.7: Run test — expect PASS**

Run: `pnpm --filter @repo/validation test`
Expected: `profile.test.ts` passes (4 tests).

- [ ] **Step 1.8: Write failing test `packages/validation/src/item.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { createItemSchema, itemSchema, updateItemSchema } from "./item.js";

describe("createItemSchema", () => {
  it("requires title (1–200 chars) and allows optional description", () => {
    expect(createItemSchema.safeParse({ title: "hello" }).success).toBe(true);
    expect(
      createItemSchema.safeParse({ title: "hello", description: "hi" }).success,
    ).toBe(true);
    expect(createItemSchema.safeParse({ title: "" }).success).toBe(false);
    expect(
      createItemSchema.safeParse({ title: "x".repeat(201) }).success,
    ).toBe(false);
  });
});

describe("updateItemSchema", () => {
  it("requires at least one field", () => {
    expect(updateItemSchema.safeParse({}).success).toBe(false);
    expect(updateItemSchema.safeParse({ title: "new" }).success).toBe(true);
    expect(updateItemSchema.safeParse({ description: "new" }).success).toBe(
      true,
    );
  });
});

describe("itemSchema", () => {
  it("validates a full DB row", () => {
    const row = {
      id: "00000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000002",
      title: "t",
      description: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };
    expect(itemSchema.safeParse(row).success).toBe(true);
  });
});
```

- [ ] **Step 1.9: Run test — expect FAIL**

Run: `pnpm --filter @repo/validation test`
Expected: `item.test.ts` errors on missing import.

- [ ] **Step 1.10: Implement `packages/validation/src/item.ts`**

```ts
import { z } from "zod";

export const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const updateItemSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .refine((v) => v.title !== undefined || v.description !== undefined, {
    message: "At least one field must be provided",
  });

export const itemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type Item = z.infer<typeof itemSchema>;
```

- [ ] **Step 1.11: Run test — expect PASS**

Run: `pnpm --filter @repo/validation test`
Expected: both test files pass.

- [ ] **Step 1.12: Write failing test `packages/validation/src/auth.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { resetPasswordSchema, signInSchema, signUpSchema } from "./auth.js";

describe("signInSchema", () => {
  it("requires valid email + password", () => {
    expect(
      signInSchema.safeParse({ email: "a@b.co", password: "secret12" }).success,
    ).toBe(true);
    expect(
      signInSchema.safeParse({ email: "nope", password: "secret12" }).success,
    ).toBe(false);
    expect(
      signInSchema.safeParse({ email: "a@b.co", password: "short" }).success,
    ).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("requires password confirmation to match", () => {
    expect(
      signUpSchema.safeParse({
        email: "a@b.co",
        password: "secret12",
        confirmPassword: "secret12",
      }).success,
    ).toBe(true);
    expect(
      signUpSchema.safeParse({
        email: "a@b.co",
        password: "secret12",
        confirmPassword: "different",
      }).success,
    ).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(resetPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(
      true,
    );
    expect(resetPasswordSchema.safeParse({ email: "nope" }).success).toBe(
      false,
    );
  });
});
```

- [ ] **Step 1.13: Run test — expect FAIL**

Run: `pnpm --filter @repo/validation test`

- [ ] **Step 1.14: Implement `packages/validation/src/auth.ts`**

```ts
import { z } from "zod";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(128);

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
```

- [ ] **Step 1.15: Create barrel `packages/validation/src/index.ts`**

```ts
export * from "./auth.js";
export * from "./item.js";
export * from "./profile.js";
```

- [ ] **Step 1.16: Install deps + run full gate**

Run from monorepo root:
```
pnpm install
pnpm --filter @repo/validation test
pnpm --filter @repo/validation typecheck
```
Expected: all pass.

- [ ] **Step 1.17: Commit**

```
git add packages/validation pnpm-lock.yaml
git commit -m "feat(validation): add Zod schemas for profile, item, auth"
```

---

## Task 2: `packages/i18n` — locale JSON + formatters + parity test

**Files:**
- Create: `packages/i18n/package.json`
- Create: `packages/i18n/tsconfig.json`
- Create: `packages/i18n/vitest.config.ts`
- Create: `packages/i18n/locales/{en,es}/{common,auth,errors}.json`
- Create: `packages/i18n/src/index.ts`
- Create: `packages/i18n/src/formatters.ts`
- Create: `packages/i18n/src/formatters.test.ts`
- Create: `packages/i18n/src/parity.test.ts`

- [ ] **Step 2.1: Create `packages/i18n/package.json`**

```json
{
  "name": "@repo/i18n",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./locales/*": "./locales/*"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2.2: Create `packages/i18n/tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "noEmit": true,
    "resolveJsonModule": true
  },
  "include": ["src", "vitest.config.ts", "locales/**/*.json"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 2.3: Create `packages/i18n/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 2.4: Create English locale files**

`packages/i18n/locales/en/common.json`:
```json
{
  "appName": "Claude Code Boilerplate",
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create"
  },
  "nav": {
    "home": "Home",
    "dashboard": "Dashboard",
    "profile": "Profile",
    "settings": "Settings",
    "signOut": "Sign out"
  }
}
```

`packages/i18n/locales/en/auth.json`:
```json
{
  "signIn": {
    "title": "Sign in",
    "email": "Email",
    "password": "Password",
    "submit": "Sign in",
    "googleButton": "Continue with Google",
    "forgotPassword": "Forgot password?",
    "noAccount": "Don't have an account? Sign up"
  },
  "signUp": {
    "title": "Create account",
    "confirmPassword": "Confirm password",
    "submit": "Sign up",
    "haveAccount": "Already have an account? Sign in"
  },
  "forgotPassword": {
    "title": "Reset password",
    "submit": "Send reset link",
    "sent": "If an account exists, a reset email has been sent."
  }
}
```

`packages/i18n/locales/en/errors.json`:
```json
{
  "generic": "Something went wrong. Please try again.",
  "network": "Network error. Check your connection.",
  "auth": {
    "invalidCredentials": "Invalid email or password.",
    "emailTaken": "An account with this email already exists.",
    "weakPassword": "Password must be at least 8 characters."
  },
  "validation": {
    "required": "This field is required.",
    "invalidEmail": "Please enter a valid email address.",
    "passwordMismatch": "Passwords do not match."
  }
}
```

- [ ] **Step 2.5: Create Spanish locale files (same shape, translated strings)**

`packages/i18n/locales/es/common.json`:
```json
{
  "appName": "Claude Code Boilerplate",
  "actions": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "create": "Crear"
  },
  "nav": {
    "home": "Inicio",
    "dashboard": "Panel",
    "profile": "Perfil",
    "settings": "Ajustes",
    "signOut": "Cerrar sesión"
  }
}
```

`packages/i18n/locales/es/auth.json`:
```json
{
  "signIn": {
    "title": "Iniciar sesión",
    "email": "Correo",
    "password": "Contraseña",
    "submit": "Iniciar sesión",
    "googleButton": "Continuar con Google",
    "forgotPassword": "¿Olvidaste tu contraseña?",
    "noAccount": "¿No tienes cuenta? Regístrate"
  },
  "signUp": {
    "title": "Crear cuenta",
    "confirmPassword": "Confirmar contraseña",
    "submit": "Registrarse",
    "haveAccount": "¿Ya tienes cuenta? Inicia sesión"
  },
  "forgotPassword": {
    "title": "Restablecer contraseña",
    "submit": "Enviar enlace",
    "sent": "Si la cuenta existe, se ha enviado un correo de restablecimiento."
  }
}
```

`packages/i18n/locales/es/errors.json`:
```json
{
  "generic": "Algo salió mal. Inténtalo de nuevo.",
  "network": "Error de red. Revisa tu conexión.",
  "auth": {
    "invalidCredentials": "Correo o contraseña no válidos.",
    "emailTaken": "Ya existe una cuenta con este correo.",
    "weakPassword": "La contraseña debe tener al menos 8 caracteres."
  },
  "validation": {
    "required": "Este campo es obligatorio.",
    "invalidEmail": "Introduce un correo válido.",
    "passwordMismatch": "Las contraseñas no coinciden."
  }
}
```

- [ ] **Step 2.6: Create `packages/i18n/src/index.ts`**

```ts
import enAuth from "../locales/en/auth.json" with { type: "json" };
import enCommon from "../locales/en/common.json" with { type: "json" };
import enErrors from "../locales/en/errors.json" with { type: "json" };
import esAuth from "../locales/es/auth.json" with { type: "json" };
import esCommon from "../locales/es/common.json" with { type: "json" };
import esErrors from "../locales/es/errors.json" with { type: "json" };

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const messages = {
  en: { common: enCommon, auth: enAuth, errors: enErrors },
  es: { common: esCommon, auth: esAuth, errors: esErrors },
} as const;

export type Namespace = keyof (typeof messages)["en"];

export function getMessages(locale: Locale) {
  return messages[locale];
}

export * from "./formatters.js";
```

- [ ] **Step 2.7: Write failing test `packages/i18n/src/formatters.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { formatDate, formatNumber } from "./formatters.js";

describe("formatDate", () => {
  it("formats the same date differently per locale", () => {
    const d = new Date("2026-03-14T00:00:00Z");
    const en = formatDate(d, "en", { timeZone: "UTC" });
    const es = formatDate(d, "es", { timeZone: "UTC" });
    expect(en).not.toEqual(es);
    expect(en).toMatch(/2026/);
    expect(es).toMatch(/2026/);
  });
});

describe("formatNumber", () => {
  it("uses locale-specific grouping", () => {
    expect(formatNumber(1234567.89, "en")).toBe("1,234,567.89");
    expect(formatNumber(1234567.89, "es")).toMatch(/1[\s.]234[\s.]567,89/);
  });
});
```

- [ ] **Step 2.8: Run test — expect FAIL**

Run: `pnpm --filter @repo/i18n test`

- [ ] **Step 2.9: Implement `packages/i18n/src/formatters.ts`**

```ts
import type { Locale } from "./index.js";

export function formatDate(
  date: Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
```

- [ ] **Step 2.10: Run test — expect PASS**

Run: `pnpm --filter @repo/i18n test`

- [ ] **Step 2.11: Write parity test `packages/i18n/src/parity.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { LOCALES, messages, type Namespace } from "./index.js";

function collectKeys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out.push(...collectKeys(v, path));
    } else {
      out.push(path);
    }
  }
  return out.sort();
}

const NAMESPACES: Namespace[] = ["common", "auth", "errors"];

describe("locale parity", () => {
  for (const ns of NAMESPACES) {
    it(`every locale exposes the same keys for "${ns}"`, () => {
      const reference = collectKeys(messages.en[ns]);
      for (const locale of LOCALES) {
        const actual = collectKeys(messages[locale][ns]);
        expect(actual, `locale=${locale} namespace=${ns}`).toEqual(reference);
      }
    });
  }
});
```

- [ ] **Step 2.12: Run test — expect PASS**

Run: `pnpm --filter @repo/i18n test`
Expected: formatters + parity tests pass.

- [ ] **Step 2.13: Install + typecheck**

Run: `pnpm install && pnpm --filter @repo/i18n typecheck`
Expected: exit 0.

- [ ] **Step 2.14: Commit**

```
git add packages/i18n pnpm-lock.yaml
git commit -m "feat(i18n): add en/es locales, formatters, and parity test"
```

---

## Task 3: `packages/tailwind-config` — design tokens + Tailwind preset

**Files:**
- Create: `packages/tailwind-config/package.json`
- Create: `packages/tailwind-config/tsconfig.json`
- Create: `packages/tailwind-config/vitest.config.ts`
- Create: `packages/tailwind-config/src/tokens.ts`
- Create: `packages/tailwind-config/src/preset.ts`
- Create: `packages/tailwind-config/src/index.ts`
- Create: `packages/tailwind-config/src/tokens.test.ts`

- [ ] **Step 3.1: Create `packages/tailwind-config/package.json`**

```json
{
  "name": "@repo/tailwind-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./preset": "./src/preset.ts",
    "./tokens": "./src/tokens.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3.2: Create `packages/tailwind-config/tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3.3: Create `packages/tailwind-config/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3.4: Implement `packages/tailwind-config/src/tokens.ts`**

```ts
export const tokens = {
  colors: {
    brand: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
    },
    neutral: {
      0: "#ffffff",
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      1000: "#000000",
    },
    success: "#16a34a",
    warning: "#eab308",
    danger: "#dc2626",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  radii: {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  typography: {
    fontFamily: {
      sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "ui-monospace", "monospace"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },
} as const;

export type Tokens = typeof tokens;
```

- [ ] **Step 3.5: Implement `packages/tailwind-config/src/preset.ts`**

```ts
import type { Config } from "tailwindcss";

import { tokens } from "./tokens.js";

export const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: tokens.colors.brand,
        neutral: tokens.colors.neutral,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        danger: tokens.colors.danger,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.radii,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
    },
  },
};

export default preset;
```

- [ ] **Step 3.6: Create barrel `packages/tailwind-config/src/index.ts`**

```ts
export { preset, default } from "./preset.js";
export { tokens } from "./tokens.js";
export type { Tokens } from "./tokens.js";
```

- [ ] **Step 3.7: Write test `packages/tailwind-config/src/tokens.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { preset } from "./preset.js";
import { tokens } from "./tokens.js";

describe("tokens", () => {
  it("exposes brand, neutral, and semantic colors", () => {
    expect(tokens.colors.brand[500]).toMatch(/^#/);
    expect(tokens.colors.neutral[900]).toMatch(/^#/);
    expect(tokens.colors.success).toMatch(/^#/);
    expect(tokens.colors.danger).toMatch(/^#/);
  });

  it("uses rem for spacing scale", () => {
    for (const value of Object.values(tokens.spacing)) {
      expect(value).toMatch(/rem$/);
    }
  });
});

describe("preset", () => {
  it("extends Tailwind theme with token values", () => {
    const extend = preset.theme?.extend;
    expect(extend?.colors).toMatchObject({ brand: tokens.colors.brand });
    expect(extend?.spacing).toEqual(tokens.spacing);
    expect(extend?.borderRadius).toEqual(tokens.radii);
    expect(extend?.fontFamily).toEqual(tokens.typography.fontFamily);
  });
});
```

- [ ] **Step 3.8: Install + run test + typecheck**

```
pnpm install
pnpm --filter @repo/tailwind-config test
pnpm --filter @repo/tailwind-config typecheck
```
Expected: all pass.

- [ ] **Step 3.9: Commit**

```
git add packages/tailwind-config pnpm-lock.yaml
git commit -m "feat(tailwind-config): add design tokens and Tailwind preset"
```

---

## Task 4: `packages/analytics` — no-op-safe wrapper

**Files:**
- Create: `packages/analytics/package.json`
- Create: `packages/analytics/tsconfig.json`
- Create: `packages/analytics/vitest.config.ts`
- Create: `packages/analytics/src/types.ts`
- Create: `packages/analytics/src/events.ts`
- Create: `packages/analytics/src/noop.ts`
- Create: `packages/analytics/src/noop.test.ts`
- Create: `packages/analytics/src/analytics.ts`
- Create: `packages/analytics/src/analytics.test.ts`
- Create: `packages/analytics/src/index.ts`

- [ ] **Step 4.1: Create `packages/analytics/package.json`**

```json
{
  "name": "@repo/analytics",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 4.2: Create `packages/analytics/tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4.3: Create `packages/analytics/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4.4: Implement `packages/analytics/src/types.ts`**

```ts
export type EventProps = Record<string, string | number | boolean | null>;

export interface AnalyticsProvider {
  name: string;
  track(event: string, props?: EventProps): void;
  identify(userId: string, traits?: EventProps): void;
  page(name: string, props?: EventProps): void;
}
```

- [ ] **Step 4.5: Implement `packages/analytics/src/events.ts`**

```ts
export const STANDARD_EVENTS = {
  SIGN_UP: "sign_up",
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
  PUSH_REGISTERED: "push_registered",
  LOCALE_CHANGED: "locale_changed",
  THEME_CHANGED: "theme_changed",
} as const;

export type StandardEvent = (typeof STANDARD_EVENTS)[keyof typeof STANDARD_EVENTS];
```

- [ ] **Step 4.6: Write failing test `packages/analytics/src/noop.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { createNoopProvider } from "./noop.js";

describe("createNoopProvider", () => {
  it("returns a provider whose methods do not throw", () => {
    const p = createNoopProvider();
    expect(p.name).toBe("noop");
    expect(() => p.track("sign_in")).not.toThrow();
    expect(() => p.identify("u1", { plan: "free" })).not.toThrow();
    expect(() => p.page("home")).not.toThrow();
  });
});
```

- [ ] **Step 4.7: Run test — expect FAIL**

Run: `pnpm --filter @repo/analytics test`

- [ ] **Step 4.8: Implement `packages/analytics/src/noop.ts`**

```ts
import type { AnalyticsProvider } from "./types.js";

export function createNoopProvider(): AnalyticsProvider {
  return {
    name: "noop",
    track() {},
    identify() {},
    page() {},
  };
}
```

- [ ] **Step 4.9: Run test — expect PASS**

Run: `pnpm --filter @repo/analytics test`

- [ ] **Step 4.10: Write failing test `packages/analytics/src/analytics.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest";
import { createAnalytics } from "./analytics.js";
import { createNoopProvider } from "./noop.js";
import type { AnalyticsProvider } from "./types.js";

function spyProvider(): AnalyticsProvider & {
  calls: Array<[string, unknown, unknown]>;
} {
  const calls: Array<[string, unknown, unknown]> = [];
  return {
    name: "spy",
    track: (e, p) => {
      calls.push(["track", e, p]);
    },
    identify: (id, t) => {
      calls.push(["identify", id, t]);
    },
    page: (name, p) => {
      calls.push(["page", name, p]);
    },
    calls,
  };
}

describe("createAnalytics", () => {
  it("fan-outs events to every registered provider", () => {
    const a = spyProvider();
    const b = spyProvider();
    const analytics = createAnalytics({ providers: [a, b] });

    analytics.track("sign_in", { method: "password" });
    analytics.identify("user-1", { plan: "free" });
    analytics.page("dashboard");

    expect(a.calls).toEqual([
      ["track", "sign_in", { method: "password" }],
      ["identify", "user-1", { plan: "free" }],
      ["page", "dashboard", undefined],
    ]);
    expect(b.calls).toEqual(a.calls);
  });

  it("falls back to the noop provider when no providers are registered", () => {
    const analytics = createAnalytics({ providers: [] });
    expect(() => analytics.track("sign_in")).not.toThrow();
  });

  it("catches provider errors so one bad provider does not break the rest", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken: AnalyticsProvider = {
      name: "broken",
      track: () => {
        throw new Error("boom");
      },
      identify: () => {},
      page: () => {},
    };
    const good = spyProvider();
    const analytics = createAnalytics({ providers: [broken, good] });
    expect(() => analytics.track("sign_in")).not.toThrow();
    expect(good.calls).toEqual([["track", "sign_in", undefined]]);
    errorSpy.mockRestore();
  });

  it("treats a noop provider as valid", () => {
    const analytics = createAnalytics({ providers: [createNoopProvider()] });
    expect(() => analytics.track("sign_in")).not.toThrow();
  });
});
```

- [ ] **Step 4.11: Run test — expect FAIL**

Run: `pnpm --filter @repo/analytics test`

- [ ] **Step 4.12: Implement `packages/analytics/src/analytics.ts`**

```ts
import { createNoopProvider } from "./noop.js";
import type { AnalyticsProvider, EventProps } from "./types.js";

export interface AnalyticsConfig {
  providers: AnalyticsProvider[];
}

export interface Analytics {
  track(event: string, props?: EventProps): void;
  identify(userId: string, traits?: EventProps): void;
  page(name: string, props?: EventProps): void;
}

function safeInvoke(name: string, fn: () => void) {
  try {
    fn();
  } catch (err) {
    console.error(`[analytics] provider "${name}" threw`, err);
  }
}

export function createAnalytics(config: AnalyticsConfig): Analytics {
  const providers =
    config.providers.length === 0 ? [createNoopProvider()] : config.providers;

  return {
    track(event, props) {
      for (const p of providers) {
        safeInvoke(p.name, () => {
          p.track(event, props);
        });
      }
    },
    identify(userId, traits) {
      for (const p of providers) {
        safeInvoke(p.name, () => {
          p.identify(userId, traits);
        });
      }
    },
    page(name, props) {
      for (const p of providers) {
        safeInvoke(p.name, () => {
          p.page(name, props);
        });
      }
    },
  };
}
```

- [ ] **Step 4.13: Run test — expect PASS**

Run: `pnpm --filter @repo/analytics test`

- [ ] **Step 4.14: Create barrel `packages/analytics/src/index.ts`**

```ts
export { createAnalytics } from "./analytics.js";
export type { Analytics, AnalyticsConfig } from "./analytics.js";
export { STANDARD_EVENTS } from "./events.js";
export type { StandardEvent } from "./events.js";
export { createNoopProvider } from "./noop.js";
export type { AnalyticsProvider, EventProps } from "./types.js";
```

- [ ] **Step 4.15: Install + typecheck**

```
pnpm install
pnpm --filter @repo/analytics test
pnpm --filter @repo/analytics typecheck
```

- [ ] **Step 4.16: Commit**

```
git add packages/analytics pnpm-lock.yaml
git commit -m "feat(analytics): add no-op-safe analytics wrapper with fan-out"
```

---

## Task 5: `packages/api-client` — Supabase factory + query keys + MSW handlers

**Files:**
- Create: `packages/api-client/package.json`
- Create: `packages/api-client/tsconfig.json`
- Create: `packages/api-client/vitest.config.ts`
- Create: `packages/api-client/src/client.ts`
- Create: `packages/api-client/src/client.test.ts`
- Create: `packages/api-client/src/query-keys.ts`
- Create: `packages/api-client/src/query-keys.test.ts`
- Create: `packages/api-client/src/hooks/use-session.ts`
- Create: `packages/api-client/src/hooks/use-items.ts`
- Create: `packages/api-client/src/msw/handlers.ts`
- Create: `packages/api-client/src/msw/handlers.test.ts`
- Create: `packages/api-client/src/msw/server.ts`
- Create: `packages/api-client/src/index.ts`

- [ ] **Step 5.1: Create `packages/api-client/package.json`**

```json
{
  "name": "@repo/api-client",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./msw": "./src/msw/server.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@repo/database-types": "workspace:*",
    "@repo/validation": "workspace:*",
    "@supabase/supabase-js": "^2.45.0"
  },
  "peerDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react": "^18.3.0 || ^19.0.0"
  },
  "devDependencies": {
    "@repo/config-typescript": "workspace:*",
    "@tanstack/react-query": "^5.59.0",
    "@types/react": "^18.3.0",
    "msw": "^2.6.0",
    "react": "^18.3.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 5.2: Create `packages/api-client/tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "noEmit": true,
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src", "vitest.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 5.3: Create `packages/api-client/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 5.4: Write failing test `packages/api-client/src/client.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { createSupabaseBrowserClient } from "./client.js";

describe("createSupabaseBrowserClient", () => {
  it("returns a client exposing auth + from APIs", () => {
    const client = createSupabaseBrowserClient(
      "https://example.supabase.co",
      "anon-key",
    );
    expect(typeof client.auth.getSession).toBe("function");
    expect(typeof client.from).toBe("function");
  });

  it("throws if url or key is missing", () => {
    expect(() => createSupabaseBrowserClient("", "k")).toThrow();
    expect(() =>
      createSupabaseBrowserClient("https://example.supabase.co", ""),
    ).toThrow();
  });
});
```

- [ ] **Step 5.5: Run test — expect FAIL**

Run: `pnpm --filter @repo/api-client test`

- [ ] **Step 5.6: Implement `packages/api-client/src/client.ts`**

```ts
import type { Database } from "@repo/database-types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AppSupabaseClient = SupabaseClient<Database>;

export function createSupabaseBrowserClient(
  url: string,
  anonKey: string,
): AppSupabaseClient {
  if (!url) throw new Error("SUPABASE_URL is required");
  if (!anonKey) throw new Error("SUPABASE_ANON_KEY is required");
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
```

- [ ] **Step 5.7: Run test — expect PASS**

Run: `pnpm --filter @repo/api-client test`

- [ ] **Step 5.8: Write test `packages/api-client/src/query-keys.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys.js";

describe("queryKeys", () => {
  it("produces stable, hierarchical keys", () => {
    expect(queryKeys.session()).toEqual(["session"]);
    expect(queryKeys.items.all()).toEqual(["items"]);
    expect(queryKeys.items.list("u1")).toEqual(["items", "list", "u1"]);
    expect(queryKeys.items.detail("id1")).toEqual(["items", "detail", "id1"]);
    expect(queryKeys.profile("u1")).toEqual(["profile", "u1"]);
  });
});
```

- [ ] **Step 5.9: Implement `packages/api-client/src/query-keys.ts`**

```ts
export const queryKeys = {
  session: () => ["session"] as const,
  profile: (userId: string) => ["profile", userId] as const,
  items: {
    all: () => ["items"] as const,
    list: (userId: string) => ["items", "list", userId] as const,
    detail: (itemId: string) => ["items", "detail", itemId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
```

- [ ] **Step 5.10: Run test — expect PASS**

Run: `pnpm --filter @repo/api-client test`

- [ ] **Step 5.11: Implement hook scaffolds (not unit-tested this phase)**

`packages/api-client/src/hooks/use-session.ts`:
```ts
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";

import type { AppSupabaseClient } from "../client.js";
import { queryKeys } from "../query-keys.js";

export function useSession(client: AppSupabaseClient) {
  return useQuery<Session | null>({
    queryKey: queryKeys.session(),
    queryFn: async () => {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });
}
```

`packages/api-client/src/hooks/use-items.ts`:
```ts
import { useQuery } from "@tanstack/react-query";

import type { AppSupabaseClient } from "../client.js";
import { queryKeys } from "../query-keys.js";

export function useItems(client: AppSupabaseClient, userId: string) {
  return useQuery({
    queryKey: queryKeys.items.list(userId),
    queryFn: async () => {
      const { data, error } = await client
        .from("items")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(userId),
  });
}
```

- [ ] **Step 5.12: Write failing test `packages/api-client/src/msw/handlers.test.ts`**

```ts
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { setupServer } from "msw/node";

import { itemsListHandler } from "./handlers.js";

const server = setupServer(itemsListHandler);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe("itemsListHandler", () => {
  it("returns a JSON array for GET /rest/v1/items", async () => {
    const res = await fetch(
      "https://example.supabase.co/rest/v1/items?select=*",
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]?.id).toBeTypeOf("string");
  });
});
```

- [ ] **Step 5.13: Implement `packages/api-client/src/msw/handlers.ts`**

```ts
import { http, HttpResponse } from "msw";

export const itemsListHandler = http.get(
  "*/rest/v1/items",
  () =>
    HttpResponse.json([
      {
        id: "00000000-0000-0000-0000-000000000001",
        user_id: "00000000-0000-0000-0000-000000000002",
        title: "Seed item",
        description: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]),
);

export const handlers = [itemsListHandler];
```

- [ ] **Step 5.14: Implement `packages/api-client/src/msw/server.ts`**

```ts
import { setupServer } from "msw/node";

import { handlers } from "./handlers.js";

export function createMockServer() {
  return setupServer(...handlers);
}

export { handlers };
```

- [ ] **Step 5.15: Run handler test — expect PASS**

Run: `pnpm --filter @repo/api-client test`

- [ ] **Step 5.16: Create barrel `packages/api-client/src/index.ts`**

```ts
export { createSupabaseBrowserClient } from "./client.js";
export type { AppSupabaseClient } from "./client.js";
export { queryKeys } from "./query-keys.js";
export type { QueryKeys } from "./query-keys.js";
export { useSession } from "./hooks/use-session.js";
export { useItems } from "./hooks/use-items.js";
```

- [ ] **Step 5.17: Install + typecheck**

```
pnpm install
pnpm --filter @repo/api-client typecheck
pnpm --filter @repo/api-client test
```
Expected: all pass. (Note: `useItems` typing may surface a placeholder-type narrowing issue against `Database = Record<string, never>`. If it does, cast inside `useItems` with `client.from("items" as never)` to keep compilation clean — downstream apps regenerate real types.)

- [ ] **Step 5.18: Commit**

```
git add packages/api-client pnpm-lock.yaml
git commit -m "feat(api-client): Supabase client factory, query keys, hooks, MSW handlers"
```

---

## Task 6: Phase gate — monorepo-wide lint/typecheck/test/format + tag

**Files:**
- Modify (if drift): `packages/*/package.json` or `tsconfig.json` as surfaced by the gate

- [ ] **Step 6.1: Ensure fresh install at root**

Run from monorepo root:
```
pnpm install
```
Expected: resolves all new workspace deps, no errors.

- [ ] **Step 6.2: Run the full test suite**

Run: `pnpm test`
Expected: turbo runs test across all workspace packages — `@repo/validation`, `@repo/i18n`, `@repo/tailwind-config`, `@repo/analytics`, `@repo/api-client`, `@repo/database-types` all green. Exit 0.

- [ ] **Step 6.3: Run typecheck**

Run: `pnpm typecheck`
Expected: root + all packages pass. Exit 0.

- [ ] **Step 6.4: Run lint**

Run: `pnpm lint`
Expected: 0 errors. Warnings are allowed (existing seed script already emits `no-console` warnings).

- [ ] **Step 6.5: Run format check**

Run: `pnpm format:check`
Expected: exit 0. If it fails, run `pnpm format` and commit the formatting fixes as part of Step 6.7.

- [ ] **Step 6.6: Verify commit count**

Run: `git log phase-2-complete..HEAD --oneline`
Expected: at least 5 feature commits (one per package) plus the initial plan commit — 6 or more commits total.

- [ ] **Step 6.7: Tag phase-3-complete**

```
git tag phase-3-complete
git tag | grep phase
```
Expected: output includes `phase-1-complete`, `phase-2-complete`, `phase-3-complete`.

---

## Self-Review Notes

- All 5 packages from the spec are scoped as independent tasks (Tasks 1–5) with at least one passing unit test each — matches the "Done when" criterion in design §9 Phase 3.
- `packages/ui-web` and `packages/ui-native` from the repo-layout table are NOT in scope for Phase 3 — the design's Phase 3 bullet explicitly lists only validation, api-client, i18n, analytics, tailwind-config. UI packages will be set up alongside the apps in Phases 4 and 5.
- Dependency edges follow design §3.1: only `api-client` → `database-types` + `validation` is introduced. No `apps/*` edges.
- Every code step contains complete code (no placeholders). Test steps and expected-output steps are separated so Red → Green → Refactor is observable.
- Analytics error-catching behavior is tested against a deliberately broken provider to confirm the "one bad provider doesn't break the rest" guarantee.
- i18n parity test enumerates namespaces and iterates locales — adding a new locale or namespace automatically extends coverage.
- api-client hook scaffolds (`useSession`, `useItems`) are implemented but intentionally not unit-tested this phase (would require `jsdom` + `@testing-library/react` + React-Query provider harness). Apps will exercise them end-to-end in Phases 4–5.
