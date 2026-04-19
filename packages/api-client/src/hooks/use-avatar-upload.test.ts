import { describe, expect, it, vi } from "vitest";

import type { AppSupabaseClient } from "../client.js";
import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_BYTES,
  avatarObjectPath,
  uploadAvatar,
} from "./use-avatar-upload.js";

function makeClient() {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const getPublicUrl = vi
    .fn()
    .mockReturnValue({ data: { publicUrl: "https://cdn.example/avatars/u/avatar.jpg" } });
  const storageFrom = vi.fn().mockReturnValue({ upload, getPublicUrl });

  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ update });

  const client = {
    storage: { from: storageFrom },
    from,
  } as unknown as AppSupabaseClient;

  return { client, upload, update, eq, storageFrom };
}

describe("avatarObjectPath", () => {
  it("maps png/webp/jpeg to correct extension", () => {
    expect(avatarObjectPath("u1", "image/png")).toBe("u1/avatar.png");
    expect(avatarObjectPath("u1", "image/webp")).toBe("u1/avatar.webp");
    expect(avatarObjectPath("u1", "image/jpeg")).toBe("u1/avatar.jpg");
  });
});

describe("uploadAvatar", () => {
  it("uploads, updates profile, and returns cache-busted url", async () => {
    const { client, upload, update } = makeClient();
    const blob = new Blob(["x"], { type: "image/jpeg" });
    const url = await uploadAvatar(client, "u1", blob, "image/jpeg");

    expect(upload).toHaveBeenCalledWith("u1/avatar.jpg", blob, {
      contentType: "image/jpeg",
      upsert: true,
      cacheControl: "3600",
    });
    expect(update).toHaveBeenCalled();
    expect(url).toMatch(/^https:\/\/cdn\.example\/avatars\/u\/avatar\.jpg\?v=\d+$/);
  });

  it("rejects unsupported content types", async () => {
    const { client } = makeClient();
    const blob = new Blob(["x"], { type: "image/gif" });
    await expect(uploadAvatar(client, "u1", blob, "image/gif")).rejects.toThrow(/Unsupported/);
  });

  it("rejects files over the max size", async () => {
    const { client } = makeClient();
    const big = new Blob([new Uint8Array(MAX_AVATAR_BYTES + 1)], { type: "image/jpeg" });
    await expect(uploadAvatar(client, "u1", big, "image/jpeg")).rejects.toThrow(/exceeds/);
  });

  it("exposes allowed types list", () => {
    expect(ALLOWED_AVATAR_TYPES).toContain("image/jpeg");
  });
});
