import base from "@repo/config-eslint";

export default [
  {
    ignores: [
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
      "**/*.config.ts",
      "**/.expo/**",
      "**/android/**",
      "**/ios/**",
      "**/dist/**",
      "**/nativewind-env.d.ts",
      "**/expo-env.d.ts",
      "index.ts",
    ],
  },
  ...base,
];
