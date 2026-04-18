import { http, HttpResponse } from "msw";

export const itemsListHandler = http.get("*/rest/v1/items", () =>
  HttpResponse.json([
    {
      id: "00000000-0000-0000-0000-000000000001",
      user_id: "00000000-0000-0000-0000-000000000002",
      title: "Seed item",
      description: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ]),
);

export const handlers = [itemsListHandler];
