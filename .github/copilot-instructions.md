# Stanbic FX Modernization — Copilot Developer Guidelines

You are assisting engineers on the Stanbic Bank FX & Cross-Border Transfer Portal,
a regulated retail banking application. Apply every rule below to all generated
code, commit messages, and reviews.

## Git & Workflow Conventions

- **Conventional Commits are mandatory**, scoped and linked to the backlog Item ID:
  - `feat(fx): #<id> <imperative description>` — e.g. `feat(fx): #101 add live fee breakdown to quote panel`
  - `fix(fx): #<id> …`, `test(fx): #<id> …`, `chore(ci): …`
- **Branch naming**: `feature/FX-<id>-<kebab-slug>` — e.g. `feature/FX-101-fee-breakdown`.
  Defect branches use `fix/FX-<id>-<kebab-slug>`.
- Every PR must link its issue (`Closes #<n>`) and complete the banking compliance checklist.
- Never suggest force-pushing to `main` or bypassing status checks.

## TypeScript Standards

- **Strict mode always**: code must compile under `"strict": true` with no `any`,
  no `@ts-ignore`, and no non-null assertions (`!`) unless provably safe.
- Export explicit `interface` definitions for all component props and API payloads.
- Prefer discriminated unions over boolean flags for state (`{ status: "idle" | "quoting" | "submitted" }`).
- All currency amounts are handled as numbers in minor-unit-safe form; never use
  floating-point arithmetic for ledger-affecting calculations — use the shared
  money utilities.

## UI / Styling Standards

- **Tailwind CSS design tokens only** — use the configured Stanbic palette
  (`stanbic-navy`, `stanbic-royal`, `stanbic-accent`) and spacing scale.
  Never emit hard-coded hex values, inline `style=` attributes, or arbitrary values
  like `bg-[#0033a1]`.
- Components must be accessible: semantic HTML, `label`/`htmlFor` pairing,
  `aria-live` for dynamic quote updates, `role="alert"` for errors, and visible
  focus states.

## Testability (non-negotiable)

- **Every interactive element MUST carry a `data-testid` attribute** using
  kebab-case with the `fx-` prefix: `data-testid="fx-amount-input"`,
  `data-testid="fx-submit-button"`, `data-testid="fx-success-panel"`.
- Playwright tests select exclusively via `getByTestId` — never CSS classes or text.
- Generate/extend Playwright Page Object Model classes in `e2e/pages/` when
  adding new UI surface area.

## Security & Data Privacy

- Sanitize and validate all user input at the component boundary; never
  interpolate user input into HTML (`innerHTML`), URLs, or shell commands.
- Never generate, echo, or hard-code credentials, API tokens (including any
  `STB_LIVE_*` pattern), or customer PII — use placeholders and environment refs.
- Do not read from or write to `src/core-ledger/**` — it is excluded from Copilot
  context by policy; treat its APIs as an opaque contract.
- Log via `src/utils/auditLogger.ts` abstractions; never log account numbers,
  balances, or beneficiary details.

## When Implementing From an Issue

1. Read the Item ID, acceptance criteria, and attached prototype screenshot.
2. Match the screenshot's layout, palette, and copy exactly using Tailwind tokens.
3. Emit the component plus a matching Playwright spec covering each acceptance criterion.
4. Propose a Conventional Commit message referencing the Item ID.
