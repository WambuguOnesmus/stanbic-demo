# Developer Guide — Stanbic Banking Portal

Welcome to the Portal Modernization programme. This guide covers local onboarding,
branching conventions, and the quality standards enforced by CI.

## 1. Local Onboarding

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS |
| npm | 10+ |
| GitHub CLI (`gh`) | 2.40+ |
| Git (signed commits configured) | 2.40+ |

### First-time setup

```bash
git clone https://github.com/enterprise-org/stanbic-banking-portal.git
cd stanbic-banking-portal

# Deterministic install — always ci, never install, on shared branches
npm ci

# Start the local dev server (serves the app and the prototype)
npm run dev
```

- App: http://localhost:4173
- Prototype (visual spec): http://localhost:4173/prototype/index.html

### Commit signing (mandatory — branch protection rejects unsigned commits)

```bash
git config commit.gpgsign true
git config user.signingkey <YOUR_KEY_ID>
```

## 2. Branching & Commit Convention

Every change traces to a backlog **Item ID** (e.g. `STB-101`).

| Artifact | Convention | Example |
|----------|-----------|---------|
| Feature branch | `feature/STB-<id>-<kebab-slug>` | `feature/STB-101-fee-breakdown` |
| Defect branch | `fix/STB-<id>-<kebab-slug>` | `fix/STB-214-gbp-rounding` |
| Commit | `feat(portal): #<issue> <imperative>` | `feat(portal): #101 add live fee breakdown` |
| PR | Must contain `Closes #<issue>` | `Closes #101` |

Merges to `main` require: 1+ CODEOWNERS approval, signed commits, linear
history, and green status checks for **Playwright E2E**, **CodeQL**, and
**Dependency Review**. Stale approvals are dismissed on new pushes.

## 3. Test Standards

- **Selectors**: Playwright targets `data-testid` exclusively — kebab-case with
  the `stb-` prefix (`stb-amount-input`, `stb-submit-button`). Never CSS classes or text.
- **Page Object Model**: page interactions live in `e2e/pages/`; specs in
  `e2e/` stay declarative. Extend `TransferPage` rather than inlining locators.
- **Coverage rule**: every acceptance criterion on the linked issue must map to
  at least one E2E assertion.
- **Hygiene**: no `.only`, no `.skip` without a linked follow-up issue, no
  hard-coded waits — use web-first assertions (`expect(locator).toBeVisible()`).

```bash
# Run the full suite locally (headless)
npm run test:e2e

# Debug interactively
npm run test:e2e:ui
```

## 4. Security Rules (non-negotiable)

- `src/core-ledger/**` is **excluded from Copilot context** and requires
  Tier 1 review — treat its API as an opaque contract.
- Never commit secrets. Push protection blocks `STB_LIVE_*` tokens and key
  material; if you are blocked, the answer is to remove the secret, not bypass.
- Log only via `src/utils/auditLogger.ts` safe helpers — never account
  numbers, balances, or beneficiary details.
- All user input is sanitized at the component boundary; `dangerouslySetInnerHTML`
  is banned.

## 5. Daily Workflow

1. Pick an item from the **Stanbic Portal Modernization** project board.
2. `git switch -c feature/STB-<id>-<slug>` from a fresh `main`.
3. Implement using Copilot with the repo instructions + `react-component` skill;
   attach the issue's prototype screenshot in Copilot Chat for visual grounding.
4. Add/extend Playwright specs; run locally until green.
5. Open a PR — complete the banking compliance checklist; let Copilot draft the summary.
6. Address CodeQL / Copilot Autofix findings and reviewer comments; squash-merge.
