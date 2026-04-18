# Phase 4 — Web App Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `apps/web` as a Next.js 15 App Router application with Tailwind, bilingual routing (en/es), theme switching, a landing page, an MDX article pipeline with two seed articles, SEO endpoints (sitemap, robots, RSS, OG image, `llms.txt`), JSON-LD helpers, and a Playwright smoke test.

**Architecture:**

- Next.js 15 App Router, TypeScript, React 18. Locale segment `app/[locale]/` drives routing. `next-intl` middleware redirects `/` to the best-match locale and persists a `NEXT_LOCALE` cookie.
- Styling via Tailwind CSS 3, extending `@repo/tailwind-config`'s preset. Theme switching via `next-themes` using `class` strategy on `<html>`.
- MDX articles live as files under `apps/web/content/articles/{locale}/{slug}.mdx` and are read at build/runtime via `fs` + `gray-matter`. No CMS. `next-mdx-remote/rsc` renders server-side.
- SEO endpoints are Route Handlers under `app/`: `sitemap.ts`, `robots.ts`, `llms.txt/route.ts`, `llms-full.txt/route.ts`, `rss.xml/route.ts`, `opengraph-image.tsx`.
- JSON-LD helpers are pure TypeScript functions returning schema.org objects — injected via `<script type="application/ld+json">` in layouts.
- Playwright covers the Phase-4 smoke: landing + one article render successfully in both locales at 375/768/1280.
- We intentionally DO NOT run `npx shadcn init` (interactive). We hand-write the equivalent `components.json`, `cn` utility, and one reference primitive (`Button`) that the later phases can extend by running `npx shadcn add <component>`.

**Tech Stack:** Next.js 15, React 18, TypeScript 5, Tailwind 3, next-intl 3, next-themes 0.4, next-mdx-remote 5, gray-matter 4, `@vercel/og` 0.6, Playwright 1.49, `clsx` + `tailwind-merge`.

**Scope adjustment vs design:** Design §9 Phase 4 mentions "Lighthouse Perf/SEO/A11y ≥ 90 locally". Lighthouse requires Chrome + lighthouse CLI and is highly environment-dependent; we include an optional manual-verify step but do NOT gate the phase on a specific score. Playwright smoke + SEO endpoint validity checks serve as the automated gate.

---

## File Structure

```
apps/web/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── next-env.d.ts                 # auto-generated, committed
├── tailwind.config.ts
├── postcss.config.mjs
├── playwright.config.ts
├── .gitignore
├── src/
│   ├── middleware.ts             # next-intl + locale cookie
│   ├── i18n.ts                   # next-intl config (getRequestConfig)
│   ├── navigation.ts             # locale-aware Link/redirect re-exports
│   ├── lib/
│   │   ├── cn.ts                 # clsx + tailwind-merge helper
│   │   ├── site.ts               # SITE_URL, SITE_NAME, author
│   │   ├── jsonld.ts             # organizationSchema, websiteSchema, articleSchema
│   │   └── articles.ts           # fs-based article loader (listArticles, getArticle)
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx        # shadcn-style reference primitive
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── locale-switcher.tsx
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── styles/
│   │   └── globals.css
│   └── app/
│       ├── layout.tsx            # root layout — delegates to [locale] for <html lang>
│       ├── not-found.tsx
│       ├── robots.ts
│       ├── sitemap.ts
│       ├── opengraph-image.tsx
│       ├── llms.txt/
│       │   └── route.ts
│       ├── llms-full.txt/
│       │   └── route.ts
│       ├── rss.xml/
│       │   └── route.ts
│       └── [locale]/
│           ├── layout.tsx        # <html lang=locale> + providers + navbar/footer
│           ├── page.tsx          # landing
│           ├── articles/
│           │   ├── page.tsx      # index
│           │   └── [slug]/
│           │       └── page.tsx  # detail — articleSchema JSON-LD
│           └── not-found.tsx
├── components.json               # shadcn config (non-interactive)
├── content/
│   └── articles/
│       ├── en/
│       │   ├── welcome.mdx
│       │   └── ship-fast.mdx
│       └── es/
│           ├── welcome.mdx
│           └── ship-fast.mdx
└── e2e/
    └── smoke.spec.ts
```

---

## Task 1: Next.js app skeleton + root layout

**Files:**

- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.mjs`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/src/styles/globals.css`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/.gitignore`
- Create: `apps/web/src/lib/cn.ts`
- Create: `apps/web/src/lib/site.ts`
- Create: `apps/web/components.json`

- [ ] **Step 1.1: Create `apps/web/package.json`**

```json
{
  "name": "@apps/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:install": "playwright install --with-deps chromium"
  },
  "dependencies": {
    "@repo/analytics": "workspace:*",
    "@repo/api-client": "workspace:*",
    "@repo/i18n": "workspace:*",
    "@repo/tailwind-config": "workspace:*",
    "@repo/validation": "workspace:*",
    "@vercel/og": "^0.6.0",
    "clsx": "^2.1.0",
    "gray-matter": "^4.0.3",
    "lucide-react": "^0.460.0",
    "next": "^15.0.3",
    "next-intl": "^3.25.0",
    "next-mdx-remote": "^5.0.0",
    "next-themes": "^0.4.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@repo/config-typescript": "workspace:*",
    "@tanstack/react-query": "^5.59.0",
    "@types/node": "^22.10.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 1.2: Create `apps/web/tsconfig.json`**

```json
{
  "extends": "@repo/config-typescript/base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "incremental": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "e2e"]
}
```

- [ ] **Step 1.3: Create `apps/web/next.config.mjs`**

```js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: false,
  },
  pageExtensions: ["ts", "tsx"],
  transpilePackages: [
    "@repo/analytics",
    "@repo/api-client",
    "@repo/i18n",
    "@repo/tailwind-config",
    "@repo/validation",
  ],
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 1.4: Create `apps/web/postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 1.5: Create `apps/web/tailwind.config.ts`**

```ts
import preset from "@repo/tailwind-config/preset";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "./content/**/*.{md,mdx}"],
  darkMode: "class",
  presets: [preset],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
      },
    },
  },
};

export default config;
```

- [ ] **Step 1.6: Create `apps/web/src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --border: 214 32% 91%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
  }

  .dark {
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --border: 217 33% 17%;
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
  }

  html {
    color-scheme: light dark;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings:
      "rlig" 1,
      "calt" 1;
  }
}
```

- [ ] **Step 1.7: Create `apps/web/.gitignore`**

```
# next
.next/
next-env.d.ts
out/

# playwright
test-results/
playwright-report/
blob-report/
playwright/.cache/

# env
.env*.local
```

- [ ] **Step 1.8: Create `apps/web/src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 1.9: Create `apps/web/src/lib/site.ts`**

```ts
export const site = {
  name: "Claude Code Boilerplate",
  description: "A full-stack web + mobile boilerplate with Supabase, Next.js, and Expo.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    name: "Claude Code Boilerplate",
    url: "https://claude.com/code",
  },
  locales: ["en", "es"] as const,
  defaultLocale: "en" as const,
};

export type Locale = (typeof site.locales)[number];
```

- [ ] **Step 1.10: Create `apps/web/components.json` (shadcn manifest)**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/components/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 1.11: Create minimal root `apps/web/src/app/layout.tsx`**

```tsx
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

Note: the real `<html>` / `<body>` elements live in `[locale]/layout.tsx` (Task 3). The root layout is a pass-through so Next.js treats `[locale]` as the true root per next-intl convention.

- [ ] **Step 1.12: Install + verify builds**

Run: `pnpm install && pnpm --filter @apps/web typecheck`
Expected: `typecheck` exits 0.

- [ ] **Step 1.13: Commit**

```
git add apps/web pnpm-lock.yaml
git commit -m "feat(web): Next.js 15 app skeleton with Tailwind + shared configs"
```

---

## Task 2: Reference shadcn primitive — `Button`

**Files:**

- Create: `apps/web/src/components/ui/button.tsx`

- [ ] **Step 2.1: Create `apps/web/src/components/ui/button.tsx`**

```tsx
import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "default" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  default: "bg-brand-600 text-white hover:bg-brand-700",
  ghost: "hover:bg-muted",
  outline: "border border-border hover:bg-muted",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
    );
  },
);
Button.displayName = "Button";
```

- [ ] **Step 2.2: Add `@radix-ui/react-slot` to `apps/web/package.json` dependencies**

Edit the `dependencies` block to add:

```json
"@radix-ui/react-slot": "^1.1.0",
```

- [ ] **Step 2.3: Install + typecheck**

Run: `pnpm install && pnpm --filter @apps/web typecheck`
Expected: exit 0.

- [ ] **Step 2.4: Commit**

```
git add apps/web/src/components/ui/button.tsx apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): add Button component (shadcn reference primitive)"
```

---

## Task 3: i18n middleware + `[locale]` layout

**Files:**

- Create: `apps/web/src/i18n.ts`
- Create: `apps/web/src/navigation.ts`
- Create: `apps/web/src/middleware.ts`
- Create: `apps/web/src/app/[locale]/layout.tsx`
- Create: `apps/web/src/app/[locale]/page.tsx`
- Create: `apps/web/src/app/[locale]/not-found.tsx`
- Create: `apps/web/src/app/not-found.tsx`

- [ ] **Step 3.1: Create `apps/web/src/i18n.ts`**

```ts
import { LOCALES, messages, type Locale } from "@repo/i18n";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (LOCALES as readonly string[]).includes(requested ?? "")
    ? (requested as Locale)
    : undefined;
  if (!locale) notFound();

  const ns = messages[locale];
  return {
    locale,
    messages: {
      common: ns.common,
      auth: ns.auth,
      errors: ns.errors,
    },
  };
});
```

- [ ] **Step 3.2: Create `apps/web/src/navigation.ts`**

```ts
import { LOCALES } from "@repo/i18n";
import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  localeDetection: true,
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 3.3: Create `apps/web/src/middleware.ts`**

```ts
import createMiddleware from "next-intl/middleware";

import { routing } from "./navigation";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 3.4: Create `apps/web/src/app/[locale]/layout.tsx`**

```tsx
import { LOCALES, type Locale } from "@repo/i18n";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();
  const typedLocale = locale as Locale;

  const messages = await getMessages();

  return (
    <html lang={typedLocale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={typedLocale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Navbar locale={typedLocale} />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3.5: Create `apps/web/src/app/[locale]/page.tsx` (landing)**

```tsx
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { organizationSchema, websiteSchema } from "@/lib/jsonld";

export default async function LandingPage() {
  const t = await getTranslations("common");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema(), websiteSchema()]),
        }}
      />
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("appName")}</h1>
        <p className="max-w-2xl text-muted-foreground">
          A full-stack starter that ships web + iOS + Android from one codebase.
        </p>
        <Button asChild size="lg">
          <Link href="/articles">{t("nav.home")} →</Link>
        </Button>
      </section>
    </>
  );
}
```

- [ ] **Step 3.6: Create `apps/web/src/app/[locale]/not-found.tsx`**

```tsx
export default function LocaleNotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Page not found.</p>
    </section>
  );
}
```

- [ ] **Step 3.7: Create `apps/web/src/app/not-found.tsx`**

```tsx
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <section className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-3xl font-bold">404</h1>
          <p className="mt-2">Page not found.</p>
        </section>
      </body>
    </html>
  );
}
```

- [ ] **Step 3.8: Commit (deferred until providers land in Task 4/5)**

Skip for now; this task compiles only after Task 5 adds Navbar/Footer/ThemeProvider. Move to Task 4.

---

## Task 4: Theme provider + toggle

**Files:**

- Create: `apps/web/src/components/theme-provider.tsx`
- Create: `apps/web/src/components/theme-toggle.tsx`

- [ ] **Step 4.1: Create `apps/web/src/components/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
```

- [ ] **Step 4.2: Create `apps/web/src/components/theme-toggle.tsx`**

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={() => setTheme(next)}>
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
```

---

## Task 5: Layout shell — Navbar, Footer, LocaleSwitcher

**Files:**

- Create: `apps/web/src/components/locale-switcher.tsx`
- Create: `apps/web/src/components/navbar.tsx`
- Create: `apps/web/src/components/footer.tsx`

- [ ] **Step 5.1: Create `apps/web/src/components/locale-switcher.tsx`**

```tsx
"use client";

import { LOCALES, type Locale } from "@repo/i18n";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/navigation";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      aria-label="Change language"
      value={current}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Locale;
        startTransition(() => {
          router.replace(pathname, { locale: next });
        });
      }}
      className="h-8 rounded-md border border-border bg-background px-2 text-sm"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 5.2: Create `apps/web/src/components/navbar.tsx`**

```tsx
import type { Locale } from "@repo/i18n";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "@/navigation";

export async function Navbar({ locale }: { locale: Locale }) {
  const t = await getTranslations("common");
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          {t("appName")}
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/articles" className="px-3 py-1 text-sm hover:text-foreground/80">
            {t("nav.home")}
          </Link>
          <LocaleSwitcher current={locale} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 5.3: Create `apps/web/src/components/footer.tsx`**

```tsx
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <a href={site.author.url} rel="noreferrer" className="hover:text-foreground">
          {site.author.name}
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5.4: Install + build (first compile of [locale] tree)**

Run: `pnpm install && pnpm --filter @apps/web typecheck`
Expected: exit 0. Errors here usually mean a missing import or an incorrect `params` typing — fix before proceeding.

- [ ] **Step 5.5: Run dev server smoke**

Run in background: `pnpm --filter @apps/web dev`
In another shell: `curl -sI http://localhost:3000/en | head -1 && curl -sI http://localhost:3000/es | head -1`
Expected: both return `HTTP/1.1 200`.
Then stop the dev server.

- [ ] **Step 5.6: Commit**

```
git add apps/web pnpm-lock.yaml
git commit -m "feat(web): locale routing, theme provider, navbar and footer"
```

---

## Task 6: JSON-LD helpers + `site.ts` consumers

**Files:**

- Create: `apps/web/src/lib/jsonld.ts`

- [ ] **Step 6.1: Create `apps/web/src/lib/jsonld.ts`**

```ts
import { site } from "./site";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    sameAs: [site.author.url],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
  };
}

export interface ArticleSchemaInput {
  title: string;
  description: string;
  slug: string;
  locale: string;
  publishedAt: string;
  updatedAt?: string;
  authorName: string;
}

export function articleSchema(input: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    inLanguage: input.locale,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/${input.locale}/articles/${input.slug}`,
    },
  };
}
```

- [ ] **Step 6.2: Typecheck + commit**

```
pnpm --filter @apps/web typecheck
git add apps/web/src/lib/jsonld.ts
git commit -m "feat(web): JSON-LD helpers (organization, website, article)"
```

---

## Task 7: MDX articles — loader + seed content + index + detail routes

**Files:**

- Create: `apps/web/content/articles/en/welcome.mdx`
- Create: `apps/web/content/articles/en/ship-fast.mdx`
- Create: `apps/web/content/articles/es/welcome.mdx`
- Create: `apps/web/content/articles/es/ship-fast.mdx`
- Create: `apps/web/src/lib/articles.ts`
- Create: `apps/web/src/app/[locale]/articles/page.tsx`
- Create: `apps/web/src/app/[locale]/articles/[slug]/page.tsx`

- [ ] **Step 7.1: Seed article `apps/web/content/articles/en/welcome.mdx`**

```mdx
---
title: Welcome
description: A quick tour of this starter.
publishedAt: "2026-04-18"
author: Claude Code Boilerplate
---

## What's inside

This starter gives you a Next.js + Tailwind web app, an Expo mobile app, and
Supabase-backed data — all wired together with shared TypeScript packages.

Keep reading to see how fast you can ship.
```

- [ ] **Step 7.2: Seed article `apps/web/content/articles/en/ship-fast.mdx`**

```mdx
---
title: Ship fast
description: From zero to production, without the yak shaving.
publishedAt: "2026-04-18"
author: Claude Code Boilerplate
---

## Why this starter

Every time you start a project you rebuild the same plumbing: auth, i18n,
deploys, push notifications. This starter does it once so your next app is
about the thing you actually want to build.
```

- [ ] **Step 7.3: Seed article `apps/web/content/articles/es/welcome.mdx`**

```mdx
---
title: Bienvenido
description: Un recorrido rápido por este starter.
publishedAt: "2026-04-18"
author: Claude Code Boilerplate
---

## Qué incluye

Este starter te da una app web con Next.js + Tailwind, una app móvil con Expo
y datos en Supabase — todo unido por paquetes TypeScript compartidos.

Sigue leyendo para ver lo rápido que puedes lanzar.
```

- [ ] **Step 7.4: Seed article `apps/web/content/articles/es/ship-fast.mdx`**

```mdx
---
title: Lanza rápido
description: De cero a producción, sin perder tiempo.
publishedAt: "2026-04-18"
author: Claude Code Boilerplate
---

## Por qué este starter

Cada vez que empiezas un proyecto reconstruyes la misma fontanería: auth, i18n,
despliegues, notificaciones push. Este starter lo hace una sola vez para que
tu próxima app trate de lo que realmente quieres construir.
```

- [ ] **Step 7.5: Create article loader `apps/web/src/lib/articles.ts`**

```ts
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";

export interface ArticleFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
}

export interface ArticleSummary extends ArticleFrontmatter {
  slug: string;
  locale: string;
}

export interface Article extends ArticleSummary {
  content: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "articles");

function parse(raw: string): { data: ArticleFrontmatter; content: string } {
  const { data, content } = matter(raw);
  const d = data as Partial<ArticleFrontmatter>;
  if (!d.title || !d.description || !d.publishedAt || !d.author) {
    throw new Error("Article frontmatter missing required fields");
  }
  return {
    data: {
      title: d.title,
      description: d.description,
      publishedAt: d.publishedAt,
      updatedAt: d.updatedAt,
      author: d.author,
    },
    content,
  };
}

export async function listArticles(locale: string): Promise<ArticleSummary[]> {
  const dir = path.join(CONTENT_ROOT, locale);
  const files = await readdir(dir);
  const out: ArticleSummary[] = [];
  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const raw = await readFile(path.join(dir, file), "utf8");
    const { data } = parse(raw);
    out.push({ slug, locale, ...data });
  }
  return out.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticle(locale: string, slug: string): Promise<Article | null> {
  try {
    const raw = await readFile(path.join(CONTENT_ROOT, locale, `${slug}.mdx`), "utf8");
    const { data, content } = parse(raw);
    return { slug, locale, content, ...data };
  } catch {
    return null;
  }
}
```

- [ ] **Step 7.6: Create `apps/web/src/app/[locale]/articles/page.tsx`**

```tsx
import type { Metadata } from "next";

import { Link } from "@/navigation";
import { listArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles",
};

export default async function ArticlesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const articles = await listArticles(locale);
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Articles</h1>
      <ul className="mt-8 space-y-6">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/articles/${a.slug}`}
              className="group block rounded-lg border border-border p-4 transition-colors hover:bg-muted"
            >
              <h2 className="text-xl font-semibold group-hover:underline">{a.title}</h2>
              <p className="mt-1 text-muted-foreground">{a.description}</p>
              <time className="mt-2 block text-xs text-muted-foreground">{a.publishedAt}</time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 7.7: Create `apps/web/src/app/[locale]/articles/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { articleSchema } from "@/lib/jsonld";
import { getArticle, listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) params.push({ locale, slug: a.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${site.url}/${locale}/articles/${slug}`,
    },
  };
}

export default async function ArticleDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticle(locale, slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 prose prose-slate dark:prose-invert">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              title: article.title,
              description: article.description,
              slug: article.slug,
              locale: article.locale,
              publishedAt: article.publishedAt,
              updatedAt: article.updatedAt,
              authorName: article.author,
            }),
          ),
        }}
      />
      <header>
        <h1>{article.title}</h1>
        <p className="lead">{article.description}</p>
        <time className="block text-sm text-muted-foreground">{article.publishedAt}</time>
      </header>
      <MDXRemote source={article.content} />
    </article>
  );
}
```

- [ ] **Step 7.8: Typecheck + commit**

```
pnpm --filter @apps/web typecheck
git add apps/web
git commit -m "feat(web): MDX article pipeline with en/es seed articles"
```

---

## Task 8: SEO endpoints — robots, sitemap, llms.txt, RSS, OG image

**Files:**

- Create: `apps/web/src/app/robots.ts`
- Create: `apps/web/src/app/sitemap.ts`
- Create: `apps/web/src/app/llms.txt/route.ts`
- Create: `apps/web/src/app/llms-full.txt/route.ts`
- Create: `apps/web/src/app/rss.xml/route.ts`
- Create: `apps/web/src/app/opengraph-image.tsx`

- [ ] **Step 8.1: Create `apps/web/src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 8.2: Create `apps/web/src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";

import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of site.locales) {
    entries.push({
      url: `${site.url}/${locale}`,
      changeFrequency: "weekly",
      priority: 1,
    });
    entries.push({
      url: `${site.url}/${locale}/articles`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    const articles = await listArticles(locale);
    for (const a of articles) {
      entries.push({
        url: `${site.url}/${locale}/articles/${a.slug}`,
        lastModified: a.updatedAt ?? a.publishedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
```

- [ ] **Step 8.3: Create `apps/web/src/app/llms.txt/route.ts`**

```ts
import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export async function GET() {
  const lines: string[] = [`# ${site.name}`, "", site.description, "", "## Articles", ""];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) {
      lines.push(`- [${a.title}](${site.url}/${locale}/articles/${a.slug}): ${a.description}`);
    }
  }
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

- [ ] **Step 8.4: Create `apps/web/src/app/llms-full.txt/route.ts`**

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";

import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

export async function GET() {
  const chunks: string[] = [`# ${site.name}`, "", site.description, ""];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) {
      const raw = await readFile(
        path.join(process.cwd(), "content", "articles", locale, `${a.slug}.mdx`),
        "utf8",
      );
      chunks.push(`\n---\n\n# ${a.title} (${locale})\n\n> ${a.description}\n\n${raw}\n`);
    }
  }
  return new Response(chunks.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

- [ ] **Step 8.5: Create `apps/web/src/app/rss.xml/route.ts`**

```ts
import { listArticles } from "@/lib/articles";
import { site } from "@/lib/site";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items: string[] = [];
  for (const locale of site.locales) {
    const articles = await listArticles(locale);
    for (const a of articles) {
      const url = `${site.url}/${locale}/articles/${a.slug}`;
      items.push(
        [
          "<item>",
          `<title>${escape(a.title)}</title>`,
          `<link>${url}</link>`,
          `<guid>${url}</guid>`,
          `<description>${escape(a.description)}</description>`,
          `<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>`,
          `<language>${locale}</language>`,
          "</item>",
        ].join(""),
      );
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${escape(site.name)}</title>
  <link>${site.url}</link>
  <description>${escape(site.description)}</description>
  ${items.join("\n  ")}
</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

- [ ] **Step 8.6: Create `apps/web/src/app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)",
        color: "white",
        fontSize: 72,
        fontWeight: 700,
        padding: "80px",
        textAlign: "center",
      }}
    >
      <div>{site.name}</div>
      <div style={{ fontSize: 28, marginTop: 32, fontWeight: 400, opacity: 0.85 }}>
        {site.description}
      </div>
    </div>,
    size,
  );
}
```

Note: `@vercel/og` is re-exported as `next/og` in Next 15; the package is still declared in `dependencies` so the types resolve.

- [ ] **Step 8.7: Typecheck + commit**

```
pnpm --filter @apps/web typecheck
git add apps/web
git commit -m "feat(web): SEO endpoints — robots, sitemap, llms.txt, RSS, OG image"
```

---

## Task 9: Playwright smoke test

**Files:**

- Create: `apps/web/playwright.config.ts`
- Create: `apps/web/e2e/smoke.spec.ts`

- [ ] **Step 9.1: Create `apps/web/playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile-375", use: { ...devices["iPhone 12"] } },
    { name: "tablet-768", use: { viewport: { width: 768, height: 1024 } } },
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 9.2: Create `apps/web/e2e/smoke.spec.ts`**

```ts
import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"] as const) {
  test(`landing renders (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test(`article index + detail render (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}/articles`);
    const firstArticle = page.getByRole("link", { name: /welcome|bienvenido/i }).first();
    await firstArticle.click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/articles/welcome$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test(`seo endpoints respond (${locale})`, async ({ request }) => {
    for (const path of ["/sitemap.xml", "/robots.txt", "/rss.xml", "/llms.txt"]) {
      const res = await request.get(path);
      expect(res.status(), `${path} status`).toBe(200);
    }
  });
}
```

- [ ] **Step 9.3: Install Playwright browsers (one-time, local only)**

Run: `pnpm --filter @apps/web exec playwright install --with-deps chromium`
Expected: chromium installed. (In CI, handled separately.)

- [ ] **Step 9.4: Run Playwright suite**

Run: `pnpm --filter @apps/web test:e2e`
Expected: all tests pass (6 smoke × 3 viewport projects).

- [ ] **Step 9.5: Commit**

```
git add apps/web
git commit -m "test(web): Playwright smoke for landing, articles, SEO endpoints"
```

---

## Task 10: Phase gate + tag

- [ ] **Step 10.1: Clean install + full gate**

```
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm format:check
```

Expected: all exit 0. `pnpm test` does NOT run Playwright (that is `test:e2e`).

- [ ] **Step 10.2: Build production bundle**

Run: `pnpm --filter @apps/web build`
Expected: `.next/` produced, exit 0, no ESLint errors surfaced.

- [ ] **Step 10.3: Commit count + tag**

```
git log phase-3-complete..HEAD --oneline
git tag phase-4-complete
```

Expected: ≥9 new commits (plan + 8+ feature commits).

---

## Self-Review Notes

- All Phase-4 design bullets are accounted for: Next 15 skeleton (T1), shadcn primitive (T2), locale middleware + routing (T3), theme provider (T4), layout shell (T5), JSON-LD helpers (T6), MDX articles with en/es seeds (T7), SEO endpoints incl. RSS + OG (T8), Playwright smoke covering both locales at 3 viewports (T9), phase gate (T10).
- Lighthouse ≥90 requirement is intentionally deferred to manual verification since the toolchain is flaky from the CLI and the user can run `npx lighthouse http://localhost:3000/en` independently; the automated gate uses Playwright smoke + endpoint validity instead.
- Task 3's commit step is deliberately deferred until Task 5 lands so the tree compiles before committing.
- `@/` path alias maps to `src/` via `tsconfig.json` paths + Next.js default resolver.
- Article loader validates required frontmatter fields at read time — throws loudly rather than rendering broken pages.
- No API routes are added: Phase 4 is UI + SEO only. Supabase consumption via `@repo/api-client` is a Phase 6+ concern.
