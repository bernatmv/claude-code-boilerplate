import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@repo/validation";

import type { AppSupabaseClient } from "../client.js";
import { queryKeys } from "../query-keys.js";

export function useProfile(client: AppSupabaseClient, userId: string) {
  return useQuery<Profile | null>({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => {
      const { data, error } = await client
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as Profile | null) ?? null;
    },
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile(client: AppSupabaseClient, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: {
      display_name?: string | null;
      avatar_url?: string | null;
    }): Promise<Profile> => {
      const { data, error } = await client
        .from("profiles")
        .update(patch)
        .eq("id", userId)
        .select("id, display_name, avatar_url")
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.profile(userId), profile);
    },
  });
}
