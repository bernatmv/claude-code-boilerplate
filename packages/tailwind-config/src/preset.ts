import type { Config } from "tailwindcss";

import { tokens } from "./tokens.js";

export const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        brand: tokens.colors.brand,
        neutral: tokens.colors.neutral,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        danger: tokens.colors.danger,
      },
      spacing: tokens.spacing,
      borderRadius: tokens.radii,
      fontFamily: {
        sans: [...tokens.typography.fontFamily.sans],
        mono: [...tokens.typography.fontFamily.mono],
      },
      fontSize: tokens.typography.fontSize,
    },
  },
};

export default preset;
