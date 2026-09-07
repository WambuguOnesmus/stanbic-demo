# Pull Request — Stanbic Portal Modernization

## Summary

<!-- One or two sentences. What does this PR change and why?
     Tip: use "Copilot: Generate Summary" to draft this section. -->

## Linked Issue

Closes #<!-- Item ID issue number, e.g. Closes #42 (STB-101) -->

> PRs without a linked issue will be closed. Branch must follow `feature/STB-<id>-<slug>`.

## Type of Change

- [ ] `feat` — New feature
- [ ] `fix` — Defect fix
- [ ] `refactor` — No behaviour change
- [ ] `test` — Test-only change
- [ ] `chore` / `ci` — Tooling, pipeline, dependencies

---

## 🏛️ Banking Compliance Checklist (all items mandatory)

### 1. Architecture Compliance
- [ ] Change conforms to the approved component architecture (no new direct calls into `src/core-ledger/**`)
- [ ] TypeScript `strict` mode passes with zero suppressions (`// @ts-ignore` requires lead sign-off)
- [ ] All new interactive elements expose `data-testid="stb-<element>"` selectors
- [ ] Tailwind design tokens used — no hard-coded hex colours

### 2. Security (GHAS / CodeQL)
- [ ] **CodeQL analysis is green** (no new `security-and-quality` alerts)
- [ ] **Dependency Review passed** — no newly introduced vulnerable or unlicensed packages
- [ ] No secrets in code or config (push protection clean); custom Stanbic patterns not triggered
- [ ] Copilot Autofix suggestions reviewed and applied or dispositioned

### 3. Quality Gates
- [ ] **Playwright E2E suite passes** (`e2e-playwright` status check green)
- [ ] New acceptance criteria from the linked issue are covered by new/updated E2E tests
- [ ] No skipped or `.only` tests committed

### 4. Data Privacy Validation
- [ ] No customer PII, account numbers, or production data in code, tests, fixtures, or screenshots
- [ ] Logging additions reviewed — no sensitive fields written to logs
- [ ] Copilot content exclusions (`src/core-ledger/**`, `*.pem`) untouched or change approved by security

### 5. Review & Sign-off
- [ ] At least one approval from `@enterprise-org/core-banking-leads` (enforced via CODEOWNERS)
- [ ] Commits are signed and follow Conventional Commits (`feat(portal): #<id> <description>`)
- [ ] Linear history maintained (rebase, no merge commits)

---

## Screenshots / Evidence

<!-- Before/after screenshots for UI changes. Playwright report link for test changes. -->

## Rollback Plan

<!-- How to revert safely if this change misbehaves in production. -->
