import { describe, expect, it } from "vitest";

import { apiErrors, err, ok } from "./api";

async function json(res: Response) {
  return (await res.json()) as unknown;
}

describe("ok()", () => {
  it("returns 200 with ok:true and data", async () => {
    const res = ok({ id: 1 });
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ ok: true, data: { id: 1 } });
  });

  it("accepts custom status", () => {
    const res = ok({ created: true }, 201);
    expect(res.status).toBe(201);
  });
});

describe("err()", () => {
  it("returns error shape with code", async () => {
    const res = err("Bad thing", 400, "BAD_THING");
    expect(res.status).toBe(400);
    expect(await json(res)).toEqual({ ok: false, error: "Bad thing", code: "BAD_THING" });
  });

  it("omits code when not provided", async () => {
    const res = err("oops", 500);
    const body = await json(res);
    expect(body).not.toHaveProperty("code");
  });
});

describe("apiErrors", () => {
  it("unauthorized returns 401", () => expect(apiErrors.unauthorized().status).toBe(401));
  it("forbidden returns 403", () => expect(apiErrors.forbidden().status).toBe(403));
  it("notFound returns 404", () => expect(apiErrors.notFound().status).toBe(404));
  it("badRequest returns 400", () => expect(apiErrors.badRequest("x").status).toBe(400));
  it("internal returns 500", () => expect(apiErrors.internal().status).toBe(500));
});
