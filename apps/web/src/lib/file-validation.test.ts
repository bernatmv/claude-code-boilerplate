import { describe, expect, it } from "vitest";

import { imageRules, validateFile } from "./file-validation";

describe("validateFile", () => {
  it("accepts valid avatar", () => {
    const r = validateFile({ name: "pic.png", type: "image/png", size: 50_000 }, imageRules.avatar);
    expect(r.ok).toBe(true);
  });

  it("rejects empty file", () => {
    const r = validateFile({ name: "p.png", type: "image/png", size: 0 }, imageRules.avatar);
    expect(r).toEqual({ ok: false, error: "File is empty", code: "EMPTY" });
  });

  it("rejects oversized file", () => {
    const r = validateFile(
      { name: "big.png", type: "image/png", size: 10 * 1024 * 1024 },
      imageRules.avatar,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("TOO_LARGE");
  });

  it("rejects wrong mime", () => {
    const r = validateFile(
      { name: "f.pdf", type: "application/pdf", size: 1000 },
      imageRules.avatar,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("BAD_MIME");
  });

  it("rejects wrong extension", () => {
    const r = validateFile({ name: "p.bmp", type: "image/png", size: 1000 }, imageRules.avatar);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("BAD_EXTENSION");
  });
});
