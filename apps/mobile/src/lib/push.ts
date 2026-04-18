import { upsertPushToken, type PushDevice } from "@repo/api-client";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { supabase } from "@/lib/supabase";

Notifications.setNotificationHandler({
  // eslint-disable-next-line @typescript-eslint/require-await
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface EasConfig {
  projectId?: string;
}

function resolveProjectId(): string | undefined {
  const extraEas = (Constants.expoConfig?.extra as { eas?: EasConfig } | undefined)?.eas;
  const easConfig = Constants.easConfig as EasConfig | undefined;
  return extraEas?.projectId ?? easConfig?.projectId;
}

export async function registerForPushNotifications(userId: string): Promise<PushDevice | null> {
  if (!Device.isDevice) return null;
  const os = Platform.OS;
  if (os !== "ios" && os !== "android") return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status: string = existing;
  if (status !== "granted") {
    const { status: next } = await Notifications.requestPermissionsAsync();
    status = next;
  }
  if (status !== "granted") return null;

  if (os === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = resolveProjectId();
  const tokenResult = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  const device: PushDevice = {
    expoToken: tokenResult.data,
    deviceId: `${os}-${Device.modelId ?? Device.modelName ?? "unknown"}`,
    platform: os,
  };

  await upsertPushToken(supabase, userId, device);
  return device;
}
