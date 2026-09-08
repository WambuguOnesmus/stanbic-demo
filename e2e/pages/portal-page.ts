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
  readonly sendMoneyPanel: Locator;
  readonly sendMoneyRecipient: Locator;
  readonly sendMoneyMobile: Locator;
  readonly sendMoneyAmount: Locator;
  readonly sendMoneySubmit: Locator;
  readonly sendMoneyError: Locator;
  readonly sendMoneyStatus: Locator;
  readonly depositPanel: Locator;
  readonly depositAmount: Locator;
  readonly depositSource: Locator;
  readonly depositSubmit: Locator;
  readonly depositError: Locator;
  readonly depositStatus: Locator;

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
    this.sendMoneyPanel = page.getByTestId("stb-sendmoney-panel");
    this.sendMoneyRecipient = page.getByTestId("stb-sendmoney-recipient");
    this.sendMoneyMobile = page.getByTestId("stb-sendmoney-mobile");
    this.sendMoneyAmount = page.getByTestId("stb-sendmoney-amount");
    this.sendMoneySubmit = page.getByTestId("stb-sendmoney-submit");
    this.sendMoneyError = page.getByTestId("stb-sendmoney-error");
    this.sendMoneyStatus = page.getByTestId("stb-sendmoney-status");
    this.depositPanel = page.getByTestId("stb-deposit-panel");
    this.depositAmount = page.getByTestId("stb-deposit-amount");
    this.depositSource = page.getByTestId("stb-deposit-source");
    this.depositSubmit = page.getByTestId("stb-deposit-submit");
    this.depositError = page.getByTestId("stb-deposit-error");
    this.depositStatus = page.getByTestId("stb-deposit-status");
  }

  async sendMoney(recipient: string, mobile: string, amountKes: number): Promise<void> {
    await this.sendMoneyRecipient.fill(recipient);
    await this.sendMoneyMobile.fill(mobile);
    await this.sendMoneyAmount.fill(String(amountKes));
    await this.sendMoneySubmit.click();
  }

  async deposit(amountKes: number, source: string): Promise<void> {
    await this.depositAmount.fill(String(amountKes));
    await this.depositSource.selectOption(source);
    await this.depositSubmit.click();
  }

  quickAction(id: string): Locator {
    return this.page.getByTestId(`stb-action-${id}`);
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
