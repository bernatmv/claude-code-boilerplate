import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Screen } from "@/components/screen";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsScreen() {
  const { t } = useTranslation("common");
  return (
    <Screen>
      <View className="gap-6">
        <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          {t("nav.settings")}
        </Text>
        <ThemeToggle />
        <LocaleSwitcher />
      </View>
    </Screen>
  );
}
