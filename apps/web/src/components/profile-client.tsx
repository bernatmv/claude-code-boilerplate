"use client";

import { useProfile, useUpdateProfile, type AppSupabaseClient } from "@repo/api-client";
import { useEffect, useMemo, useState } from "react";

import { createBrowserClient } from "@/lib/supabase/browser";

export function ProfileClient({ userId }: { userId: string }) {
  const client: AppSupabaseClient = useMemo(() => createBrowserClient(), []);
  const { data: profile, isLoading } = useProfile(client, userId);
  const update = useUpdateProfile(client, userId);

  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile?.display_name]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    try {
      await update.mutateAsync({ display_name: displayName.trim() || null });
      setStatus("Saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-md border p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>Display name</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={isLoading ? "Loading…" : "Your name"}
          className="rounded-md border px-3 py-2"
          minLength={2}
          maxLength={50}
        />
      </label>
      <button
        type="submit"
        disabled={update.isPending}
        className="self-start rounded-md bg-brand-500 px-4 py-2 text-white disabled:opacity-60"
      >
        {update.isPending ? "…" : "Save"}
      </button>
      {status ? <p className="text-sm text-neutral-600">{status}</p> : null}
    </form>
  );
}
