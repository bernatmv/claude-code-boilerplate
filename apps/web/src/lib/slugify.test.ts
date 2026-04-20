import { describe, expect, it } from "vitest";

import { slugify, uniqueSlug } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Olé")).toBe("cafe-ole");
    expect(slugify("Niño")).toBe("nino");
  });

  it("collapses non-alphanumerics", () => {
    expect(slugify("foo!!  bar??")).toBe("foo-bar");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  --hi--  ")).toBe("hi");
  });

  it("returns fallback for empty results", () => {
    expect(slugify("   !!!   ")).toBe("n-a");
    expect(slugify("", { fallback: "untitled" })).toBe("untitled");
  });

  it("honors maxLength", () => {
    const long = "a".repeat(200);
    expect(slugify(long, { maxLength: 10 })).toHaveLength(10);
  });

  it("trims dashes after truncation", () => {
    expect(slugify("abcdefghij-klmn", { maxLength: 11 })).toBe("abcdefghij");
  });
});

describe("uniqueSlug", () => {
  it("returns the base slug when not taken", () => {
    expect(uniqueSlug("Hello", [])).toBe("hello");
  });

  it("suffixes a counter when taken", () => {
    expect(uniqueSlug("Hello", ["hello"])).toBe("hello-2");
  });

  it("finds the next free counter", () => {
    expect(uniqueSlug("hello", ["hello", "hello-2", "hello-3"])).toBe("hello-4");
  });
});
