import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AppSupabaseClient } from "../client.js";
import { queryKeys } from "../query-keys.js";

export const AVATARS_BUCKET = "avatars";
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export function avatarObjectPath(userId: string, contentType: string): string {
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  return `${userId}/avatar.${ext}`;
}

export async function uploadAvatar(
  client: AppSupabaseClient,
  userId: string,
  file: Blob,
  contentType: string,
): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.includes(contentType as (typeof ALLOWED_AVATAR_TYPES)[number])) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error(`File exceeds ${MAX_AVATAR_BYTES} bytes`);
  }

  const path = avatarObjectPath(userId, contentType);
  const { error: uploadError } = await client.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, { contentType, upsert: true, cacheControl: "3600" });
  if (uploadError) throw uploadError;

  const { data } = client.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await client
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", userId);
  if (profileError) throw profileError;

  return publicUrl;
}

export function useUploadAvatar(client: AppSupabaseClient, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { file: Blob; contentType: string }) =>
      uploadAvatar(client, userId, input.file, input.contentType),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
  });
}
