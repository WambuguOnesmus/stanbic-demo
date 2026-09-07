import type { Locator, Page } from "@playwright/test";

/** Page Object Model for the banking portal dashboard (React app at /). */
export class PortalPage {
  readonly page: Page;

  readonly accountsOverview: Locator;
  readonly currentAccountCard: Locator;
  readonly savingsAccountCard: Locator;
  readonly usdAccountCard: Locator;
  readonly transactionsPanel: Locator;
  readonly transactionRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountsOverview = page.getByTestId("fx-accounts-overview");
    this.currentAccountCard = page.getByTestId("fx-account-card-current");
    this.savingsAccountCard = page.getByTestId("fx-account-card-savings");
    this.usdAccountCard = page.getByTestId("fx-account-card-usd");
    this.transactionsPanel = page.getByTestId("fx-transactions-panel");
    this.transactionRows = page.getByTestId("fx-transaction-row");
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
