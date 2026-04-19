import { describe, expect, it } from "vitest";

import { estimatePasswordStrength } from "./password-strength.js";

describe("estimatePasswordStrength", () => {
  it("flags empty password", () => {
    const r = estimatePasswordStrength("");
    expect(r.score).toBe(0);
    expect(r.label).toBe("very weak");
  });

  it("scores short simple passwords as weak", () => {
    const r = estimatePasswordStrength("abc");
    expect(r.score).toBeLessThanOrEqual(1);
  });

  it("detects common passwords", () => {
    const r = estimatePasswordStrength("Password123!");
    expect(r.warnings.join(" ")).toMatch(/common/i);
  });

  it("scores diverse long passwords as strong", () => {
    const r = estimatePasswordStrength("xK9#mQ2@vB4!nZ7&");
    expect(r.score).toBe(4);
    expect(r.label).toBe("strong");
  });

  it("penalizes repeated characters", () => {
    const r = estimatePasswordStrength("aaaaaaaaaaaa");
    expect(r.score).toBe(0);
  });
});
