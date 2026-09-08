import { expect, test } from "@playwright/test";
import { PortalPage, StatementModal } from "./pages/portal-page";

const CURRENT_BALANCE = "KES 1,250,000.00";
const TRANSACTION_ROW_COUNT = 4;
// Date.now().toString(36).toUpperCase() — 8 chars until ~2059.
const REFERENCE_PATTERN = /^STB-STM-[A-Z0-9]{8}$/;

test.describe("Account Statement — multi-step modal (#15)", () => {
  let portal: PortalPage;
  let statement: StatementModal;

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    statement = new StatementModal(page);
    await portal.goto();
  });

  test("Statement quick action opens the modal with Details active", async () => {
    await portal.quickAction("download-statement").click();

    await expect(statement.modal).toBeVisible();
    await expect(statement.modal).toHaveRole("dialog");
    await expect(statement.modal).toHaveAttribute("aria-modal", "true");

    await expect(statement.stepPill("details")).toBeVisible();
    await expect(statement.stepPill("review")).toBeVisible();
    await expect(statement.stepPill("success")).toBeVisible();
    await expect(statement.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(statement.stepPill("review")).not.toHaveAttribute("aria-current", "step");
    await expect(statement.stepPill("success")).not.toHaveAttribute("aria-current", "step");

    await expect(statement.accountSelect).toBeVisible();
    await expect(statement.periodSelect).toBeVisible();
    await expect(statement.formatSelect).toBeVisible();
    await expect(statement.nextButton).toBeVisible();
  });

  test("Details step offers the exact select options with correct defaults", async () => {
    await portal.quickAction("download-statement").click();

    await expect(statement.accountOptions).toHaveText([
      "Current Account •••• 4521",
      "Savings Account •••• 7810",
      "USD Account •••• 2093",
    ]);
    await expect(statement.accountSelect).toHaveValue("Current Account •••• 4521");

    await expect(statement.periodOptions).toHaveText([
      "Last 30 days",
      "Last 90 days",
      "Year to date",
    ]);
    await expect(statement.periodSelect).toHaveValue("Last 30 days");

    await expect(statement.formatOptions).toHaveText(["PDF", "CSV"]);
    await expect(statement.formatSelect).toHaveValue("PDF");
  });

  test("Review step reflects the chosen selections and marks Review active", async () => {
    await portal.quickAction("download-statement").click();
    await statement.fillDetails("Savings Account •••• 7810", "Last 90 days", "CSV");
    await statement.nextButton.click();

    await expect(statement.stepPill("review")).toHaveAttribute("aria-current", "step");
    await expect(statement.stepPill("details")).not.toHaveAttribute("aria-current", "step");

    await expect(statement.reviewAccount).toHaveText("Savings Account •••• 7810");
    await expect(statement.reviewPeriod).toHaveText("Last 90 days");
    await expect(statement.reviewFormat).toHaveText("CSV");

    await expect(statement.backButton).toBeVisible();
    await expect(statement.confirmButton).toBeVisible();
    await expect(statement.accountSelect).toHaveCount(0);
    await expect(statement.periodSelect).toHaveCount(0);
    await expect(statement.formatSelect).toHaveCount(0);
  });

  test("Back returns to Details with values preserved", async () => {
    await portal.quickAction("download-statement").click();
    await statement.fillDetails("Savings Account •••• 7810", "Last 90 days", "CSV");
    await statement.nextButton.click();

    await statement.backButton.click();

    await expect(statement.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(statement.accountSelect).toHaveValue("Savings Account •••• 7810");
    await expect(statement.periodSelect).toHaveValue("Last 90 days");
    await expect(statement.formatSelect).toHaveValue("CSV");

    await statement.nextButton.click();
    await expect(statement.reviewAccount).toHaveText("Savings Account •••• 7810");
    await expect(statement.reviewPeriod).toHaveText("Last 90 days");
    await expect(statement.reviewFormat).toHaveText("CSV");
  });

  test("Happy path: Generate Statement shows Success with STB-STM reference", async () => {
    await portal.quickAction("download-statement").click();
    await statement.nextButton.click();
    await statement.confirmButton.click();

    await expect(statement.stepPill("success")).toHaveAttribute("aria-current", "step");
    await expect(statement.stepPill("details")).not.toHaveAttribute("aria-current", "step");
    await expect(statement.stepPill("review")).not.toHaveAttribute("aria-current", "step");

    await expect(statement.successPanel).toBeVisible();
    await expect(statement.successPanel).toContainText("Statement Ready");
    await expect(statement.successPanel).toContainText(
      "PDF statement for Current Account •••• 4521 (Last 30 days)",
    );

    await expect(statement.reference).toHaveText(REFERENCE_PATTERN);

    await expect(statement.doneButton).toBeVisible();
    await expect(statement.confirmButton).toHaveCount(0);
    await expect(statement.backButton).toHaveCount(0);
  });

  test("Generating a statement has NO balance impact and records NO transaction", async () => {
    await expect(portal.currentAccountCard).toContainText(CURRENT_BALANCE);
    await expect(portal.transactionRows).toHaveCount(TRANSACTION_ROW_COUNT);

    await portal.quickAction("download-statement").click();
    await statement.nextButton.click();
    await statement.confirmButton.click();
    await expect(statement.successPanel).toBeVisible();
    await statement.doneButton.click();

    await expect(statement.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText(CURRENT_BALANCE);
    await expect(portal.transactionRows).toHaveCount(TRANSACTION_ROW_COUNT);
  });

  test("Close via the × button before confirm leaves everything unchanged", async () => {
    await expect(portal.currentAccountCard).toContainText(CURRENT_BALANCE);
    await expect(portal.transactionRows).toHaveCount(TRANSACTION_ROW_COUNT);

    await portal.quickAction("download-statement").click();
    await statement.accountSelect.selectOption("USD Account •••• 2093");
    await statement.periodSelect.selectOption("Year to date");
    await statement.nextButton.click();
    await statement.closeButton.click();

    await expect(statement.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText(CURRENT_BALANCE);
    await expect(portal.transactionRows).toHaveCount(TRANSACTION_ROW_COUNT);

    await portal.quickAction("download-statement").click();
    await expect(statement.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(statement.accountSelect).toHaveValue("Current Account •••• 4521");
    await expect(statement.periodSelect).toHaveValue("Last 30 days");
    await expect(statement.formatSelect).toHaveValue("PDF");
  });

  test("Close via the Escape key before confirm leaves everything unchanged", async () => {
    await expect(portal.currentAccountCard).toContainText(CURRENT_BALANCE);
    await expect(portal.transactionRows).toHaveCount(TRANSACTION_ROW_COUNT);

    await portal.quickAction("download-statement").click();
    await expect(statement.modal).toBeVisible();
    await portal.page.keyboard.press("Escape");

    await expect(statement.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText(CURRENT_BALANCE);
    await expect(portal.transactionRows).toHaveCount(TRANSACTION_ROW_COUNT);
  });

  test("Done closes the modal after success and resets the flow", async () => {
    await portal.quickAction("download-statement").click();
    await statement.nextButton.click();
    await statement.confirmButton.click();
    await expect(statement.successPanel).toBeVisible();

    await statement.doneButton.click();
    await expect(statement.modal).toHaveCount(0);

    await portal.quickAction("download-statement").click();
    await expect(statement.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(statement.accountSelect).toHaveValue("Current Account •••• 4521");
    await expect(statement.periodSelect).toHaveValue("Last 30 days");
    await expect(statement.formatSelect).toHaveValue("PDF");

    await expect(portal.currentAccountCard).toContainText(CURRENT_BALANCE);
    await expect(portal.transactionRows).toHaveCount(TRANSACTION_ROW_COUNT);
  });
});
