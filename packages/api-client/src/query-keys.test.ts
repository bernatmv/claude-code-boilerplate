import { describe, expect, it } from "vitest";
import { queryKeys } from "./query-keys.js";

describe("queryKeys", () => {
  it("produces stable, hierarchical keys", () => {
    expect(queryKeys.session()).toEqual(["session"]);
    expect(queryKeys.items.all()).toEqual(["items"]);
    expect(queryKeys.items.list("u1")).toEqual(["items", "list", "u1"]);
    expect(queryKeys.items.detail("id1")).toEqual(["items", "detail", "id1"]);
    expect(queryKeys.profile("u1")).toEqual(["profile", "u1"]);
  });
});
