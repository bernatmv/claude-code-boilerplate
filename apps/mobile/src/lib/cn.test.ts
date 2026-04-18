import { describe, expect, it } from "vitest";

import { cn } from "./cn.js";

describe("cn", () => {
  it("merges conflicting tailwind utilities, last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignores falsy inputs", () => {
    expect(cn("text-base", false, null, undefined, "font-bold")).toBe("text-base font-bold");
  });
});
