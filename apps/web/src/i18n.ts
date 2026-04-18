import { LOCALES, messages, type Locale } from "@repo/i18n";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (LOCALES as readonly string[]).includes(requested ?? "")
    ? (requested as Locale)
    : undefined;
  if (!locale) notFound();

  const ns = messages[locale];
  return {
    locale,
    messages: {
      common: ns.common,
      auth: ns.auth,
      errors: ns.errors,
    },
  };
});
