import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { isEmailConfigured, sendEmail } from "./email";
import { subscriptionActivatedEmail, welcomeEmail } from "./emails/templates";

describe("email", () => {
  const original = { key: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM };

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
  });

  afterEach(() => {
    if (original.key) process.env.RESEND_API_KEY = original.key;
    if (original.from) process.env.EMAIL_FROM = original.from;
  });

  it("isEmailConfigured returns false without env", () => {
    expect(isEmailConfigured()).toBe(false);
  });

  it("sendEmail returns not-configured error when missing env", async () => {
    const r = await sendEmail({ to: "x@y.z", subject: "s", html: "<p>h</p>" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("email-not-configured");
  });
});

describe("email templates", () => {
  it("welcomeEmail renders subject and links", () => {
    const r = welcomeEmail({ appName: "Acme", signInUrl: "https://acme.test/sign-in" });
    expect(r.subject).toContain("Acme");
    expect(r.html).toContain("https://acme.test/sign-in");
    expect(r.text).toContain("https://acme.test/sign-in");
  });

  it("subscriptionActivatedEmail renders manage link", () => {
    const r = subscriptionActivatedEmail({
      appName: "Acme",
      manageUrl: "https://acme.test/billing",
    });
    expect(r.subject).toContain("active");
    expect(r.html).toContain("https://acme.test/billing");
  });
});
