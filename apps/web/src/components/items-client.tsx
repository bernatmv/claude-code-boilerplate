"use client";

import { useCreateItem, useDeleteItem, useItems, type AppSupabaseClient } from "@repo/api-client";
import { useMemo, useState } from "react";

import { createBrowserClient } from "@/lib/supabase/browser";

export function ItemsClient({ userId }: { userId: string }) {
  const client: AppSupabaseClient = useMemo(() => createBrowserClient(), []);
  const { data: items, isLoading, error } = useItems(client, userId);
  const create = useCreateItem(client, userId);
  const remove = useDeleteItem(client, userId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), description: description.trim() || undefined });
    setTitle("");
    setDescription("");
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-2 rounded-md border p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-md border px-3 py-2"
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="rounded-md border px-3 py-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="self-start rounded-md bg-brand-500 px-4 py-2 text-white disabled:opacity-60"
        >
          {create.isPending ? "…" : "Add item"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
      {isLoading ? <p className="text-sm text-neutral-500">Loading…</p> : null}

      <ul className="flex flex-col gap-2">
        {(items ?? []).map((item) => (
          <li key={item.id} className="flex items-start justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">{item.title}</p>
              {item.description ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => remove.mutate(item.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
        {(items ?? []).length === 0 && !isLoading ? (
          <li className="text-sm text-neutral-500">No items yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
