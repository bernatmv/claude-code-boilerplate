import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getFlags, isFlagEnabled, resetFlagsCache } from "./flags";

describe("flags", () => {
  const original = process.env.NEXT_PUBLIC_FEATURE_FLAGS;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_FEATURE_FLAGS;
    resetFlagsCache();
  });

  afterEach(() => {
    if (original) process.env.NEXT_PUBLIC_FEATURE_FLAGS = original;
    resetFlagsCache();
  });

  it("returns empty when env unset", () => {
    expect(getFlags()).toEqual({});
    expect(isFlagEnabled("anything")).toBe(false);
  });

  it("parses true booleans", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = JSON.stringify({ alpha: true, beta: false });
    expect(isFlagEnabled("alpha")).toBe(true);
    expect(isFlagEnabled("beta")).toBe(false);
    expect(isFlagEnabled("missing")).toBe(false);
  });

  it("coerces 'true' and 1", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = '{"x":"true","y":1,"z":"false"}';
    expect(isFlagEnabled("x")).toBe(true);
    expect(isFlagEnabled("y")).toBe(true);
    expect(isFlagEnabled("z")).toBe(false);
  });

  it("returns empty on malformed JSON", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = "{not json";
    expect(getFlags()).toEqual({});
  });

  it("returns empty on non-object JSON", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = "[1,2,3]";
    expect(getFlags()).toEqual({});
  });
});
