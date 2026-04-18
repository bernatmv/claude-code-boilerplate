import type { Locale } from "@repo/i18n";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "@/navigation";

export async function Navbar({ locale }: { locale: Locale }) {
  const t = await getTranslations("common");
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          {t("appName")}
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/articles" className="px-3 py-1 text-sm hover:text-foreground/80">
            {t("nav.home")}
          </Link>
          <LocaleSwitcher current={locale} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
