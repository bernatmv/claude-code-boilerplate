import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isAuthorizedCronRequest } from "./cron";

describe("isAuthorizedCronRequest", () => {
  const original = process.env.CRON_SECRET;

  beforeEach(() => {
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    if (original) process.env.CRON_SECRET = original;
  });

  it("returns false when CRON_SECRET unset", () => {
    expect(isAuthorizedCronRequest(new Headers({ authorization: "Bearer x" }))).toBe(false);
  });

  it("returns false when bearer mismatches", () => {
    process.env.CRON_SECRET = "real";
    expect(isAuthorizedCronRequest(new Headers({ authorization: "Bearer wrong" }))).toBe(false);
  });

  it("returns false when header missing", () => {
    process.env.CRON_SECRET = "real";
    expect(isAuthorizedCronRequest(new Headers())).toBe(false);
  });

  it("returns true on exact match", () => {
    process.env.CRON_SECRET = "real";
    expect(isAuthorizedCronRequest(new Headers({ authorization: "Bearer real" }))).toBe(true);
  });
});
