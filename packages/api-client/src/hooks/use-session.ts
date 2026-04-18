import type { Session } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";

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
