import { describe, expect, it } from "vitest";
import { resetPasswordSchema, signInSchema, signUpSchema } from "./auth.js";

describe("signInSchema", () => {
  it("requires valid email + password", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "secret12" }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "nope", password: "secret12" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "a@b.co", password: "short" }).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("requires password confirmation to match", () => {
    expect(
      signUpSchema.safeParse({
        email: "a@b.co",
        password: "secret12",
        confirmPassword: "secret12",
      }).success,
    ).toBe(true);
    expect(
      signUpSchema.safeParse({
        email: "a@b.co",
        password: "secret12",
        confirmPassword: "different",
      }).success,
    ).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a valid email", () => {
    expect(resetPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ email: "nope" }).success).toBe(false);
  });
});
