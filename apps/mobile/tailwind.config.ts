import type { Config } from "tailwindcss";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nativewindPreset = require("nativewind/preset") as Config;

import preset from "@repo/tailwind-config/preset";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [nativewindPreset, preset as Config],
  darkMode: "class",
};

export default config;
