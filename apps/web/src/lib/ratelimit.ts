import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export type Limiter = {
  limit: (identifier: string) => Promise<RateLimitResult>;
};

const NOOP_LIMITER: Limiter = {
  limit: () => Promise.resolve({ success: true, limit: Infinity, remaining: Infinity, reset: 0 }),
};

let cachedAuthLimiter: Limiter | null = null;
let cachedApiLimiter: Limiter | null = null;

function makeRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function makeLimiter(
  prefix: string,
  tokens: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
): Limiter {
  const redis = makeRedis();
  if (!redis) return NOOP_LIMITER;
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix,
  });
  return {
    limit: async (identifier) => {
      const r = await rl.limit(identifier);
      return { success: r.success, limit: r.limit, remaining: r.remaining, reset: r.reset };
    },
  };
}

export function getAuthRateLimiter(): Limiter {
  if (!cachedAuthLimiter) cachedAuthLimiter = makeLimiter("rl:auth", 5, "1 m");
  return cachedAuthLimiter;
}

export function getApiRateLimiter(): Limiter {
  if (!cachedApiLimiter) cachedApiLimiter = makeLimiter("rl:api", 60, "1 m");
  return cachedApiLimiter;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return headers.get("x-real-ip") ?? "unknown";
}
