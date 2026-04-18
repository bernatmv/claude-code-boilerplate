import { useTranslation } from "react-i18next";
import { Pressable, Text } from "react-native";

import { LOCALES, type Locale } from "@repo/i18n";

export function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const current = (i18n.language as Locale) ?? "en";
  const next: Locale = LOCALES[(LOCALES.indexOf(current) + 1) % LOCALES.length] ?? "en";
  return (
    <Pressable
      className="self-start rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700"
      onPress={() => {
        void i18n.changeLanguage(next);
      }}
      accessibilityRole="button"
    >
      <Text className="text-neutral-900 dark:text-neutral-50">Language: {current}</Text>
    </Pressable>
  );
}
