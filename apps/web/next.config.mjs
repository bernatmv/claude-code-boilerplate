import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: false,
  },
  pageExtensions: ["ts", "tsx"],
  transpilePackages: [
    "@repo/analytics",
    "@repo/api-client",
    "@repo/i18n",
    "@repo/tailwind-config",
    "@repo/validation",
    "next-mdx-remote",
  ],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

const hasSentryOrg = Boolean(process.env.SENTRY_ORG && process.env.SENTRY_PROJECT);

const withSentry = hasSentryOrg
  ? (config) =>
      withSentryConfig(config, {
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        silent: !process.env.CI,
        widenClientFileUpload: true,
        disableLogger: true,
      })
  : (config) => config;

export default withSentry(withNextIntl(nextConfig));
