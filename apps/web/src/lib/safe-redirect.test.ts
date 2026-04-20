import { describe, expect, it } from "vitest";

import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  it("returns fallback for null/undefined/empty", () => {
    expect(safeRedirect(null)).toBe("/");
    expect(safeRedirect(undefined)).toBe("/");
    expect(safeRedirect("")).toBe("/");
  });

  it("accepts same-origin relative paths", () => {
    expect(safeRedirect("/dashboard")).toBe("/dashboard");
    expect(safeRedirect("/settings/profile?tab=avatar")).toBe("/settings/profile?tab=avatar");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeRedirect("//evil.com")).toBe("/");
    expect(safeRedirect("\\\\evil.com")).toBe("/");
  });

  it("rejects absolute URLs by default", () => {
    expect(safeRedirect("https://evil.com")).toBe("/");
    expect(safeRedirect("http://evil.com/path")).toBe("/");
  });

  it("rejects non-http protocols even when allowed hosts exist", () => {
    expect(safeRedirect("javascript:alert(1)", { allowedHosts: ["evil.com"] })).toBe("/");
    expect(safeRedirect("data:text/html,hi", { allowedHosts: ["evil.com"] })).toBe("/");
  });

  it("allows absolute URLs on allowed hosts", () => {
    expect(
      safeRedirect("https://app.example.com/dashboard", {
        allowedHosts: ["app.example.com"],
      }),
    ).toBe("https://app.example.com/dashboard");
  });

  it("rejects absolute URLs not in allowed hosts", () => {
    expect(safeRedirect("https://evil.com/x", { allowedHosts: ["app.example.com"] })).toBe("/");
  });

  it("uses custom fallback", () => {
    expect(safeRedirect("https://evil.com", { fallback: "/home" })).toBe("/home");
  });

  it("normalizes backslashes in relative paths", () => {
    expect(safeRedirect("/path\\with\\backslash")).toBe("/path/with/backslash");
  });
});
