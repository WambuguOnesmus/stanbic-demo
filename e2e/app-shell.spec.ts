import { expect, test } from "@playwright/test";

test.describe("Stanbic Banking Portal — app shell", () => {
  test("serves the approved prototype alongside the app", async ({ page }) => {
    await page.goto("/prototype/index.html");

    await expect(page.getByTestId("stb-accounts-overview")).toBeVisible();
    await expect(page.getByTestId("stb-quick-actions")).toBeVisible();
  });
});
