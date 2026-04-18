import {
  createAnalytics,
  createNoopProvider,
  createPostHogProvider,
  type Analytics,
} from "@repo/analytics";
import Constants from "expo-constants";
import PostHog, { PostHogProvider as PHProvider } from "posthog-react-native";
import { createContext, useContext, useMemo, type ReactNode } from "react";

const AnalyticsContext = createContext<Analytics | null>(null);

interface Extra {
  posthogApiKey?: string;
  posthogHost?: string;
}

function resolveKeys(): Extra {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  return {
    posthogApiKey: extra.posthogApiKey ?? process.env.EXPO_PUBLIC_POSTHOG_KEY,
    posthogHost: extra.posthogHost ?? process.env.EXPO_PUBLIC_POSTHOG_HOST,
  };
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { posthogApiKey, posthogHost } = resolveKeys();

  const { analytics, client } = useMemo(() => {
    if (!posthogApiKey) {
      return {
        analytics: createAnalytics({ providers: [createNoopProvider()] }),
        client: null as PostHog | null,
      };
    }
    const c = new PostHog(posthogApiKey, { host: posthogHost ?? "https://app.posthog.com" });
    return {
      analytics: createAnalytics({
        providers: [
          createPostHogProvider({
            client: {
              capture: (event, props) => {
                c.capture(event, props ?? {});
              },
              identify: (userId, traits) => {
                c.identify(userId, traits ?? {});
              },
            },
          }),
        ],
      }),
      client: c,
    };
  }, [posthogApiKey, posthogHost]);

  const content = (
    <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>
  );
  if (!client) return content;
  return <PHProvider client={client}>{content}</PHProvider>;
}

export function useAnalytics(): Analytics {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics must be used inside <AnalyticsProvider>");
  return ctx;
}
