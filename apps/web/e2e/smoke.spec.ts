import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"] as const) {
  test(`landing renders (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test(`article index + detail render (${locale})`, async ({ page }) => {
    await page.goto(`/${locale}/articles`);
    const firstArticle = page.getByRole("link", { name: /welcome|bienvenido/i }).first();
    await firstArticle.click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/articles/welcome$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test(`seo endpoints respond (${locale})`, async ({ request }) => {
    for (const path of ["/sitemap.xml", "/robots.txt", "/rss.xml", "/llms.txt"]) {
      const res = await request.get(path);
      expect(res.status(), `${path} status`).toBe(200);
    }
  });
}
