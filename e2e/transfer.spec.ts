import { expect, test } from "@playwright/test";
import { TransferPage } from "./pages/transfer-page";

const FEE_PCT = 0.0125;
const SWIFT_CHARGE_KES = 1500;
const OPENING_BALANCE_KES = 1_250_000;

test.describe("Stanbic Banking Portal", () => {
  let transfer: TransferPage;

  test.beforeEach(async ({ page }) => {
    transfer = new TransferPage(page);
    await transfer.goto();
  });

  test("displays the opening KES account balance", async () => {
    await expect(transfer.accountBalance).toContainText("KES 1,250,000.00");
  });

  test.describe("exchange rate calculations", () => {
    test("quotes fee, SWIFT charge, total debit and received amount for a KES→USD transfer", async () => {
      const amount = 50_000;
      await transfer.fillTransfer({
        amountKes: amount,
        currency: "USD",
        beneficiaryName: "Jane Wanjiku",
        iban: "GB29NWBK60161331926819",
      });

      const rateText = (await transfer.quoteRate.textContent()) ?? "";
      const rateMatch = rateText.match(/([0-9.]+)\s*USD/);
      expect(rateMatch, "quote panel must display the applied USD rate").not.toBeNull();
      const rate = Number.parseFloat(rateMatch?.[1] ?? "0");

      const quote = await transfer.readQuote();
      const expectedFee = amount * FEE_PCT;

      expect(quote.fee).toBeCloseTo(expectedFee, 2);
      expect(quote.swift).toBeCloseTo(SWIFT_CHARGE_KES, 2);
      expect(quote.debit).toBeCloseTo(amount + expectedFee + SWIFT_CHARGE_KES, 2);
      expect(quote.receive).toBeCloseTo(amount * rate, 2);
    });

    test("recalculates the quote when destination currency changes to EUR", async () => {
      await transfer.amountInput.fill("100000");
      await transfer.currencySelect.selectOption("EUR");

      await expect(transfer.quoteRate).toContainText("EUR");
      await expect(transfer.quoteReceive).toContainText("EUR");

      const quote = await transfer.readQuote();
      expect(quote.fee).toBeCloseTo(100_000 * FEE_PCT, 2);
      expect(quote.receive).toBeGreaterThan(0);
    });
  });

  test.describe("validation", () => {
    test("blocks submission with an insufficient funds error when debit exceeds balance", async () => {
      await transfer.fillTransfer({
        amountKes: 2_000_000, // exceeds the 1,250,000 opening balance
        currency: "USD",
        beneficiaryName: "John Otieno",
        iban: "KE930100012345678901",
      });
      await transfer.submit();

      await expect(transfer.formError).toBeVisible();
      await expect(transfer.formError).toContainText("Insufficient funds");
      await expect(transfer.successPanel).not.toBeVisible();
      // Balance must be untouched after a rejected submission.
      await expect(transfer.accountBalance).toContainText("KES 1,250,000.00");
    });

    test("rejects amounts below the KES 100 minimum", async () => {
      await transfer.fillTransfer({
        amountKes: 50,
        currency: "GBP",
        beneficiaryName: "Amina Hassan",
        iban: "GB29NWBK60161331926819",
      });
      await transfer.submit();

      await expect(transfer.amountError).toContainText("at least KES 100");
      await expect(transfer.successPanel).not.toBeVisible();
    });
  });

  test.describe("successful transfer submission", () => {
    test("submits a valid transfer, shows the receipt, and debits the balance", async () => {
      const amount = 50_000;
      await transfer.fillTransfer({
        amountKes: amount,
        currency: "USD",
        beneficiaryName: "Jane Wanjiku",
        iban: "GB29NWBK60161331926819",
        reference: "Invoice 2026-114",
      });

      const quote = await transfer.readQuote();
      await transfer.submit();

      await expect(transfer.successPanel).toBeVisible();
      await expect(transfer.successHeading).toContainText("Transfer Submitted Successfully");
      await expect(transfer.receiptRef).toContainText(/^STB-TRF-/);
      await expect(transfer.receiptReceived).toContainText("USD");

      const newBalanceText = (await transfer.receiptBalance.textContent()) ?? "";
      const newBalance = TransferPage.parseMoney(newBalanceText);
      expect(newBalance).toBeCloseTo(OPENING_BALANCE_KES - quote.debit, 0);
    });

    test("allows starting a new transfer from the success panel", async () => {
      await transfer.fillTransfer({
        amountKes: 10_000,
        currency: "USD",
        beneficiaryName: "Jane Wanjiku",
        iban: "GB29NWBK60161331926819",
      });
      await transfer.submit();
      await expect(transfer.successPanel).toBeVisible();

      await transfer.newTransferButton.click();

      await expect(transfer.successPanel).not.toBeVisible();
      await expect(transfer.amountInput).toBeVisible();
      await expect(transfer.amountInput).toHaveValue("");
    });
  });
});
