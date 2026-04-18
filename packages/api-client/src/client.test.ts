import { describe, expect, it } from "vitest";
import {
  createSupabaseBrowserClient,
  createSupabaseMobileClient,
  type StorageAdapter,
} from "./client.js";

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

describe("createSupabaseMobileClient", () => {
  it("returns a client using the provided storage adapter", () => {
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    const client = createSupabaseMobileClient("https://example.supabase.co", "anon-key", storage);
    expect(typeof client.auth.getSession).toBe("function");
  });

  it("throws if url or key is missing", () => {
    const storage: StorageAdapter = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
    expect(() => createSupabaseMobileClient("", "k", storage)).toThrow();
    expect(() => createSupabaseMobileClient("https://example.supabase.co", "", storage)).toThrow();
  });
});
