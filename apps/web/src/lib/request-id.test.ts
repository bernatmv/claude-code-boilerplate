import { describe, expect, it } from "vitest";

import { REQUEST_ID_HEADER, generateRequestId, getOrGenerateRequestId } from "./request-id";

describe("generateRequestId", () => {
  it("returns a UUID", () => {
    const id = generateRequestId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("produces unique ids", () => {
    expect(generateRequestId()).not.toBe(generateRequestId());
  });
});

describe("getOrGenerateRequestId", () => {
  it("returns existing header value when present", () => {
    const headers = new Headers({ [REQUEST_ID_HEADER]: "abc-123" });
    expect(getOrGenerateRequestId(headers)).toBe("abc-123");
  });

  it("generates one when absent", () => {
    const id = getOrGenerateRequestId(new Headers());
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
