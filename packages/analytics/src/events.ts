export const STANDARD_EVENTS = {
  SIGN_UP: "sign_up",
  SIGN_IN: "sign_in",
  SIGN_OUT: "sign_out",
  PUSH_REGISTERED: "push_registered",
  LOCALE_CHANGED: "locale_changed",
  THEME_CHANGED: "theme_changed",
} as const;

export type StandardEvent = (typeof STANDARD_EVENTS)[keyof typeof STANDARD_EVENTS];
