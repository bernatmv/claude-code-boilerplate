import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

interface Extra {
  sentryDsn?: string;
  sentryEnvironment?: string;
}

export function initSentry(): void {
  const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
  const dsn = extra.sentryDsn ?? process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment:
      extra.sentryEnvironment ?? process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
    tracesSampleRate: 0.1,
    enableAutoSessionTracking: true,
  });
}

export { Sentry };
