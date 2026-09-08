import { expect, test } from "@playwright/test";
import { PortalPage } from "./pages/portal-page";

test.describe("Dashboard - accounts overview, quick actions and recent transactions (#14)", () => {
  let portal: PortalPage;

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    await portal.goto();
  });

  test("replaces the coming-soon shell with the dashboard", async ({ page }) => {
    await expect(page.getByTestId("stb-coming-soon")).toHaveCount(0);
    await expect(portal.accountsOverview).toBeVisible();
    await expect(portal.quickActionsPanel).toBeVisible();
    await expect(portal.transactionsPanel).toBeVisible();
  });

  test("shows the header brand bar with the environment pill", async () => {
    await expect(portal.envPill).toBeVisible();
    await expect(portal.envPill).toContainText("Demo Environment");
  });

  test("shows all three account cards with label, balance and masked number", async () => {
    await expect(portal.currentAccountCard).toContainText("Current Account");
    await expect(portal.currentAccountCard).toContainText("KES 1,250,000.00");
    await expect(portal.currentAccountCard).toContainText("•••• 4521");

    await expect(portal.savingsAccountCard).toContainText("Savings Account");
    await expect(portal.savingsAccountCard).toContainText("KES 3,480,200.55");
    await expect(portal.savingsAccountCard).toContainText("•••• 7810");

    await expect(portal.usdAccountCard).toContainText("USD Account");
    await expect(portal.usdAccountCard).toContainText("USD 12,940.10");
    await expect(portal.usdAccountCard).toContainText("•••• 2093");
  });

  test("shows the four quick action launchers", async () => {
    for (const id of ["pay-bills", "buy-airtime", "download-statement", "deposit"]) {
      await expect(portal.quickAction(id)).toBeVisible();
      await expect(portal.quickAction(id)).toBeEnabled();
    }
  });

  test("shows seeded recent transactions with signed, colour-coded amounts", async () => {
    await expect(portal.transactionRows).toHaveCount(4);

    const salary = portal.transactionRows.first();
    await expect(salary).toContainText("Salary — Acme Industries Ltd");
    await expect(salary).toContainText("SAL-082026");
    await expect(salary).toContainText("+320,000.00");

    const groceries = portal.transactionRows.last();
    await expect(groceries).toContainText("Naivas Supermarket");
    await expect(groceries).toContainText("-12,845.50");
  });
});
