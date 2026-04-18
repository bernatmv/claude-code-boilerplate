import { describe, expect, it, vi } from "vitest";

import { createPostHogProvider, type PostHogLike } from "./posthog.js";

function makeClient(): PostHogLike {
  return { capture: vi.fn(), identify: vi.fn() };
}

describe("createPostHogProvider", () => {
  it("forwards track to capture", () => {
    const client = makeClient();
    createPostHogProvider({ client }).track("signed_in", { plan: "pro" });
    expect(client.capture).toHaveBeenCalledWith("signed_in", { plan: "pro" });
  });

  it("forwards identify", () => {
    const client = makeClient();
    createPostHogProvider({ client }).identify("user-1", { email: "a@b.c" });
    expect(client.identify).toHaveBeenCalledWith("user-1", { email: "a@b.c" });
  });

  it("emits $pageview with $current_url on page()", () => {
    const client = makeClient();
    createPostHogProvider({ client }).page("/dashboard", { referrer: "/sign-in" });
    expect(client.capture).toHaveBeenCalledWith("$pageview", {
      $current_url: "/dashboard",
      referrer: "/sign-in",
    });
  });
});
