import { describe, expect, it } from "vitest";
import { displayNameSchema, profileSchema } from "./profile.js";

describe("displayNameSchema", () => {
  it("accepts 2–50 char strings", () => {
    expect(displayNameSchema.safeParse("Al").success).toBe(true);
    expect(displayNameSchema.safeParse("A").success).toBe(false);
    expect(displayNameSchema.safeParse("x".repeat(51)).success).toBe(false);
  });

  it("trims whitespace before validating length", () => {
    expect(displayNameSchema.safeParse("  Al  ").success).toBe(true);
    expect(displayNameSchema.safeParse("   ").success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("requires a uuid id and accepts nullable fields", () => {
    const ok = profileSchema.safeParse({
      id: "00000000-0000-0000-0000-000000000001",
      display_name: null,
      avatar_url: null,
    });
    expect(ok.success).toBe(true);
  });

  it("rejects non-uuid ids", () => {
    const bad = profileSchema.safeParse({
      id: "not-a-uuid",
      display_name: null,
      avatar_url: null,
    });
    expect(bad.success).toBe(false);
  });
});
