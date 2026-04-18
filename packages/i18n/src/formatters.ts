import type { Locale } from "./index.js";

export function formatDate(
  date: Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}
