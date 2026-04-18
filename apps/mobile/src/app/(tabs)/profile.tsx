import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

import { Screen } from "@/components/screen";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <Screen>
      <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        {t("nav.profile")}
      </Text>
      {email ? <Text className="text-neutral-700 dark:text-neutral-300">{email}</Text> : null}
      <Pressable
        onPress={() => void supabase.auth.signOut()}
        className="rounded-md border border-neutral-300 px-4 py-3 items-center dark:border-neutral-700"
        accessibilityRole="button"
      >
        <Text className="text-neutral-900 dark:text-neutral-50">
          {t("auth.signOut", "Sign out")}
        </Text>
      </Pressable>
    </Screen>
  );
}
