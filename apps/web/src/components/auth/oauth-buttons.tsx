"use client";

import { useTransition } from "react";

import { createBrowserClient } from "@/lib/supabase/browser";

type Provider = "google" | "github";

export function OAuthButtons({
  googleLabel,
  githubLabel,
}: {
  googleLabel: string;
  githubLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  const go = (provider: Provider) => {
    startTransition(async () => {
      const supabase = createBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => go("google")}
        disabled={pending}
        className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        {googleLabel}
      </button>
      <button
        type="button"
        onClick={() => go("github")}
        disabled={pending}
        className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        {githubLabel}
      </button>
    </div>
  );
}
