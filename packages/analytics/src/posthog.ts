import type { AnalyticsProvider, EventProps } from "./types.js";

export interface PostHogLike {
  capture: (event: string, props?: EventProps) => void;
  identify: (userId: string, traits?: EventProps) => void;
}

export interface PostHogProviderConfig {
  client: PostHogLike;
}

export function createPostHogProvider(config: PostHogProviderConfig): AnalyticsProvider {
  return {
    name: "posthog",
    track(event, props) {
      config.client.capture(event, props);
    },
    identify(userId, traits) {
      config.client.identify(userId, traits);
    },
    page(name, props) {
      config.client.capture("$pageview", { $current_url: name, ...(props ?? {}) });
    },
  };
}
