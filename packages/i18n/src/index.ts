import enAuth from "../locales/en/auth.json" with { type: "json" };
import enCommon from "../locales/en/common.json" with { type: "json" };
import enErrors from "../locales/en/errors.json" with { type: "json" };
import esAuth from "../locales/es/auth.json" with { type: "json" };
import esCommon from "../locales/es/common.json" with { type: "json" };
import esErrors from "../locales/es/errors.json" with { type: "json" };

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const messages = {
  en: { common: enCommon, auth: enAuth, errors: enErrors },
  es: { common: esCommon, auth: esAuth, errors: esErrors },
} as const;

export type Namespace = keyof (typeof messages)["en"];

export function getMessages(locale: Locale) {
  return messages[locale];
}

export * from "./formatters";
