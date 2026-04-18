import { describe, expect, it } from "vitest";
import { preset } from "./preset.js";
import { tokens } from "./tokens.js";

describe("tokens", () => {
  it("exposes brand, neutral, and semantic colors", () => {
    expect(tokens.colors.brand[500]).toMatch(/^#/);
    expect(tokens.colors.neutral[900]).toMatch(/^#/);
    expect(tokens.colors.success).toMatch(/^#/);
    expect(tokens.colors.danger).toMatch(/^#/);
  });

  it("uses rem for spacing scale", () => {
    for (const value of Object.values(tokens.spacing)) {
      expect(value).toMatch(/rem$/);
    }
  });
});

describe("preset", () => {
  it("extends Tailwind theme with token values", () => {
    const extend = preset.theme?.extend;
    expect(extend?.colors).toMatchObject({ brand: tokens.colors.brand });
    expect(extend?.spacing).toEqual(tokens.spacing);
    expect(extend?.borderRadius).toEqual(tokens.radii);
    expect(extend?.fontFamily).toEqual({
      sans: [...tokens.typography.fontFamily.sans],
      mono: [...tokens.typography.fontFamily.mono],
    });
  });
});
