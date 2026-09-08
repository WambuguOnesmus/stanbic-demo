import type { Locator, Page } from "@playwright/test";

/** Page Object Model for the banking portal dashboard (React app at /). */
export class PortalPage {
  readonly page: Page;

  readonly comingSoon: Locator;
  readonly envPill: Locator;
  readonly headerEnvPill: Locator;
  readonly accountsOverview: Locator;
  readonly accountCards: Locator;
  readonly currentAccountCard: Locator;
  readonly savingsAccountCard: Locator;
  readonly usdAccountCard: Locator;
  readonly quickActionsPanel: Locator;
  readonly actionButtons: Locator;
  readonly transactionsPanel: Locator;
  readonly transactionHeaderCells: Locator;
  readonly transactionRows: Locator;

  constructor(page: Page) {
    this.page = page;
    this.comingSoon = page.getByTestId("stb-coming-soon");
    this.envPill = page.getByTestId("stb-env-pill");
    this.headerEnvPill = page.getByRole("banner").getByTestId("stb-env-pill");
    this.accountsOverview = page.getByTestId("stb-accounts-overview");
    this.accountCards = this.accountsOverview.getByTestId(/^stb-account-card-/);
    this.currentAccountCard = page.getByTestId("stb-account-card-current");
    this.savingsAccountCard = page.getByTestId("stb-account-card-savings");
    this.usdAccountCard = page.getByTestId("stb-account-card-usd");
    this.quickActionsPanel = page.getByTestId("stb-quick-actions");
    this.actionButtons = this.quickActionsPanel.getByTestId(/^stb-action-/);
    this.transactionsPanel = page.getByTestId("stb-transactions-panel");
    this.transactionHeaderCells = this.transactionsPanel.locator("thead th");
    this.transactionRows = page.getByTestId("stb-transaction-row");
  }

  quickAction(id: string): Locator {
    return this.page.getByTestId(`stb-action-${id}`);
  }

  /** All cells of a transaction row, in column order. */
  rowCells(row: Locator): Locator {
    return row.locator("td");
  }

  /** Amount cell (last td) of a transaction row — it carries no dedicated testid. */
  amountCell(row: Locator): Locator {
    return row.locator("td").last();
  }

  /** Signed numeric value parsed from a row's amount cell, e.g. "-8,420.00" → -8420. */
  async amountValue(row: Locator): Promise<number> {
    const text = await this.amountCell(row).innerText();
    return Number(text.replace(/,/g, ""));
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
