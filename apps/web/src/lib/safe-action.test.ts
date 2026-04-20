import { describe, expect, it } from "vitest";
import { z } from "zod";

import { formDataToObject, safeAction } from "./safe-action";

describe("safeAction", () => {
  const schema = z.object({
    email: z.string().email(),
    age: z.number().int().min(0),
  });

  it("returns ok with parsed data on success", async () => {
    const action = safeAction(schema, (input) => Promise.resolve({ id: "1", ...input }));
    const result = await action({ email: "a@b.com", age: 30 });
    expect(result).toEqual({ ok: true, data: { id: "1", email: "a@b.com", age: 30 } });
  });

  it("returns fieldErrors on invalid input", async () => {
    const action = safeAction(schema, () => Promise.resolve("never"));
    const result = await action({ email: "not-an-email", age: -1 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Invalid input");
      expect(result.fieldErrors?.email).toBeDefined();
      expect(result.fieldErrors?.age).toBeDefined();
    }
  });

  it("catches thrown handler errors", async () => {
    const action = safeAction(schema, () => {
      throw new Error("boom");
    });
    const result = await action({ email: "a@b.com", age: 1 });
    expect(result).toEqual({ ok: false, error: "boom" });
  });

  it("handles non-Error thrown values", async () => {
    const action = safeAction(schema, () => {
      throw "string error"; // eslint-disable-line @typescript-eslint/only-throw-error
    });
    const result = await action({ email: "a@b.com", age: 1 });
    expect(result).toEqual({ ok: false, error: "Unknown error" });
  });
});

describe("formDataToObject", () => {
  it("converts simple form data", () => {
    const fd = new FormData();
    fd.set("name", "Alice");
    fd.set("age", "30");
    expect(formDataToObject(fd)).toEqual({ name: "Alice", age: "30" });
  });

  it("collects repeated keys into arrays", () => {
    const fd = new FormData();
    fd.append("tags", "a");
    fd.append("tags", "b");
    fd.append("tags", "c");
    expect(formDataToObject(fd)).toEqual({ tags: ["a", "b", "c"] });
  });
});
