import { expect, test } from "@playwright/test";
import { PortalPage, StatementModal } from "./pages/portal-page";

test.describe("Account Statement - multi-step modal (#15)", () => {
  let portal: PortalPage;
  let statement: StatementModal;

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    statement = new StatementModal(page);
    await portal.goto();
  });

  test("opens from the Statement quick action with the details step active", async () => {
    await portal.quickAction("download-statement").click();

    await expect(statement.modal).toBeVisible();
    await expect(statement.modal).toHaveAttribute("aria-modal", "true");
    await expect(statement.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(statement.accountSelect).toBeFocused();
  });

  test("review step shows the selected account, period and format", async () => {
    await portal.quickAction("download-statement").click();
    await statement.fillDetails("Savings Account •••• 7810", "Last 90 days", "CSV");
    await statement.nextButton.click();

    await expect(statement.stepPill("review")).toHaveAttribute("aria-current", "step");
    await expect(statement.reviewAccount).toContainText("Savings Account •••• 7810");
    await expect(statement.reviewPeriod).toContainText("Last 90 days");
    await expect(statement.reviewFormat).toContainText("CSV");
  });

  test("back returns to details with the selections preserved", async () => {
    await portal.quickAction("download-statement").click();
    await statement.fillDetails("USD Account •••• 2093", "Year to date", "CSV");
    await statement.nextButton.click();
    await statement.backButton.click();

    await expect(statement.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(statement.accountSelect).toHaveValue("USD Account •••• 2093");
    await expect(statement.periodSelect).toHaveValue("Year to date");
    await expect(statement.formatSelect).toHaveValue("CSV");
  });

  test("generating shows Statement Ready with an STB-STM reference and no balance or transaction impact", async () => {
    await portal.quickAction("download-statement").click();
    await statement.fillDetails("Current Account •••• 4521", "Last 30 days", "PDF");
    await statement.nextButton.click();
    await statement.confirmButton.click();

    await expect(statement.stepPill("success")).toHaveAttribute("aria-current", "step");
    await expect(statement.successPanel).toContainText("Statement Ready");
    await expect(statement.successPanel).toContainText(
      "PDF statement for Current Account •••• 4521 (Last 30 days) is ready for download.",
    );
    await expect(statement.reference).toContainText(/^STB-STM-/);

    await statement.doneButton.click();
    await expect(statement.modal).not.toBeVisible();

    // No balance impact and no transaction recorded.
    await expect(portal.currentAccountCard).toContainText("KES 1,250,000.00");
    await expect(portal.transactionRows).toHaveCount(4);
  });

  test("closes via the close button and Escape without side effects", async () => {
    await portal.quickAction("download-statement").click();
    await statement.closeButton.click();
    await expect(statement.modal).not.toBeVisible();

    await portal.quickAction("download-statement").click();
    await portal.page.keyboard.press("Escape");
    await expect(statement.modal).not.toBeVisible();

    await expect(portal.currentAccountCard).toContainText("KES 1,250,000.00");
    await expect(portal.transactionRows).toHaveCount(4);
  });
});
