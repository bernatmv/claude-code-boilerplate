import { afterEach, describe, expect, it, vi } from "vitest";

import { getClientIp } from "./ratelimit";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getClientIp", () => {
  it("returns first entry from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "5.6.7.8" });
    expect(getClientIp(headers)).toBe("5.6.7.8");
  });

  it("returns 'unknown' when no header is present", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("getAuthRateLimiter (noop when env absent)", () => {
  it("returns success when UPSTASH env vars are missing", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.resetModules();
    const { getAuthRateLimiter } = await import("./ratelimit");
    const limiter = getAuthRateLimiter();
    const result = await limiter.limit("ip:1.2.3.4");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(Infinity);
  });
});
