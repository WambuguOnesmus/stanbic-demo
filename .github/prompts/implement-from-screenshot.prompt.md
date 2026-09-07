---
mode: agent
description: "Implement a React component from a GitHub Issue's prototype screenshot (Stanbic Banking Portal)"
---

# Implement Portal Feature From Issue Screenshot

You are implementing a feature for the Stanbic Banking Portal.

## Inputs

- GitHub Issue: ${input:issueUrl:Paste the GitHub Issue URL or number}
- The issue contains an **Item ID** (e.g. STB-101), **Acceptance Criteria**, and an
  attached **prototype screenshot** which is the authoritative visual specification.

## Task

1. **Read the issue** (title, Item ID, business value, acceptance criteria) and
   **analyze the attached prototype screenshot**: layout, palette (Stanbic navy
   `stanbic-navy`, royal blue `stanbic-royal`, white), typography hierarchy, form
   fields, quote/fee breakdown panel, and success confirmation state.

2. **Generate or update the React component** in `src/components/` that matches
   the screenshot pixel-intent-faithfully, following `.github/copilot-instructions.md`
   and the `react-component` skill:
   - TypeScript strict mode with an exported props interface
   - Tailwind design tokens only (no hex values, no inline styles)
   - Kebab-case `data-testid="stb-<element>"` on every interactive element
   - Accessible labels, `aria-live` quote updates, `role="alert"` errors
   - Input sanitization and insufficient-funds validation as shown in the prototype

3. **Generate the Playwright coverage**: update `e2e/pages/` POM and add specs
   in `e2e/` asserting every acceptance criterion via `getByTestId`.

4. **Propose the delivery plan**:
   - Branch: `feature/STB-<id>-<kebab-slug>`
   - Commit: `feat(portal): #<issue-number> <imperative description>`
   - PR body pre-filled against the banking compliance checklist.

Do not touch `src/core-ledger/**` or any `*.pem` file — these are excluded by policy.
