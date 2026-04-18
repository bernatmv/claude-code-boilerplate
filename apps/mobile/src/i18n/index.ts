import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE, LOCALES, messages, type Locale } from "@repo/i18n";

function detectLocale(): Locale {
  const device = getLocales()[0]?.languageCode ?? DEFAULT_LOCALE;
  return (LOCALES as readonly string[]).includes(device) ? (device as Locale) : DEFAULT_LOCALE;
}

export const i18n = i18next.createInstance();

void i18n.use(initReactI18next).init({
  resources: {
    en: messages.en,
    es: messages.es,
  },
  lng: detectLocale(),
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: "common",
  ns: ["common", "auth", "errors"],
  interpolation: { escapeValue: false },
  returnNull: false,
  compatibilityJSON: "v4",
});
