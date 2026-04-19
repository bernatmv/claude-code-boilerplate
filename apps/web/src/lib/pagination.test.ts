import { describe, expect, it } from "vitest";

import { buildPaginatedResult, paginationRange, parsePaginationParams } from "./pagination";

describe("parsePaginationParams", () => {
  it("applies defaults when params missing", () => {
    expect(parsePaginationParams({})).toEqual({ page: 1, pageSize: 20 });
  });

  it("parses URLSearchParams", () => {
    const sp = new URLSearchParams("page=3&pageSize=10");
    expect(parsePaginationParams(sp)).toEqual({ page: 3, pageSize: 10 });
  });

  it("clamps pageSize to max 100", () => {
    expect(parsePaginationParams({ pageSize: "500" })).toEqual({ page: 1, pageSize: 100 });
  });

  it("rejects negatives and non-numeric", () => {
    expect(parsePaginationParams({ page: "-1", pageSize: "abc" })).toEqual({
      page: 1,
      pageSize: 20,
    });
  });
});

describe("paginationRange", () => {
  it("returns supabase-style from/to range", () => {
    expect(paginationRange({ page: 1, pageSize: 20 })).toEqual({ from: 0, to: 19 });
    expect(paginationRange({ page: 3, pageSize: 10 })).toEqual({ from: 20, to: 29 });
  });
});

describe("buildPaginatedResult", () => {
  it("computes totalPages, hasNext, hasPrev", () => {
    const r = buildPaginatedResult([1, 2, 3], 45, { page: 2, pageSize: 20 });
    expect(r).toEqual({
      data: [1, 2, 3],
      total: 45,
      page: 2,
      pageSize: 20,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    });
  });

  it("handles empty results", () => {
    const r = buildPaginatedResult([], 0, { page: 1, pageSize: 20 });
    expect(r.totalPages).toBe(1);
    expect(r.hasNext).toBe(false);
    expect(r.hasPrev).toBe(false);
  });
});
