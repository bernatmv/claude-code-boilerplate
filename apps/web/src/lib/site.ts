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
