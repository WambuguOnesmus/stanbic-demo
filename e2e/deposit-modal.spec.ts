import { expect, test } from "@playwright/test";
import { DepositModal, PortalPage } from "./pages/portal-page";

const OPENING_BALANCE = "KES 1,250,000.00";
const SEEDED_ROW_COUNT = 4;
const MIN_DEPOSIT_ERROR = "Enter a deposit of at least KES 100.";
const REFERENCE_PATTERN = /^STB-DEP-[A-Z0-9]+$/;

test.describe("Deposit — multi-step modal (#11)", () => {
  let portal: PortalPage;
  let deposit: DepositModal;

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    deposit = new DepositModal(page);
    await portal.goto();
  });

  test("Deposit quick action opens an accessible modal at the Details step", async () => {
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
    await expect(deposit.amountInput).toHaveValue("");
    await expect(deposit.sourceSelect).toHaveValue("Cash");
    await expect(deposit.nextButton).toBeVisible();
    await expect(deposit.closeButton).toBeVisible();
    await expect(deposit.amountError).toHaveCount(0);
  });

  test("Empty amount is blocked with an inline alert", async () => {
    await portal.quickAction("deposit").click();

    await deposit.nextButton.click();

    await expect(deposit.amountError).toHaveText(MIN_DEPOSIT_ERROR);
    await expect(deposit.amountError).toHaveRole("alert");
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.reviewAmount).toHaveCount(0);
  });

  test("Boundary: 99.99 is blocked (below KES 100 minimum)", async () => {
    await portal.quickAction("deposit").click();

    await deposit.amountInput.fill("99.99");
    await deposit.nextButton.click();

    await expect(deposit.amountError).toHaveText(MIN_DEPOSIT_ERROR);
    await expect(deposit.amountError).toHaveRole("alert");
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.reviewAmount).toHaveCount(0);
  });

  test("Boundary: exactly 100 is allowed and proceeds to Review", async () => {
    await portal.quickAction("deposit").click();

    await deposit.amountInput.fill("100");
    await deposit.nextButton.click();

    await expect(deposit.amountError).toHaveCount(0);
    await expect(deposit.stepPill("review")).toHaveAttribute("aria-current", "step");
    await expect(deposit.stepPill("details")).not.toHaveAttribute("aria-current", "step");
    await expect(deposit.reviewAmount).toHaveText("KES 100.00");
    await expect(deposit.reviewSource).toHaveText("Cash");
  });

  test("Review step shows entered values and the target account", async () => {
    await portal.quickAction("deposit").click();
    await deposit.fillDetails("25000", "M-PESA");
    await deposit.nextButton.click();

    await expect(deposit.reviewAmount).toHaveText("KES 25,000.00");
    await expect(deposit.reviewSource).toHaveText("M-PESA");
    await expect(deposit.modal).toContainText("Current Account •••• 4521");

    await expect(deposit.backButton).toBeVisible();
    await expect(deposit.confirmButton).toBeVisible();
    await expect(deposit.nextButton).toHaveCount(0);
  });

  test("Back returns to Details with values preserved", async () => {
    await portal.quickAction("deposit").click();
    await deposit.fillDetails("25000", "M-PESA");
    await deposit.nextButton.click();

    await deposit.backButton.click();

    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.amountInput).toHaveValue("25000");
    await expect(deposit.sourceSelect).toHaveValue("M-PESA");
    await expect(deposit.amountError).toHaveCount(0);
  });

  test("Happy path: Confirm credits balance, shows reference, prepends transaction", async () => {
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);

    await portal.quickAction("deposit").click();
    await deposit.fillDetails("25000", "M-PESA");
    await deposit.nextButton.click();
    await deposit.confirmButton.click();

    await expect(deposit.stepPill("success")).toHaveAttribute("aria-current", "step");
    await expect(deposit.successPanel).toBeVisible();
    await expect(deposit.successPanel).toContainText("Deposit Recorded");
    await expect(deposit.successPanel).toContainText(
      "M-PESA deposit of KES 25,000.00 has been credited.",
    );
    await expect(deposit.reference).toHaveText(REFERENCE_PATTERN);
    const referenceText = (await deposit.reference.innerText()).trim();

    await expect(portal.currentAccountCard).toContainText("KES 1,275,000.00");

    await deposit.doneButton.click();
    await expect(deposit.modal).toHaveCount(0);

    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT + 1);
    const topRow = portal.transactionRows.first();
    await expect(topRow).toContainText("M-PESA Deposit");
    await expect(topRow).toContainText(referenceText);
    await expect(portal.amountCell(topRow)).toHaveText("+25,000.00");
  });

  test("Boundary happy path: minimum deposit of exactly KES 100", async () => {
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);

    await portal.quickAction("deposit").click();
    await deposit.amountInput.fill("100");
    await deposit.nextButton.click();
    await deposit.confirmButton.click();
    await deposit.doneButton.click();

    await expect(portal.currentAccountCard).toContainText("KES 1,250,100.00");
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT + 1);
    const topRow = portal.transactionRows.first();
    await expect(topRow).toContainText("Cash Deposit");
    await expect(portal.amountCell(topRow)).toHaveText("+100.00");
  });

  test("Close via × before confirmation leaves state unchanged; reopen starts fresh", async () => {
    await portal.quickAction("deposit").click();
    await deposit.amountInput.fill("900");
    await deposit.nextButton.click();

    await deposit.closeButton.click();

    await expect(deposit.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);

    await portal.quickAction("deposit").click();
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.amountInput).toHaveValue("");
    await expect(deposit.sourceSelect).toHaveValue("Cash");
  });

  test("Escape key closes the modal before confirmation with no side effects", async ({
    page,
  }) => {
    await portal.quickAction("deposit").click();
    await deposit.amountInput.fill("5000");

    await page.keyboard.press("Escape");

    await expect(deposit.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText(OPENING_BALANCE);
    await expect(portal.transactionRows).toHaveCount(SEEDED_ROW_COUNT);

    await portal.quickAction("deposit").click();
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.amountInput).toHaveValue("");
    await expect(deposit.sourceSelect).toHaveValue("Cash");
  });

  test("Done closes the modal after a successful deposit", async () => {
    await portal.quickAction("deposit").click();
    await deposit.fillDetails("1000", "Cheque");
    await deposit.nextButton.click();
    await deposit.confirmButton.click();

    await deposit.doneButton.click();

    await expect(deposit.modal).toHaveCount(0);
    await expect(portal.currentAccountCard).toContainText("KES 1,251,000.00");

    await portal.quickAction("deposit").click();
    await expect(deposit.stepPill("details")).toHaveAttribute("aria-current", "step");
    await expect(deposit.amountInput).toHaveValue("");
    await expect(deposit.sourceSelect).toHaveValue("Cash");
  });
});
