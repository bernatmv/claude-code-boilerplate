export type SafeRedirectOptions = {
  fallback?: string;
  allowedHosts?: readonly string[];
};

const DEFAULT_FALLBACK = "/";

export function safeRedirect(
  target: string | null | undefined,
  options: SafeRedirectOptions = {},
): string {
  const fallback = options.fallback ?? DEFAULT_FALLBACK;

  if (typeof target !== "string" || target.length === 0) return fallback;

  if (target.startsWith("//") || target.startsWith("\\\\")) return fallback;

  if (target.startsWith("/")) {
    return target.replace(/\\/g, "/");
  }

  const allowedHosts = options.allowedHosts;
  if (!allowedHosts || allowedHosts.length === 0) return fallback;

  try {
    const url = new URL(target);
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallback;
    if (!allowedHosts.includes(url.host)) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}
