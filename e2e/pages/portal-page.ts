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
  readonly quickActionsPanel: Locator;
  readonly actionStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountsOverview = page.getByTestId("stb-accounts-overview");
    this.currentAccountCard = page.getByTestId("stb-account-card-current");
    this.savingsAccountCard = page.getByTestId("stb-account-card-savings");
    this.usdAccountCard = page.getByTestId("stb-account-card-usd");
    this.transactionsPanel = page.getByTestId("stb-transactions-panel");
    this.transactionRows = page.getByTestId("stb-transaction-row");
    this.quickActionsPanel = page.getByTestId("stb-quick-actions");
    this.actionStatus = page.getByTestId("stb-action-status");
  }

  quickAction(id: string): Locator {
    return this.page.getByTestId(`stb-action-${id}`);
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
