import { describe, expect, it } from "vitest";

import { computeHmac, verifyHmac } from "./hmac";

describe("computeHmac", () => {
  it("produces stable hex output", () => {
    const sig = computeHmac("secret", "hello");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(computeHmac("secret", "hello")).toBe(sig);
  });

  it("differs for different secrets", () => {
    expect(computeHmac("a", "payload")).not.toBe(computeHmac("b", "payload"));
  });
});

describe("verifyHmac", () => {
  it("accepts correct signature", () => {
    const sig = computeHmac("secret", "body");
    expect(verifyHmac("secret", "body", sig)).toBe(true);
  });

  it("rejects wrong signature", () => {
    expect(verifyHmac("secret", "body", "deadbeef")).toBe(false);
  });

  it("rejects forged payload", () => {
    const sig = computeHmac("secret", "body");
    expect(verifyHmac("secret", "tampered", sig)).toBe(false);
  });

  it("strips sha256= prefix", () => {
    const sig = computeHmac("secret", "body");
    expect(verifyHmac("secret", "body", `sha256=${sig}`)).toBe(true);
  });
});
