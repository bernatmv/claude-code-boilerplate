import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { I18nextProvider } from "react-i18next";

import { AnalyticsProvider } from "@/components/analytics-provider";
import { QueryProvider } from "@/components/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { i18n } from "@/i18n";
import { initSentry } from "@/lib/sentry";

initSentry();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <QueryProvider>
          <AnalyticsProvider>
            <ThemeProvider>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </ThemeProvider>
          </AnalyticsProvider>
        </QueryProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
