import { describe, expect, it } from "vitest";
import { createItemSchema, itemSchema, updateItemSchema } from "./item.js";

describe("createItemSchema", () => {
  it("requires title (1–200 chars) and allows optional description", () => {
    expect(createItemSchema.safeParse({ title: "hello" }).success).toBe(true);
    expect(createItemSchema.safeParse({ title: "hello", description: "hi" }).success).toBe(true);
    expect(createItemSchema.safeParse({ title: "" }).success).toBe(false);
    expect(createItemSchema.safeParse({ title: "x".repeat(201) }).success).toBe(false);
  });
});

describe("updateItemSchema", () => {
  it("requires at least one field", () => {
    expect(updateItemSchema.safeParse({}).success).toBe(false);
    expect(updateItemSchema.safeParse({ title: "new" }).success).toBe(true);
    expect(updateItemSchema.safeParse({ description: "new" }).success).toBe(true);
  });
});

describe("itemSchema", () => {
  it("validates a full DB row", () => {
    const row = {
      id: "00000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000002",
      title: "t",
      description: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    };
    expect(itemSchema.safeParse(row).success).toBe(true);
  });
});
