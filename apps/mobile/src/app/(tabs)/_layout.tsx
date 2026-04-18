import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { registerForPushNotifications } from "@/lib/push";
import { supabase } from "@/lib/supabase";

type SessionState = "loading" | "authenticated" | "unauthenticated";

export default function TabsLayout() {
  const { t } = useTranslation("common");
  const [session, setSession] = useState<SessionState>("loading");

  useEffect(() => {
    let mounted = true;
    const bootstrap = (userId: string | null) => {
      if (!userId) return;
      void registerForPushNotifications(userId).catch((err: unknown) => {
        console.warn("push registration failed", err);
      });
    };
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ? "authenticated" : "unauthenticated");
      bootstrap(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? "authenticated" : "unauthenticated");
      bootstrap(s?.user.id ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (session === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
        <Text className="text-neutral-500">…</Text>
      </View>
    );
  }

  if (session === "unauthenticated") {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: t("nav.home", "Home") }} />
      <Tabs.Screen name="profile" options={{ title: t("nav.profile", "Profile") }} />
      <Tabs.Screen name="settings" options={{ title: t("nav.settings", "Settings") }} />
    </Tabs>
  );
}
