import type { Locator, Page } from "@playwright/test";

export type FxCurrency = "USD" | "GBP" | "EUR";

export interface TransferDetails {
  amountKes: number;
  currency: FxCurrency;
  beneficiaryName: string;
  iban: string;
  reference?: string;
}

/**
 * Page Object Model for the FX & Cross-Border Transfer portal.
 * All selectors use data-testid per Stanbic testability standards —
 * never CSS classes or visible text.
 */
export class FxTransferPage {
  readonly page: Page;

  readonly accountBalance: Locator;
  readonly amountInput: Locator;
  readonly currencySelect: Locator;
  readonly beneficiaryNameInput: Locator;
  readonly ibanInput: Locator;
  readonly referenceInput: Locator;
  readonly quotePanel: Locator;
  readonly quoteRate: Locator;
  readonly quoteFee: Locator;
  readonly quoteSwift: Locator;
  readonly quoteDebit: Locator;
  readonly quoteReceive: Locator;
  readonly submitButton: Locator;
  readonly formError: Locator;
  readonly amountError: Locator;
  readonly successPanel: Locator;
  readonly successHeading: Locator;
  readonly receiptRef: Locator;
  readonly receiptReceived: Locator;
  readonly receiptBalance: Locator;
  readonly newTransferButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountBalance = page.getByTestId("fx-account-balance");
    this.amountInput = page.getByTestId("fx-amount-input");
    this.currencySelect = page.getByTestId("fx-currency-select");
    this.beneficiaryNameInput = page.getByTestId("fx-beneficiary-name");
    this.ibanInput = page.getByTestId("fx-iban-input");
    this.referenceInput = page.getByTestId("fx-reference-input");
    this.quotePanel = page.getByTestId("fx-quote-panel");
    this.quoteRate = page.getByTestId("fx-quote-rate");
    this.quoteFee = page.getByTestId("fx-quote-fee");
    this.quoteSwift = page.getByTestId("fx-quote-swift");
    this.quoteDebit = page.getByTestId("fx-quote-debit");
    this.quoteReceive = page.getByTestId("fx-quote-receive");
    this.submitButton = page.getByTestId("fx-submit-button");
    this.formError = page.getByTestId("fx-form-error");
    this.amountError = page.getByTestId("fx-amount-error");
    this.successPanel = page.getByTestId("fx-success-panel");
    this.successHeading = page.getByTestId("fx-success-heading");
    this.receiptRef = page.getByTestId("fx-receipt-ref");
    this.receiptReceived = page.getByTestId("fx-receipt-received");
    this.receiptBalance = page.getByTestId("fx-receipt-balance");
    this.newTransferButton = page.getByTestId("fx-new-transfer-button");
  }

  async goto(): Promise<void> {
    await this.page.goto("/prototype/index.html");
  }

  async fillTransfer(details: TransferDetails): Promise<void> {
    await this.amountInput.fill(String(details.amountKes));
    await this.currencySelect.selectOption(details.currency);
    await this.beneficiaryNameInput.fill(details.beneficiaryName);
    await this.ibanInput.fill(details.iban);
    if (details.reference !== undefined) {
      await this.referenceInput.fill(details.reference);
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Parse "KES 1,250,000.00" (or "USD 387.50") into a number. */
  static parseMoney(text: string): number {
    return Number.parseFloat(text.replace(/[^0-9.-]/g, ""));
  }

  async readQuote(): Promise<{ fee: number; swift: number; debit: number; receive: number }> {
    return {
      fee: FxTransferPage.parseMoney((await this.quoteFee.textContent()) ?? ""),
      swift: FxTransferPage.parseMoney((await this.quoteSwift.textContent()) ?? ""),
      debit: FxTransferPage.parseMoney((await this.quoteDebit.textContent()) ?? ""),
      receive: FxTransferPage.parseMoney((await this.quoteReceive.textContent()) ?? ""),
    };
  }
}
