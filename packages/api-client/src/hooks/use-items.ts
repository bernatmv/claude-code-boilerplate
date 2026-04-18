import { useQuery } from "@tanstack/react-query";

import type { AppSupabaseClient } from "../client.js";
import { queryKeys } from "../query-keys.js";

export function useItems(client: AppSupabaseClient, userId: string) {
  return useQuery({
    queryKey: queryKeys.items.list(userId),
    queryFn: async () => {
      const { data, error } = await client
        .from("items" as never)
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(userId),
  });
}
