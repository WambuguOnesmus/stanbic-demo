# Test Plan — Account Statement Multi-Step Modal (Issue #15)

**Feature:** Account Statement — multi-step modal (details → review → success)
**Entry point:** Dashboard quick action `stb-action-download-statement`
**App URL:** http://localhost:4173

## Verified `data-testid` inventory

| Test ID | Element | Notes |
|---|---|---|
| `stb-action-download-statement` | `button` | Dashboard quick action "Statement" |
| `stb-statement-modal` | dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="stb-statement-modal-heading"` |
| `stb-statement-close` | `button` | "×" close, present on every step |
| `stb-statement-step-details` | `li` | Step indicator 1 — `aria-current="step"` when active |
| `stb-statement-step-review` | `li` | Step indicator 2 |
| `stb-statement-step-success` | `li` | Step indicator 3 |
| `stb-statement-account` | `select` | Options: `Current Account •••• 4521` (default) / `Savings Account •••• 7810` / `USD Account •••• 2093` |
| `stb-statement-period` | `select` | Options: `Last 30 days` (default) / `Last 90 days` / `Year to date` |
| `stb-statement-format` | `select` | Options: `PDF` (default) / `CSV` |
| `stb-statement-next` | `button` | "Continue to Review" |
| `stb-statement-review-account` | `dd` | Echoes selected account |
| `stb-statement-review-period` | `dd` | Echoes selected period |
| `stb-statement-review-format` | `dd` | Echoes selected format |
| `stb-statement-back` | `button` | "Back" (Review → Details) |
| `stb-statement-confirm` | `button` | "Generate Statement" |
| `stb-statement-success` | `div` | Success panel, "Statement Ready" |
| `stb-statement-reference` | `span` | Reference matching `/^STB-STM-[A-Z0-9]{8}$/` (e.g. `STB-STM-MTSMKO1C`) |
| `stb-statement-done` | `button` | "Done" |

Side-effect invariants (dashboard): current account card shows `KES 1,250,000.00`; `stb-transaction-row` count = 4.

## Seed state (all scenarios)

- Fresh page load of http://localhost:4173, no persisted state.
- Current Account •••• 4521 balance: **KES 1,250,000.00**.
- Recent transfers list: exactly **4** `stb-transaction-row` elements.

---

### Scenario 1 — Statement quick action opens the modal with Details active

**Seed state:** as above.

**Steps:**
1. Click `stb-action-download-statement`.

**Expected results:**
- `stb-statement-modal` is visible with `role="dialog"` and `aria-modal="true"`.
- Step indicator shows all three items: `stb-statement-step-details`, `stb-statement-step-review`, `stb-statement-step-success`.
- `stb-statement-step-details` has `aria-current="step"`; the review and success indicators have no `aria-current` attribute.
- Details form is shown: `stb-statement-account`, `stb-statement-period`, `stb-statement-format`, and `stb-statement-next` are visible.

---

### Scenario 2 — Details step offers the exact select options with correct defaults

**Seed state:** modal opened via `stb-action-download-statement`.

**Steps:**
1. Read the options and selected value of `stb-statement-account`.
2. Read the options and selected value of `stb-statement-period`.
3. Read the options and selected value of `stb-statement-format`.

**Expected results:**
- `stb-statement-account` has exactly 3 options in order: `Current Account •••• 4521`, `Savings Account •••• 7810`, `USD Account •••• 2093`; default selected value = `Current Account •••• 4521`.
- `stb-statement-period` has exactly 3 options in order: `Last 30 days`, `Last 90 days`, `Year to date`; default = `Last 30 days`.
- `stb-statement-format` has exactly 2 options in order: `PDF`, `CSV`; default = `PDF`.

---

### Scenario 3 — Review step reflects the chosen selections and marks Review active

**Seed state:** modal open on Details step.

**Steps:**
1. Select `Savings Account •••• 7810` in `stb-statement-account`.
2. Select `Last 90 days` in `stb-statement-period`.
3. Select `CSV` in `stb-statement-format`.
4. Click `stb-statement-next`.

**Expected results:**
- `stb-statement-step-review` has `aria-current="step"`; `stb-statement-step-details` no longer has `aria-current`.
- `stb-statement-review-account` has exact text `Savings Account •••• 7810`.
- `stb-statement-review-period` has exact text `Last 90 days`.
- `stb-statement-review-format` has exact text `CSV`.
- `stb-statement-back` and `stb-statement-confirm` are visible; the Details selects are not.

---

### Scenario 4 — Back returns to Details with values preserved

**Seed state:** modal on Review step after selecting Savings •••• 7810 / Last 90 days / CSV (Scenario 3 steps 1–4).

**Steps:**
1. Click `stb-statement-back`.

**Expected results:**
- `stb-statement-step-details` has `aria-current="step"` again.
- `stb-statement-account` value = `Savings Account •••• 7810`.
- `stb-statement-period` value = `Last 90 days`.
- `stb-statement-format` value = `CSV`.
- Clicking `stb-statement-next` again returns to Review with the same three review values (`stb-statement-review-account` = `Savings Account •••• 7810`, `stb-statement-review-period` = `Last 90 days`, `stb-statement-review-format` = `CSV`).

---

### Scenario 5 — Happy path: Generate Statement shows Success with STB-STM reference

**Seed state:** modal on Review step (defaults: Current Account •••• 4521 / Last 30 days / PDF).

**Steps:**
1. Click `stb-action-download-statement`.
2. Click `stb-statement-next` (accept defaults).
3. Click `stb-statement-confirm`.

**Expected results:**
- `stb-statement-step-success` has `aria-current="step"`; details and review indicators do not.
- `stb-statement-success` is visible and contains the heading text `Statement Ready`.
- Success copy references the selections: contains `PDF statement for Current Account •••• 4521 (Last 30 days)`.
- `stb-statement-reference` text matches regex `/^STB-STM-[A-Z0-9]{8}$/`.
- `stb-statement-done` is visible; `stb-statement-confirm` and `stb-statement-back` are gone.

---

### Scenario 6 — Generating a statement has NO balance impact and records NO transaction

**Seed state:** dashboard freshly loaded; assert baseline before opening the modal.

**Steps:**
1. Assert current account card shows `KES 1,250,000.00` and `stb-transaction-row` count = 4 (baseline).
2. Click `stb-action-download-statement` → `stb-statement-next` → `stb-statement-confirm` (defaults).
3. Click `stb-statement-done`.

**Expected results:**
- `stb-statement-modal` is no longer in the DOM after Done.
- Current Account card still shows exactly `KES 1,250,000.00` — arithmetic: balance delta = KES 0.00 (statement generation is non-ledger-affecting; no fee, no debit).
- `stb-transaction-row` count is still exactly 4 — no new transaction row added.

---

### Scenario 7 — Close via the × button before confirm leaves everything unchanged

**Seed state:** dashboard baseline asserted (KES 1,250,000.00; 4 rows).

**Steps:**
1. Click `stb-action-download-statement`.
2. Select `USD Account •••• 2093` in `stb-statement-account` and `Year to date` in `stb-statement-period`.
3. Click `stb-statement-next` (now on Review).
4. Click `stb-statement-close`.

**Expected results:**
- `stb-statement-modal` is removed from the DOM.
- Balance still `KES 1,250,000.00`; `stb-transaction-row` count still 4.
- Reopening via `stb-action-download-statement` shows Details active with defaults restored: `stb-statement-account` = `Current Account •••• 4521`, `stb-statement-period` = `Last 30 days`, `stb-statement-format` = `PDF` (verified live: state resets between openings).

---

### Scenario 8 — Close via the Escape key before confirm leaves everything unchanged

**Seed state:** dashboard baseline asserted.

**Steps:**
1. Click `stb-action-download-statement`.
2. Press `Escape`.

**Expected results:**
- `stb-statement-modal` is removed from the DOM.
- Balance still `KES 1,250,000.00`; `stb-transaction-row` count still 4.

---

### Scenario 9 — Done closes the modal after success and resets the flow

**Seed state:** success step reached (Scenario 5).

**Steps:**
1. Click `stb-statement-done`.
2. Click `stb-action-download-statement` to reopen.

**Expected results:**
- After step 1, `stb-statement-modal` is removed from the DOM.
- After step 2, the modal reopens on Details (`stb-statement-step-details` has `aria-current="step"`) with all defaults (`Current Account •••• 4521` / `Last 30 days` / `PDF`) — no residue from the previous run.
- Balance and transaction count invariants still hold (KES 1,250,000.00; 4 rows).

---

**Coverage notes:** AC1 → Scenario 1; AC2 → Scenario 2; AC3 → Scenarios 3–4; AC4 → Scenarios 5–6; AC5 → Scenarios 7–9. No amount inputs exist in this flow, so the KES 100 minimum / balance-exceeded boundary cases are not applicable; the money invariant is the zero-impact assertion in Scenarios 6–8.