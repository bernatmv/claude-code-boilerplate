import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateItemInput, Item, UpdateItemInput } from "@repo/validation";

import type { AppSupabaseClient } from "../client.js";
import { queryKeys } from "../query-keys.js";

export function useItems(client: AppSupabaseClient, userId: string) {
  return useQuery<Item[]>({
    queryKey: queryKeys.items.list(userId),
    queryFn: async () => {
      const { data, error } = await client
        .from("items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Item[];
    },
    enabled: Boolean(userId),
  });
}

export function useCreateItem(client: AppSupabaseClient, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateItemInput): Promise<Item> => {
      const { data, error } = await client
        .from("items")
        .insert({ user_id: userId, ...input })
        .select("*")
        .single();
      if (error) throw error;
      return data as Item;
    },
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: queryKeys.items.list(userId) });
      const prev = qc.getQueryData<Item[]>(queryKeys.items.list(userId)) ?? [];
      const optimistic: Item = {
        id: `optimistic-${Date.now()}`,
        user_id: userId,
        title: input.title,
        description: input.description ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      qc.setQueryData<Item[]>(queryKeys.items.list(userId), [optimistic, ...prev]);
      return { prev };
    },
    onError: (_err, _input, context) => {
      if (context?.prev) qc.setQueryData(queryKeys.items.list(userId), context.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.items.list(userId) });
    },
  });
}

export function useUpdateItem(client: AppSupabaseClient, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: UpdateItemInput }): Promise<Item> => {
      const { data, error } = await client
        .from("items")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return data as Item;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: queryKeys.items.list(userId) });
      const prev = qc.getQueryData<Item[]>(queryKeys.items.list(userId)) ?? [];
      qc.setQueryData<Item[]>(
        queryKeys.items.list(userId),
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(queryKeys.items.list(userId), context.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.items.list(userId) });
    },
  });
}

export function useDeleteItem(client: AppSupabaseClient, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { error } = await client.from("items").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.items.list(userId) });
      const prev = qc.getQueryData<Item[]>(queryKeys.items.list(userId)) ?? [];
      qc.setQueryData<Item[]>(
        queryKeys.items.list(userId),
        prev.filter((it) => it.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) qc.setQueryData(queryKeys.items.list(userId), context.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.items.list(userId) });
    },
  });
}
