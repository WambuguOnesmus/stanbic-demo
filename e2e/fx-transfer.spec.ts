import { expect, test } from "@playwright/test";
import { FxTransferPage } from "./pages/fx-transfer-page";

const FEE_PCT = 0.0125;
const SWIFT_CHARGE_KES = 1500;
const OPENING_BALANCE_KES = 1_250_000;

test.describe("Stanbic FX & Cross-Border Transfer Portal", () => {
  let fx: FxTransferPage;

  test.beforeEach(async ({ page }) => {
    fx = new FxTransferPage(page);
    await fx.goto();
  });

  test("displays the opening KES account balance", async () => {
    await expect(fx.accountBalance).toContainText("KES 1,250,000.00");
  });

  test.describe("exchange rate calculations", () => {
    test("quotes fee, SWIFT charge, total debit and received amount for a KES→USD transfer", async () => {
      const amount = 50_000;
      await fx.fillTransfer({
        amountKes: amount,
        currency: "USD",
        beneficiaryName: "Jane Wanjiku",
        iban: "GB29NWBK60161331926819",
      });

      const rateText = (await fx.quoteRate.textContent()) ?? "";
      const rateMatch = rateText.match(/([0-9.]+)\s*USD/);
      expect(rateMatch, "quote panel must display the applied USD rate").not.toBeNull();
      const rate = Number.parseFloat(rateMatch?.[1] ?? "0");

      const quote = await fx.readQuote();
      const expectedFee = amount * FEE_PCT;

      expect(quote.fee).toBeCloseTo(expectedFee, 2);
      expect(quote.swift).toBeCloseTo(SWIFT_CHARGE_KES, 2);
      expect(quote.debit).toBeCloseTo(amount + expectedFee + SWIFT_CHARGE_KES, 2);
      expect(quote.receive).toBeCloseTo(amount * rate, 2);
    });

    test("recalculates the quote when destination currency changes to EUR", async () => {
      await fx.amountInput.fill("100000");
      await fx.currencySelect.selectOption("EUR");

      await expect(fx.quoteRate).toContainText("EUR");
      await expect(fx.quoteReceive).toContainText("EUR");

      const quote = await fx.readQuote();
      expect(quote.fee).toBeCloseTo(100_000 * FEE_PCT, 2);
      expect(quote.receive).toBeGreaterThan(0);
    });
  });

  test.describe("validation", () => {
    test("blocks submission with an insufficient funds error when debit exceeds balance", async () => {
      await fx.fillTransfer({
        amountKes: 2_000_000, // exceeds the 1,250,000 opening balance
        currency: "USD",
        beneficiaryName: "John Otieno",
        iban: "KE930100012345678901",
      });
      await fx.submit();

      await expect(fx.formError).toBeVisible();
      await expect(fx.formError).toContainText("Insufficient funds");
      await expect(fx.successPanel).not.toBeVisible();
      // Balance must be untouched after a rejected submission.
      await expect(fx.accountBalance).toContainText("KES 1,250,000.00");
    });

    test("rejects amounts below the KES 100 minimum", async () => {
      await fx.fillTransfer({
        amountKes: 50,
        currency: "GBP",
        beneficiaryName: "Amina Hassan",
        iban: "GB29NWBK60161331926819",
      });
      await fx.submit();

      await expect(fx.amountError).toContainText("at least KES 100");
      await expect(fx.successPanel).not.toBeVisible();
    });
  });

  test.describe("successful transfer submission", () => {
    test("submits a valid transfer, shows the receipt, and debits the balance", async () => {
      const amount = 50_000;
      await fx.fillTransfer({
        amountKes: amount,
        currency: "USD",
        beneficiaryName: "Jane Wanjiku",
        iban: "GB29NWBK60161331926819",
        reference: "Invoice 2026-114",
      });

      const quote = await fx.readQuote();
      await fx.submit();

      await expect(fx.successPanel).toBeVisible();
      await expect(fx.successHeading).toContainText("Transfer Submitted Successfully");
      await expect(fx.receiptRef).toContainText(/^STB-FX-/);
      await expect(fx.receiptReceived).toContainText("USD");

      const newBalanceText = (await fx.receiptBalance.textContent()) ?? "";
      const newBalance = FxTransferPage.parseMoney(newBalanceText);
      expect(newBalance).toBeCloseTo(OPENING_BALANCE_KES - quote.debit, 0);
    });

    test("allows starting a new transfer from the success panel", async () => {
      await fx.fillTransfer({
        amountKes: 10_000,
        currency: "USD",
        beneficiaryName: "Jane Wanjiku",
        iban: "GB29NWBK60161331926819",
      });
      await fx.submit();
      await expect(fx.successPanel).toBeVisible();

      await fx.newTransferButton.click();

      await expect(fx.successPanel).not.toBeVisible();
      await expect(fx.amountInput).toBeVisible();
      await expect(fx.amountInput).toHaveValue("");
    });
  });
});
