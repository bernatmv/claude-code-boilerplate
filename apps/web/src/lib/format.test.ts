import { describe, expect, it } from "vitest";

import { formatCurrency, formatDate, formatNumber, formatRelativeTime } from "./format";

describe("formatCurrency", () => {
  it("formats USD cents", () => {
    expect(formatCurrency(1999)).toBe("$19.99");
  });

  it("supports EUR in de-DE", () => {
    const out = formatCurrency(1000, "EUR", "de-DE");
    expect(out).toMatch(/10,00\s?€/);
  });
});

describe("formatNumber", () => {
  it("uses locale separators", () => {
    expect(formatNumber(1234567, "en-US")).toBe("1,234,567");
    expect(formatNumber(1234567, "de-DE")).toBe("1.234.567");
  });
});

describe("formatDate", () => {
  it("formats ISO string", () => {
    expect(formatDate("2026-04-19T12:00:00Z", "en-US")).toMatch(/Apr 19, 2026/);
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-04-19T12:00:00Z");

  it("returns 'in X seconds' for future", () => {
    const d = new Date(now.getTime() + 30_000);
    expect(formatRelativeTime(d, now)).toMatch(/30 seconds/);
  });

  it("returns 'X minutes ago' for past", () => {
    const d = new Date(now.getTime() - 5 * 60_000);
    expect(formatRelativeTime(d, now)).toMatch(/5 minutes ago/);
  });

  it("escalates units", () => {
    const d = new Date(now.getTime() - 3 * 24 * 3600 * 1000);
    expect(formatRelativeTime(d, now)).toMatch(/3 days ago/);
  });
});
