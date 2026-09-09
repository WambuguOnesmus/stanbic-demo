# Test Plan — Deposit Multi-Step Modal (Issue #11)

App under test: http://localhost:4173 (already running — do not start another server).
Feature: `DepositModal` launched from the Deposit quick action; 3-step wizard (Details → Review → Success).

## Seed state (applies to every scenario unless noted)

- Current Account balance: **KES 1,250,000.00** (`stb-account-card-current`, "Acct •••• 4521")
- Recent Transactions (`stb-transactions-panel`): **4 seeded rows** (`stb-transaction-row`), top row "Salary — Acme Industries Ltd" / `SAL-082026` / `+320,000.00`
- Deposit modal closed

## data-testid inventory (verified against the running app)

| data-testid | Element | Notes |
| --- | --- | --- |
| `stb-action-deposit` | button | Quick action that opens the modal |
| `stb-deposit-modal` | dialog container | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="stb-deposit-modal-heading"` |
| `stb-deposit-close` | button | × close, present on all steps |
| `stb-deposit-step-details` | li | Progress pill 1; `aria-current="step"` when active |
| `stb-deposit-step-review` | li | Progress pill 2 |
| `stb-deposit-step-success` | li | Progress pill 3 |
| `stb-deposit-amount` | input | `type="number"`, `min="100"`, `step="0.01"`; receives focus on open |
| `stb-deposit-source` | select | Options `Cash` / `Cheque` / `M-PESA`; default `Cash` |
| `stb-deposit-next` | button | "Continue to Review" |
| `stb-deposit-error` | inline error | `role="alert"`, text "Enter a deposit of at least KES 100." |
| `stb-deposit-review-amount` | text | e.g. "KES 25,000.00" |
| `stb-deposit-review-source` | text | e.g. "M-PESA" |
| `stb-deposit-back` | button | Review → Details |
| `stb-deposit-confirm` | button | "Confirm Deposit" — commits the deposit |
| `stb-deposit-success` | panel | "Deposit Recorded" confirmation |
| `stb-deposit-reference` | text | Format `STB-DEP-XXXXXXXX` (matches `/^STB-DEP-[A-Z0-9]+$/`) |
| `stb-deposit-done` | button | Closes modal from Success step |
| `stb-account-card-current` | card | Contains live Current Account balance |
| `stb-transaction-row` | tr | One per transaction; new deposits are prepended |

---

## Scenario 1 — Deposit quick action opens an accessible modal at the Details step

Seed state: default.

Steps:
1. Click `stb-action-deposit`.

Expected results:
- `stb-deposit-modal` is visible with `role="dialog"` and `aria-modal="true"`.
- All three progress pills are visible: `stb-deposit-step-details`, `stb-deposit-step-review`, `stb-deposit-step-success`.
- `stb-deposit-step-details` has `aria-current="step"`; the review and success pills have no `aria-current`.
- `stb-deposit-amount` is focused (`toBeFocused`) and empty.
- `stb-deposit-source` has value `Cash` (default).
- `stb-deposit-next` and `stb-deposit-close` are visible; `stb-deposit-error` is not present.

## Scenario 2 — Empty amount is blocked with an inline alert

Seed state: default; modal open on Details.

Steps:
1. Click `stb-action-deposit`.
2. Leave `stb-deposit-amount` empty; click `stb-deposit-next`.

Expected results:
- `stb-deposit-error` is visible with `role="alert"` and exact text "Enter a deposit of at least KES 100."
- `stb-deposit-step-details` still has `aria-current="step"` (no progression).
- `stb-deposit-review-amount` is not present in the DOM.

## Scenario 3 — Boundary: 99.99 is blocked (below KES 100 minimum)

Seed state: default; modal open on Details.

Steps:
1. Click `stb-action-deposit`.
2. Fill `stb-deposit-amount` with `99.99`.
3. Click `stb-deposit-next`.

Expected results:
- `stb-deposit-error` visible, `role="alert"`, exact text "Enter a deposit of at least KES 100."
- `stb-deposit-step-details` retains `aria-current="step"`; Review content is not rendered.

## Scenario 4 — Boundary: exactly 100 is allowed and proceeds to Review

Seed state: default; modal open on Details.

Steps:
1. Click `stb-action-deposit`.
2. Fill `stb-deposit-amount` with `100`.
3. Click `stb-deposit-next`.

Expected results:
- No `stb-deposit-error` in the DOM.
- `stb-deposit-step-review` has `aria-current="step"`; `stb-deposit-step-details` no longer does.
- `stb-deposit-review-amount` shows exactly "KES 100.00".
- `stb-deposit-review-source` shows "Cash" (default source untouched).

## Scenario 5 — Review step shows entered values and the target account

Seed state: default.

Steps:
1. Click `stb-action-deposit`.
2. Fill `stb-deposit-amount` with `25000`.
3. Select `M-PESA` in `stb-deposit-source`.
4. Click `stb-deposit-next`.

Expected results:
- `stb-deposit-review-amount` shows exactly "KES 25,000.00".
- `stb-deposit-review-source` shows exactly "M-PESA".
- `stb-deposit-modal` contains the target account line "Current Account •••• 4521" (Credited to).
- `stb-deposit-back` and `stb-deposit-confirm` are visible; `stb-deposit-next` is not.

## Scenario 6 — Back returns to Details with values preserved

Seed state: default.

Steps:
1. Click `stb-action-deposit`; fill `stb-deposit-amount` with `25000`; select `M-PESA`; click `stb-deposit-next`.
2. Click `stb-deposit-back`.

Expected results:
- `stb-deposit-step-details` has `aria-current="step"` again.
- `stb-deposit-amount` input value is still `25000`.
- `stb-deposit-source` value is still `M-PESA`.
- No `stb-deposit-error` is shown.

## Scenario 7 — Happy path: Confirm credits balance, shows reference, prepends transaction

Seed state: default (balance KES 1,250,000.00; 4 rows).

Steps:
1. Click `stb-action-deposit`.
2. Fill `stb-deposit-amount` with `25000`; select `M-PESA` in `stb-deposit-source`.
3. Click `stb-deposit-next`.
4. Click `stb-deposit-confirm`.
5. Read `stb-deposit-reference`; click `stb-deposit-done`.

Expected results:
- After step 4: `stb-deposit-step-success` has `aria-current="step"`; `stb-deposit-success` panel visible with heading "Deposit Recorded" and copy "M-PESA deposit of KES 25,000.00 has been credited."
- `stb-deposit-reference` text matches `/^STB-DEP-[A-Z0-9]+$/`.
- `stb-account-card-current` shows **KES 1,275,000.00** (1,250,000.00 + 25,000.00).
- After step 5: `stb-deposit-modal` is removed from the DOM.
- `stb-transaction-row` count is **5** (4 seeded + 1 new).
- First `stb-transaction-row` contains description "M-PESA Deposit", the same `STB-DEP-*` reference captured in step 5, and positive amount "+25,000.00".

## Scenario 8 — Boundary happy path: minimum deposit of exactly KES 100

Seed state: default (balance KES 1,250,000.00; 4 rows).

Steps:
1. Click `stb-action-deposit`.
2. Fill `stb-deposit-amount` with `100` (keep source `Cash`).
3. Click `stb-deposit-next`, then `stb-deposit-confirm`, then `stb-deposit-done`.

Expected results:
- `stb-account-card-current` shows **KES 1,250,100.00** (1,250,000.00 + 100.00).
- First `stb-transaction-row` shows "Cash Deposit" with amount "+100.00"; row count is 5.

## Scenario 9 — Close via × before confirmation leaves state unchanged; reopen starts fresh

Seed state: default (balance KES 1,250,000.00; 4 rows).

Steps:
1. Click `stb-action-deposit`.
2. Fill `stb-deposit-amount` with `900`; click `stb-deposit-next` (now on Review).
3. Click `stb-deposit-close`.
4. Click `stb-action-deposit` again.

Expected results:
- After step 3: `stb-deposit-modal` is removed from the DOM.
- `stb-account-card-current` still shows **KES 1,250,000.00**; `stb-transaction-row` count is still **4**.
- After step 4: modal reopens at Details (`stb-deposit-step-details` has `aria-current="step"`), `stb-deposit-amount` is empty, `stb-deposit-source` is back to `Cash` (no stale values from step 2).

## Scenario 10 — Escape key closes the modal before confirmation with no side effects

Seed state: default (balance KES 1,250,000.00; 4 rows).

Steps:
1. Click `stb-action-deposit`.
2. Fill `stb-deposit-amount` with `5000`.
3. Press the `Escape` key.
4. Click `stb-action-deposit` again.

Expected results:
- After step 3: `stb-deposit-modal` is removed from the DOM.
- `stb-account-card-current` still shows **KES 1,250,000.00**; `stb-transaction-row` count is still **4**.
- After step 4: fresh Details step — `stb-deposit-amount` empty, `stb-deposit-source` = `Cash`, `stb-deposit-step-details` has `aria-current="step"`.

## Scenario 11 — Done closes the modal after a successful deposit

Seed state: default.

Steps:
1. Complete a deposit of `1000` via `stb-deposit-next` → `stb-deposit-confirm` (source `Cheque`).
2. Click `stb-deposit-done`.
3. Click `stb-action-deposit` again.

Expected results:
- After step 2: `stb-deposit-modal` is removed from the DOM; balance shows **KES 1,251,000.00** (1,250,000.00 + 1,000.00) and remains so.
- After step 3: wizard restarts at Details with empty amount and `Cash` source — no residue from the completed deposit.

---

Notes for implementation:
- All selectors via `getByTestId` only (POM: `e2e/pages/PortalPage`), per repo testing standards.
- Scenarios 7, 8 and 11 mutate app state; each test must start from a fresh page load to restore the seed state.
