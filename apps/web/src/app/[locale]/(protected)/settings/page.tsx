import type { Locale } from "@repo/i18n";
import { getTranslations } from "next-intl/server";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function SettingsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = await getTranslations("common");
  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">{t("nav.settings")}</h1>
      <div className="flex flex-col gap-4 rounded-md border p-4">
        <section className="flex items-center justify-between">
          <span className="text-sm">Language</span>
          <LocaleSwitcher current={locale} />
        </section>
        <section className="flex items-center justify-between">
          <span className="text-sm">Theme</span>
          <ThemeToggle />
        </section>
      </div>
      <div className="mt-6">
        <SignOutButton label={t("nav.signOut")} />
      </div>
    </>
  );
}
