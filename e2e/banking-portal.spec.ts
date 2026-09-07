import { expect, test } from "@playwright/test";
import { PortalPage } from "./pages/portal-page";

test.describe("Stanbic Banking Portal — dashboard", () => {
  let portal: PortalPage;

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    await portal.goto();
  });

  test("shows the accounts overview with all three accounts", async () => {
    await expect(portal.accountsOverview).toBeVisible();
    await expect(portal.currentAccountCard).toContainText("KES 1,250,000.00");
    await expect(portal.savingsAccountCard).toContainText("KES 3,480,200.55");
    await expect(portal.usdAccountCard).toContainText("USD 12,940.10");
  });

  test("shows the recent transactions panel with seeded activity", async () => {
    await expect(portal.transactionsPanel).toBeVisible();
    await expect(portal.transactionRows).toHaveCount(4);
    await expect(portal.transactionRows.first()).toContainText("Salary — Acme Industries Ltd");
    await expect(portal.transactionRows.first()).toContainText("+320,000.00");
  });

  test("hosts the FX transfer widget on the dashboard", async ({ page }) => {
    await expect(page.getByTestId("fx-amount-input")).toBeVisible();
    await expect(page.getByTestId("fx-quote-panel")).toBeVisible();
    await expect(page.getByTestId("fx-submit-button")).toBeVisible();
  });
});
