import { describe, expect, it } from "vitest";
import { formatDate, formatNumber } from "./formatters.js";

describe("formatDate", () => {
  it("formats the same date differently per locale", () => {
    const d = new Date("2026-03-14T00:00:00Z");
    const en = formatDate(d, "en", { timeZone: "UTC" });
    const es = formatDate(d, "es", { timeZone: "UTC" });
    expect(en).not.toEqual(es);
    expect(en).toMatch(/2026/);
    expect(es).toMatch(/2026/);
  });
});

describe("formatNumber", () => {
  it("uses locale-specific grouping", () => {
    expect(formatNumber(1234567.89, "en")).toBe("1,234,567.89");
    expect(formatNumber(1234567.89, "es")).toMatch(/1[\s.]234[\s.]567,89/);
  });
});
