export const queryKeys = {
  session: () => ["session"] as const,
  profile: (userId: string) => ["profile", userId] as const,
  items: {
    all: () => ["items"] as const,
    list: (userId: string) => ["items", "list", userId] as const,
    detail: (itemId: string) => ["items", "detail", itemId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
