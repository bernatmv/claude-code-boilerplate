import base from "@repo/config-eslint";

export default [
  {
    ignores: [
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
    ],
  },
  ...base,
];
