import { expect, test } from "@playwright/test";

test.describe("Stanbic Banking Portal — app shell", () => {
  test("shows the coming soon shell with a link to the approved prototype", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("stb-coming-soon")).toBeVisible();
    await expect(page.getByTestId("stb-coming-soon")).toContainText("Banking Portal Coming Soon");
    await expect(page.getByTestId("stb-prototype-link")).toHaveAttribute(
      "href",
      "/prototype/index.html",
    );
  });

  test("serves the approved prototype alongside the app", async ({ page }) => {
    await page.goto("/prototype/index.html");

    await expect(page.getByTestId("stb-accounts-overview")).toBeVisible();
    await expect(page.getByTestId("stb-quick-actions")).toBeVisible();
  });
});
