export type FlagMap = Readonly<Record<string, boolean>>;

let cached: FlagMap | null = null;

function parse(raw: string | undefined): FlagMap {
  if (!raw) return Object.freeze({});
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return Object.freeze({});
    const out: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      out[k] = v === true || v === "true" || v === 1;
    }
    return Object.freeze(out);
  } catch {
    return Object.freeze({});
  }
}

export function getFlags(): FlagMap {
  if (cached) return cached;
  cached = parse(process.env.NEXT_PUBLIC_FEATURE_FLAGS);
  return cached;
}

export function isFlagEnabled(name: string): boolean {
  return getFlags()[name] === true;
}

export function resetFlagsCache(): void {
  cached = null;
}
