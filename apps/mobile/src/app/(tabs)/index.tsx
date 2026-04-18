import { useCreateItem, useDeleteItem, useItems } from "@repo/api-client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/screen";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  const { t } = useTranslation("common");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { data: items, isLoading } = useItems(supabase, userId ?? "");
  const create = useCreateItem(supabase, userId ?? "");
  const remove = useDeleteItem(supabase, userId ?? "");

  const [title, setTitle] = useState("");

  async function onAdd() {
    if (!title.trim() || !userId) return;
    await create.mutateAsync({ title: title.trim() });
    setTitle("");
  }

  return (
    <Screen>
      <View className="gap-4">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {t("nav.home")}
        </Text>

        <View className="flex-row gap-2">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor="#9ca3af"
            className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <Pressable
            onPress={() => void onAdd()}
            disabled={create.isPending}
            className="rounded-md bg-brand-500 px-4 py-2 items-center justify-center disabled:opacity-60"
            accessibilityRole="button"
          >
            <Text className="text-white font-medium">{create.isPending ? "…" : "Add"}</Text>
          </Pressable>
        </View>

        {isLoading ? <Text className="text-neutral-500">Loading…</Text> : null}

        <FlatList
          data={items ?? []}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <View className="flex-row items-start justify-between rounded-md border border-neutral-200 dark:border-neutral-800 p-3">
              <View className="flex-1 pr-2">
                <Text className="font-medium text-neutral-900 dark:text-neutral-50">
                  {item.title}
                </Text>
                {item.description ? (
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </Text>
                ) : null}
              </View>
              <Pressable onPress={() => remove.mutate(item.id)} accessibilityRole="button">
                <Text className="text-sm text-red-600">Delete</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? <Text className="text-neutral-500">No items yet.</Text> : null
          }
        />
      </View>
    </Screen>
  );
}
