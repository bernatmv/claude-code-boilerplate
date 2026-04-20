import { describe, expect, it } from "vitest";

import { etag, hashHex } from "./hash";

describe("hashHex", () => {
  it("matches known SHA-256 for empty string", async () => {
    expect(await hashHex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("matches known SHA-256 for 'abc'", async () => {
    expect(await hashHex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("is deterministic for the same input", async () => {
    const a = await hashHex("hello world");
    const b = await hashHex("hello world");
    expect(a).toBe(b);
  });

  it("differs across inputs", async () => {
    expect(await hashHex("a")).not.toBe(await hashHex("b"));
  });

  it("supports SHA-1", async () => {
    expect(await hashHex("abc", "SHA-1")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });
});

describe("etag", () => {
  it("returns a weak etag wrapping a 16-char prefix", async () => {
    const tag = await etag("abc");
    expect(tag.startsWith('W/"')).toBe(true);
    expect(tag.endsWith('"')).toBe(true);
    expect(tag).toBe('W/"ba7816bf8f01cfea"');
  });
});
