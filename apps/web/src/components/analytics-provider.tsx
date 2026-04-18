"use client";

import {
  createAnalytics,
  createNoopProvider,
  createPostHogProvider,
  type Analytics,
} from "@repo/analytics";
import posthog from "posthog-js";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

import { env } from "@/env";

const AnalyticsContext = createContext<Analytics | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (posthog.__loaded) return;
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      capture_pageview: false,
      persistence: "localStorage",
    });
  }, []);

  const analytics = useMemo<Analytics>(() => {
    if (!env.NEXT_PUBLIC_POSTHOG_KEY) {
      return createAnalytics({ providers: [createNoopProvider()] });
    }
    return createAnalytics({
      providers: [
        createPostHogProvider({
          client: {
            capture: (event, props) => posthog.capture(event, props),
            identify: (userId, traits) => posthog.identify(userId, traits),
          },
        }),
      ],
    });
  }, []);

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): Analytics {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics must be used inside <AnalyticsProvider>");
  return ctx;
}
