import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { t } = useTranslation("common");
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: t("nav.home", "Home") }} />
      <Tabs.Screen name="profile" options={{ title: t("nav.profile", "Profile") }} />
      <Tabs.Screen name="settings" options={{ title: t("nav.settings", "Settings") }} />
    </Tabs>
  );
}
