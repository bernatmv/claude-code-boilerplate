import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { itemsListHandler } from "./handlers.js";

const server = setupServer(itemsListHandler);

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe("itemsListHandler", () => {
  it("returns a JSON array for GET /rest/v1/items", async () => {
    const res = await fetch("https://example.supabase.co/rest/v1/items?select=*");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]?.id).toBeTypeOf("string");
  });
});
