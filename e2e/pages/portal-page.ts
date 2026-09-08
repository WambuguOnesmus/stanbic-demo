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

/** Page Object Model for the Account Statement multi-step modal (#15). */
export class StatementModal {
  readonly page: Page;

  readonly modal: Locator;
  readonly closeButton: Locator;
  readonly accountSelect: Locator;
  readonly periodSelect: Locator;
  readonly formatSelect: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly confirmButton: Locator;
  readonly reviewAccount: Locator;
  readonly reviewPeriod: Locator;
  readonly reviewFormat: Locator;
  readonly successPanel: Locator;
  readonly reference: Locator;
  readonly doneButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId("stb-statement-modal");
    this.closeButton = page.getByTestId("stb-statement-close");
    this.accountSelect = page.getByTestId("stb-statement-account");
    this.periodSelect = page.getByTestId("stb-statement-period");
    this.formatSelect = page.getByTestId("stb-statement-format");
    this.nextButton = page.getByTestId("stb-statement-next");
    this.backButton = page.getByTestId("stb-statement-back");
    this.confirmButton = page.getByTestId("stb-statement-confirm");
    this.reviewAccount = page.getByTestId("stb-statement-review-account");
    this.reviewPeriod = page.getByTestId("stb-statement-review-period");
    this.reviewFormat = page.getByTestId("stb-statement-review-format");
    this.successPanel = page.getByTestId("stb-statement-success");
    this.reference = page.getByTestId("stb-statement-reference");
    this.doneButton = page.getByTestId("stb-statement-done");
  }

  stepPill(step: "details" | "review" | "success"): Locator {
    return this.page.getByTestId(`stb-statement-step-${step}`);
  }

  async fillDetails(account: string, period: string, format: string): Promise<void> {
    await this.accountSelect.selectOption(account);
    await this.periodSelect.selectOption(period);
    await this.formatSelect.selectOption(format);
  }
}
