import { describe, expect, it, vi } from "vitest";

import { computeBackoff, retry } from "./retry";

describe("computeBackoff", () => {
  it("grows exponentially without jitter", () => {
    const base = { minDelayMs: 100, factor: 2, jitter: false, maxDelayMs: 10_000 };
    expect(computeBackoff(1, base)).toBe(100);
    expect(computeBackoff(2, base)).toBe(200);
    expect(computeBackoff(3, base)).toBe(400);
    expect(computeBackoff(4, base)).toBe(800);
  });

  it("caps at maxDelayMs", () => {
    expect(computeBackoff(10, { minDelayMs: 100, factor: 2, jitter: false, maxDelayMs: 500 })).toBe(
      500,
    );
  });

  it("applies jitter between 0 and the capped delay", () => {
    const values = Array.from({ length: 50 }, () =>
      computeBackoff(3, { minDelayMs: 100, factor: 2, jitter: true, maxDelayMs: 10_000 }),
    );
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(400);
    }
  });
});

describe("retry", () => {
  it("returns on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    await expect(retry(fn, { retries: 3 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries until success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue("ok");
    await expect(
      retry(fn, { retries: 3, minDelayMs: 1, jitter: false, maxDelayMs: 1 }),
    ).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(
      retry(fn, { retries: 2, minDelayMs: 1, jitter: false, maxDelayMs: 1 }),
    ).rejects.toThrow("boom");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("honors shouldRetry=false", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fatal"));
    await expect(
      retry(fn, { retries: 5, shouldRetry: () => false, minDelayMs: 1, jitter: false }),
    ).rejects.toThrow("fatal");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("invokes onRetry with attempt and delay", async () => {
    const onRetry = vi.fn();
    const fn = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue("ok");
    await retry(fn, { retries: 1, minDelayMs: 5, jitter: false, maxDelayMs: 5, onRetry });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry.mock.calls[0]?.[1]).toBe(1);
  });
});
