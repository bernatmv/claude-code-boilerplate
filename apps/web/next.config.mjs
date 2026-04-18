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

export default withNextIntl(nextConfig);
