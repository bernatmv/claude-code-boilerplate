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
  ],
};

export default withNextIntl(nextConfig);
