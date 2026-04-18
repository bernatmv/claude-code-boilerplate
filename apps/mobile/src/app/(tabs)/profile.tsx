import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { Screen } from "@/components/screen";

export default function ProfileScreen() {
  const { t } = useTranslation("common");
  return (
    <Screen>
      <Text className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        {t("nav.profile")}
      </Text>
    </Screen>
  );
}
