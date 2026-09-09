import { expect, test } from "@playwright/test";
import { DepositModal, PortalPage } from "./pages/portal-page";

const OPENING_BALANCE = "KES 1,250,000.00";
const SEEDED_ROW_COUNT = 4;
// Date.now().toString(36).toUpperCase() — 8 chars until ~2059.
const REFERENCE_PATTERN = /^STB-DEP-[A-Z0-9]{8}$/;

test.describe("Deposit — multi-step modal (#11)", () => {
  let portal: PortalPage;
  let deposit: DepositModal;

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    deposit = new DepositModal(page);
    await portal.goto();
  });

  test("Deposit quick action opens the modal with Details active and amount focused", async () => {
    await portal.quickAction("deposit").click();

    await expect(deposit.modal).toBeVisible();
    await expect(deposit.modal).toHaveRole("dialog");
    await expect(deposit.modal).toHaveAttribute("aria-modal", "true");

    await expect(deposit.stepPill("details")).toBeVisible();
    await expect(deposit.stepPill("review")).toBeVisible();
    await expect(deposit.stepPill("success")).toBeVisible();
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.stepPill("review")).not.toHaveAttribute("aria-current", "step");
    await expect(deposit.stepPill("success")).not.toHaveAttribute("aria-current", "step");

    await expect(deposit.amountInput).toBeFocused();
    await expect(deposit.sourceSelect).toBeVisible();
    await expect(deposit.nextButton).toBeVisible();
  });

  test("Details step offers the exact source options with Cash default", async () => {
    await portal.quickAction("deposit").click();

    await expect(deposit.sourceOptions).toHaveText(["Cash", "Cheque", "M-PESA"]);
    await expect(deposit.sourceSelect).toHaveValue("Cash");
  });

  test("Amounts below KES 100 show an inline alert and block progression", async () => {
    await portal.quickAction("deposit").click();

    await deposit.amountInput.fill("99.99");
    await deposit.nextButton.click();

    await expect(deposit.amountError).toHaveText("Enter a deposit of at least KES 100.");
    await expect(deposit.amountError).toHaveRole("alert");
    await expect(deposit.amountInput).toHaveAttribute("aria-invalid", "true");
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.confirmButton).toHaveCount(0);

    // Empty amount is also blocked.
    await deposit.amountInput.fill("");
    await deposit.nextButton.click();
    await expect(deposit.amountError).toHaveText("Enter a deposit of at least KES 100.");
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
  });

  test("A valid amount clears the error and reaches Review", async () => {
    await portal.quickAction("deposit").click();

    await deposit.amountInput.fill("50");
    await deposit.nextButton.click();
    await expect(deposit.amountError).toHaveText("Enter a deposit of at least KES 100.");

    await deposit.amountInput.fill("100");
    await deposit.nextButton.click();

    await expect(deposit.stepPill("review")).toHaveAttribute("aria-current", "step");
    await expect(deposit.amountError).toHaveCount(0);
  });

  test("Review step shows amount, source and target account", async () => {
    await portal.quickAction("deposit").click();
    await deposit.fillDetails("50000", "M-PESA");
    await deposit.nextButton.click();

    await expect(deposit.stepPill("review")).toHaveAttribute("aria-current", "step");
    await expect(deposit.stepPill("details")).not.toHaveAttribute("aria-current", "step");

    await expect(deposit.reviewAmount).toHaveText("KES 50,000.00");
    await expect(deposit.reviewSource).toHaveText("M-PESA");
    await expect(deposit.modal).toContainText("Current Account •••• 4521");

    await expect(deposit.backButton).toBeVisible();
    await expect(deposit.confirmButton).toBeVisible();
    await expect(deposit.amountInput).toHaveCount(0);
    await expect(deposit.sourceSelect).toHaveCount(0);
  });

  test("Back returns to Details with values preserved", async () => {
    await portal.quickAction("deposit").click();
    await deposit.fillDetails("50000", "Cheque");
    await deposit.nextButton.click();

    await deposit.backButton.click();

    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.amountInput).toHaveValue("50000");
    await expect(deposit.sourceSelect).toHaveValue("Cheque");

    await deposit.nextButton.click();
    await expect(deposit.reviewAmount).toHaveText("KES 50,000.00");
    await expect(deposit.reviewSource).toHaveText("Cheque");
  });

  test("Confirm Deposit credits the balance, shows a reference and records the transaction", async () => {
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);

    await portal.quickAction("deposit").click();
    await deposit.fillDetails("50000", "M-PESA");
    await deposit.nextButton.click();
    await deposit.confirmButton.click();

    await expect(deposit.stepPill("success")).toHaveAttribute("aria-current", "step");
    await expect(deposit.successPanel).toBeVisible();
    await expect(deposit.successPanel).toContainText("Deposit Recorded");
    await expect(deposit.successPanel).toContainText(
      "M-PESA deposit of KES 50,000.00 has been credited.",
    );
    await expect(deposit.reference).toHaveText(REFERENCE_PATTERN);
    const referenceText = (await deposit.reference.innerText()).trim();

    await expect(portal.currentAccountCard).toContainText("KES 1,300,000.00");

    await deposit.doneButton.click();
    await expect(deposit.modal).toHaveCount(0);

    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT + 1);
    const topRow = portal.transactionRows.first();
    await expect(portal.rowCells(topRow).nth(1)).toHaveText("M-PESA Deposit");
    await expect(portal.rowCells(topRow).nth(2)).toHaveText(referenceText);
    expect(await portal.amountValue(topRow)).toBe(50_000);
  });

  test("Closing via the × button before confirm leaves balance and transactions unchanged", async () => {
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);

    await portal.quickAction("deposit").click();
    await deposit.fillDetails("75000", "Cash");
    await deposit.nextButton.click();
    await deposit.closeButton.click();

    await expect(deposit.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);

    // Reopening starts fresh at Details.
    await portal.quickAction("deposit").click();
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.amountInput).toHaveValue("");
    await expect(deposit.sourceSelect).toHaveValue("Cash");
  });

  test("Escape closes the modal before confirmation with no side effects", async ({ page }) => {
    await portal.quickAction("deposit").click();
    await deposit.fillDetails("25000", "Cheque");
    await deposit.nextButton.click();

    await page.keyboard.press("Escape");

    await expect(deposit.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);
  });
});
