const DIACRITICS_REGEX = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_REGEX = /[^a-z0-9]+/g;
const LEADING_TRAILING_DASH_REGEX = /^-+|-+$/g;

export type SlugifyOptions = {
  maxLength?: number;
  fallback?: string;
};

export function slugify(input: string, options: SlugifyOptions = {}): string {
  const { maxLength = 80, fallback = "n-a" } = options;

  const base = input
    .normalize("NFKD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_REGEX, "-")
    .replace(LEADING_TRAILING_DASH_REGEX, "");

  if (base.length === 0) return fallback;

  if (base.length <= maxLength) return base;

  const truncated = base.slice(0, maxLength).replace(LEADING_TRAILING_DASH_REGEX, "");
  return truncated.length === 0 ? fallback : truncated;
}

export function uniqueSlug(
  desired: string,
  existing: Iterable<string>,
  options: SlugifyOptions = {},
): string {
  const base = slugify(desired, options);
  const taken = new Set(existing);
  if (!taken.has(base)) return base;

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}
