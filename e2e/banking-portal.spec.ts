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

  test("hosts the international transfer widget on the dashboard", async ({ page }) => {
    await expect(page.getByTestId("stb-amount-input")).toBeVisible();
    await expect(page.getByTestId("stb-quote-panel")).toBeVisible();
    await expect(page.getByTestId("stb-submit-button")).toBeVisible();
  });

  test("shows all four quick actions", async () => {
    await expect(portal.quickActionsPanel).toBeVisible();
    for (const id of ["pay-bills", "buy-airtime", "download-statement", "deposit"]) {
      await expect(portal.quickAction(id)).toBeVisible();
    }
  });

  test("confirms a quick action request via the live status region", async () => {
    await portal.quickAction("buy-airtime").click();
    await expect(portal.actionStatus).toContainText(
      "Buy Airtime request queued — you will receive an SMS confirmation.",
    );
  });
});
