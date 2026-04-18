import * as SecureStore from "expo-secure-store";

import type { StorageAdapter } from "@repo/api-client";

export const secureStoreAdapter: StorageAdapter = {
  async getItem(key) {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key, value) {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key) {
    await SecureStore.deleteItemAsync(key);
  },
};
