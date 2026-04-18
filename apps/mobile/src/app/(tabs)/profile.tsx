import { useProfile, useUpdateProfile } from "@repo/api-client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/screen";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const { t } = useTranslation("common");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const { data: profile } = useProfile(supabase, userId ?? "");
  const update = useUpdateProfile(supabase, userId ?? "");

  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile?.display_name]);

  async function onSave() {
    setStatus(null);
    try {
      await update.mutateAsync({ display_name: displayName.trim() || null });
      setStatus("Saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <Screen>
      <View className="gap-4">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {t("nav.profile")}
        </Text>
        {email ? <Text className="text-neutral-700 dark:text-neutral-300">{email}</Text> : null}

        <View className="gap-2">
          <Text className="text-sm text-neutral-700 dark:text-neutral-300">Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor="#9ca3af"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <Pressable
            onPress={() => void onSave()}
            disabled={update.isPending}
            className="rounded-md bg-brand-500 px-4 py-2 items-center disabled:opacity-60"
            accessibilityRole="button"
          >
            <Text className="text-white font-medium">{update.isPending ? "…" : "Save"}</Text>
          </Pressable>
          {status ? (
            <Text className="text-sm text-neutral-600 dark:text-neutral-400">{status}</Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => void supabase.auth.signOut()}
          className="rounded-md border border-neutral-300 px-4 py-3 items-center dark:border-neutral-700"
          accessibilityRole="button"
        >
          <Text className="text-neutral-900 dark:text-neutral-50">
            {t("auth.signOut", "Sign out")}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
