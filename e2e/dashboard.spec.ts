import { expect, test } from "@playwright/test";
import { PortalPage } from "./pages/portal-page";

const EXPECTED_ROWS: readonly (readonly [string, string, string, string])[] = [
  ["05 Sep 2026", "Salary — Acme Industries Ltd", "SAL-082026", "+320,000.00"],
  ["03 Sep 2026", "KPLC Electricity", "UTIL-99213", "-8,420.00"],
  ["01 Sep 2026", "Transfer to Savings ••7810", "TRF-INT-5540", "-150,000.00"],
  ["29 Aug 2026", "Naivas Supermarket", "POS-77120", "-12,845.50"],
];

const CREDIT_GREEN = "rgb(21, 128, 61)";
const DEBIT_RED = "rgb(185, 28, 28)";

const QUICK_ACTION_IDS = ["pay-bills", "buy-airtime", "download-statement", "deposit"] as const;

test.describe("Dashboard - accounts overview, quick actions and recent transactions (#14)", () => {
  let portal: PortalPage;

  test.beforeEach(async ({ page }) => {
    portal = new PortalPage(page);
    await portal.goto();
  });

  test("dashboard replaces the coming-soon shell (AC1)", async ({ page }) => {
    await expect(portal.comingSoon).toHaveCount(0);
    await expect(portal.accountsOverview).toBeVisible();
    await expect(portal.quickActionsPanel).toBeVisible();
    await expect(portal.transactionsPanel).toBeVisible();
    await expect(page).toHaveTitle("Stanbic Bank — Banking Portal");
  });

  test("accounts overview shows three seeded account cards (AC2)", async () => {
    await expect(portal.accountCards).toHaveCount(3);

    await expect(portal.currentAccountCard).toBeVisible();
    await expect(portal.currentAccountCard).toHaveText(
      /Current Account\s*KES 1,250,000\.00\s*Acct •••• 4521/,
    );

    await expect(portal.savingsAccountCard).toBeVisible();
    await expect(portal.savingsAccountCard).toHaveText(
      /Savings Account\s*KES 3,480,200\.55\s*Acct •••• 7810/,
    );

    await expect(portal.usdAccountCard).toBeVisible();
    await expect(portal.usdAccountCard).toHaveText(
      /USD Account\s*USD 12,940\.10\s*Acct •••• 2093/,
    );

    const cards = [portal.currentAccountCard, portal.savingsAccountCard, portal.usdAccountCard];
    for (const card of cards) {
      // Balance formatting: currency code, thousands separators, exactly 2 decimals.
      await expect(card).toContainText(/(?:KES|USD) \d{1,3}(?:,\d{3})*\.\d{2}/);
      // Masked account number: exactly the last 4 digits behind the mask.
      await expect(card).toContainText(/Acct •••• \d{4}/);
      // No full (unmasked) account number leaks — no run of 5+ consecutive digits.
      const text = await card.innerText();
      expect(text).not.toMatch(/\d{5,}/);
    }
  });

  test("recent transactions table structure and seeded rows (AC3)", async () => {
    await expect(portal.transactionsPanel).toContainText(
      "Recent Transactions — Current Account",
    );

    await expect(portal.transactionHeaderCells).toHaveText([
      "Date",
      "Description",
      "Reference",
      "Amount (KES)",
    ]);

    await expect(portal.transactionRows).toHaveCount(EXPECTED_ROWS.length);
    for (const [index, expectedCells] of EXPECTED_ROWS.entries()) {
      const row = portal.transactionRows.nth(index);
      await expect(portal.rowCells(row)).toHaveText([...expectedCells]);
    }
  });

  test("credit and debit amounts are colour-coded with signed prefixes (AC3)", async () => {
    await expect(portal.transactionRows).toHaveCount(4);

    // Row 1: the single credit — signed prefix and green-700.
    const creditCell = portal.amountCell(portal.transactionRows.nth(0));
    await expect(creditCell).toHaveText("+320,000.00");
    await expect(creditCell).toHaveCSS("color", CREDIT_GREEN);

    // Rows 2–4: the three debits — signed prefix and red-700.
    for (const index of [1, 2, 3]) {
      const debitCell = portal.amountCell(portal.transactionRows.nth(index));
      await expect(debitCell).toHaveText(/^-/);
      await expect(debitCell).toHaveCSS("color", DEBIT_RED);
    }
    await expect(portal.amountCell(portal.transactionRows.nth(3))).toHaveText("-12,845.50");

    // Arithmetic sanity: signed sum of the 4 amounts nets to +148,734.50 KES.
    let sum = 0;
    for (let index = 0; index < 4; index += 1) {
      sum += await portal.amountValue(portal.transactionRows.nth(index));
    }
    expect(sum).toBeCloseTo(148734.5, 2);
  });

  test("quick actions: four launchers visible and enabled (AC4)", async ({ page }) => {
    await expect(portal.actionButtons).toHaveCount(4);

    for (const id of QUICK_ACTION_IDS) {
      const button = portal.quickAction(id);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();

      // Launcher only — clicking must not navigate away (journeys ship separately).
      await button.click();
      await expect(page).toHaveURL("/");

      // A launcher may open its journey dialog (e.g. Statement, #15) — dismiss it
      // so the next launcher is clickable again.
      await page.keyboard.press("Escape");

      // Keyboard accessibility: each launcher is focusable.
      await button.focus();
      await expect(button).toBeFocused();
    }
  });

  test("header brand bar shows the environment pill (AC5)", async () => {
    await expect(portal.headerEnvPill).toBeVisible();
    await expect(portal.headerEnvPill).toContainText("Demo Environment");
    await expect(portal.headerEnvPill).toHaveText("React App · Demo Environment");
  });
});
