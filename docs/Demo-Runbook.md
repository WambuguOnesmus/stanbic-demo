# Stanbic Demo Runbook — GitHub Enterprise + Copilot

Presenter guide for the live demo. Companion narrative with ROI lines and
objection handling: [Demo-Talk-Track wiki](https://github.com/WambuguOnesmus/stanbic-demo/wiki/Demo-Talk-Track).

## Key links

| Asset | URL |
|---|---|
| Repo | https://github.com/WambuguOnesmus/stanbic-demo |
| Project board | https://github.com/orgs/WambuguOnesmus/projects/1 |
| Prototype (Pages) | https://wambuguonesmus.github.io/stanbic-demo/public/prototype/index.html |
| Wiki | https://github.com/WambuguOnesmus/stanbic-demo/wiki |
| Local app | http://localhost:4173 (prototype at `/prototype/index.html`) |

## Pre-demo checklist (30 min before)

- [ ] `git switch main && git pull` — clean tree, latest state
- [ ] `npm ci && npx playwright install chromium` (if fresh machine)
- [ ] `npm run dev` running; app + prototype load
- [ ] `npm run test:e2e` green once (warms browser/server)
- [ ] Playwright MCP server enabled in VS Code (`MCP: List Servers`)
- [ ] `gh auth status` OK; logged into github.com in the browser
- [ ] Pick the live issue (recommended: **#11 Deposit modal** — richest wizard) and confirm it is still OPEN with screenshots rendering
- [ ] Have a fake token ready to type (do NOT save it anywhere): `STB_LIVE_` + 32 random alphanumerics
- [ ] Close noisy apps/notifications; zoom editor + browser to presentation size

---

## Act 1 — GitHub Enterprise governance (5 min)

Show the platform is enterprise-ready before any code:

1. **Org on Enterprise plan** → repo Settings: branch protection on `main`
   (PR required, CODEOWNERS review, dismiss stale reviews, linear history,
   required checks: Playwright E2E / CodeQL / Dependency Review)
2. `.github/CODEOWNERS` — review authority over business logic, CI/CD, security files
3. Issue templates (Item ID, Risk Tier, screenshot upload, Definition of Ready)
   and the banking PR template checklist
4. **Wiki** — Project-Setup, Branching-Strategy (issue number = Item ID), Developer-Guide

> Beat: "Governance is encoded in the platform, not in a PDF."

## Act 2 — Prototype as the visual spec (3 min)

1. Open the **GitHub Pages prototype** — click through: accounts, quick actions,
   the deposit wizard (details → review → success), send money, transactions
2. Point out every element carries a `data-testid="stb-*"` — the contract
   between design, code, and tests

> Beat: "Product approves this once; everything downstream is derived from it."

## Act 3 — Repo + Project managing the work (4 min)

1. **Project board** — custom fields (Sprint, Item ID, Risk Tier), issues #8–#15
2. Open **issue #11** — business value, testid-level acceptance criteria,
   step-by-step prototype screenshots, wiki-convention branch name
3. Show a merged example: **PR #16** (dashboard) — linked issue, checklist,
   green checks, squash commit `feat(portal): #14 …`

> Beat: "Every change traces issue → branch → commit → PR → merge. Audit for free."

## Act 4 — Local code (3 min)

1. VS Code tour: `src/components/` (strict TS, Tailwind tokens, stb-* testids),
   `e2e/` (POMs + specs + plans), `.github/` (all the governance as code)
2. `npm run dev` → app at 4173 matches the prototype
3. `npm run test:e2e` or `npm run test:e2e:ui` — suite green (show the UI mode
   trace viewer if time allows)

## Act 5 — Copilot customizations (5 min)

1. `.github/copilot-instructions.md` — house rules every suggestion obeys
2. `.github/skills/react-component.md` — component scaffolding contract
3. **Prompts**: `/implement-issue` and `/generate-e2e-tests` (open the files,
   show the `${input:issue}` variable)
4. **Agents**: `.github/agents/playwright-test-*.agent.md` — planner/generator/healer
5. **Content exclusion**: open `.github/copilot-content-exclusion.json`; then open
   a file under `src/core-ledger/` and show Copilot is inactive there
   (org setting: Enterprise → Copilot → Content exclusion)

> Beat: "Copilot ships with your standards baked in — and your crown-jewel IP walled off."

## Act 6 — THE CENTERPIECE: issue → code → tests, hands-off (15 min)

1. In Copilot Chat (Agent mode):
   ```
   /implement-issue issue=11
   ```
   Narrate while it works: reads the wiki, fetches the issue, branches
   `feature/11-deposit-modal`, implements to the prototype's testids, verifies,
   opens a **draft PR** with the compliance checklist
2. Refresh http://localhost:4173 — click the new Deposit wizard live
3. Then:
   ```
   /generate-e2e-tests issue=11
   ```
   **Pause at the plan** — show the human-readable test plan (the governance
   beat), approve, watch the generator produce POM-driven specs and go green
4. Open the PR: Copilot **Generate summary**, request **Copilot code review**
   (Reviewers → Copilot), show required checks gating the merge

> Fallback if Copilot is slow: PR #16/#17 are pre-baked results of exactly this
> flow — walk those instead and show the committed plans in `e2e/plans/`.

## Act 7 — GHAS security story (8 min)

1. **Push protection (live)**: paste the fake `STB_LIVE_…` token into any file,
   commit, `git push` → blocked at the client. Delete the change.
   (Custom patterns definition: `src/config/stanbic-custom-patterns.json`)
2. **CodeQL + Copilot Autofix**: Security → Code scanning → alerts on
   `src/utils/auditLogger.ts` (deliberate DOM-XSS + command injection) →
   click **Generate fix** → commit from the UI
3. **Dependabot**: open a dependabot PR (weekly, grouped, conventional-commit)
4. **Dependency Review**: point at the required check on any PR — vulnerable
   packages blocked at the gate

## Act 8 — Supply chain + wrap (5 min)

1. `.github/workflows/release-attestation.yml` — SPDX SBOM + signed provenance;
   verify with `gh attestation verify <artifact> --owner WambuguOnesmus`
2. Recap chain: governed intake → guarded AI → protected secrets → gated PR →
   auto-remediated vulns → attested releases
3. Objection cheat sheet: bottom of the
   [Demo-Talk-Track](https://github.com/WambuguOnesmus/stanbic-demo/wiki/Demo-Talk-Track)

---

## Timing summary (≈ 45–50 min)

| Act | Topic | Min |
|---|---|---|
| 1 | Enterprise governance | 5 |
| 2 | Prototype | 3 |
| 3 | Repo + project | 4 |
| 4 | Local code | 3 |
| 5 | Copilot customizations | 5 |
| 6 | Issue → code → tests (live) | 15 |
| 7 | GHAS | 8 |
| 8 | Supply chain + wrap | 5 |

Short-on-time order: keep Acts 6 and 7, compress 1–5 into a 5-minute tour.

## Reset after a dry run

- Delete the dry-run branch/PR for the live issue:
  `gh pr close <n> --delete-branch` (leave issue OPEN)
- Revert the feature commit if it was merged, or re-open the issue
- `git switch main && git pull`; re-run the pre-demo checklist
- Do NOT reset PRs #16/#17 — they are the fallback evidence
