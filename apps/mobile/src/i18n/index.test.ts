import { describe, expect, it, vi } from "vitest";

vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }],
}));

describe("mobile i18n", () => {
  it("initializes with en and resolves namespaces", async () => {
    const { i18n } = await import("./index.js");
    expect(i18n.language).toBe("en");
    expect(i18n.t("appName", { ns: "common" })).toBe("Claude Code Boilerplate");
    expect(i18n.t("nav.home", { ns: "common" })).toBe("Home");
    expect(i18n.hasResourceBundle("es", "common")).toBe(true);
    expect(i18n.hasResourceBundle("en", "errors")).toBe(true);
    expect(i18n.hasResourceBundle("en", "auth")).toBe(true);
  });
});
