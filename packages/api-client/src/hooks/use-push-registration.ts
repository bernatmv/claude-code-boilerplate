import type { AppSupabaseClient } from "../client.js";

export type Platform = "ios" | "android";

export interface PushDevice {
  expoToken: string;
  deviceId: string;
  platform: Platform;
}

export async function upsertPushToken(
  client: AppSupabaseClient,
  userId: string,
  device: PushDevice,
): Promise<void> {
  if (!userId) throw new Error("userId is required");
  const { error } = await client.from("push_tokens").upsert(
    {
      user_id: userId,
      device_id: device.deviceId,
      expo_token: device.expoToken,
      platform: device.platform,
    },
    { onConflict: "user_id,device_id" },
  );
  if (error) throw error;
}

export async function removePushToken(
  client: AppSupabaseClient,
  userId: string,
  deviceId: string,
): Promise<void> {
  if (!userId) throw new Error("userId is required");
  const { error } = await client
    .from("push_tokens")
    .delete()
    .eq("user_id", userId)
    .eq("device_id", deviceId);
  if (error) throw error;
}
