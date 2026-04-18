"use client";

import { LOCALES, type Locale } from "@repo/i18n";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/navigation";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      aria-label="Change language"
      value={current}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Locale;
        startTransition(() => {
          router.replace(pathname, { locale: next });
        });
      }}
      className="h-8 rounded-md border border-border bg-background px-2 text-sm"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
