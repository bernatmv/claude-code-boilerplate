import { describe, expect, it, vi } from "vitest";

import type { AppSupabaseClient } from "../client.js";
import { removePushToken, upsertPushToken } from "./use-push-registration.js";

function makeClient(): {
  client: AppSupabaseClient;
  upsert: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
} {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const eq2 = vi.fn().mockResolvedValue({ error: null });
  const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
  const del = vi.fn().mockReturnValue({ eq: eq1 });
  const client = {
    from: vi.fn().mockReturnValue({ upsert, delete: del }),
  } as unknown as AppSupabaseClient;
  return { client, upsert, del, eq: eq2 };
}

describe("upsertPushToken", () => {
  it("upserts with onConflict composite key", async () => {
    const { client, upsert } = makeClient();
    await upsertPushToken(client, "user-1", {
      expoToken: "ExpoPushToken[abc]",
      deviceId: "ios-iPhone",
      platform: "ios",
    });
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        device_id: "ios-iPhone",
        expo_token: "ExpoPushToken[abc]",
        platform: "ios",
      },
      { onConflict: "user_id,device_id" },
    );
  });

  it("throws when userId is missing", async () => {
    const { client } = makeClient();
    await expect(
      upsertPushToken(client, "", {
        expoToken: "x",
        deviceId: "d",
        platform: "android",
      }),
    ).rejects.toThrow(/userId/);
  });
});

describe("removePushToken", () => {
  it("deletes by user_id + device_id", async () => {
    const { client, del } = makeClient();
    await removePushToken(client, "user-1", "android-pixel");
    expect(del).toHaveBeenCalled();
  });
});
