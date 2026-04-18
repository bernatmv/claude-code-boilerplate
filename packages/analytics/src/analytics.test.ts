import { describe, expect, it, vi } from "vitest";
import { createAnalytics } from "./analytics.js";
import { createNoopProvider } from "./noop.js";
import type { AnalyticsProvider } from "./types.js";

function spyProvider(): AnalyticsProvider & {
  calls: Array<[string, unknown, unknown]>;
} {
  const calls: Array<[string, unknown, unknown]> = [];
  return {
    name: "spy",
    track: (e, p) => {
      calls.push(["track", e, p]);
    },
    identify: (id, t) => {
      calls.push(["identify", id, t]);
    },
    page: (name, p) => {
      calls.push(["page", name, p]);
    },
    calls,
  };
}

describe("createAnalytics", () => {
  it("fan-outs events to every registered provider", () => {
    const a = spyProvider();
    const b = spyProvider();
    const analytics = createAnalytics({ providers: [a, b] });

    analytics.track("sign_in", { method: "password" });
    analytics.identify("user-1", { plan: "free" });
    analytics.page("dashboard");

    expect(a.calls).toEqual([
      ["track", "sign_in", { method: "password" }],
      ["identify", "user-1", { plan: "free" }],
      ["page", "dashboard", undefined],
    ]);
    expect(b.calls).toEqual(a.calls);
  });

  it("falls back to the noop provider when no providers are registered", () => {
    const analytics = createAnalytics({ providers: [] });
    expect(() => analytics.track("sign_in")).not.toThrow();
  });

  it("catches provider errors so one bad provider does not break the rest", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const broken: AnalyticsProvider = {
      name: "broken",
      track: () => {
        throw new Error("boom");
      },
      identify: () => {},
      page: () => {},
    };
    const good = spyProvider();
    const analytics = createAnalytics({ providers: [broken, good] });
    expect(() => analytics.track("sign_in")).not.toThrow();
    expect(good.calls).toEqual([["track", "sign_in", undefined]]);
    errorSpy.mockRestore();
  });

  it("treats a noop provider as valid", () => {
    const analytics = createAnalytics({ providers: [createNoopProvider()] });
    expect(() => analytics.track("sign_in")).not.toThrow();
  });
});
