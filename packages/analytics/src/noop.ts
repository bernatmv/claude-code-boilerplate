import type { AnalyticsProvider } from "./types.js";

export function createNoopProvider(): AnalyticsProvider {
  return {
    name: "noop",
    track() {},
    identify() {},
    page() {},
  };
}
