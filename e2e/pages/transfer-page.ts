import type { Locator, Page } from "@playwright/test";

export type Currency = "USD" | "GBP" | "EUR";

export interface TransferDetails {
  amountKes: number;
  currency: Currency;
  beneficiaryName: string;
  iban: string;
  reference?: string;
}

/**
 * Page Object Model for the Banking Portal portal.
 * All selectors use data-testid per Stanbic testability standards —
 * never CSS classes or visible text.
 */
export class TransferPage {
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
    this.accountBalance = page.getByTestId("stb-account-balance");
    this.amountInput = page.getByTestId("stb-amount-input");
    this.currencySelect = page.getByTestId("stb-currency-select");
    this.beneficiaryNameInput = page.getByTestId("stb-beneficiary-name");
    this.ibanInput = page.getByTestId("stb-iban-input");
    this.referenceInput = page.getByTestId("stb-reference-input");
    this.quotePanel = page.getByTestId("stb-quote-panel");
    this.quoteRate = page.getByTestId("stb-quote-rate");
    this.quoteFee = page.getByTestId("stb-quote-fee");
    this.quoteSwift = page.getByTestId("stb-quote-swift");
    this.quoteDebit = page.getByTestId("stb-quote-debit");
    this.quoteReceive = page.getByTestId("stb-quote-receive");
    this.submitButton = page.getByTestId("stb-submit-button");
    this.formError = page.getByTestId("stb-form-error");
    this.amountError = page.getByTestId("stb-amount-error");
    this.successPanel = page.getByTestId("stb-success-panel");
    this.successHeading = page.getByTestId("stb-success-heading");
    this.receiptRef = page.getByTestId("stb-receipt-ref");
    this.receiptReceived = page.getByTestId("stb-receipt-received");
    this.receiptBalance = page.getByTestId("stb-receipt-balance");
    this.newTransferButton = page.getByTestId("stb-new-transfer-button");
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
      fee: TransferPage.parseMoney((await this.quoteFee.textContent()) ?? ""),
      swift: TransferPage.parseMoney((await this.quoteSwift.textContent()) ?? ""),
      debit: TransferPage.parseMoney((await this.quoteDebit.textContent()) ?? ""),
      receive: TransferPage.parseMoney((await this.quoteReceive.textContent()) ?? ""),
    };
  }
}
