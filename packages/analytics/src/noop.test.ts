import { describe, expect, it } from "vitest";
import { createNoopProvider } from "./noop.js";

describe("createNoopProvider", () => {
  it("returns a provider whose methods do not throw", () => {
    const p = createNoopProvider();
    expect(p.name).toBe("noop");
    expect(() => p.track("sign_in")).not.toThrow();
    expect(() => p.identify("u1", { plan: "free" })).not.toThrow();
    expect(() => p.page("home")).not.toThrow();
  });
});
