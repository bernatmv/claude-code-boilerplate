import { describe, expect, it } from "vitest";
import { createSupabaseBrowserClient } from "./client.js";

describe("createSupabaseBrowserClient", () => {
  it("returns a client exposing auth + from APIs", () => {
    const client = createSupabaseBrowserClient("https://example.supabase.co", "anon-key");
    expect(typeof client.auth.getSession).toBe("function");
    expect(typeof client.from).toBe("function");
  });

  it("throws if url or key is missing", () => {
    expect(() => createSupabaseBrowserClient("", "k")).toThrow();
    expect(() => createSupabaseBrowserClient("https://example.supabase.co", "")).toThrow();
  });
});
