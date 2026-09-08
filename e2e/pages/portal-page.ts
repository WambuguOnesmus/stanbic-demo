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
  readonly depositModal: Locator;
  readonly depositAmount: Locator;
  readonly depositSource: Locator;
  readonly depositError: Locator;
  readonly depositNext: Locator;
  readonly depositBack: Locator;
  readonly depositConfirm: Locator;
  readonly depositReviewAmount: Locator;
  readonly depositReviewSource: Locator;
  readonly depositSuccess: Locator;
  readonly depositReference: Locator;
  readonly depositDone: Locator;
  readonly depositClose: Locator;

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
    this.depositModal = page.getByTestId("stb-deposit-modal");
    this.depositAmount = page.getByTestId("stb-deposit-amount");
    this.depositSource = page.getByTestId("stb-deposit-source");
    this.depositError = page.getByTestId("stb-deposit-error");
    this.depositNext = page.getByTestId("stb-deposit-next");
    this.depositBack = page.getByTestId("stb-deposit-back");
    this.depositConfirm = page.getByTestId("stb-deposit-confirm");
    this.depositReviewAmount = page.getByTestId("stb-deposit-review-amount");
    this.depositReviewSource = page.getByTestId("stb-deposit-review-source");
    this.depositSuccess = page.getByTestId("stb-deposit-success");
    this.depositReference = page.getByTestId("stb-deposit-reference");
    this.depositDone = page.getByTestId("stb-deposit-done");
    this.depositClose = page.getByTestId("stb-deposit-close");
  }

  async openDepositModal(): Promise<void> {
    await this.quickAction("deposit").click();
  }

  async sendMoney(recipient: string, mobile: string, amountKes: number): Promise<void> {
    await this.sendMoneyRecipient.fill(recipient);
    await this.sendMoneyMobile.fill(mobile);
    await this.sendMoneyAmount.fill(String(amountKes));
    await this.sendMoneySubmit.click();
  }

  /** Walks the full wizard: details -> review -> confirm (leaves the success step open). */
  async deposit(amountKes: number, source: string): Promise<void> {
    await this.openDepositModal();
    await this.depositAmount.fill(String(amountKes));
    await this.depositSource.selectOption(source);
    await this.depositNext.click();
    await this.depositConfirm.click();
  }

  quickAction(id: string): Locator {
    return this.page.getByTestId(`stb-action-${id}`);
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
  }
}
