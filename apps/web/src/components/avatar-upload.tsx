"use client";

import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_BYTES,
  useProfile,
  useUploadAvatar,
  type AppSupabaseClient,
} from "@repo/api-client";
import { useMemo, useRef, useState } from "react";

import { createBrowserClient } from "@/lib/supabase/browser";

export function AvatarUpload({ userId }: { userId: string }) {
  const client: AppSupabaseClient = useMemo(() => createBrowserClient(), []);
  const { data: profile } = useProfile(client, userId);
  const upload = useUploadAvatar(client, userId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const contentType = file.type;
    if (!ALLOWED_AVATAR_TYPES.includes(contentType as (typeof ALLOWED_AVATAR_TYPES)[number])) {
      setError("Only PNG, JPEG, or WEBP images are supported.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError(`Max size is ${MAX_AVATAR_BYTES / 1024 / 1024} MB.`);
      return;
    }
    try {
      await upload.mutateAsync({ file, contentType });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 overflow-hidden rounded-full border bg-neutral-100">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <label className="cursor-pointer rounded-md border px-3 py-2 text-sm">
        {upload.isPending ? "Uploading…" : "Change avatar"}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_AVATAR_TYPES.join(",")}
          onChange={onChange}
          className="hidden"
          disabled={upload.isPending}
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
