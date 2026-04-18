import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Claude Code Boilerplate",
  slug: "claude-code-boilerplate",
  version: "0.0.0",
  orientation: "portrait",
  scheme: "boilerplate",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#ffffff",
      },
    ],
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.example.boilerplate",
  },
  android: {
    package: "com.example.boilerplate",
    adaptiveIcon: {
      backgroundColor: "#ffffff",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
  },
};

export default config;
