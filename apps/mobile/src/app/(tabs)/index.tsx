import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { Screen } from "@/components/screen";

export default function HomeScreen() {
  const { t } = useTranslation("common");
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-3xl font-semibold text-neutral-900 dark:text-neutral-50">
          {t("appName")}
        </Text>
        <Text className="text-base text-neutral-600 dark:text-neutral-400">{t("nav.home")}</Text>
      </View>
    </Screen>
  );
}
