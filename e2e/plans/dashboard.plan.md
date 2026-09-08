# Test Plan — Dashboard: Accounts Overview, Quick Actions & Recent Transactions

- **Issue:** #14 — Dashboard - accounts overview, quick actions and recent transactions
- **Journey URL:** http://localhost:4173/
- **Page object:** extend `e2e/pages/portal-page.ts` (`PortalPage`)

## data-testid inventory (verified against running app)

| data-testid | Element | Notes |
| --- | --- | --- |
| `stb-env-pill` | `span` in header brand bar | Text: `React App · Demo Environment` |
| `stb-accounts-overview` | `section` (labelled "Accounts overview") | 3-card grid |
| `stb-account-card-current` | `div` card | Current Account / KES 1,250,000.00 / Acct •••• 4521 |
| `stb-account-card-savings` | `div` card | Savings Account / KES 3,480,200.55 / Acct •••• 7810 |
| `stb-account-card-usd` | `div` card | USD Account / USD 12,940.10 / Acct •••• 2093 |
| `stb-quick-actions` | `section` | Heading "Quick Actions" |
| `stb-action-pay-bills` | `button` | "Pay Bills", enabled |
| `stb-action-buy-airtime` | `button` | "Buy Airtime", enabled |
| `stb-action-download-statement` | `button` | "Statement", enabled |
| `stb-action-deposit` | `button` | "Deposit", enabled |
| `stb-transactions-panel` | `section` | Heading "Recent Transactions — Current Account"; `table` with aria-label "Recent transactions" |
| `stb-transaction-row` | `tr` × 4 | Amount is the last `td` in each row (no dedicated testid); colour via `text-green-700` / `text-red-700` |
| `stb-coming-soon` | — | **Absent** (count = 0) — required by AC1 |

## Seed state (applies to all scenarios)

Static demo seed served by the app at http://localhost:4173/ — no setup steps required:
- Current Account: opening balance KES 1,250,000.00, account •••• 4521
- Savings Account: KES 3,480,200.55, account •••• 7810
- USD Account: USD 12,940.10, account •••• 2093
- 4 seeded transactions on the Current Account (1 credit, 3 debits)

---

## Scenario 1 — dashboard replaces the coming-soon shell (AC1)

**Seed state:** default seed above.

**Steps:**
1. Navigate to `/`.

**Expected results:**
- Element count of `stb-coming-soon` is exactly **0**.
- `stb-accounts-overview` is visible.
- `stb-quick-actions` is visible.
- `stb-transactions-panel` is visible.
- Page title is `Stanbic Bank — Banking Portal`.

## Scenario 2 — accounts overview shows three seeded account cards (AC2)

**Seed state:** default seed above.

**Steps:**
1. Navigate to `/`.
2. Locate `stb-accounts-overview`.
3. Locate `stb-account-card-current`, `stb-account-card-savings`, `stb-account-card-usd` within it.

**Expected results:**
- All three cards are visible; exactly **3** account cards exist inside `stb-accounts-overview`.
- `stb-account-card-current` contains, in order: label `Current Account`, balance `KES 1,250,000.00`, masked number `Acct •••• 4521`.
- `stb-account-card-savings` contains: `Savings Account`, `KES 3,480,200.55`, `Acct •••• 7810`.
- `stb-account-card-usd` contains: `USD Account`, `USD 12,940.10`, `Acct •••• 2093`.
- Boundary/format checks: every balance has exactly 2 decimal places and thousands separators; masked numbers expose exactly the last 4 digits preceded by `••••` (no full account number anywhere in the card text).

## Scenario 3 — recent transactions table structure and seeded rows (AC3)

**Seed state:** default seed above.

**Steps:**
1. Navigate to `/`.
2. Locate `stb-transactions-panel`.
3. Collect all `stb-transaction-row` elements.

**Expected results:**
- Panel heading reads `Recent Transactions — Current Account`.
- Table header has exactly 4 columns with texts: `Date`, `Description`, `Reference`, `Amount (KES)`.
- Exactly **4** `stb-transaction-row` rows exist, in this order (cell texts asserted exactly):

  | # | Date | Description | Reference | Amount (last cell) |
  |---|------|-------------|-----------|--------------------|
  | 1 | 05 Sep 2026 | Salary — Acme Industries Ltd | SAL-082026 | `+320,000.00` |
  | 2 | 03 Sep 2026 | KPLC Electricity | UTIL-99213 | `-8,420.00` |
  | 3 | 01 Sep 2026 | Transfer to Savings ••7810 | TRF-INT-5540 | `-150,000.00` |
  | 4 | 29 Aug 2026 | Naivas Supermarket | POS-77120 | `-12,845.50` |

## Scenario 4 — credit and debit amounts are colour-coded with signed prefixes (AC3)

**Seed state:** default seed above.

**Steps:**
1. Navigate to `/`.
2. For each `stb-transaction-row`, read the last `td` (amount cell — no dedicated testid; select as last cell within the row).

**Expected results:**
- Row 1 (credit, Salary — Acme Industries Ltd / SAL-082026): amount text starts with `+`, equals `+320,000.00`, computed CSS `color` is `rgb(21, 128, 61)` (green-700).
- Rows 2–4 (debits): amount text starts with `-`; computed CSS `color` is `rgb(185, 28, 28)` (red-700). Naivas Supermarket / POS-77120 row equals exactly `-12,845.50`.
- Exactly **1** green (credit) amount and exactly **3** red (debit) amounts across the table.
- Arithmetic sanity: sum of signed amounts = +320,000.00 − 8,420.00 − 150,000.00 − 12,845.50 = **+148,734.50 KES** net over the period (assert by parsing the 4 cells and summing).

## Scenario 5 — quick actions: four launchers visible and enabled (AC4)

**Seed state:** default seed above.

**Steps:**
1. Navigate to `/`.
2. Locate `stb-quick-actions`.
3. Locate `stb-action-pay-bills`, `stb-action-buy-airtime`, `stb-action-download-statement`, `stb-action-deposit`.
4. Click each of the four buttons once.

**Expected results:**
- Exactly **4** action buttons exist inside `stb-quick-actions`.
- Each button is visible and enabled (`disabled` = false).
- Labels: Pay Bills, Buy Airtime, Statement, Deposit (assert testid presence, not text, for selection).
- Clicking each button throws no page error and does not navigate away from `/` (journeys ship in separate issues — no behavioural assertion beyond clickability).
- Keyboard accessibility boundary check: each button is focusable via Tab and shows a visible focus state.

## Scenario 6 — header brand bar shows the environment pill (AC5)

**Seed state:** default seed above.

**Steps:**
1. Navigate to `/`.
2. Locate `stb-env-pill` inside the page `banner` (header).

**Expected results:**
- `stb-env-pill` is visible and rendered within the header brand bar.
- Its text contains `Demo Environment` (full rendered text: `React App · Demo Environment`).

---

## Out of scope (tracked in separate issues)

- Pay Bills / Buy Airtime / Statement / Deposit journeys (launchers only in #14).
- Transfer flows, fee arithmetic (fee = amount × 1.25%, SWIFT charge KES 1,500), minimum-amount KES 100 and balance-exceeded validations — no debit-entry form exists on this dashboard surface, so those boundary scenarios attach to the transfer-journey plans.
