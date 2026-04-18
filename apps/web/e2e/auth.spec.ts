import { expect, test } from "@playwright/test";

test.describe("auth", () => {
  test("sign-in page renders with email + password fields", async ({ page }) => {
    await page.goto("/en/sign-in");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("sign-in links to sign-up and forgot-password", async ({ page }) => {
    await page.goto("/en/sign-in");
    await page.getByRole("link", { name: /no account|sign up/i }).click();
    await expect(page).toHaveURL(/\/en\/sign-up$/);
    await page.goto("/en/sign-in");
    await page.getByRole("link", { name: /forgot/i }).click();
    await expect(page).toHaveURL(/\/en\/forgot-password$/);
  });

  test("sign-up shows error when passwords do not match", async ({ page }) => {
    await page.goto("/en/sign-up");
    await page.getByLabel(/email/i).fill("user@example.com");
    await page.getByLabel("Password", { exact: true }).fill("password123");
    await page.getByLabel(/confirm/i).fill("different123");
    await page.getByRole("button", { name: /sign up/i }).click();
    await expect(page.getByText(/match/i)).toBeVisible();
  });

  test("forgot-password page renders", async ({ page }) => {
    await page.goto("/en/forgot-password");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("Google button is disabled (not configured)", async ({ page }) => {
    await page.goto("/en/sign-in");
    const google = page.getByRole("button", { name: /google/i });
    await expect(google).toBeDisabled();
  });

  test("protected route redirects to sign-in when unauthenticated", async ({ page }) => {
    await page.goto("/en/profile");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
